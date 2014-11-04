'use strict';

var chalk = require('chalk');
var globule = require('globule');
var gulp = require('gulp');
var path = require('path');
var rump = require('rump');
var pkg = require('../package');

gulp.task(rump.taskName('info:styles'), function() {
  var glob = path.join(rump.configs.main.paths.source.root,
                       rump.configs.main.paths.source.styles,
                       rump.configs.main.globs.build.styles);
  var files = globule.find([glob].concat(rump.configs.main.globs.global));
  var source = path.join(rump.configs.main.paths.source.root,
                         rump.configs.main.paths.source.styles);
  var destination = path.join(rump.configs.main.paths.destination.root,
                              rump.configs.main.paths.destination.styles);
  var action = 'copied';

  if(!files.length) {
    return;
  }

  if(rump.configs.main.styles.sourceMap) {
    action += ' ' + chalk.yellow('with source maps');
  }

  if(rump.configs.main.styles.minify) {
    action = chalk.yellow('minified') + ' and ' + action;
  }

  console.log();
  console.log(chalk.magenta('--- Styles', 'v' + pkg.version));
  console.log('Processed CSS files from', chalk.green(source),
              'are', action,
              'to', chalk.green(destination));
  console.log('Affected files:');
  files.forEach(function(file) {
    console.log(chalk.blue(path.relative(source, file)));
  });

  console.log();
});

gulp.tasks[rump.taskName('info')].dep.push(rump.taskName('info:styles'));
