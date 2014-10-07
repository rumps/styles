'use strict';

var rump = module.exports = require('rump');
var configs = require('./configs');
var originalAddGulpTasks = rump.addGulpTasks;

rump.addGulpTasks = function() {
  originalAddGulpTasks();
  require('./gulp');
};

rump.on('update:main', function() {
  configs.rebuild();
  rump.emit('update:styles');
});
