var assert = require('assert'),
    Game = require('../lib/game'),
    winston = require('winston'),
    logger = new winston.Logger({
      transports: [
        // new winston.transports.Console(),
      ]
    }),
    letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function mkGame(id) {
  return new Game(id || 1, 'player1@example.com', 'player2@example.com', {
    logger: logger
  });
}

describe('game API', function() {
  var game;
  beforeEach(function() {
    game = mkGame(1);
  });

  describe('commandsEnd', function(){
    it('should not trigger the next turn if the player has no waiting commands', function(){
      game.command(game.player1, 'attack J10'); // valid command
      game.commandsEnd(game.player1);
      game.commandsEnd(game.player2);

      assert.equal(game.turn, 1);
      assert(game.player1.wait);
      assert(!game.player2.wait);
    });

    it('should trigger the next turn if the player has waiting commands', function(){
      game.command(game.player1, 'attack J10'); // valid command
      game.command(game.player2, 'attack J10'); // valid command
      game.commandsEnd(game.player1);
      game.commandsEnd(game.player2);

      assert.equal(game.turn, 2);
      assert(!game.player1.wait);
      assert(!game.player2.wait);
    });
  });
});

describe('game mechanisms', function(){
  var game = mkGame(2);

  describe('attack command', function(){
    it('should remove health points', function(){
      var p2Position = game.terrain.getPosition(game.player2, function(err, x, y) {
        var coords = (y+1) + letters[x]; // 'M16'
        game.command(game.player1, 'attack ' + coords);
        game.command(game.player2, 'attack A5');
        game.commandsEnd(game.player1);
        game.commandsEnd(game.player2);
        assert(game.player2.health < 40);
      });
    });
  });

});
