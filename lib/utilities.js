/* From MDN: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Math/random */
module.exports.randomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
