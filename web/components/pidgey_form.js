import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import {recalculate, calculate} from '../actions'
import set from '101/put'
import del from '101/del'
import getId from '../helpers/get_id'
import getKeyValue from '../helpers/get_key_value';

function PidgeyForm ({dispatch, context, path}) {
  const form = context.form || {}
  const rowIds = form.pokemon || {}
  const hasRemove = Object.keys(rowIds).length > 1
  const update = () => null

  return <div class="pidgey-form">
    <form id={'' + path + '-form'}>
      <table class={`pidgey-table ${hasRemove ? '-multi' : '-single'}`}>
        <thead>
          <tr>
            <th class="pokemon" key="pokemon"></th>
            {hasRemove ? <th class="remove" key="remove"></th> : null}
            <th class="count" key="count">Count</th>
            <th class="candies" key="candies">Candies</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(rowIds).map((id) =>
            <PidgeyRow id={id}
              value={rowIds[id]}
              onremove={hasRemove && removeRow(rowIds, dispatch, id)} />)}
          <tr>
            <td colspan="1" class="pidgey-table-add">
              <button onclick={addRow(rowIds, dispatch)}>Add another</button>
            </td>
            <td colspan="3">
              <label class="checkbox-label">
                <input type="checkbox" name="transfer" value="1"
                   checked={form.transfer}
                   onchange={saveForm(dispatch)} />
                <span
                  class="hint--bottom hint--large"
                  attributes={{
                    'aria-label': 'Transfer your Pidgeottos right after evolving them from Pidgeys (if necessary). Yields more leftover Pidgeys/Pidgeottos/candies, but may take more time. Turning this off also gives you a chance to inspect for any Pidgeottos you\'d like to keep.'
                  }}
                  >Transfer immediately</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
}

function addRow (rowIds, dispatch) {
  return e => {
    e.preventDefault()
    dispatch({
      type: 'form:set',
      key: `pokemon.${getId()}`,
      value: { id: null, candies: "0", count: "0" }
    })
  }
}

function removeRow (rowIds, dispatch, id) {
  return e => {
    e.preventDefault()
    dispatch({ type: 'form:delete', key: `pokemon.${id}` })
    dispatch(recalculate())
  }
}

function PidgeyRow ({props, dispatch}) {
  let {id} = props
  let value = props.value || {}
  let pokemon = pokedex.data[value.id]
  let hasCandies = pokemon && !pokemon.evolvesFrom
  let hasCount = pokemon

  return <tr class="pidgey-row" key={id}>
    <td class="pokemon" key="pokemon">
      <select name={`pokemon[${id}][id]`}
        attributes={{'data-selected': value.id || ""}}
        onchange={saveForm(dispatch)}>
        {pokemonOptions(value.id)}
      </select>
    </td>

    {props.onremove
      ? <td class="remove" key="remove">
        <button onclick={props.onremove} class="remove-button">&times;</button>
      </td>
      : null}

    <td class="count" key="count">
      {hasCount
        ? <input type="number"
          class="form-control"
          name={`pokemon[${id}][count]`}
          value={value.count}
          onfocus={selectAllText}
          oninput={saveForm(dispatch)} />
        : null}
    </td>

    <td class="candies" key="candies">
      {hasCandies
        ? <input type="number"
            class="form-control"
            name={`pokemon[${id}][candies]`}
            value={value.candies}
          onfocus={selectAllText}
            oninput={saveForm(dispatch)} />
        : null }
    </td>
  </tr>
}

function saveForm (dispatch) {
  return e => {
    e.preventDefault()
    let [key, value] = getKeyValue(e)
    dispatch({ type: 'form:set', key, value })
    dispatch(recalculate())
  }
}

function pokemonOptions (selected) {
  const base = [10, 13, 16, 19, 21, 41].map(id =>
    <option value={id} selected={id === +selected}>{pokedex.data[id].name}</option>)

  const evolved = [11, 14, 17, 20, 22, 42].map(id =>
    <option value={id} selected={id === +selected}>{pokedex.data[id].name}</option>)

  return []
    .concat([<option value="">Select Pokemon...</option>])
    .concat(element('optgroup', {label: 'Base'}, ...base))
    .concat(element('optgroup', {label: 'Evolved'}, ...evolved))
}

function selectAllText (e) {
  e.target.select()
}

export default PidgeyForm
