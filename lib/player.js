var Player;

Player = function(playerObj) {
  if (typeof playerObj === 'object') {
    this.email = playerObj.email;
    this.health = playerObj.health;
    this.wait = playerObj.wait;
    this.waitActions = playerObj.waitActions;
    this.position = playerObj.position;
    this.skin = playerObj.skin;
    return;
  }
  this.email = playerObj;
  this.health = 40;
  this.wait = false;
  this.waitActions = {};
  this.position = [0, 0];
};

module.exports = Player;
