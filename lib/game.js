var fs = require('fs');
var uuid = require('node-uuid');

var Game = {};

Game.save = function save(filename, cb) {
  fs.writeFile(filename, this.toString(), cb);
};

Game.toString = function toString() {
  return JSON.stringify(this);
};

function create(players, terrain, turn) {
  var game = Object.create(Game);
  game.id = uuid();
  game.terrain = terrain;
  game.players = players;
  game.turns = [ turn ];
  return game;
}

function load(email1, email2) {
}

function save(cb) {
}

module.exports = {
  create: create,
  load: load
};
