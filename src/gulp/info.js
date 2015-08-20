import gulp, {tasks} from 'gulp'
import rump from 'rump'
import {find} from 'globule'
import {colors} from 'gulp-util'
import {join, relative} from 'path'
import {version} from '../../package'

const name = ::rump.taskName,
      task = ::gulp.task,
      {blue, green, magenta, yellow} = colors,
      {configs} = rump

task(name('info:styles'), () => {
  const glob = join(configs.main.paths.source.root,
                    configs.main.paths.source.styles,
                    configs.main.globs.build.styles),
        files = find([glob].concat(configs.main.globs.global)),
        source = join(configs.main.paths.source.root,
                      configs.main.paths.source.styles),
        destination = join(configs.main.paths.destination.root,
                           configs.main.paths.destination.styles)
  let action = 'copied'
  if(!files.length) {
    return
  }
  if(configs.main.styles.sourceMap) {
    action += ` ${yellow('with source maps')}`
  }
  if(configs.main.styles.minify) {
    action = `${yellow('minified')} and ${action}`
  }
  console.log()
  console.log(magenta(`--- Styles v${version}`))
  console.log(`Processed CSS files from ${green(source)} are ${action}`,
              `to ${green(destination)}`)
  console.log('Affected files:')
  files.forEach(file => console.log(blue(relative(source, file))))
  console.log()
})

tasks[name('info')].dep.push(name('info:styles'))
