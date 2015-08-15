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

describe('tasks', () => {
  beforeEach(() => {
    rump.configure({
      environment: 'development',
      paths: {
        source: {root: 'test/src', styles: ''},
        destination: {root: 'tmp', styles: ''},
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
    logs.slice(-6).should.eql([
      '',
      '--- Styles v0.7.0',
      `Processed CSS files from test${sep}src are copied with source maps to tmp`,
      'Affected files:',
      'index.css',
      '',
    ])
  })

  describe('for building', () => {
    let originals

    before(async(done) => {
      originals = await Promise.all([
        readFile('test/src/index.css'),
        readFile('test/src/lib/variables.css'),
      ])
      gulp.task('postbuild', ['spec:watch'], () => done())
      gulp.start('postbuild')
    })

    afterEach(async() => {
      await timeout(800)
      await Promise.all([
        writeFile('test/src/index.css', originals[0]),
        writeFile('test/src/lib/variables.css', originals[1]),
      ])
      await timeout(800)
    })

    it('handles updates', async() => {
      const firstContent = await readFile('tmp/index.css')
      let secondContent
      await timeout(800)
      await writeFile('test/src/lib/variables.css', ':root{--color:black}')
      await timeout(800)
      secondContent = await readFile('tmp/index.css')
      bufferEqual(firstContent, secondContent).should.be.false()
    })

    it('handles autoprefix', async() => {
      const content = (await readFile('tmp/index.css')).toString()
      content.should.containEql('display: flex')
      content.should.containEql('display: -webkit-flex')
    })

    it('handles source maps in development', async() => {
      const content = await readFile('tmp/index.css'),
            sourceMap = convert.fromSource(content.toString()),
            paths = sourceMap
              .getProperty('sources')
              .map(x => x.replace(protocol, '').split('/').join(sep))
      paths.should.eql([
        resolve('node_modules/normalize.css/normalize.css'),
        resolve('test/src/index.css'),
      ])
    })

    // it('handles minification in production', async() => {
    //   const firstContent = await readFile('tmp/index.css')
    //   let secondContent
    //   rump.reconfigure({environment: 'production'})
    //   await timeout(800)
    //   writeFile('test/src/lib/variables.css', ':root{--color:orange}')
    //   await timeout(800)
    //   secondContent = await readFile('tmp/index.css')
    //   firstContent.length.should.be.above(secondContent.length)
    // })
  })
})
