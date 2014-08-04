var express = require('express');
var bodyParser = require('body-parser');
var jade = require('jade');
var createTurn = require('./turn').create;
var gameManager = require('./game-manager');
var makeHtmlRenderer = require('./renderers/html');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }))

function init(settings) {

  var templatesPath = settings.tplPath;
  var publicUrl = settings.publicUrl;
  var gameManager = settings.gameManager;

  var renderHome = null;
  var renderGame = null;
  var webserverTemplatePath = templatesPath + '/webserver.jade';

  function compileTemplates() {
    console.log('compile');
    renderHome = jade.compileFile(webserverTemplatePath, { pretty: true });
    renderGame = makeHtmlRenderer(templatesPath, publicUrl);
  }

  compileTemplates();

  app.get('/', function(req, res) {
    gameManager.list().then(function(games) {
      var html = '<body>\n';
      html += '<style>body,a{background:black;color:white;}</style>\n';
      html += '<form action="/new" method="post">\n';
      html += '<p><button>New game</button></p>\n';
      html += '</form>\n';
      html += '<h2>Active games:</h2>\n';
      html += '<ul>\n';
      html += games.map(function(game) {
        var humanTitle = game.players.p1.email + ' vs. ' + game.players.p2.email;
        return '<li><a href="/game/' + game.id + '">'+ humanTitle + '</a></li>';
      }).join('\n');
      html += '</ul>\n';
      html += '</body>\n';
      res.send(html);
    });
  });

  app.get('/game/:id', function(req, res) {
    if (settings.reloadTemplates) compileTemplates();
    gameManager.loadGameById(req.params.id).then(function(game) {
      res.send(renderHome({
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
