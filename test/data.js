var assert = require('assert'),
    Data = require('../lib/data').Data,
    redis = require('redis');

describe('Data', function(){
  var rclient = redis.createClient(),
      dataInst;

  rclient.select(2); // Test DB

  beforeEach(function(){
    rclient.flushdb();
    dataInst = new Data(rclient);
  });

  describe('#getIndexKey(email1, email2)', function(){
    it('should sort emails', function(){
      var email1 = 'test1@example.net',
          email2 = 'test2@example.net',
          result = 'test1@example.net:test2@example.net';
      assert.equal(Data.getIndexKey(email1, email2), result);
      assert.equal(Data.getIndexKey(email2, email1), result);
    });
  });

  describe('#gameId(cb)', function(){
    it('should increment IDs', function(done){
      dataInst.gameId(function(id) {
        assert.equal(id, '1');
        dataInst.gameId(function(id) {
          assert.equal(id, '2');
          done();
        });
      });
    });
  });

});