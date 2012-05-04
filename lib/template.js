var _ = require('underscore'),
    async = require('async'),
    fs = require('fs'),
    ejs = require('ejs'),
    DEFAULT_SETTINGS = {
      root: __dirname + '/../tpl',
      open: '<%',
      close: '%>'
    },
    settings;

function init(opts) {
  settings = _.extend({}, DEFAULT_SETTINGS, opts);
}

function render(template, opts, renderCallback) {
  var body,
      tpl,
      loaders;
  opts = _.extend({}, settings, opts);
  loaders = [
    function(cb) {
      fs.readFile(settings.root + '/' + template + '.html', 'utf8', cb);
    },
    function(cb) {
      fs.readFile(settings.root + '/global.json', 'utf8', cb);
    }
  ];

  if (opts.layout) {
    loaders.push(function(cb) {
      fs.readFile(settings.root + '/' + opts.layout + '.html', 'utf8', cb);
    });
  }

  async.parallel(loaders, function(err, results){
    if (!err) {
      opts = _.extend({}, opts, JSON.parse(results[1]));
    }
    body = ejs.render(results[0], opts);

    // Layout
    if (loaders.length === 3) {
      opts.body = body;
      body = ejs.render(results[2], opts);
    }

    return renderCallback(body);
  });
}

module.exports = {
  init: init,
  render: render
};