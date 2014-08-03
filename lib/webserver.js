var makeHtmlRenderer = require('./renderers/html');
var express = require('express');
var bodyParser = require('body-parser');
var jade = require('jade');
var createTurn = require('./turn').create;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

function init(game, templatesPath, port) {

  var renderHome = jade.compileFile(templatesPath + '/webserver.jade', {
    pretty: true
  });

  var renderGame = makeHtmlRenderer(templatesPath);

  app.get('/', function(req, res) {
    res.send(renderHome({
      gameView: renderGame(game)
    }));
  });

  app.post('/command', function(req, res) {
    var command = req.body.command;
    if (!command) return;
    var player = command.split('-')[0];
    var direction = command.split('-')[1];

    var turn = game.currentTurn();
    var p1x = turn.char1.position[0];
    var p1y = turn.char1.position[1];
    var p2x = turn.char2.position[0];
    var p2y = turn.char2.position[1];

    if (player === 'p1') {
      if (direction === 'left') p1x--;
      if (direction === 'right') p1x++;
      if (direction === 'top') p1y--;
      if (direction === 'bottom') p1y++;
    }

    if (player === 'p2') {
      if (direction === 'left') p2x--;
      if (direction === 'right') p2x++;
      if (direction === 'top') p2y--;
      if (direction === 'bottom') p2y++;
    }

    game.turns.push(createTurn([p1x, p1y], [p2x, p2y]));

    res.redirect('/');
  });

  app.listen(3000);
}

module.exports = init;
