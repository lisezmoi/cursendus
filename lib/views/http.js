var util = require('util'),
    events = require('events'),
    url = require('url'),
    connect = require('connect'),
    _ = require('underscore'),
    fs = require('fs'),
    init = false;

function http404(res) {
  var body = '404';
  res.writeHead(404, {
    'Content-Length': body.length,
    'Content-Type': 'text/plain' });
  res.end(body, 'utf8');
}
function http302(res, url) {
  res.writeHead(302, { 'Location': url });
  res.end();
}

var HttpView = function() {
  events.EventEmitter.call(this);
};
util.inherits(HttpView, events.EventEmitter);

HttpView.prototype.start = function(gamesManager, template, pubsub, errorMessages, conf) {
  var self = this;

  if (init) return;
  init = true;

  function handleRequests(req, res) {
    var path = url.parse(req.url).path,
        routes = { GET: {}, POST: {} },
        htmlType = { 'Content-Type': 'text/html; charset=UTF-8' };

    // (get) test message template
    routes.GET['^(\/message\/?.*)'] = function(matches) {
      var query = url.parse(matches[1], true).query,
          body;

      if (!query.error || !errorMessages[query.error]) {
        return http404(res);
      }

      template.render('message', {
        layout: '_layout',
        mode: 'http',
        messageSubject: 'A message from Cursendus',
        messageBody: errorMessages[query.error],
        assetsUrl: conf.assetsUrl
      },
      function(body) {
        res.writeHead(200, htmlType);
        res.end(body);
      });
    };

    // (get) game (no player)
    routes.GET['^\/game\/([0-9]+)\/?$'] = function(matches) {
      var gameId = matches[1],
          body;

      gamesManager.getGame(gameId, function(game) {
        if (!game) {
          return http404(res);
        }
        res.writeHead(200, htmlType);
        res.write('<h1>Which player?</h1>');
        res.write('<ul>');
        res.write('<li><a href="/game/'+ game.id + '/' + game.player1  +'">(player 1) '+ game.player1 +'</a></li>')
        res.write('<li><a href="/game/'+ game.id + '/' + game.player2 +'">(player 2) '+ game.player2 +'</a></li>')
        res.write('</ul>');
        res.end();
      });
    };

    // (get) game with player
    routes.GET['^\/game\/([0-9]+)\/([^\/]+)\/?$'] = function(matches) {
      var gameId = matches[1],
          playerId = matches[2],
          body;

      gamesManager.getGame(gameId, function(game) {
        var player = game.getPlayerById(playerId);
        if (!game || !player) {
          return http404(res);
        }
        template.render('game', {
          layout: '_layout',
          mode: 'http',
          player1: game.player1,
          player2: game.player2,
          player: player,
          otherPlayer: game.getOtherPlayer(player),
          turn: game.turn,
          terrain: game.terrain.map,
          assetsUrl: conf.assetsUrl
        },
        function(body) {
          res.writeHead(200, htmlType);
          res.end(body);
        });
      });
    };

    // (get) new page
    routes.GET['^\/$'] = function(matches) {
      template.render('new', {}, function(body) {
        res.writeHead(200, htmlType);
        res.end(body);
      });
    };

    // (post) new game
    routes.POST['^\/new\/?$'] = function() {
      var player1 = req.body['player_1_email'],
          player2 = req.body['player_2_email'];

      if (!player1 || !player2) {
        return http404(res);
      }
      gamesManager.addGame(player1, player2, function(game) {
        var parsedUrl = url.parse(req.url);
        parsedUrl.pathname = '/game/' + game.id;
        parsedUrl.search = '';
        http302(res, url.format(parsedUrl));
      });
    };

    // (post) command
    routes.POST['^\/game\/([0-9]+)\/?$'] = function(matches) {
      var gameId = matches[1],
          requestBody, commands, player, commandStr;

      gamesManager.getGame(gameId, function(game) {
        if (!game) {
          return http404(res);
        }

        player = game.getPlayerById(req.body['player']);
        commandStr = req.body['command'];

        if (!player) {
          return http404(res);
        }
        if (!commandStr) {
          commandStr = '';
        }

        commands = commandStr.split(/\r\n|\r|\n/g);
        _.each(commands, function(command) {
          game.command(player, command);
        });
        game.commandsEnd(player);

        return http302(res, req.url);
      });
    };

    var routesMethod = req.method;
    if (!routes[routesMethod]) {
      return http404(res);
    }

    var routeMatches;
    for (var i in routes[routesMethod]) {
      routeMatches = path.match(new RegExp(i));
      if (routeMatches) {
        return routes[routesMethod][i](routeMatches);
        break;
      }
    }

    return http404(res);
  }

  connect()
    .use(connect.bodyParser())
    .use(handleRequests)
    .listen(3000);
};

module.exports = new HttpView;
