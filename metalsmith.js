var Metalsmith = require('metalsmith')

var b = require('metalsmith-browserify')('js/script.js', ['web/script.js'])
b.bundle.transform('babelify')
b.bundle.transform({ global: true }, 'uglifyify')

var app = Metalsmith(__dirname)
  .source('./src')
  .destination('./public')
  .use(require('metalsmith-jstransformer')())
  .use(require('metalsmith-sense-sass')())
  .use(b)

if (module.parent) {
  module.exports = app
} else {
  app.build(function (err) { if (err) throw err })
}
