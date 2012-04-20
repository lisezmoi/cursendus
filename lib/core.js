var util = require("util"),
    events = require("events"),
    _ = require('underscore'),
    games = {},
    Core,
    skinTiles = {
      moon: 'sky-moon',
      sky: ['sky-1'],
      horizon: ['top-1', 'top-2'],
      ground: ['ground-1', 'ground-2', 'ground-3', 'ground-4']
    };

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function terrainSkins(terrain) {
  var moonPos = getRandomInt(0, terrain[0].length);
  for (var i=0; i < terrain.length; i++) {
    for (var j=0; j < terrain[i].length; j++) {
      if (i < 4) {
        if (i === 1 && j === moonPos) {
          terrain[i][j].skin = skinTiles.moon;
        } else {
          terrain[i][j].skin = skinTiles.sky[getRandomInt(0, skinTiles.sky.length-1)];
        }
      } else if (i === 4) {
        terrain[i][j].skin = skinTiles.horizon[getRandomInt(0, skinTiles.horizon.length-1)];
      } else {
        terrain[i][j].skin = skinTiles.ground[getRandomInt(0, skinTiles.ground.length-1)];
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

Core.getGame = function(id, player1, player2) {
  var game;
  if (games[id]) {
    game = games[id];
  } else {
    game = new Core(id, player1, player2);
    games[id] = game;
  }
  return game;
};

Core.prototype.command = function(playerId, command) {
  // console.log(gameId, playerId, command);
}

Core.prototype.players = function() {
  // console.log(gameId, playerId, command);
}


module.exports = Core;
