import extend from 'extend'
import rump from 'rump'
import {join, relative} from 'path'

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

  const source = join(configs.main.paths.source.root,
                      configs.main.paths.source.styles),
        paths = ['node_modules', 'bower_components', source],
        sassOptions = {includePaths: paths}
  if(configs.main.paths.destination.images) {
    sassOptions.imagePath = relative(configs.main.paths.destination.styles,
                                     configs.main.paths.destination.images)
  }
  configs.main.styles.pleeease = extend(true, {
    import: {path: paths},
    minifier: configs.main.styles.minify,
    less: {paths},
    next: true,
    sass: sassOptions,
    sourcemaps: configs.main.styles.sourceMap,
    stylus: {paths},
  }, configs.main.styles.pleeease)
}
