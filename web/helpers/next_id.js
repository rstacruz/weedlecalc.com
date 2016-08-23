/**
 * Internal: returns the next available ID for the object `rows`.
 */

export default function (rows) {
  const keys = Object.keys(rows)
  const lastId = keys.length ? keys[keys.length - 1] : -1
  return +lastId + 1
}
