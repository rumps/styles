'use strict';

var convert = require('convert-source-map');
var gulp = require('gulp');
var pleeease = require('gulp-pleeease');
var plumber = require('gulp-plumber');
var rework = require('gulp-rework');
var sourcemaps = require('gulp-sourcemaps');
var util = require('gulp-util');
var path = require('path');
var at2x = require('rework-plugin-at2x');
var rump = require('rump');
var through = require('through2');
var protocol = process.platform === 'win32' ? 'file:///' : 'file://';

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
    .pipe((sourceMap ? sourcemaps.write : util.noop)())
    .pipe(rework(at2x()))
    .pipe(sourceMap ? through.obj(sourceMapRewriter) : util.noop())
    .pipe(gulp.dest(destination));

  // Clear out autoprefixer's data and fix paths to match original
  function sourceMapRewriter(file, enc, callback) {
    if(file.isNull()) {
      return callback(null, file);
    }

    var content = file.contents.toString();
    var sourceMap = convert.fromSource(content);
    var sources = sourceMap.getProperty('sources');
    sourceMap.setProperty('sourceRoot', null);
    sourceMap.setProperty('sources', sources.map(rewriteUrl));
    content = convert.removeComments(content) +
      '\n/*# sourceMappingURL=data:application/json;base64,' +
      sourceMap.toBase64() +
      ' */';
    file.contents = new Buffer(content);
    callback(null, file);
  }

  function rewriteUrl(url) {
    if(!/^(node_modules|bower_components)\//.test(url)) {
      url = path.join(sourcePath, url);
    }
    return protocol + path.resolve(url).split(path.sep).join('/');
  }
});

gulp.tasks[rump.taskName('build')].dep.push(rump.taskName('build:styles'));
