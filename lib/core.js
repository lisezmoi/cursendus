var util = require("util"),
    events = require("events"),
    _ = require('underscore'),
    games = {},
    Core,
    conf = {
      skinTiles: {
        moon: 'sky-moon',
        sky: ['sky'],
        horizon: ['horizon'],
        ground: ['ground']
      }
    };

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function terrainSkins(terrain) {
  var moonPos = getRandomInt(0, terrain[0].length),
      tiles = conf.skinTiles;
  for (var i=0; i < terrain.length; i++) {
    for (var j=0; j < terrain[i].length; j++) {
      if (i < 4) {
        if (i === 1 && j === moonPos) {
          terrain[i][j].skin = tiles.moon;
        } else {
          terrain[i][j].skin = tiles.sky[getRandomInt(0, tiles.sky.length-1)];
        }
      } else if (i === 4) {
        terrain[i][j].skin = tiles.horizon[getRandomInt(0, tiles.horizon.length-1)];
      } else {
        terrain[i][j].skin = tiles.ground[getRandomInt(0, tiles.ground.length-1)];
      }
    }
  }
  return terrain;
}

function getEmptyTerrain() {
  var lines = [];
  for (var i=0; i < 20; i++) {
    var col = [];
    for (var j=0; j < 14; j++) {
      col[j] = { // Cell
        occupied: false,
        skin: Math.floor(Math.random() * 10)
      };
    }
    lines[i] = col;
  }
  return lines;
}

Core = function(id, player1, player2) {
  events.EventEmitter.call(this);
  this.id = id;
  this.turn = 0;
  this.player1 = player1;
  this.player2 = player2;
  this.terrain = getEmptyTerrain();
  terrainSkins(this.terrain);
};
util.inherits(Core, events.EventEmitter);

Core.configure = function(configuration) {
  _.extend(conf, configuration);
};

Core.getGame = function(id) {
  return games[id] || false;
};

Core.addGame = function(id, player1, player2) {
  if (games[id] || !id || !player1 || !player2 || player1 === player2) {
    return false;
  }
  games[id] = new Core(id, player1, player2);
  return games[id];
};

Core.prototype.command = function(playerId, command) {
  console.log('[COMMAND] %s: %s', playerId, command);
  // console.log(gameId, playerId, command);
}

Core.prototype.players = function() {
  // console.log(gameId, playerId, command);
}


module.exports = Core;
