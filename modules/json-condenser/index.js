let A = 'a'.charCodeAt(0)

/**
 * Condenses `json` based on `keys`.
 *
 *     condense(['id'], '{"id":1}')
 *     //=> '{a:1}'
 */

function condense (keys, json) {
  return keys.reduce(function (json, key, idx) {
    var char = getLetter(idx)
    return json
      .replace(new RegExp('' + JSON.stringify(key) + ':', 'g'), char + ':')
      .replace(new RegExp('([:,\[])' + JSON.stringify(key), 'g'), '$1' + char)
    return json
  }, json)
}

/**
 * Expands `json` based on `keys`.
 *
 *     expand(['id'], '{a:1}'
 *     //=> '{"id":1}'
 */

function expand (keys, json) {
  return keys.reduce(function (json, key, idx) {
    var char = getLetter(idx)
    return json
      .replace(new RegExp('' + char + ':', 'g'), JSON.stringify(key) + ':')
      .replace(new RegExp('([:,\[])' + char, 'g'), '$1' + JSON.stringify(key))
  }, json)
}

/**
 * Internal: gets the `n`th letter.
 *
 *     getLetter(0) => 'a'
 *     getLetter(4) => 'e'
 *     getLetter(26) => 'aa'
 */

function getLetter (n) {
  if (n < 26) {
    return String.fromCharCode(A + n)
  }

  return String.fromCharCode(A + Math.floor(n / 26 - 1))
    + String.fromCharCode(A + (n % 26))
}

module.exports = {
  condense: condense,
  expand: expand,
  getLetter: getLetter
}
