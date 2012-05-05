var util = require('util'),
    utilities = require('./utilities'),
    events = require('events'),
    _ = require('underscore'),
    Player = require('./player'),
    Terrain = require('./terrain'),
    commandParser = require('./command-parser'),
    Game,
    DEFAULT_SETTINGS = {
      width: 13,
      height: 16,
      positions: {
        p1: [0, 4],
        p2: [12, 15]
      },
      skinTiles: {
        moon: 'sky-moon',
        sky: ['sky-1'],
        horizon: ['top-1'],
        ground: ['ground-1']
      },
      skyHeight: 2,
      moonRow: 1
    };

/**
 * A game object.
 *
 * Handle mechanisms of a game.
 *
 * @param {Object} gameObj Either an ID to create a new game, or a JSON representation of a saved game, to restore it.
 * @param {String} player1Name The ID of the player 1 (email).
 * @param {String} player2Name The ID of the player 2 (email).
 * @param {Object} settings The settings of the game.
 *
 */
Game = function(gameObj, player1Name, player2Name, settings) {
  events.EventEmitter.call(this);

  var conf = this.conf = _.extend({}, DEFAULT_SETTINGS, settings);
  this.logger = conf.logger || require('winston');

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
    this.logger.error('Players not added to the map');
  }

};
util.inherits(Game, events.EventEmitter);

/**
 * Command: move
 *
 * Move the player in the given direction.
 * 
 * @param {Player} player The player who moves.
 * @param {String} direction The direction. Valid directions: 'N', 'E', 'S', 'W'.
 * @return {Boolean} true if succeed, false otherwise.
 *
 */
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

/**
 * Command: attack
 *
 * Remove health points from the other player.
 * The health points removed are randomly chosen in a range.
 *
 * @param {Player} player The player who attack.
 * @param {String} col The targetted column (letter).
 * @param {String} line The targetted line (number).
 * @return {Boolean} true if succeed, false otherwise.
 *
 */
Game.prototype.attackPlayer = function(player, col, line) {
  var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
      damages = [8, 13],
      x = letters.indexOf(col.toUpperCase()),
      y = line-1,
      isOccupied,
      other;

  isOccupied = this.terrain.isOccupied(x, y);
  if (x === -1 || isOccupied instanceof Error) {
    return false;
  }

  other = this.getOtherPlayer(player);

  if (!isOccupied || this.terrain.map[y][x].occupied !== other) {
    return false;
  }

  other.health -= utilities.randomInt(damages[0], damages[1]);
  if (other.health <= 0) {
    other.health = 0;
    other.dead = true;
  }

  this.emit('update');
  return true;
};

/**
 * Get a player, based on the given player id.
 *
 * @param {String} id A player id (email).
 * @return {Player} The player, or false if the player id is not in the game.
 *
 */
Game.prototype.getPlayerById = function(id) {
  if (this.player1.email === id) {
    return this.player1;
  } else if (this.player2.email === id) {
    return this.player2;
  } else {
    return false;
  }
};

/**
 * Get the other player, based on the given player.
 *
 * @param {Player} player A player.
 * @return {Player} The other player, or false if the given player is not in the game.
 *
 */
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
    this.logger.error('The player ['+ player.email +'] does not exists');
    return false;
  }

  command = commandParser(commandStr);

  if (!command) {
    this.logger.error('The command "'+ commandStr +'" ('+ player.email +') does not exists');
    return false;
  }

  this.logger.info('Command added to the waitlist: "'+ commandStr +'" ('+ player.email +')');
  player.waitActions[command.action] = command.value;

  return true;
};

/**
 * Ends the commands of the given player.
 * If both players are waiting, a new turn is triggered.
 *
 * @param {Player} player The concerned player.
 * @return {Boolean} true if a new turn is triggered, false otherwise.
 *
 */
Game.prototype.commandsEnd = function(player) {
  var turnEnd = false;
  if (player !== this.player1 && player !== this.player2) {
    this.logger.error('The player ['+ player.email +'] does not exists');
    return false;
  }

  if (Object.keys(player.waitActions).length === 0) {
    this.logger.error('Commands End failed: player ['+ player.email +'] has no actions in his waiting list.');
    return false;
  }

  player.wait = true;
  this.logger.info('Commands end: '+ player.email +'');

  turnEnd = this.getOtherPlayer(player).wait;
  if (turnEnd) {
    this.turnEnd();
  }

  this.emit('update');
  return turnEnd;
};

/**
 * End of a turn.
 *
 * Triggers waiting actions, and launch the next turn.
 *
 */
Game.prototype.turnEnd = function() {
  var self = this,
      logger = this.logger;
  logger.info('End of turn.');

  // Move
  _.each([this.player1, this.player2], function(player) {
    if (player.waitActions.move && self.movePlayer(player, player.waitActions.move)) {
      logger.info('[move action]');
    }
  });

  // Attack
  _.each([this.player1, this.player2], function(player) {
    if (player.waitActions.attack && self.attackPlayer(player, player.waitActions.attack[0], player.waitActions.attack[1])) {
      logger.info('[attack action]');
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
