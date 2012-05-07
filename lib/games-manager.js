var GamesManager,
    Game = require('./game'),
    mkData = require('./data'),
    activeGames = {};

GamesManager = function(rclient, gameConf) {
  this.rclient = rclient;
  this.data = mkData(rclient);
  this.gameConf = gameConf;
};

GamesManager.prototype.getGame = function(id, cb) {
  var data = this.data,
      conf = this.gameConf,
      newGame;

  if (activeGames[id]) {
    return cb(activeGames[id]);
  }

  data.getGame(id, function(err, gameData) {
    if (err || !gameData) {
      return cb(false);
    }

    newGame = new Game(gameData, null, null, conf);
    newGame.on('update', function(){
      data.updateGame(newGame);
    });
    activeGames[newGame.id] = newGame;
    return cb(newGame);
  });
};

GamesManager.prototype.getGameByEmails = function(email1, email2, cb) {
  var data = this.data,
      conf = this.gameConf,
      newGame;

  // Cached game?
  for (var i in activeGames) {
    if ( (activeGames[i].player1.id == email1 && activeGames[i].player2.id == email2)
         || (activeGames[i].player2.id == email1 && activeGames[i].player1.id == email2)
       ) {
      return cb(activeGames[i]);
    }
  }

  data.getGameByEmails(email1, email2, function(err, gameData) {
    if (err || !gameData) {
      return cb(false);
    }
    newGame = new Game(gameData, null, null, conf);
    newGame.on('update', function(){
      data.updateGame(newGame);
    });
    activeGames[id] = newGame;
    return cb(newGame);
  });
};

GamesManager.prototype.getAllGames = function(err, cb) {
  return this.data.getAllGames(err, cb);
};

GamesManager.prototype.addGame = function(player1, player2, cb) {
  var data = this.data,
      conf = this.gameConf,
      newGame;
  data.gameId(function(id) {
    console.log('new game: %s', id);
    newGame = new Game(id, player1, player2, conf);
    console.log('redis: add game...');
    data.addGame(newGame, function(val) {
      if (val) {
        console.log('redis: game added.');
        newGame.on('update', function(){
          data.updateGame(newGame);
        });
      } else {
        console.log('redis: error, the game ID already exists.');
      }
    });
    activeGames[id] = newGame;
    return cb(newGame);
  });
};

module.exports = GamesManager;
