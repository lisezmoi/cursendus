var util = require('util'),
    events = require('events'),
    url = require('url'),
    http = require('http'),
    _ = require('underscore'),
    fs = require('fs'),
    ejs = require('ejs'),
    init = false,
    skins = ['.', ' ', ' ', ' ', '-', '|', ' ', ' ', ' ', '*'],
    templatePath = __dirname + '/../../tpl/game.html';

function http404(res) {
  var body = '404';
  res.writeHead(404, {
    'Content-Length': body.length,
    'Content-Type': 'text/plain' });
  res.end(body, 'utf8');
}

function renderTerrain(terrain) {
  var text = '';
  _.each(terrain, function(line, i) {
    if (i > 0) text += '\n';
    _.each(line, function(cell) {
      text += skins[cell.skin];
    });
  });
  return text;
}

function renderTpl(opts) {
  var template = fs.readFileSync(templatePath, 'utf8');
  return ejs.render(template, opts);
}

var HttpView = function() {
  events.EventEmitter.call(this);
};
util.inherits(HttpView, events.EventEmitter);

HttpView.prototype.start = function(GameCore) {
  var self = this;

  if (init) return;
  init = true;

  http.createServer(function(req, res) {
    var path = url.parse(req.url).path,
        matches = path.match(/^\/game\/([0-9]+)\/?$/),
        gameId,
        game;
    if (!matches || matches.length < 2) {
      return http404(res);
    }

    gameId = matches[1];
    game = GameCore.getGame(gameId);

    var body = renderTpl({
      terrain: game.terrain
    });

    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(body);

  }).listen(3000);
};

module.exports = new HttpView;
