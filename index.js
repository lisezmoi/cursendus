var Game = require('./lib/game'),
    GamesManager = require('./lib/games-manager'),
    mailView = require('./lib/views/mail'),
    httpView = require('./lib/views/http'),
    redis = require('redis'),
    rclient,
    rpubsub,
    games,
    conf = require('./config'),
    init = false;

function assetsServer() {
  var connect = require('connect'),
      server = connect();
  server.use(connect.static('public'));
  server.listen(3001);
  conf.assetsUrl = 'http://localhost:3001';
}

function main() {
  if (init) { return; }
  init = true;

  // Redis connection
  function redisError(err) {
    console.log('Redis connection error. Is Redis started?');
    console.log(err);
    process.exit(0);
  }
  rclient = redis.createClient();
  rpubsub = redis.createClient();
  rclient.on('error', redisError);
  rpubsub.on('error', redisError);

  // Static files
  if (!conf.assetsUrl) {
    assetsServer();
  }

  // Games server
  Game.DEFAULT_SETTINGS.skinTiles = conf.skinTiles;
  games = new GamesManager(rclient, Game, {
    width: conf.terrainDimensions[0],
    height: conf.terrainDimensions[1],
    skinTiles: conf.skinTiles,
    positions: {
      p1: [0, conf.skyHeight+2],
      p2: [conf.terrainDimensions[0]-1, conf.terrainDimensions[1]-1]
    },
    skyHeight: conf.skyHeight,
    moonRow: conf.moonRow
  });
  mailView.start(games, rpubsub, conf);
  httpView.start(games, conf);
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
