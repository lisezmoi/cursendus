var Player;

Player = function(playerObj) {
  if (typeof playerObj === 'object') {
    this.email = playerObj.email;
    this.health = playerObj.health;
    this.dead = playerObj.dead;
    this.wait = playerObj.wait;
    this.waitActions = playerObj.waitActions;
    this.position = playerObj.position;
    this.skin = playerObj.skin;
    return;
  }
  this.email = playerObj;
  this.health = 40;
  this.dead = false;
  this.wait = false;
  this.waitActions = {};
  this.position = [0, 0];
};

Player.prototype.toString = function() {
  return this.email;
}

module.exports = Player;