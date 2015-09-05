import convert from 'convert-source-map'
import extend from 'extend'
import gulp, {dest, src, tasks} from 'gulp'
import pleeease from 'gulp-pleeease'
import plumber from 'gulp-plumber'
import filter from 'gulp-filter'
import rename from 'gulp-rename'
import rump from 'rump'
import through from 'through2'
import {noop} from 'gulp-util'
import {join, resolve, sep} from 'path'

const name = ::rump.taskName
const protocol = process.platform === 'win32' ? 'file:///' : 'file://'
const task = ::gulp.task
const {configs} = rump

task(name('build:styles'), () => {
  const sourcePath = join(configs.main.paths.source.root,
                          configs.main.paths.source.styles)
  const source = join(sourcePath, configs.main.globs.build.styles)
  const destination = join(configs.main.paths.destination.root,
                           configs.main.paths.destination.styles)
  const nonCssFilter = filter(['**/*.{less,scss,styl}'], {restore: true})
  const cssFilter = filter(['**/*.css'], {restore: true})
  const cssConfig = extend({}, rump.configs.pleeease, {
    less: false,
    sass: false,
    stylus: false,
  })
  const lessFilter = filter(['**/*.less'], {restore: true})
  const lessConfig = extend({}, rump.configs.pleeease, {
    sass: false,
    stylus: false,
  })
  const scssFilter = filter(['**/*.scss'], {restore: true})
  const scssConfig = extend({}, rump.configs.pleeease, {
    less: false,
    stylus: false,
  })
  const stylFilter = filter(['**/*.styl'], {restore: true})
  const stylConfig = extend({}, rump.configs.pleeease, {
    less: false,
    sass: false,
  })
  const {sourceMap} = configs.main.styles

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
    .pipe(nonCssFilter)
    .pipe(rename({extname: '.css'}))
    .pipe(nonCssFilter.restore)
    .pipe(dest(destination))

  // Clear out autoprefixer's data and fix paths to match original
  function sourceMapRewriter(file, enc, callback) {
    if(file.isNull()) {
      return callback(null, file)
    }

    let content = file.contents.toString()
    const sourceMap = convert.fromSource(content)
    const sources = sourceMap.getProperty('sources')
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

    function rewriteUrl(oldUrl) {
      let url = oldUrl
      if(url === '<no-source>') {
        url = file.path
      }
      else if(url === '<no-output>') {
        return ''
      }
      else if(!/^(node_modules|bower_components)\//.test(url)) {
        url = join(sourcePath, url)
      }
      return `${protocol}${resolve(url).split(sep).join('/')}`
    }
  }
})

tasks[name('build')].dep.push(name('build:styles'))
