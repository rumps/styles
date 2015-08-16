import '../src'
import bufferEqual from 'buffer-equal'
import convert from 'convert-source-map'
import gulp from 'gulp'
import timeout from 'timeout-then'
import rump from 'rump'
import {colors} from 'gulp-util'
import {readFile, writeFile} from 'mz/fs'
import {resolve, sep} from 'path'
import {spy} from 'sinon'

const {stripColor} = colors,
      protocol = process.platform === 'win32' ? 'file:///' : 'file://'

describe('tasks', function() {
  this.timeout(0)

  beforeEach(() => {
    rump.configure({
      environment: 'development',
      paths: {
        source: {root: 'test/src', styles: ''},
        destination: {root: 'tmp', styles: '', images: 'images'},
      },
    })
  })

  it('are added and defined', () => {
    const callback = spy()
    rump.on('gulp:main', callback)
    rump.on('gulp:styles', callback)
    rump.addGulpTasks({prefix: 'spec'})
    callback.should.be.calledTwice()
    gulp.tasks['spec:info:styles'].should.be.ok()
    gulp.tasks['spec:build:styles'].should.be.ok()
    gulp.tasks['spec:watch:styles'].should.be.ok()
  })

  it('displays correct information in info task', () => {
    const logs = [],
          {log} = console
    console.log = (...args) => logs.push(stripColor(args.join(' ')))
    gulp.start('spec:info')
    console.log = log
    logs.slice(-9).should.eql([
      '',
      '--- Styles v0.7.0',
      `Processed CSS files from test${sep}src are copied with source maps to tmp`,
      'Affected files:',
      'index.css',
      'less.less',
      'sass.scss',
      'stylus.styl',
      '',
    ])
  })

  describe('for building', () => {
    let originals

    before(async(done) => {
      originals = await Promise.all([
        readFile('test/src/index.css'),
        readFile('test/src/lib/variables.css'),
        readFile('test/src/less.less'),
        readFile('test/src/lib/variables.less'),
        readFile('test/src/sass.scss'),
        readFile('test/src/lib/variables.scss'),
        readFile('test/src/stylus.styl'),
        readFile('test/src/lib/variables.styl'),
      ])
      gulp.task('postbuild', ['spec:watch'], () => done())
      gulp.start('postbuild')
    })

    afterEach(async() => {
      await timeout(1000)
      await Promise.all([
        writeFile('test/src/index.css', originals[0]),
        writeFile('test/src/lib/variables.css', originals[1]),
        writeFile('test/src/less.less', originals[2]),
        writeFile('test/src/lib/variables.less', originals[3]),
        writeFile('test/src/sass.scss', originals[4]),
        writeFile('test/src/lib/variables.scss', originals[5]),
        writeFile('test/src/stylus.styl', originals[6]),
        writeFile('test/src/lib/variables.styl', originals[7]),
      ])
      await timeout(1000)
    })

    it('handles image paths for Sass', async() => {
      const content = await readFile('tmp/sass.css')
      content
        .toString()
        .should
        .containEql('background-image: url("images/sample.png")')
    })

    it('handles updates', async() => {
      const firstContents = await Promise.all([
        readFile('tmp/index.css'),
        readFile('tmp/less.css'),
        readFile('tmp/sass.css'),
        readFile('tmp/stylus.css'),
      ])
      let secondContents
      await timeout(1000)
      await Promise.all([
        writeFile('test/src/lib/variables.css', ':root{--color:black}'),
        writeFile('test/src/lib/variables.less', '@color: black;'),
        writeFile('test/src/lib/variables.scss', '$color: black;'),
        writeFile('test/src/lib/variables.styl', 'color = black'),
      ])
      await timeout(1000)
      secondContents = await Promise.all([
        readFile('tmp/index.css'),
        readFile('tmp/less.css'),
        readFile('tmp/sass.css'),
        readFile('tmp/stylus.css'),
      ])
      firstContents.forEach((firstContent, index) => {
        bufferEqual(firstContent, secondContents[index]).should.be.false()
      })
    })

    it('handles autoprefix', async() => {
      const contents = await Promise.all([
        readFile('tmp/index.css'),
        readFile('tmp/less.css'),
        readFile('tmp/sass.css'),
        readFile('tmp/stylus.css'),
      ])
      contents.map(content => {
        content.toString().should.containEql('display: flex')
        content.toString().should.containEql('display: -webkit-flex')
      })
    })

    it('handles source maps in development', async() => {
      const css = readFile('tmp/index.css'),
            less = readFile('tmp/less.css'),
            sass = readFile('tmp/sass.css'),
            stylus = readFile('tmp/stylus.css'),
            contents = await Promise.all([css, less, sass, stylus]),
            pathSet = contents
              .map(x => convert.fromSource(x.toString()))
              .map(x => x.getProperty('sources').sort()),
            paths = [].concat(...pathSet)
              .filter(x => x)
              .map(x => x.replace(protocol, '').split('/').join(sep))
      paths.should.eql([
        resolve('node_modules/normalize.css/normalize.css'),
        resolve('test/src/index.css'),
        resolve('node_modules/bootstrap/less/buttons.less'),
        resolve('node_modules/bootstrap/less/mixins/buttons.less'),
        resolve('node_modules/bootstrap/less/mixins/opacity.less'),
        resolve('node_modules/bootstrap/less/mixins/tab-focus.less'),
        resolve('node_modules/bootstrap/less/mixins/vendor-prefixes.less'),
        resolve('node_modules/normalize.css/normalize.css'),
        resolve('test/src/less.less'),
        resolve('node_modules/normalize-compass/normalize.scss'),
        resolve('test/src/sass.scss'),
        resolve('node_modules/normalize.css/normalize.css'),
        resolve('test/src/stylus.styl'),
      ])
    })

    it('handles minification in production', async() => {
      const firstContents = await Promise.all([
        readFile('tmp/index.css'),
        readFile('tmp/less.css'),
        readFile('tmp/sass.css'),
        readFile('tmp/stylus.css'),
      ])
      let secondContents
      rump.reconfigure({environment: 'production'})
      await timeout(1000)
      await Promise.all([
        writeFile('test/src/lib/variables.css', ':root{--color:orange}'),
        writeFile('test/src/lib/variables.less', '@color: orange;'),
        writeFile('test/src/lib/variables.scss', '$color: orange;'),
        writeFile('test/src/lib/variables.styl', 'color = orange'),
      ])
      await timeout(1000)
      secondContents = await Promise.all([
        readFile('tmp/index.css'),
        readFile('tmp/less.css'),
        readFile('tmp/sass.css'),
        readFile('tmp/stylus.css'),
      ])
      firstContents.forEach((firstContent, index) => {
        firstContent.length.should.be.above(secondContents[index].length)
      })
    })
  })
})
