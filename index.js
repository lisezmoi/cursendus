var GAME_WIDTH = 13;
var GAME_HEIGHT = 16;
var SKY_HEIGHT = 2;

var inspect = require('./lib/utils2').inspect;
var makeGame = require('./lib/game').create;
var makeTerrain = require('./lib/terrain').create;
var makeTurn = require('./lib/turn').create;
var makeHtmlRenderer = require('./lib/renderers/html');

var players = {
  p1: { email: 'john@example.com' },
  p2: { email: 'dave@example.com' }
};

var terrain = makeTerrain(GAME_WIDTH, GAME_HEIGHT, SKY_HEIGHT);
var firstTurn = makeTurn(players, terrain);
var game = makeGame(players, terrain, firstTurn);

var renderHtml = makeHtmlRenderer(__dirname + '/templates');

// inspect(game);
console.log(renderHtml(game));
