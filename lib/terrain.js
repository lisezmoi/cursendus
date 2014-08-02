var utils2 = require('./utils2');

var Terrain = {};

Terrain.toString = function toString() {
  return JSON.stringify(this);
};

module.exports = {
  create: function create(width, height, skyHeight) {
    var terrain = Object.create(Terrain);
    terrain.width = width;
    terrain.height = height;
    terrain.skyHeight = skyHeight;
    terrain.moonRow = utils2.getRandomInt(0, skyHeight + 1);
    return terrain;
  }
};
