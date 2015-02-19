'use strict';

var assert = require('better-assert');
var fs = require('graceful-fs');
var gulp = require('gulp');
var util = require('gulp-util');
var any = require('lodash/collection/any');
var toArray = require('lodash/lang/toArray');
var sinon = require('sinon');
var rump = require('../lib');
var configs = require('../lib/configs');

describe('rump styles tasks', function() {
  var original;

  before(function() {
    original = fs.readFileSync('test/src/lib/variables.css').toString();
  });

  beforeEach(function() {
    rump.configure({
      environment: 'development',
      paths: {
        source: {
          root: 'test/src',
          styles: ''
        },
        destination: {
          root: 'tmp',
          styles: ''
        }
      }
    });
    configs.watch = false;
  });

  after(function() {
    fs.writeFileSync('test/src/lib/variables.css', original);
  });

  it('are added and defined', function() {
    var callback = sinon.spy();
    rump.on('gulp:main', callback);
    rump.on('gulp:styles', callback);
    rump.addGulpTasks({prefix: 'spec'});
    // TODO Remove no callback check on next major core update
    assert(!callback.called || callback.calledTwice);
    assert(gulp.tasks['spec:info:styles']);
    assert(gulp.tasks['spec:build:styles']);
    assert(gulp.tasks['spec:watch:styles']);
  });

  it('info:styles', function() {
    var oldLog = console.log;
    var logs = [];
    console.log = function() {
      logs.push(util.colors.stripColor(toArray(arguments).join(' ')));
    };
    gulp.start('spec:info');
    console.log = oldLog;
    assert(any(logs, hasPaths));
    assert(any(logs, hasCssFile));
    assert(!any(logs, hasVariablesFile));
  });

  it('build:styles, watch:styles', function(done) {
    gulp.task('postbuild', ['spec:watch'], function() {
      var firstResult = fs.readFileSync('tmp/index.css').toString();
      assert(~firstResult.indexOf('display: flex'));
      assert(~firstResult.indexOf('display: -webkit-flex'));
      timeout(function() {
        fs.writeFileSync('test/src/lib/variables.css', ':root{--color:black}');
        timeout(function() {
          var secondResult = fs.readFileSync('tmp/index.css').toString();
          assert(firstResult !== secondResult);
          rump.reconfigure({environment: 'production'});
          fs.writeFileSync('test/src/lib/variables.css',
                           ':root{--color:white}');
          timeout(function() {
            var thirdResult = fs.readFileSync('tmp/index.css').toString();
            assert(firstResult.length > thirdResult.length);
            assert(secondResult.length > thirdResult.length);
            done();
          }, 950);
        }, 950);
      }, 950);
    });
    gulp.start('postbuild');
  });
});

function hasCssFile(log) {
  return log === 'index.css';
}

function hasVariablesFile(log) {
  return ~log.indexOf('variables.css');
}

function hasPaths(log) {
  return ~log.indexOf('test/src') && ~log.indexOf('tmp');
}

function timeout(cb, delay) {
  process.nextTick(function() {
    setTimeout(function() {
      process.nextTick(cb);
    }, delay || 0);
  });
}
