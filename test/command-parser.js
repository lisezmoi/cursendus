var assert = require('assert'),
    commandParser = require('../lib/command-parser');

describe('command-parser', function(){

  it('should parse a move command', function() {
    var res,
        values = {
          'N': {
            'eq': [ 'move n', 'move N', 'move NORTH', 'move north ', 'move nOrTh' ],
            'neq': [ 'move NORTHE' ]
          },
          'E': {
            'eq': [ 'move e', 'move E', 'move   EAST', 'MoVe east', 'move eAsT' ],
            'neq': [ 'move eeast' ]
          },
          'S': {
            'eq': [ 'move s', 'move S', 'move SOUTH', 'MOVE south', 'move  sOuTh' ],
            'neq': [ 'moove s' ]
          },
          'W': {
            'eq': [ 'move w', 'move W', 'move WEST', 'move west', 'move wEsT', 'move  west' ],
            'neq': [ 'movve west']
          },
        };

    for (var direction in values) {
      if (values.hasOwnProperty(direction)) {
        // Valid
        for (var i=0; i < values[direction].eq.length; i++) {
          res = commandParser(values[direction].eq[i]);
          assert.equal(res.action, 'move');
          assert.equal(res.value, direction);
        }
        // Not valid
        for (var i=0; i < values[direction].neq.length; i++) {
          res = commandParser(values[direction].neq[i]);
          assert.equal(res, false);
        }
      }
    }
  });

  it('should parse an attack command', function() {
    var res,
        valid = [
          ['ATTACK D20', 'D', '20'],
          ['attack 28D', 'D', '28'],
          ['attack d28', 'D', '28']
        ],
        notValid = [
          'attack n',
          'atack d3',
          'attack 1',
          'attack 1d1',
          'attack d',
          'attack d1d'
        ];

    // Valid
    for (var i=0; i < valid.length; i++) {
      res = commandParser(valid[i][0]);
      assert.equal(res.action, 'attack');
      assert.equal(res.value[0], valid[i][1]);
      assert.equal(res.value[1], valid[i][2]);
    }
    // Not valid
    for (var i=0; i < notValid.length; i++) {
      res = commandParser(notValid[i]);
      assert.equal(res, false);
    }
  });

  it('should parse an invoke command', function() {
    var res,
        valid = [
          ['invoke fb', 'fb'],
          ['invoke ib', 'ib'],
          ['invoke iB', 'ib'],
          ['invoke FB', 'fb'],
          ['INVoke FB', 'fb']
        ],
        notValid = [
          'invoke f',
          'invok fb',
          'invoke 1',
          'invoke ibb'
        ];

    // Valid
    for (var i=0; i < valid.length; i++) {
      res = commandParser(valid[i][0]);
      assert.equal(res.action, 'invoke');
      assert.equal(res.value, valid[i][1]);
    }
    // Not valid
    for (var i=0; i < notValid.length; i++) {
      res = commandParser(notValid[i]);
      assert.equal(res, false);
    }
  });

});
