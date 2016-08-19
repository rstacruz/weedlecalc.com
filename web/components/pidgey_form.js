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
          <tr>
            <th class="pokemon"></th>
            <th class="count">Count</th>
            <th class="candies">Candies</th>
          </tr>
        </thead>
        <tbody>
          {map(range(count), n =>
            <PidgeyRow id={n} onupdate={submit(`${path}-form`, dispatch)} />)}
          <tr>
            <td colspan="3" class="pidgey-table-add">
              <button onclick={addRow(count, setState, 1)}>Add another</button>
            </td>
          </tr>
        </tbody>
      </table>
      <label class="checkbox-label">
        <input type="checkbox" name="transfer" value="1" />
        <span>Transfer after evolving</span>
      </label>
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
      const id = int(pokemon.id)
      const candies = int(pokemon.candies)
      const count = int(pokemon.count)
      list[id] = { id, candies, count }
      return list
    }, {})

    dispatch(calculate({ pokemon }))
  }
}

function int (n) {
  const result = +n
  return isNaN(result) ? 0 : result
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
      <input type="text"
        class="form-control"
        name={`pokemon[${id}][count]`}
        oninput={props.onupdate} />
    </td>

    <td class="candies">
      <input type="text"
        class="form-control"
        name={`pokemon[${id}][candies]`}
        oninput={props.onupdate} />
    </td>
  </tr>
}

function pokemonOptions () {
  const base = map([10, 13, 16, 19], id =>
    <option value={id}>{pokedex.data[id].name}</option>)

  const evolved = map([11, 14, 17, 20], id =>
    <option value={id}>{pokedex.data[id].name}</option>)

  return []
    .concat([<option disabled>Base:</option>])
    .concat(base)
    .concat([<option disabled></option>])
    .concat([<option disabled>Evolved:</option>])
    .concat(evolved)
}

export default stateful(PidgeyForm)
