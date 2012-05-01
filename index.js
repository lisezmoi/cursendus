var winston = require('winston'),
    async = require('async'),
    Game = require('./lib/game'),
    GamesManager = require('./lib/games-manager'),
    template = require('./lib/template'),
    mailView = require('./lib/views/mail'),
    httpView = require('./lib/views/http'),
    errorMessages = require('./msg/errors'),
    redis = require('redis'),
    rclient,
    rpubsub,
    games,
    logger,
    conf = require('./config'),
    init = false;

function makeLogger(name) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({ colorize: true }),
      new winston.transports.File({
        filename: __dirname + '/log/'+ name +'.log',
        timestamp: true,
        maxsize: (100 * 1024 * 1024)
      })
    ]
  });
}

function assetsServer(logger) {
  var connect = require('connect'),
      server = connect();
  server.use(connect.static('public'));
  server.listen(3001);
  conf.assetsUrl = 'http://localhost:3001';
  logger.info('Assets web server started at http://localhost:3001/');
}

function gameServer(logger) {
  // Static files
  if (!conf.assetsUrl) {
    assetsServer(logger);
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

  // Template system
  template.init({
    root: __dirname + '/tpl'
  });

  // Views
  mailView.start(games, template, rpubsub, errorMessages, logger, conf);
  httpView.start(games, template, rpubsub, errorMessages, logger, conf);

  // Mail fetcher
  require('./mail-fetcher')(makeLogger('fetchmail'));

  logger.info('Cursendus launched.');
}

function main() {
  if (init) { return; }
  init = true;

  logger = makeLogger('cursendus');

  // Redis connections
  async.parallel([
    function(cb){
      rclient = redis.createClient();
      rclient.on('error', cb);
      rclient.on('ready', cb);
    },
    function(cb){
      rpubsub = redis.createClient();
      rpubsub.on('error', cb);
      rpubsub.on('ready', cb);
    }
  ], function(err) {
    if (err) {
      logger.error('Redis connection error. Is Redis started?');
      logger.error(err);
      return process.exit(0);
    }
    rpubsub.removeAllListeners();
    rclient.removeAllListeners();
    gameServer(logger);
  });

}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
