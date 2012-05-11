var _ = require('underscore'),
    prefix = 'game:';

/**
 * Data object: synchronize data with redis.
 *
 * @class Data
 * @constructor
 * @param {RedisClient} redisClient a RedisClient object, see https://github.com/mranney/node_redis
 *
 */
function Data(redisClient, prefix) {
  this.rclient = redisClient;
  this.prefix = prefix || '';
}

/**
 * Get a index key with provided emails.
 *
 * @method getIndexKey
 * @static
 * @param {String} email1 The first email.
 * @param {String} email2 The second email.
 * @return {String} An index key.
 *
 */
Data.getIndexKey = function(email1, email2) {
  return [email1, email2].sort().join(':');
}

/**
 * Get a unique game ID.
 *
 * @method gameId
 * @param {Function} cb The callback.
 *
 */
Data.prototype.gameId = function(cb) {
  this.rclient.incr(prefix + 'id', function(err, id) {
    cb(id);
  });
};

/**
 * Save a new game.
 *
 * @method addGame
 * @param {Game} game The game to add.
 * @param {Function} cb The callback.
 *
 */
Data.prototype.addGame = function(game, cb) {
  var indexKey = Data.getIndexKey(game.player1.email, game.player2.email),
      rclient = this.rclient;
  rclient.SETNX(prefix + 'id:' + game.id, JSON.stringify(game), function(err, val) {
    rclient.SET(prefix + 'byemails:' + indexKey, game.id, function(err, val) {
      if (cb) {
        cb(val);
      }
    });
  });
};

Data.prototype.updateGame = function(game, cb) {
  this.rclient.SET(prefix + 'id:' + game.id, JSON.stringify(game), function(err, val) {
    if (cb) {
      cb(val);
    }
  });
};

/**
 * Retrieve an existing game.
 *
 * @method getGame
 * @param {Number} id The game ID.
 * @param {Function} cb The callback.
 *
 */
Data.prototype.getGame = function(id, cb) {
  this.rclient.GET(prefix + 'id:' + id, function(err, val) {
    if (err) {
      return cb(err);
    }
    return cb(null, JSON.parse(val));
  });
};

/**
 * Retrieve all the game IDs.
 *
 * @method getAllGames
 * @param {Function} cb The callback.
 *
 */
Data.prototype.getAllGames = function(cb) {
  this.rclient.KEYS(prefix + 'id:*', function(err, keys) {
    if (err) {
      return cb(err);
    }
    keys = _.map(keys, function(val){
      return parseInt(val.replace(/^game:id:/, ''), 10);
    });
    return cb(null, keys);
  });
};

/**
 * Retrieve a game by providing two emails.
 *
 * @method getGameByEmails
 * @param {String} email1 The first email.
 * @param {String} email2 The second email.
 *
 */
Data.prototype.getGameByEmails = function(email1, email2, cb) {
  var indexKey = Data.getIndexKey(email1, email2);
  this.rclient.GET(prefix + 'byemails:' + indexKey, function(err, val) {
    if (val) {
      return data.getGame(val, cb);
    } else {
      return cb(new Error('Game not found'));
    }
  });
};

function makeData(redisClient, prefix) {
  return new Data(redisClient, prefix);
};

module.exports = makeData;
module.exports.Data = Data;
