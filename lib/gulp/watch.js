'use strict';

var gulp = require('gulp');
var path = require('path');
var rump = require('rump');

gulp.task(rump.taskName('watch:styles'),
          [rump.taskName('build:styles')],
          function() {
  var glob = path.join(rump.configs.main.paths.source.root,
                       rump.configs.main.paths.source.styles,
                       rump.configs.main.globs.watch.styles);
  gulp.watch([glob].concat(rump.configs.main.globs.global),
             [rump.taskName('build:styles')]);
});

gulp.tasks[rump.taskName('watch')].dep.push(rump.taskName('watch:styles'));
