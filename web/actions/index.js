import { calc } from '../../modules/pidgey-calculator'
import getId from '../helpers/get_id'
import get from '101/pluck'
import set from '101/put'

export function calculate (input) {
  try {
    let output = calc(input)
    return { type: 'results', payload: output }
  } catch (e) {
    return { type: 'error', error: e }
  }
}

export function demoValues () {
  return dispatch => {
    const id = getId()
    dispatch({ type: 'form:set', key: `transfer`, value: true })
    dispatch({ type: 'form:set', key: `pokemon.${id}.id`, value: 16 })
    dispatch({ type: 'form:set', key: `pokemon.${id}.count`, value: 1 })
    dispatch({ type: 'form:set', key: `pokemon.${id}.candies`, value: 12 })
    dispatch(recalculate())
  }
}

export function recalculate () {
  return (dispatch, getState) => {
    const state = getState()
    let form = state.form || {}

    // It's got the wrong keys, let's fix that. Also let's numerify the strings
    const pokemon = Object.keys(form.pokemon || {}).reduce((list, formId) => {
      const pokemon = form.pokemon[formId]
      const id = int(pokemon.id)
      const candies = int(pokemon.candies)
      const count = int(pokemon.count)
      list[id] = { id, candies, count }
      return list
    }, {})

    form = set(form, 'pokemon', pokemon)

    dispatch(calculate(form))
  }
}

function int (n) {
  const result = +n
  return isNaN(result) ? 0 : result
}

function bool (n) {
  return n === "1"
}
