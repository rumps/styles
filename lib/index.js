'use strict';

var rump = module.exports = require('rump');
var configs = require('./configs');
var originalAddGulpTasks = rump.addGulpTasks;

// TODO remove on next major core update
rump.addGulpTasks = function(options) {
  originalAddGulpTasks(options);
  require('./gulp');
  return rump;
};

rump.on('update:main', function() {
  configs.rebuild();
  rump.emit('update:styles');
});

rump.on('gulp:main', function(options) {
  require('./gulp');
  rump.emit('gulp:styles', options);
});

Object.defineProperty(rump.configs, 'pleeease', {
  get: function() {
    return configs.pleeease;
  }
});
