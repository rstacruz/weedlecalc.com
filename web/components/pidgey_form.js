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
          {map(range(count), n =>
            <PidgeyRow id={n} onupdate={submit(`${path}-form`, dispatch)} />)}
          <tr>
            <td colspan="3" class="pidgey-table-add">
              <button onclick={addRow(count, setState, 1)}>+</button>
              <button onclick={addRow(count, setState, -1)}>&minus;</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
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
    if (e) e.preventDefault()
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
      <select name={`pokemon[${id}][id]`} onchange={props.onupdate}>
        {pokemonOptions()}
      </select>
    </td>

    <td class="count">
      <input type="number"
        name={`pokemon[${id}][count]`}
        oninput={props.onupdate} />
    </td>

    <td class="candies">
      <input type="number"
        name={`pokemon[${id}][candies]`}
        oninput={props.onupdate} />
    </td>
  </tr>
}

function pokemonOptions () {
  const base = map([13, 16, 19], id =>
    <option value={id}>{pokedex.data[id].name}</option>)

  const evolved = map([14, 17, 20], id =>
    <option value={id}>{pokedex.data[id].name}</option>)

  return []
    .concat([<option disabled>Base:</option>])
    .concat(base)
    .concat([<option disabled>&mdash;</option>])
    .concat([<option disabled>Evolved:</option>])
    .concat(evolved)
}

export default stateful(PidgeyForm)
