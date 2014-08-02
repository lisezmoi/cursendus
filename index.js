var TERRAIN_WIDTH = 13;
var TERRAIN_HEIGHT = 16;
var TERRAIN_SKY_HEIGHT = 2;

var util = require('util');
var makeGame = require('./lib/game').create;
var makeTerrain = require('./lib/terrain').create;
var makeTurn = require('./lib/turn').create;

var players = {
  p1: { email: 'john@example.com' },
  p2: { email: 'dave@example.com' }
};

var terrain = makeTerrain(TERRAIN_WIDTH, TERRAIN_HEIGHT, TERRAIN_SKY_HEIGHT);
var turn = makeTurn(players, terrain);
var game = makeGame(players, terrain, turn);

console.log(util.inspect(game, { colors: true, depth: 20 }));
