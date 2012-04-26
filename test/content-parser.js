var assert = require('assert'),
    parser = require('../lib/content-parser');

describe('content-parser', function(){

  describe('#commands(text)', function(){
    it('should extract commands', function() {
      var str = 'move south\nattack d3',
          res = parser.commands(str);
      assert.equal(res.length, 2);
      assert.equal(res[0][0], 'move');
      assert.equal(res[0][1], 'south');
      assert.equal(res[1][0], 'attack');
      assert.equal(res[1][1], 'd3');
    });

    it('should remove empty lines before commands', function(){
      var str = '\n\nmove south',
          res = parser.commands(str);
      assert.equal(res.length, 1);
    });

    it('should remove empty lines after commands', function(){
      var str = 'move south\nattack d3\n\n',
          res = parser.commands(str);
      assert.equal(res.length, 2);
    });

    it('should stop parsing commands after an empty line', function(){
      var str = 'move south\n\nattack d3',
          res = parser.commands(str);
      assert.equal(res.length, 1);
      assert.equal(res[0][0], 'move');
      assert.equal(res[0][1], 'south');
    });
  });

  describe('#gameId(subject)', function(){
    it('should convert the game ID to a Number', function() {
      var str = '[battle id: 02828]',
          res = parser.gameId(str);
      assert.equal(res, 2828);
    });
    it('should get the game ID after a characters suite', function() {
      var str = 'auie [battle id: 2828]',
          res = parser.gameId(str);
      assert.equal(res, 2828);
    });
    it('should get the game ID before a characters suite', function() {
      var str = '[battle id: 2828] auie',
          res = parser.gameId(str);
      assert.equal(res, 2828);
    });
    it('should get the game ID before and after a characters suite', function() {
      var str = 'auie [battle id: 2828] auie',
          res = parser.gameId(str);
      assert.equal(res, 2828);
    });
    it('should get the last detected game ID', function() {
      var str = 'auie [battle id: 2828] auie [battle id: 18] auie',
          res = parser.gameId(str);
      assert.equal(res, 18);
    });
    it('should return `false` if no game ID are detected', function() {
      var res1 = parser.gameId('auie [battle id: 2828 auie'),
          res2 = parser.gameId('auie [battle id: ] auie'),
          res3 = parser.gameId('auie [attle id: 82] auie'),
          res4 = parser.gameId('auie battle id: 2828] auie'),
          res5 = parser.gameId('auie [battle id 2828] auie');
      assert.equal(res1, false);
      assert.equal(res2, false);
      assert.equal(res3, false);
      assert.equal(res4, false);
      assert.equal(res5, false);
    });
  });

});
