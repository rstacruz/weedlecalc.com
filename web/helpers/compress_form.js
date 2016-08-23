import { condenseByKeys, expandByKeys } from '../../modules/json-condenser'

const KEYS = ['pokemon', 'id', 'count', 'candies', 'transfer']

export default {
  stringify: data => condenseByKeys(KEYS, JSON.stringify(data)),
  parse: str => JSON.parse(expandByKeys(KEYS, str))
}
