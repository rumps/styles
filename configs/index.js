'use strict';

var extend = require('extend');
var path = require('path');
var rump = require('rump');

exports.rebuild = function() {
  rump.configs.main.globs = extend(true, {
    build: {
      styles: '*.css'
    },
    watch: {
      styles: '**/*.css'
    }
  }, rump.configs.main.globs);

  rump.configs.main.paths = extend(true, {
    source: {
      styles: 'styles'
    },
    destination: {
      styles: 'styles'
    }
  }, rump.configs.main.paths);

  rump.configs.main.styles = extend(true, {
    minify: rump.configs.main.environment === 'production',
    sourceMap: rump.configs.main.environment === 'development'
  }, rump.configs.main.styles);

  exports.pleeease = extend(true, {
    import: {
      path: [
        'node_modules',
        'bower_components',
        path.join(rump.configs.main.paths.source.root,
                  rump.configs.main.paths.source.styles)
      ]
    },
    next: true,
    minifier: rump.configs.main.styles.minify
  }, rump.configs.main.styles.pleeease);
};

exports.rebuild();
