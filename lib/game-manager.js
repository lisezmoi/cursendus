var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var mkdirp = Promise.promisify(require('mkdirp'));
var glob = Promise.promisify(require('glob'));
var makeGame = require('./game').create;
var loadGameFromData = require('./game').loadFromData;
var makeTerrain = require('./terrain').create;
var makeTurn = require('./turn').createFirst;

function loadGameByPath(gamePath) {
  return fs.readFileAsync(gamePath, 'utf8').then(function(content) {
    return loadGameFromData(JSON.parse(content));
  });
}

module.exports = function init(dataPath, settings) {
  var gameWidth = settings.gameWidth;
  var gameHeight = settings.gameHeight;
  var skyHeight = settings.skyHeight;
  var activeGamesPath = dataPath + '/games/active';
  var gameManager = {
    createGame: function create(email1, email2) {
      return new Promise(function(resolve, reject) {
        var players = {
          p1: { email: email1 },
          p2: { email: email2 }
        };
        var terrain = makeTerrain(gameWidth, gameHeight, skyHeight);
        var firstTurn = makeTurn(players, terrain);
        var game = makeGame(players, terrain, firstTurn);
        resolve(gameManager.saveGame(game).thenReturn(game));
      });
    },
    saveGame: function saveGame(game) {
      var filename = path.join(activeGamesPath, game.id + '.json');
      return mkdirp(activeGamesPath)
        .then(function() {
          fs.writeFileAsync(filename, game.toString());
        });
    },
    loadGameById: function load(id) {
      return mkdirp(activeGamesPath)
        .then(function() {
          return loadGameByPath(path.join(activeGamesPath, id + '.json'));
        });
    },
    loadByEmails: function load(email1, email2) {
      // TODO
    },
    list: function list() {
      return glob(path.join(activeGamesPath, '*.json'))
        .map(loadGameByPath);
    }
  };
  return gameManager;
};
