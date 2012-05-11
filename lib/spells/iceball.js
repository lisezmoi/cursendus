var util = require('util'),
    Spell = require('../spell'),
    Iceball;

/**
 * A Iceball spell.
 *
 * @class Iceball
 * @constructor
 * @extends Spell
 *
 */
Iceball = function() {
  Spell.call(this);
};
util.inherits(Iceball, Spell);

Iceball.readName = 'Iceball';
Iceball.shortcut = 'ib';
Iceball.damages = [10, 20];
Iceball.points = 2;
Iceball.description = 'Launch a glacial ball of ice, which freeze your target. Damages from '
                       + Iceball.damages[0] + ' to ' + Iceball.damages[1] + '.';
Iceball.image = 'iceball.png';

module.exports = Iceball;

