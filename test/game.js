var assert = require('assert'),
    Game = require('../lib/game'),
    winston = require('winston');

describe('game mechanisms', function(){
  var game, letters;

  var logger = new winston.Logger({
    transports: [
      // new winston.transports.Console(),
    ]
  });

  game = new Game(1, 'player1@example.com', 'player1@example.com', {
    logger: logger
  });
  letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  describe('attack command', function(){
    it('should remove health points', function(){
      var p2Position = game.terrain.getPosition(game.player2, function(err, x, y) {
        var coords = (y+1) + letters[x]; // 'M16'
        game.command(game.player1, 'attack ' + coords);
        game.commandsEnd(game.player1);
        game.commandsEnd(game.player2);
        assert(game.player2.health < 40);
      });
    });
  });

});
