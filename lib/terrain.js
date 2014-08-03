var rand = require('./utils2').getRandomInt;

var GROUND_SKINS = 5;
var SKY_SKINS = 2;
var TOP_SKINS = 2;

var SPECIAL_GROUND_SKIN = 4;
var SPECIAL_TOP_SKIN = 2;

var Terrain = {};

Terrain.toString = function toString() {
  return JSON.stringify(this);
};

function ground(x, y, width, height, skyHeight, moonPos) {
  var skin = 0;
  type = y > skyHeight? 'ground' : 'sky';
  skin = rand(0, y > skyHeight? GROUND_SKINS : SKY_SKINS) + 1;
  if (y === skyHeight) {
    type = 'top';
    skin = rand(0, TOP_SKINS) + 1;
  }
  if (moonPos[0] === x && moonPos[1] === y) skin = 'moon';

  // terrain-ground-4.gif (the stones) has 1/9 chance to be set again
  if (type === 'ground' && skin === SPECIAL_GROUND_SKIN && rand(0, 9)) {
    skin = rand(0, GROUND_SKINS) + 1;
  }

  // terrain-top-2.gif (the stones at the top) has 1/10 chance to be set again
  if (type === 'top' && skin === SPECIAL_TOP_SKIN && rand(0, 10)) {
    skin = rand(0, TOP_SKINS) + 1;
  }

  return {
    type: type,
    skin: skin
  };
}

function fillCells(skyHeight, width, height) {
  var cells = [];
  var type = '';
  var skin = 0;
  var moonPos = [rand(0, width), rand(0, skyHeight)];
  for (var i = 0; i < height; i++) {
    cells[i] = [];
    for (var j = 0; j < width; j++) {
      cells[i][j] = {
        ground: ground(j, i, width, height, skyHeight, moonPos)
      };
    }
  }
  return cells;
}

module.exports = {
  create: function create(width, height, skyHeight) {
    var terrain = Object.create(Terrain);
    terrain.width = width;
    terrain.height = height;
    terrain.skyHeight = skyHeight;
    terrain.moonRow = rand(0, skyHeight + 1);
    terrain.cells = fillCells(skyHeight, width, height);
    return terrain;
  }
};
