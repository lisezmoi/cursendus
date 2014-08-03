var jade = require('jade');

module.exports = function init(templatesPath, publicUrl) {
  var jrender = jade.compileFile(templatesPath + '/game.jade', {
    pretty: true
  });

  return function render(game) {
    return jrender({
      game: game,
      puburl: publicUrl
    });
  };
};
