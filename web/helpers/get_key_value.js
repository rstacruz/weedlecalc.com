/*
 * Given an event `e`, get the key/value for that target input's key & value.
 */

export default function (e) {
  let name = e.target.getAttribute('name')
  let type = e.target.getAttribute('type')
  let key = name.replace(/\[([^\]]+)\]/g, '.$1')

  let value = type === 'checkbox'
    ? e.target.checked
    : e.target.value

  // Numerify
  if (typeof value === 'string' && !isNaN(+value) && value) {
    value = +value
  }

  return [key, value]
}
