import { calc } from '../../modules/pidgey-calculator'
import getId from '../helpers/get_id'
import get from '101/pluck'
import set from '101/put'
import PokeJSON from '../helpers/compress_form'

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
    let id = getId()
    dispatch({ type: 'form:set', key: `transfer`, value: true })
    dispatch({ type: 'form:set', key: `pokemon.${id}.id`, value: 16 })
    dispatch({ type: 'form:set', key: `pokemon.${id}.count`, value: 22 })
    dispatch({ type: 'form:set', key: `pokemon.${id}.candies`, value: 168 })
    id = getId()
    dispatch({ type: 'form:set', key: `pokemon.${id}.id`, value: 13 })
    id = getId()
    dispatch({ type: 'form:set', key: `pokemon.${id}.id`, value: 19 })
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

    dispatch(saveFormState())
    dispatch(calculate(form))
  }
}

/*
 * Saves the form state into the URL.
 */

export function saveFormState () {
  return (dispatch, getState) => {
    const {form} = getState()
    let data = 'J:' + PokeJSON.stringify(form)
    window.history.replaceState({}, '', `#${data}`)
  }
}

function int (n) {
  const result = +n
  return isNaN(result) ? 0 : result
}

function bool (n) {
  return n === "1"
}
