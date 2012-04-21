var Terrain,
    conf = require('../config');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function skinMap(map) {
  var moonPos = getRandomInt(0, map[0].length),
      tiles = conf.skinTiles;
  for (var i=0; i < map.length; i++) {
    for (var j=0; j < map[i].length; j++) {
      if (i < 4) {
        if (i === 1 && j === moonPos) {
          map[i][j].skin = tiles.moon;
        } else {
          map[i][j].skin = tiles.sky[getRandomInt(0, tiles.sky.length-1)];
        }
      } else if (i === 4) {
        map[i][j].skin = tiles.horizon[getRandomInt(0, tiles.horizon.length-1)];
      } else {
        map[i][j].skin = tiles.ground[getRandomInt(0, tiles.ground.length-1)];
      }
    }
  }
  return map;
}

Terrain = function() {
  var width = conf.terrainDimensions[0],
      height = conf.terrainDimensions[1],
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
  skinMap(this.map);
};

Terrain.prototype.isOccupied = function(x, y) {
  if (!this.map[y] || !this.map[y][x]) {
    return new Error('Does not exists');
  }
  return this.map[y][x].occupied;
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
