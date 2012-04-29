var util = require('util'),
    events = require('events'),
    _ = require('underscore'),
    Player = require('./player'),
    Terrain = require('./terrain'),
    Data = require('./data').Data,
    commandParser = require('./command-parser'),
    Game,
    DEFAULT_SETTINGS = {
      width: 13,
      height: 19,
      positions: {
        p1: [0, 6],
        p2: [12, 18]
      },
      skinTiles: {
        moon: 'sky-moon',
        sky: ['sky-1'],
        horizon: ['top-1'],
        ground: ['ground-1']
      },
      skyHeight: 4,
      moonRow: 1
    };

Game = function(gameObj, player1Name, player2Name, settings) {
  events.EventEmitter.call(this);

  var conf = this.conf = _.extend({}, DEFAULT_SETTINGS, settings);

  if (typeof gameObj === 'object') {
    this.id = gameObj.id;
    this.turn = gameObj.turn;
    this.player1 = new Player(gameObj.player1);
    this.player2 = new Player(gameObj.player2);

    this.terrain = new Terrain(gameObj.terrain);

    // :-(
    this.terrain.release(this.player1.position[0], this.player1.position[1]);
    this.terrain.release(this.player2.position[0], this.player2.position[1]);
    this.terrain.occupy(this.player1, this.player1.position[0], this.player1.position[1]);
    this.terrain.occupy(this.player2, this.player2.position[0], this.player2.position[1]);
    return;
  }

  this.id = gameObj;
  this.turn = 1;
  this.player1 = new Player(player1Name);
  this.player2 = new Player(player2Name);
  this.terrain = new Terrain(null, conf.width, conf.height,
                             conf.skinTiles, conf.skyHeight, conf.moonRow);

  this.player1.skin = 1;
  this.player2.skin = 2;
  this.player1.position = conf.positions.p1;
  this.player2.position = conf.positions.p2;

  // Add players
  var p1Added = this.terrain.occupy(this.player1,
                                    this.player1.position[0],
                                    this.player1.position[1]),
      p2Added = this.terrain.occupy(this.player2,
                                    this.player2.position[0],
                                    this.player2.position[1]);

  if (!p1Added || !p2Added) {
    // TODO: error handling
    console.log('Error: players not added to the map');
  }

};
util.inherits(Game, events.EventEmitter);

Game.prototype.movePlayer = function(player, direction) {
  var oldX = player.position[0],
      oldY = player.position[1],
      x = player.position[0],
      y = player.position[1],
      isOccupied;

  switch (direction) {
    case 'N': y--; break;
    case 'E': x++; break;
    case 'S': y++; break;
    case 'W': x--; break;
  }

  isOccupied = this.terrain.isOccupied(x, y);
  if (isOccupied instanceof Error || isOccupied) {
    return false;
  }

  this.terrain.release(oldX, oldY);
  this.terrain.occupy(player, x, y);
  player.position = [x, y];

  this.emit('update');
  return true;
};

Game.prototype.castPlayer = function(player, col, line) {
  var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      x = letters.indexOf(col.toUpperCase()),
      y = line-1,
      isOccupied,
      other;

  isOccupied = this.terrain.isOccupied(x, y);
  if (x === -1 || isOccupied instanceof Error) {
    return false;
  }

  other = this.getOtherPlayer(player);
  console.log(other, isOccupied, this.terrain.map[y][x].occupied, other);

  if (!isOccupied || this.terrain.map[y][x].occupied !== other) {
    return false;
  }

  other.health -= 5;
  this.emit('update');
  return true;
};

Game.prototype.getPlayerById = function(id) {
  if (this.player1.email === id) {
    return this.player1;
  } else if (this.player2.email === id) {
    return this.player2;
  } else {
    return false;
  }
};

Game.prototype.getOtherPlayer = function(player) {
  if (this.player1 === player) {
    return this.player2;
  } else if (this.player2 === player) {
    return this.player1;
  }
  return false;
};

Game.prototype.command = function(player, commandStr) {
  var self = this, command, commandValue, player;

  if (player !== self.player1 && player !== self.player2) {
    console.log('[PLAYER DOES NOT EXISTS] %s', player.email);
    return false;
  }

  command = commandParser(commandStr);

  if (!command) {
    console.log('[COMMAND DOES NOT EXISTS] %s: %s', player.email, commandStr);
    return false;
  }

  console.log('[COMMAND] %s: %s', player.email, commandStr);
  player.waitActions[command.action] = command.value;

  return true;
};

Game.prototype.commandsEnd = function(player) {
  var turnEnd = false;
  if (player !== this.player1 && player !== this.player2) {
    console.log('[PLAYER DOES NOT EXISTS] %s', player.email);
    return false;
  }
  player.wait = true;
  console.log('[commands end: %s]', player.email);

  turnEnd = this.getOtherPlayer(player).wait;
  if (turnEnd) {
    this.turnEnd();
  }

  this.emit('update');
  return turnEnd;
};

Game.prototype.turnEnd = function() {
  var self = this;
  console.log('end of turn.');

  // Move
  _.each([this.player1, this.player2], function(player) {
    if (player.waitActions.move && self.movePlayer(player, player.waitActions.move)) {
      console.log('MOVE OK!');
    }
  });

  // Cast
  _.each([this.player1, this.player2], function(player) {
    if (player.waitActions.cast && self.castPlayer(player, player.waitActions.cast[0], player.waitActions.cast[1])) {
      console.log('CAST OK!');
    }
  });

  // Reset
  _.each([this.player1, this.player2], function(player) {
    player.waitActions = {};
    player.wait = false;
  });

  this.turn++;
  this.emit('new turn', this.turn);
};

Game.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
module.exports = Game;
