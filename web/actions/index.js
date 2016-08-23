import get from '101/pluck'
import set from '101/put'
import { calc } from '../../modules/pidgey-calculator'
import getId from '../helpers/get_id'
import { saveToStorage } from '../helpers/persistence'

export function calculate (input) {
  try {
    let output = calc(input)
    return { type: 'results', payload: output }
  } catch (e) {
    return { type: 'error', error: e }
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

    dispatch(saveFormState())
    dispatch(calculate(form))
  }
}

/*
 * Saves the form state into local storage.
 */

export function saveFormState () {
  return (dispatch, getState) => {
    saveToStorage(getState().form)
  }
}

function int (n) {
  const result = +n
  return isNaN(result) ? 0 : result
}

function bool (n) {
  return n === "1"
}
