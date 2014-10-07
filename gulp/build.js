'use strict';

var at2x = require('rework-plugin-at2x');
var csso = require('gulp-csso');
var gulp = require('gulp');
var myth = require('gulp-myth');
var path = require('path');
var plumber = require('gulp-plumber');
var rework = require('gulp-rework');
var rump = require('rump');
var util = require('gulp-util');

gulp.task('rump:build:styles', function() {
  var source = path.join(rump.configs.main.paths.source.root,
                         rump.configs.main.paths.source.styles,
                         rump.configs.main.globs.build.styles);
  var destination = path.join(rump.configs.main.paths.destination.root,
                              rump.configs.main.paths.destination.styles);
  var development = rump.configs.main.environment === 'development';
  var production = rump.configs.main.environment === 'production';

  return gulp
  .src([source].concat(rump.configs.main.globs.global))
  .pipe((rump.configs.watch ? plumber : util.noop)())
  .pipe(myth({sourcemap: development}))
  .pipe(rework(at2x(), {sourcemap: development}))
  .pipe((production ? csso : util.noop)())
  .pipe(gulp.dest(destination));
});

gulp.tasks['rump:build'].dep.push('rump:build:styles');
