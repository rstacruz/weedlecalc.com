import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import {calculate} from '../actions'
import map from 'lodash/map'
import range from 'lodash/range'
import reduce from 'lodash/reduce'
import stateful from 'deku-stateful'
import formSerialize from 'form-serialize'

function PidgeyForm ({state, setState, dispatch, path}) {
  const count = (state && state.count) || 1

  return <div class="pidgey-form">
    <form id={'' + path + '-form'}>
      <table class="pidgey-table">
        <thead>
          <th class="pokemon"></th>
          <th class="count">Count</th>
          <th class="candies">Candies</th>
        </thead>
        <tbody>
          {map(range(count), n => <PidgeyRow id={n} />)}
          <tr>
            <td colspan="3" class="pidgey-table-add">
              <button onclick={addRow(count, setState, 1)}>+</button>
              <button onclick={addRow(count, setState, -1)}>&minus;</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
    <button class='submit-button' onclick={submit(`${path}-form`, dispatch)}>Let's go</button>
  </div>
}

function addRow (count, setState, n) {
  return e => {
    e.preventDefault()
    setState({ count: Math.max(count + n, 1) })
  }
}

function submit (formId, dispatch) {
  return (e) => {
    e.preventDefault()
    const form = document.getElementById(formId)
    const data = formSerialize(form, { hash: true })

    // It's got the wrong keys, let's fix that. Also let's numerify the strings
    const pokemon = reduce(data.pokemon, (list, pokemon) => {
      const id = +pokemon.id
      const candies = +pokemon.candies
      const count = +pokemon.count
      list[id] = { id, candies, count }
      return list
    }, {})

    dispatch(calculate({ pokemon }))
  }
}

function PidgeyRow({props}) {
  const {id} = props
  return <tr class="pidgey-row">
    <td class="pokemon">
      <select name={`pokemon[${id}][id]`}>
        <option disabled>Pokemon...</option>
        {pokemonOptions()}
      </select>
    </td>

    <td class="count">
      <input type="number" name={`pokemon[${id}][count]`} />
    </td>

    <td class="candies">
      <input type="number" name={`pokemon[${id}][candies]`} />
    </td>
  </tr>
}

function pokemonOptions () {
  return map(pokedex.data, (pokemon, id) =>
    <option value={id}>{pokemon.name}</option>
  )
}

export default stateful(PidgeyForm)
