var GameCore = require('./lib/core'),
    view = require('./lib/views/http'),
    connect = require('connect'),
    conf = require('./config'),
    init = false,
    httpView,
    games = {};

function main() {
  if (init) { return; }
  init = true;

  GameCore.configure(conf);

  // Static files
  connect()
    .use(connect.static('public'))
    .listen(3001);

  view.start(GameCore);
  // view.on('new game', function(gameId) {
  //
  // });
}

if (require.main === module) {
  main();
} else {
  module.exports = main;
}
