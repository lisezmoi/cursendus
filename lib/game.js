var fs = require('fs');
var uuid = require('node-uuid');

var Game = {};

Game.currentTurn = function currentTurn() {
  return this.turns[this.turns.length-1];
};

Game.occupant = function(x, y) {
  var turn = this.currentTurn();
  var charnames = ['char1', 'char2'];
  for (var i = 0, len = charnames.length; i < len; i++) {
    if (turn[charnames[i]].position[0] === x &&
        turn[charnames[i]].position[1] === y) {
      return turn[charnames[i]];
    }
  }
  return null;
};

Game.toString = function toString() {
  return JSON.stringify(this);
};

function create(players, terrain, turn) {
  var game = Object.create(Game);
  game.id = uuid().replace(/-/g, '');
  game.width = terrain.width;
  game.height = terrain.height;
  game.terrain = terrain;
  game.players = players;
  game.turns = [ turn ];
  return game;
}

module.exports = {
  create: create,
  loadFromData: function(gameData) {
    var game = Object.create(Game);
    game.id = gameData.id;
    game.width = gameData.width;
    game.height = gameData.height;
    game.terrain = gameData.terrain;
    game.players = gameData.players;
    game.turns = gameData.turns;
    return game;
  }
};
