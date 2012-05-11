var Spell;

/**
 * A basic spell.
 *
 * @class Spell
 * @constructor
 *
 */
Spell = function() {
};

Spell.getAll = function() {
  return require('./spells');
};

module.exports = Spell;

