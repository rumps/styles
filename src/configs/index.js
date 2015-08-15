import extend from 'extend'
import rump from 'rump'
import {join} from 'path'

const {configs} = rump

rebuild()

export function rebuild() {
  configs.main.globs = extend(true, {
    build: {styles: '*.{css,less,scss,styl}'},
    watch: {styles: '**/*.{css,less,scss,styl}'},
  }, configs.main.globs)
  configs.main.paths = extend(true, {
    source: {styles: 'styles'},
    destination: {styles: 'styles'},
  }, configs.main.paths)
  configs.main.styles = extend(true, {
    minify: configs.main.environment === 'production',
    sourceMap: configs.main.environment === 'development',
  }, configs.main.styles)
  configs.main.styles.pleeease = extend(true, {
    import: {path: [
      'node_modules',
      'bower_components',
      join(configs.main.paths.source.root, configs.main.paths.source.styles),
    ]},
    minifier: configs.main.styles.minify,
    next: true,
    sourcemaps: configs.main.styles.sourceMap,
  }, configs.main.styles.pleeease)
}
