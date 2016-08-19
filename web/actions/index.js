import { calc } from '../../modules/pidgey-calculator'

export function calculate (input) {
  var output = calc(input)
  return { type: 'results', payload: output }
}
