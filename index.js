var Game = require('./lib/game'),
    view = require('./lib/views/http'),
    connect = require('connect'),
    conf = require('./config'),
    init = false;

function main() {
  if (init) { return; }
  init = true;

  Game.configure(conf);

  // Static files
  connect()
    .use(connect.static('public'))
    .listen(3001);

  view.start(Game);
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
