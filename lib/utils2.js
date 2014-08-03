var util = require('util');

module.exports = {
  getRandomInt: function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  inspect: function inspect(obj) {
    console.log(util.inspect(obj, { colors: true, depth: 20 }));
  }
};
