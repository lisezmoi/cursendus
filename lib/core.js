var util = require('util'),
    events = require('events'),
    _ = require('underscore'),
    Player = require('./player'),
    Terrain = require('./terrain'),
    conf = require('../config'),
    games = {},
    Core,
    commands = {
      move: /^move (N|E|S|W)/
    };

Core = function(id, player1Name, player2Name) {
  events.EventEmitter.call(this);
  this.id = id;
  this.turn = 1;
  this.player1 = new Player(player1Name);
  this.player2 = new Player(player2Name);
  this.terrain = new Terrain();

  this.player1.skin = 1;
  this.player2.skin = 2;

  // Add players
  var p1Added = this.terrain.occupy(this.player1, 0, 6),
      p2Added = this.terrain.occupy(this.player2,
        conf.terrainDimensions[0]-1,
        conf.terrainDimensions[1]-1);

  if (!p1Added || !p2Added) {
    // TODO: error handling
    console.log('Error: players not added to the map');
  }

  this.player1.position = [0, 6];
  this.player2.position = [conf.terrainDimensions[0]-1,
                           conf.terrainDimensions[1]-1];
};
util.inherits(Core, events.EventEmitter);

Core.configure = function(configuration) {
  _.extend(conf, configuration);
};

Core.getGame = function(id) {
  return games[id] || false;
};

Core.addGame = function(id, player1, player2) {
  if (games[id] || !id || !player1 || !player2 || player1 === player2) {
    return false;
  }
  games[id] = new Core(id, player1, player2);
  return games[id];
};

Core.prototype.movePlayer = function(player, direction) {
  var oldX = player.position[0],
      oldY = player.position[1],
      x = player.position[0],
      y = player.position[1],
      isOccupied;
  switch (direction) {
    case 'N':
      y--;
      break;
    case 'E':
      x++;
      break;
    case 'S':
      y++;
      break;
    case 'W':
      x--;
      break;
  }

  isOccupied = this.terrain.isOccupied(x, y);
  if (isOccupied instanceof Error || isOccupied) {
    return false;
  }

  this.terrain.release(oldX, oldY);
  this.terrain.occupy(player, x, y);
  player.position = [x, y];
  return true;
}

Core.prototype.getPlayerById = function(playerId) {
  if (this.player1.name === playerId) {
    return this.player1;
  } else if (this.player2.name === playerId) {
    return this.player2;
  } else {
    return false;
  }
};

Core.prototype.getOtherPlayer = function(player) {
  if (this.player1 === player) {
    return this.player2;
  } else if (this.player2 === player) {
    return this.player1;
  }
  return false;
};

Core.prototype.command = function(playerId, commandStr) {
  var self = this, command, commandValue, player;

  player = self.getPlayerById(playerId);
  if (!player) {
    console.log('[PLAYER DOES NOT EXISTS] %s', playerId);
    return false;
  }

  for (var i in commands) {
    if (commands.hasOwnProperty(i) && commands[i].test(commandStr)) {
      command = i;
      break;
    }
  }

  if (!command) {
    console.log('[COMMAND DOES NOT EXISTS] %s: %s', playerId, commandStr);
    return false;
  }

  commandValue = commandStr.match(commands[command]);

  console.log('[COMMAND] %s: %s', playerId, command);

  switch (command) {
    case 'move':
      player.waitActions.move = function() {
        if (self.movePlayer(player, commandValue[1])) {
          console.log('MOVE OK!');
        }
      };
      break;
  }

  // console.log(gameId, playerId, command);
};

Core.prototype.commandsEnd = function(playerId) {
  var player = this.getPlayerById(playerId);
  if (!player) {
    console.log('[PLAYER DOES NOT EXISTS] %s', playerId);
    return false;
  }
  player.wait = true;

  if (this.getOtherPlayer(player).wait) {
    this.turnEnd();
  }
};

Core.prototype.turnEnd = function() {
  _.each([this.player1, this.player2], function(player) {
    _.each(player.waitActions, function(action) {
      action();
    });
    player.waitActions = {};
    player.wait = false;
  });

  this.turn++;
};

module.exports = Core;
