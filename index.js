var GAME_WIDTH = 13;
var GAME_HEIGHT = 16;
var SKY_HEIGHT = 2;

var dotenv = require('dotenv');
dotenv.load();

function env(name, defaultValue) {
  if (process.env[name] !== undefined) {
    return process.env[name];
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error('The ' + name + ' environment variable must be set.');
}

var TPL_PATH = env('TPL_PATH', __dirname + '/templates');
var DATA_PATH = env('DATA_PATH', __dirname + '/data');
var PUBLIC_URL = env('PUBLIC_URL');
var WEBSERVER_PORT = env('WEBSERVER_PORT', 3000);

var inspect = require('./lib/utils2').inspect;
var makeGameManager = require('./lib/game-manager');
var webserver = require('./lib/webserver');

var gameManager = makeGameManager(DATA_PATH, {
  gameWidth: GAME_WIDTH,
  gameHeight: GAME_HEIGHT,
  skyHeight: SKY_HEIGHT
});

webserver({
  tplPath: TPL_PATH,
  publicUrl: PUBLIC_URL,
  port: WEBSERVER_PORT,
  gameManager: gameManager
});

// inspect(game);
// console.log(renderHtml(game));
