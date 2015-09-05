import gulp, {tasks} from 'gulp'
import rump from 'rump'
import {join} from 'path'

const name = ::rump.taskName
const task = ::gulp.task
const watch = ::gulp.watch
const {configs} = rump

task(name('watch:styles'), [name('build:styles')], () => {
  const glob = join(configs.main.paths.source.root,
                    configs.main.paths.source.styles,
                    configs.main.globs.watch.styles)
  watch([glob].concat(configs.main.globs.global), [name('build:styles')])
})

tasks[name('watch')].dep.push(name('watch:styles'))
