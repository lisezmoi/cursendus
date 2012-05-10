var Line;

/**
 * A line, traced by a wizard.
 *
 * @class Line
 * @constructor
 * @param {Array} path The path to load.
 *
 */
Line = function(path) {
  this.path = (path && path.path)? path.path : [];
};

/**
 * Trace a line block.
 *
 * @method trace
 * @param {Array} coords Coordinates of the new block: [x, y]
 * @return {Number} The new length of the path.
 *
 */
Line.prototype.trace = function(x, y) {
  this.path.push([y, x]);
  return this.path.length;
};

/**
 * "Use" (clear) the line.
 *
 * @method use
 * @return {Number} Return the length before clear.
 *
 */
Line.prototype.use = function() {
  var pathLength = this.path.length;
  this.path = this.path.slice(-1);
  return pathLength;
};

module.exports = Line;

