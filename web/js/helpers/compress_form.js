import { condense, expand } from 'json-condenser'

const KEYS = [null, true, false, undefined, 'pokemon', 'id', 'count', 'candies', 'transfer']

export default {
  stringify: data => condense(KEYS, JSON.stringify(data)),
  parse: str => JSON.parse(expand(KEYS, str))
}
