const get = require('101/pluck')
const set = require('101/put')

function update (obj, path, fn) {
  var val = fn(get(obj, path))
  return set(obj, path, val)
}

module.exports = { update }
