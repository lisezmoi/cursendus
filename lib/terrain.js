var Terrain;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function skinMap(map, tiles, skyHeight, moonRow) {
  var moonPos = getRandomInt(0, map[0].length);
  for (var i=0; i < map.length; i++) {
    for (var j=0; j < map[i].length; j++) {
      map[i][j].traced = 0;
      if (i < skyHeight) {
        if (i === moonRow && j === moonPos) {
          map[i][j].skin = tiles.moon;
        } else {
          map[i][j].skin = tiles.sky[getRandomInt(0, tiles.sky.length-1)];
        }
      } else if (i === skyHeight) {
        map[i][j].skin = tiles.horizon[getRandomInt(0, tiles.horizon.length-1)];
      } else {
        map[i][j].skin = tiles.ground[getRandomInt(0, tiles.ground.length-1)];
      }
    }
  }
  return map;
}

Terrain = function(terrain, width, height, skinTiles, skyHeight, moonRow) {
  var lines;
  if (terrain) {
    this.map = terrain.map;
    this.width = terrain.width;
    this.height = terrain.height;
  } else {
    lines = [];
    for (var i=0; i < height; i++) {
      var col = [];
      for (var j=0; j < width; j++) {
        col[j] = { // Cell
          occupied: false,
          skin: Math.floor(Math.random() * 10)
        };
      }
      lines[i] = col;
    }
    this.map = lines;
    this.width = width;
    this.height = height;
    skinMap(this.map, skinTiles, skyHeight, moonRow);
  }
};

Terrain.prototype.getPosition = function(obj, cb) {
  var map = this.map;
  for (var i=0; i < map.length; i++) {
    for (var j=0; j < map[i].length; j++) {
      if (map[i][j].occupied === obj) {
        return cb(null, j, i);
      }
    }
  }
  return cb(new Error('Object not found.'));
};

Terrain.prototype.isOccupied = function(x, y) {
  if (!this.map[y] || !this.map[y][x]) {
    return new Error('Does not exists');
  }
  return !!this.map[y][x].occupied;
};

Terrain.prototype.trace = function(player, x, y) {
  this.map[y][x].traced = player.skin;
  return true;
};

Terrain.prototype.clearTrace = function(player, x, y) {
  this.map[y][x].traced = 0;
  return true;
};

Terrain.prototype.occupy = function(player, x, y) {
  if (this.isOccupied(x, y)) {
    return false;
  }
  this.map[y][x].occupied = player;
  return true;
};

Terrain.prototype.release = function(x, y) {
  if (!this.map[y] || !this.map[y][x]) {
    return false;
  }
  this.map[y][x].occupied = false;
  return true;
};

module.exports = Terrain;
