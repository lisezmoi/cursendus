var Turn = {};

Turn.toString = function toString() {
  return JSON.stringify(this);
};

module.exports = {
  create: function create(players, terrain) {
    return {
      char1: {
        player: players.p1,
        position: [0, terrain.skyHeight + 2]
      },
      char2: {
        player: players.p2,
        position: [terrain.width - 1, terrain.height - 1]
      }
    };
  }
};
