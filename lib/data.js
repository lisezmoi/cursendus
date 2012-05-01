var _ = require('underscore'),
    prefix = 'game:';

function Data(redisClient, prefix) {
  this.rclient = redisClient;
  this.prefix = prefix || '';
}

Data.getIndexKey = function(email1, email2) {
  return [email1, email2].sort().join(':');
}

Data.prototype.gameId = function(cb) {
  this.rclient.incr(prefix + 'id', function(err, id) {
    cb(id);
  });
};

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

Data.prototype.getGame = function(id, cb) {
  this.rclient.GET(prefix + 'id:' + id, function(err, val) {
    if (err) {
      return cb(err);
    }
    return cb(null, JSON.parse(val));
  });
};

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
