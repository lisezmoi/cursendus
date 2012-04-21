var redis = require('redis'),
    redisClient = redis.createClient(),
    data = {};

data.gameId = function(cb) {
  redisClient.incr('game:id', function(err, id) {
    cb(id);
  });
};

data.addGame = function(game, cb) {
  redisClient.SETNX('game:' + game.id, JSON.stringify(game), function(err, val) {
    if (cb) {
      cb(val);
    }
  });
};

data.updateGame = function(game, cb) {
  redisClient.SET('game:' + game.id, JSON.stringify(game), function(err, val) {
    if (cb) {
      cb(val);
    }
  });
};

data.getGame = function(id, cb) {
  redisClient.GET('game:' + id, function(err, val) {
    if (err) {
      return cb(err);
    }
    return cb(null, JSON.parse(val));
  });
};

module.exports = data;