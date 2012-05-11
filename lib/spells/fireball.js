var util = require('util'),
    Spell = require('../spell'),
    Fireball;

/**
 * A fireball spell.
 *
 * @class Fireball
 * @constructor
 * @extends Spell
 *
 */
Fireball = function() {
  Spell.call(this);
};
util.inherits(Fireball, Spell);

Fireball.readName = 'Fireball';
Fireball.shortcut = 'fb';
Fireball.damages = [10, 20];
Fireball.points = 1;
Fireball.description = 'Launch great ball of fire, which burns your target. Damages from '
                       + Fireball.damages[0] + ' to ' + Fireball.damages[1] + '.';
Fireball.image = 'fireball.png';

module.exports = Fireball;

