import { calc } from '../../modules/pidgey-calculator'

export function calculate (input) {
  try {
    let output = calc(input)
    return { type: 'results', payload: output }
  } catch (e) {
    return { type: 'error', error: e }
  }
}
