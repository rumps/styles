'use strict';

var gulp = require('gulp');
var path = require('path');
var rump = require('rump');

gulp.task('rump:watch:styles', ['rump:build:styles'], function() {
  var glob = path.join(rump.configs.main.paths.source.root,
                       rump.configs.main.paths.source.styles,
                       rump.configs.main.globs.watch.styles);
  gulp.watch([glob].concat(rump.configs.main.globs.global),
             ['rump:build:styles']);
});

gulp.tasks['rump:watch'].dep.push('rump:watch:styles');
