'use strict';

var chalk = require('chalk');
var globule = require('globule');
var gulp = require('gulp');
var path = require('path');
var rump = require('rump');

gulp.task('rump:info:styles', function() {
  var glob = path.join(rump.configs.main.paths.source.root,
                       rump.configs.main.paths.source.styles,
                       rump.configs.main.globs.build.styles);
  var files = globule.find([glob].concat(rump.configs.main.globs.global));
  var source = path.join(rump.configs.main.paths.source.root,
                         rump.configs.main.paths.source.styles);
  var destination = path.join(rump.configs.main.paths.destination.root,
                              rump.configs.main.paths.destination.styles);
  var action = 'copied';

  switch(rump.configs.main.environment) {
    case 'development':
      action = 'copied ' + chalk.yellow('with source maps');
      break;
    case 'production':
      action = chalk.yellow('minified') + ' and copied';
      break;
  }

  console.log();
  console.log(chalk.magenta('--- Styles'));
  console.log('Processed CSS from', chalk.green(source),
              'is', action,
              'to', chalk.green(destination));

  if(files.length) {
    console.log('Affected files:');
    files.forEach(function(file) {
      console.log(chalk.blue(path.relative(source, file)));
    });
  }

  console.log();
});

gulp.tasks['rump:info'].dep.push('rump:info:styles');
