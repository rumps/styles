import '../src'
import bufferEqual from 'buffer-equal'
import convert from 'convert-source-map'
import gulp from 'gulp'
import timeout from 'timeout-then'
import rump from 'rump'
import {colors} from 'gulp-util'
import {exists, readFile, writeFile} from 'mz/fs'
import {resolve, sep} from 'path'
import {spy} from 'sinon'

const protocol = process.platform === 'win32' ? 'file:///' : 'file://',
      {stripColor} = colors

describe('tasks', function() {
  this.timeout(0)

  afterEach(() => {
    rump.configure({environment: 'development', paths: {
      source: {root: 'test/fixtures', styles: ''},
      destination: {root: 'tmp', styles: '', images: 'images'},
    }})
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
    console.log = newLog
    gulp.start('spec:info')
    console.log = log
    logs.slice(-9).should.eql([
      '',
      '--- Styles v0.7.0',
      `Processed CSS files from test${sep}fixtures are copied with source maps to tmp`,
      'Affected files:',
      'index.css',
      'less.less',
      'sass.scss',
      'stylus.styl',
      '',
    ])
    logs.length = 0
    console.log = newLog
    gulp.start('spec:info:prod')
    console.log = log
    logs.slice(-9).should.eql([
      '',
      '--- Styles v0.7.0',
      `Processed CSS files from test${sep}fixtures are minified and copied to tmp`,
      'Affected files:',
      'index.css',
      'less.less',
      'sass.scss',
      'stylus.styl',
      '',
    ])
    rump.reconfigure({paths: {source: {styles: 'nonexistant'}}})
    logs.length = 0
    console.log = newLog
    gulp.start('spec:info')
    console.log = log
    logs.length.should.not.be.above(4)

    function newLog(...args) {
      logs.push(stripColor(args.join(' ')))
    }
  })

  it('for building', async() => {
    await new Promise(resolve => {
      gulp.task('postbuild', ['spec:build'], resolve)
      gulp.start('postbuild')
    })
    const filesExists = await Promise.all([
      exists('tmp/index.css'),
      exists('tmp/less.css'),
      exists('tmp/sass.css'),
      exists('tmp/stylus.css'),
    ])
    filesExists.forEach(x => x.should.be.true())
  })

  describe('for watching', () => {
    let originals

    before(async() => {
      originals = await Promise.all([
        readFile('test/fixtures/index.css'),
        readFile('test/fixtures/lib/variables.css'),
        readFile('test/fixtures/less.less'),
        readFile('test/fixtures/lib/variables.less'),
        readFile('test/fixtures/sass.scss'),
        readFile('test/fixtures/lib/variables.scss'),
        readFile('test/fixtures/stylus.styl'),
        readFile('test/fixtures/lib/variables.styl'),
      ])
      await new Promise(resolve => {
        gulp.task('postwatch', ['spec:watch'], resolve)
        gulp.start('postwatch')
      })
    })

    beforeEach(() => timeout(1000))

    afterEach(() => Promise.all([
      writeFile('test/fixtures/index.css', originals[0]),
      writeFile('test/fixtures/lib/variables.css', originals[1]),
      writeFile('test/fixtures/less.less', originals[2]),
      writeFile('test/fixtures/lib/variables.less', originals[3]),
      writeFile('test/fixtures/sass.scss', originals[4]),
      writeFile('test/fixtures/lib/variables.scss', originals[5]),
      writeFile('test/fixtures/stylus.styl', originals[6]),
      writeFile('test/fixtures/lib/variables.styl', originals[7]),
    ]))

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
        writeFile('test/fixtures/lib/variables.css', ':root{--color:black}'),
        writeFile('test/fixtures/lib/variables.less', '@color: black;'),
        writeFile('test/fixtures/lib/variables.scss', '$color: black;'),
        writeFile('test/fixtures/lib/variables.styl', 'color = black'),
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
        resolve('test/fixtures/index.css'),
        resolve('node_modules/bootstrap/less/buttons.less'),
        resolve('node_modules/bootstrap/less/mixins/buttons.less'),
        resolve('node_modules/bootstrap/less/mixins/opacity.less'),
        resolve('node_modules/bootstrap/less/mixins/tab-focus.less'),
        resolve('node_modules/bootstrap/less/mixins/vendor-prefixes.less'),
        resolve('node_modules/normalize.css/normalize.css'),
        resolve('test/fixtures/less.less'),
        resolve('node_modules/normalize-compass/normalize.scss'),
        resolve('test/fixtures/sass.scss'),
        resolve('node_modules/normalize.css/normalize.css'),
        resolve('test/fixtures/stylus.styl'),
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
        writeFile('test/fixtures/lib/variables.css', ':root{--color:orange}'),
        writeFile('test/fixtures/lib/variables.less', '@color: orange;'),
        writeFile('test/fixtures/lib/variables.scss', '$color: orange;'),
        writeFile('test/fixtures/lib/variables.styl', 'color = orange'),
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
