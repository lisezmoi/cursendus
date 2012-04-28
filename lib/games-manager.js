var GamesManager,
    mkData = require('./data');

GamesManager = function(rclient, Game, gameConf) {
  this.Game = Game;
  this.rclient = rclient;
  this.data = mkData(rclient);
  this.gameConf = gameConf;
};

GamesManager.prototype.getGame = function(id, cb) {
  var data = this.data,
      Game = this.Game,
      conf = this.gameConf,
      newGame;
  data.getGame(id, function(err, gameData) {
    if (err || !gameData) {
      return cb(false);
    }
    newGame = new Game(gameData, null, null, conf);
    newGame.on('update', function(){
      data.updateGame(newGame);
    });
    return cb(newGame);
  });
};

GamesManager.prototype.getGameByEmails = function(email1, email2, cb) {
  var data = this.data,
      Game = this.Game,
      conf = this.gameConf,
      newGame;
  data.getGameByEmails(email1, email2, function(err, gameData) {
    if (err || !gameData) {
      return cb(false);
    }
    newGame = new Game(gameData, null, null, conf);
    newGame.on('update', function(){
      data.updateGame(newGame);
    });
    return cb(newGame);
  });
};

GamesManager.prototype.addGame = function(player1, player2, cb) {
  var data = this.data,
      Game = this.Game,
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
    return cb(newGame);
  });
};

module.exports = GamesManager;
