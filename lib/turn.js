var Turn = {};

Turn.toString = function toString() {
  return JSON.stringify(this);
};

module.exports = {
  create: function create(players, terrain) {
    return {
      p1: {
        player: players.p1,
        position: [0, 0]
      },
      p2: {
        player: players.p2,
        position: [terrain.width - 1, terrain.height -1]
      }
    };
  }
};
