var Game = require('./lib/game'),
    GamesManager = require('./lib/games-manager'),
    mailView = require('./lib/views/mail'),
    httpView = require('./lib/views/http'),
    redis = require('redis'),
    rclient = redis.createClient(),
    games,
    conf = require('./config'),
    init = false;

function assetsServer() {
  var connect = require('connect'),
      server = connect();
  server.use(connect.static('public'));
  server.listen(3001);
  conf.assetsUrl = 'http://localhost:3001/';
}

function main() {
  if (init) { return; }
  init = true;

  // Static files
  if (!conf.assetsUrl) {
    assetsServer();
  }

  // Games server
  Game.DEFAULT_SETTINGS.skinTiles = conf.skinTiles;
  games = new GamesManager(rclient, Game);
  mailView.start(games, conf);
  httpView.start(games, conf);
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
