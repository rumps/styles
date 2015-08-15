import convert from 'convert-source-map'
import extend from 'extend'
import gulp, {tasks} from 'gulp'
import pleeease from 'gulp-pleeease'
import plumber from 'gulp-plumber'
import filter from 'gulp-filter'
import rump from 'rump'
import through from 'through2'
import {noop} from 'gulp-util'
import {join, resolve, sep} from 'path'

const {configs} = rump,
      dest = ::gulp.dest,
      name = ::rump.taskName,
      protocol = process.platform === 'win32' ? 'file:///' : 'file://',
      src = ::gulp.src,
      task = ::gulp.task

task(name('build:styles'), () => {
  const {sourceMap} = configs.main.styles,
        sourcePath = join(configs.main.paths.source.root,
                          configs.main.paths.source.styles),
        source = join(sourcePath, configs.main.globs.build.styles),
        destination = join(configs.main.paths.destination.root,
                           configs.main.paths.destination.styles),
        cssFilter = filter(['**/*.css'], {restore: true}),
        cssConfig = extend({
          less: false,
          sass: false,
          stylus: false,
        }, rump.configs.pleeease),
        lessFilter = filter(['**/*.less'], {restore: true}),
        lessConfig = extend({
          less: true,
          sass: false,
          stylus: false,
        }, rump.configs.pleeease),
        scssFilter = filter(['**/*.scss'], {restore: true}),
        scssConfig = extend({
          less: false,
          sass: true,
          stylus: false,
        }, rump.configs.pleeease),
        stylFilter = filter(['**/*.styl'], {restore: true}),
        stylConfig = extend({
          less: false,
          sass: false,
          stylus: true,
        }, rump.configs.pleeease)

  return src([source].concat(configs.main.globs.global))
    .pipe((configs.watch ? plumber : noop)())
    .pipe(cssFilter)
    .pipe(pleeease(cssConfig))
    .pipe(cssFilter.restore)
    .pipe(lessFilter)
    .pipe(pleeease(lessConfig))
    .pipe(lessFilter.restore)
    .pipe(scssFilter)
    .pipe(pleeease(scssConfig))
    .pipe(scssFilter.restore)
    .pipe(stylFilter)
    .pipe(pleeease(stylConfig))
    .pipe(stylFilter.restore)
    .pipe((sourceMap ? through.obj : noop)(sourceMapRewriter))
    .pipe(dest(destination))

  // Clear out autoprefixer's data and fix paths to match original
  function sourceMapRewriter(file, enc, callback) {
    if(file.isNull()) {
      return callback(null, file)
    }

    let content = file.contents.toString()
    const sourceMap = convert.fromSource(content),
          sources = sourceMap.getProperty('sources')
    sourceMap.setProperty('sourceRoot', null)
    sourceMap.setProperty('sources', sources.map(rewriteUrl))
    content = [
      convert.removeComments(content),
      '\n',
      '/*# sourceMappingURL=data:application/json;base64,',
      sourceMap.toBase64(),
      ' */',
    ].join('')
    file.contents = new Buffer(content)
    return callback(null, file)

    function rewriteUrl(url) {
      if(url === '<no-source>') {
        url = file.path
      }
      else if(!/^(node_modules|bower_components)\//.test(url)) {
        url = join(sourcePath, url)
      }
      return `${protocol}${resolve(url).split(sep).join('/')}`
    }
  }
})

tasks[name('build')].dep.push(name('build:styles'))
