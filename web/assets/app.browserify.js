
module.exports = {
  entries: [__dirname + '/../js/app.js'],
  cache: {},
  packageCache: {},
  transform: ['babelify'],
  plugin: process.env.NODE_ENV === 'development' ? ['watchify'] : []
}
