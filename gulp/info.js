'use strict';

var globule = require('globule');
var gulp = require('gulp');
var path = require('path');
var rump = require('rump');
var util = require('gulp-util');

gulp.task('rump:info:styles', function() {
  var glob = path.join(rump.configs.main.paths.source.root,
                       rump.configs.main.paths.source.styles,
                       rump.configs.main.globs.build.styles);
  var files = globule.find([glob].concat(rump.configs.main.globs.global));
  var source = path.join(rump.configs.main.paths.source.root,
                         rump.configs.main.paths.source.styles);
  var destination = path.join(rump.configs.main.paths.destination.root,
                              rump.configs.main.paths.destination.styles);

  util.log('CSS files from', util.colors.green(source),
           'are generated and copied to', util.colors.green(destination));

  if(files.length) {
    util.log('Affected files:');
    files.forEach(function(file) {
      util.log(util.colors.blue(path.relative(source, file)));
    });
  }
});

gulp.tasks['rump:info'].dep.push('rump:info:styles');
