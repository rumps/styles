'use strict';

var at2x = require('rework-plugin-at2x');
var gulp = require('gulp');
var path = require('path');
var pleeease = require('gulp-pleeease');
var plumber = require('gulp-plumber');
var rework = require('gulp-rework');
var rump = require('rump');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');

gulp.task(rump.taskName('build:styles'), function() {
  var sourcePath = path.join(rump.configs.main.paths.source.root,
                             rump.configs.main.paths.source.styles);
  var source = path.join(sourcePath, rump.configs.main.globs.build.styles);
  var destination = path.join(rump.configs.main.paths.destination.root,
                              rump.configs.main.paths.destination.styles);
  var sourceMap = rump.configs.main.styles.sourceMap;

  return gulp
    .src([source].concat(rump.configs.main.globs.global))
    .pipe((rump.configs.watch ? plumber : util.noop)())
    .pipe((sourceMap ? sourcemaps.init : util.noop)())
    .pipe(pleeease(rump.configs.pleeease))
    .pipe((sourceMap ? sourcemaps.write : util.noop)({
      sourceRoot: path.resolve(sourcePath)
    }))
    .pipe(rework(at2x()))
    .pipe(gulp.dest(destination));
});

gulp.tasks[rump.taskName('build')].dep.push(rump.taskName('build:styles'));
