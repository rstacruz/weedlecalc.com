import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import map from 'lodash/map'
import reduce from 'lodash/reduce'
import stateful from 'deku-stateful'
import formSerialize from 'form-serialize'

function PidgeyForm ({state, dispatch, path}) {
  return <div class="pidgey-form">
    <form id={'' + path + '-form'}>
      <table class="pidgey-table">
        <thead>
          <th class="pokemon"></th>
          <th class="count">Count</th>
          <th class="candies">Candies</th>
        </thead>
        <tbody>
          <PidgeyRow id={0} />
        </tbody>
      </table>
    </form>
    <button class='submit-button' onclick={submit(`${path}-form`, dispatch)}>Let's go</button>
  </div>
}

function submit (formId, dispatch) {
  return (e) => {
    e.preventDefault()
    const form = document.getElementById(formId)
    let data = formSerialize(form, { hash: true })

    // It's got the wrong keys, let's fix that. Also let's numerify the strings
    data = reduce(data.pokemon, (list, pokemon) => {
      const id = +pokemon.id
      const candies = +pokemon.candies
      const count = +pokemon.count
      list[id] = { id, candies, count }
      return list
    }, {})

    console.log(data)
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
      <input type="number" name={`pokemon[${id}][count]`} value="0" />
    </td>

    <td class="candies">
      <input type="number" name={`pokemon[${id}][candies]`} value="0" />
    </td>
  </tr>
}

function pokemonOptions () {
  return map(pokedex.data, (pokemon, id) =>
    <option value={id}>{pokemon.name}</option>
  )
}

export default stateful(PidgeyForm)
