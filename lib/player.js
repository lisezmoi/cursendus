var Player;

Player = function(name) {
  this.name = name;
  this.health = 40;
  this.wait = false;
  this.waitActions = {};
};

module.exports = Player;
