'use strict';

var merge = require('merge');
var rump = require('rump');

exports.rebuild = function() {
  rump.configs.main.globs = merge.recursive({
    build: {
      styles: '*.css'
    },
    watch: {
      styles: '**/*.css'
    }
  }, rump.configs.main.globs);

  rump.configs.main.paths = merge.recursive({
    source: {
      styles: 'styles'
    },
    destination: {
      styles: 'styles'
    }
  }, rump.configs.main.paths);
};

exports.rebuild();
