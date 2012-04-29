var _ = require('underscore'),
    fs = require('fs'),
    ejs = require('ejs'),
    DEFAULT_SETTINGS = {
      root: __dirname + '/../tpl',
      open: '<%',
      close: '%>'
    },
    settings;

function loadFile(tplname, opts) {
  var tpl = settings.root + '/' + tplname + '.html';
  return fs.readFileSync(tpl, 'utf8');
}

function init(opts) {
  settings = _.extend({}, DEFAULT_SETTINGS, opts);
}

function render(template, opts, cb) {
  var body,
      tpl = loadFile(template);

  // Globals
  fs.readFile(settings.root + '/global.json', 'utf8', function(err, data) {
    if (!err) {
      opts = _.extend({}, opts, JSON.parse(data));
    }
    opts = _.extend({}, settings, opts);

    body = ejs.render(tpl, opts);
    if (opts.layout) {
      tpl = loadFile(opts.layout);
      opts.body = body;
      body = ejs.render(tpl, opts);
    }
    return cb(body);
  });
}

module.exports = {
  init: init,
  render: render
};