function condenseByKeys (keys, json) {
  let letter = 'a'.charCodeAt(0) - 1
  keys = [null, true, false, undefined].concat(keys)

  return keys.reduce((json, key) => {
    let char = String.fromCharCode(++letter)
    return json
      .replace(new RegExp('' + JSON.stringify(key) + ':', 'g'), char + ':')
      .replace(new RegExp('([:,\[])' + JSON.stringify(key), 'g'), '$1' + char)
    return json
  }, json)
}

function expandByKeys (keys, json) {
  let letter = 'a'.charCodeAt(0) - 1
  keys = [null, true, false, undefined].concat(keys)

  return keys.reduce((json, key) => {
    let char = String.fromCharCode(++letter)
    return json
      .replace(new RegExp('' + char + ':', 'g'), JSON.stringify(key) + ':')
      .replace(new RegExp('([:,\[])' + char, 'g'), '$1' + JSON.stringify(key))
  }, json)
}

module.exports = {
  condenseByKeys: condenseByKeys,
  expandByKeys: expandByKeys
}
