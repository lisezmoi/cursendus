var jade = require('jade');

module.exports = function init(templatesPath) {
  var jrender = jade.compileFile(templatesPath + '/game.jade', {
    pretty: true
  });

  return function render(game) {
    return jrender({
      game: game,
      puburl: 'http://localhost/cursendus/public/'
    });
  };
};
