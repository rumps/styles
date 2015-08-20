import rump from 'rump'
import {rebuild} from './configs'

rump.on('update:main', () => {
  rebuild()
  rump.emit('update:styles')
})

rump.on('gulp:main', (...args) => {
  require('./gulp')
  rump.emit('gulp:styles', ...args)
})

Object.defineProperty(rump.configs, 'pleeease', {
  get: () => rump.configs.main.styles.pleeease,
})
