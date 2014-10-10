'use strict';

var extend = require('extend');
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
};

exports.rebuild();
