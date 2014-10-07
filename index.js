'use strict';

var rump = require('rump');
var configs = require('./configs');

exports.addGulpTasks = function() {
  rump.addGulpTasks();
  require('./gulp');
};

rump.on('update:main', function() {
  configs.rebuild();
  rump.emit('update:styles');
});
