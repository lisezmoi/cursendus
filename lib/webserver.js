var express = require('express');
var bodyParser = require('body-parser');
var jade = require('jade');
var createTurn = require('./turn').create;
var gameManager = require('./game-manager');
var makeHtmlRenderer = require('./renderers/html');

var jadeOptions = { pretty: true };

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

function init(settings) {

  var templatesPath = settings.tplPath;
  var publicUrl = settings.publicUrl;
  var gameManager = settings.gameManager;

  var renderGameLayout = null;
  var renderGamesList = null;
  var renderGame = null;
  var gameLayoutTemplate = templatesPath + '/webserver/game-layout.jade';
  var gamesListTemplate = templatesPath + '/webserver/games-list.jade';

  function compileTemplates() {
    renderGameLayout = jade.compileFile(gameLayoutTemplate, jadeOptions);
    renderGamesList = jade.compileFile(gamesListTemplate, jadeOptions);
    renderGame = makeHtmlRenderer(templatesPath, publicUrl);
  }

  compileTemplates();

  app.get('/', function(req, res) {
    if (settings.reloadTemplates) compileTemplates();
    gameManager.list().then(function(games) {
      res.send(renderGamesList({ games: games }));
    });
  });

  app.get('/game/:id', function(req, res) {
    if (settings.reloadTemplates) compileTemplates();
    gameManager.loadGameById(req.params.id).then(function(game) {
      res.send(renderGameLayout({
        game: game,
        gameView: renderGame(game)
      }));
    });
  });

  app.post('/new', function(req, res) {
    gameManager.createGame('bob@example.com', 'alice@example.com')
      .then(function(game) {
        res.redirect('/game/' + game.id);
      });
  });


  app.post('/game/:id/command', function(req, res) {
    var command = req.body.command;
    if (!command) return;

    var player = command.split('-')[0];
    var direction = command.split('-')[1];

    gameManager.loadGameById(req.params.id).then(function(game) {

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

      gameManager.saveGame(game).then(function() {
        res.redirect('/game/' + game.id);
      });
    });
  });

  app.listen(settings.port);
}

module.exports = init;
