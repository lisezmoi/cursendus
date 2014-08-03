/*global module:false*/
module.exports = function(grunt) {

  var fs = require('fs'),
      jsPrefix = 'js';
      jsFiles = [
        'underscore.js',
        'request-animation-frame.js',
        'particles.js',
        'main.js'
      ],
      jsConcat = 'cursendus.js',
      jsConcatMin = 'cursendus.min.js',
      screenshot = 'img/screenshot-1.gif',
      screenshotThumb = 'img/screenshot-1-thumb.gif',
      screenshotThumbWidth = 300;


  jsFiles = jsFiles.map(function(filename) {
    return  jsPrefix + '/' + filename;
  });
  jsFiles.unshift('<banner:meta.banner>');

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! Cursendus website - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */',
      jsbanner: '<%= meta.banner %>\n/*! Uncompressed files:\n  ' +
        jsFiles.slice(1).join('\n  ') + ' */'
    },
    concat: {
      dist: {
        src: jsFiles,
        dest: jsPrefix + '/' + jsConcat
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.jsbanner>', '<config:concat.dist.dest>'],
        dest: jsPrefix + '/' + jsConcatMin
      }
    },
    cssmin: {
      dist: {
        src: ['<banner:meta.banner>', 'css/main.css'],
        dest: 'css/cursendus.min.css'
      }
    },
    uglify: {}
  });

  grunt.task.loadNpmTasks('grunt-css');

  grunt.registerTask('screenshot', 'Resize the screenshot.', function() {
    var done = this.async(),
        im = require('imagemagick'),
        imOpts = {
          srcPath: screenshot,
          dstPath: screenshotThumb,
          format: 'gif',
          width: screenshotThumbWidth,
          height: ''
        };
    im.resize(imOpts, function(err, stdout, stderr) {
      if (err) throw err;
      console.log('resized '+ screenshot +' to '+ screenshotThumbWidth +'px.');
      done();
    });
  });

  // Default task.
  grunt.registerTask('default', 'concat min cssmin');

};
