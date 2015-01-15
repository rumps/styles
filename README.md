# Rump Styles
[![NPM](http://img.shields.io/npm/v/rump-styles.svg?style=flat-square)](https://www.npmjs.org/package/rump-styles)
![License](http://img.shields.io/npm/l/rump-styles.svg?style=flat-square)
[![Dependencies](http://img.shields.io/david/rumps/rump-styles.svg?style=flat-square)](https://david-dm.org/rumps/rump-styles)


## About
Rump Styles is a Rump module for styles authored in plain CSS with
[Pleeease](http://pleeease.io/) included to write better CSS with ease and even
leverage some future CSS features. For more information, visit the
[Rump repository](https://github.com/rumps/rump).


## API
The following is appended to the core Rump API:

### `rump.addGulpTasks(options)`
This module adds the following tasks:

- `build:styles` will process CSS stylesheets with Pleeease. For more
information on source and destination paths see `rump.configure()` below. This
task is also added to the `build` task.
- `watch:styles` will run `build:styles`, then monitor for changes and process
updated files as needed. This task is also added to the `watch` task.
- `info:styles` will display information on what this specific module does,
specifically the source and destination paths as well as what files would get
processed. This task is also added to the `info` task.

### `rump.configure(options)`
Redefine options for Rump and Rump modules to follow. In addition to what
options Rump and other Rump modules offer, the following options are
available alongside default values:

#### `options.paths.source.styles` (`'styles'`)
This is the directory where styles to be processed are contained. This path is
relative to the root source path. (If the default root and styles path is used,
then the path would be `src/styles`)

#### `options.paths.destination.styles` (`'styles'`)
This is the directory where styles are copied to. This path is relative to the
root destination path. (If the default root and styles path is used, then the
path would be `dist/styles`)

#### `options.globs.build.styles` (`'*.css'`)
This specifies which stylesheets to process. By default it processes all CSS
files in the immediate directory of the root source path for styles.

#### `options.globs.watch.styles` (`'**/*.css'`)
This specifies which stylesheets to monitor for changes. By default it watches
all CSS files in the root source path for styles, including those in
subdirectories.

#### `options.styles.minify` (`options.environment === 'production'`)
This specifies whether to minify generated CSS. (minified if `true`) By default
CSS is minified only if the environment is set to production. (visit the main
Rump repository for more information on environment)

#### `options.styles.sourceMap` (`options.environment === 'development'`)
This specifies whether to include inline source maps to generated CSS. (source
maps included if `true`) By default source maps are included only if the
environment is set to development. (visit the main Rump repository for more
information on environment)

#### `options.styles.pleeease`
This specifies any options you want to override in Pleeease. (specifically
[gulp-pleeease](https://github.com/danielhusar/gulp-pleeease)) Minification by
default is enabled or disabled based on the minify option above. Future CSS
features are enabled by default. Default search paths for `@import` are also
added, including: `node_modules`, `bower_components`, and root source path for
styles detailed above.

### `rump.configs.pleeease`
This contains the generated options that are passed to Pleeease in the Gulp
task. This is a good way to see what options are generated based on defaults
and overrides.
