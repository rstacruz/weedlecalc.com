function ms (n) {
  var result = []
  var mins = Math.floor(n / 60000)
  n -= mins * 60000
  if (mins > 0) result.push('' + mins + 'm')

  var secs = Math.floor(n / 1000)
  if (secs < 10) secs = '0' + secs
  if (secs != 0) result.push('' + secs + 's')

  return result.join(' ')
}

module.exports = ms
