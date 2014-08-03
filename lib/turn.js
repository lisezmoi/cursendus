var Turn = {};

Turn.toString = function toString() {
  return JSON.stringify(this);
};

module.exports = {
  createFirst: function createFirst(players, terrain) {
    return {
      char1: {
        id: 1,
        player: players.p1,
        position: [0, terrain.skyHeight + 2]
      },
      char2: {
        id: 2,
        player: players.p2,
        position: [terrain.width - 1, terrain.height - 1]
      }
    }
  },
  create: function create(pos1, pos2) {
    return {
      char1: { id: 1, position: pos1 },
      char2: { id: 2, position: pos2 }
    };
  }
};
