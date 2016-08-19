import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import {calculate} from '../actions'
import stateful from 'deku-stateful'
import formSerialize from 'form-serialize'
import set from '101/put'
import del from '101/del'

function onCreate ({setState, path, dispatch}) {
  const ids = [ id(), id() ]
  setState({ rowIds: { [ids[0]]: true, [ids[1]]: true } })

  // Prefill with demo values.
  setTimeout(() => {
    setVal(`#${path}-form [name="pokemon[${ids[0]}][id]"]`, 16)
    setVal(`#${path}-form [name="pokemon[${ids[1]}][id]"]`, 10)
    setVal(`#${path}-form [name="pokemon[${ids[0]}][count]"]`, 1)
    setVal(`#${path}-form [name="pokemon[${ids[0]}][candies]"]`, 12)
    submit(`${path}-form`, dispatch)()
  })

  function setVal (selector, value) {
    document.querySelector(selector).value = value
  }
}

function render ({state, setState, dispatch, path}) {
  const rowIds = (state && state.rowIds) || {}
  const hasRemove = Object.keys(rowIds).length > 1
  const update = submit(`${path}-form`, dispatch)

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
              onremove={hasRemove && removeRow(rowIds, setState, id, update)}
              onupdate={update} />)}
          <tr>
            <td colspan="1" class="pidgey-table-add">
              <button onclick={addRow(rowIds, setState)}>Add another</button>
            </td>
            <td colspan="3">
              <label class="checkbox-label">
                <input type="checkbox" name="transfer" value="1" checked={true}
                   onchange={submit(`${path}-form`, dispatch)} />
                <span>Transfer immediately</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  </div>
}

function addRow (rowIds, setState, n) {
  return e => {
    e.preventDefault()
    setState({ rowIds: set(rowIds, id(), true) })
  }
}

function removeRow (rowIds, setState, n, update) {
  return e => {
    e.preventDefault()
    setState({ rowIds: del(rowIds, n) })
    setTimeout(() => update(), 1)
  }
}

function submit (formId, dispatch) {
  return (e) => {
    if (e) e.preventDefault()
    const form = document.getElementById(formId)
    const data = formSerialize(form, { hash: true })

    // It's got the wrong keys, let's fix that. Also let's numerify the strings
    const pokemon = Object.keys(data.pokemon).reduce((list, dataId) => {
      const pokemon = data.pokemon[dataId]
      const id = int(pokemon.id)
      const candies = int(pokemon.candies)
      const count = int(pokemon.count)
      list[id] = { id, candies, count }
      return list
    }, {})

    dispatch(calculate({ pokemon, transfer: bool(data.transfer) }))
  }
}

function int (n) {
  const result = +n
  return isNaN(result) ? 0 : result
}

function bool (n) {
  return n === "1"
}

function PidgeyRow({props}) {
  const {id} = props
  return <tr class="pidgey-row" key={id}>
    <td class="pokemon" key="pokemon">
      <select name={`pokemon[${id}][id]`} onchange={props.onupdate}>
        {pokemonOptions()}
      </select>
    </td>

    {props.onremove
      ? <td class="remove" key="remove">
        <button onclick={props.onremove} class="remove-button">&times;</button>
      </td>
      : null}

    <td class="count" key="count">
      <input type="text"
        class="form-control"
        name={`pokemon[${id}][count]`}
        oninput={props.onupdate} />
    </td>

    <td class="candies" key="candies">
      <input type="text"
        class="form-control"
        name={`pokemon[${id}][candies]`}
        oninput={props.onupdate} />
    </td>
  </tr>
}

function pokemonOptions () {
  const base = [10, 13, 16, 19, 21, 41].map(id =>
    <option value={id}>{pokedex.data[id].name}</option>)

  const evolved = [11, 14, 17, 20, 22, 42].map(id =>
    <option value={id}>{pokedex.data[id].name}</option>)

  return []
    .concat([<option disabled>Base:</option>])
    .concat(base)
    .concat([<option disabled></option>])
    .concat([<option disabled>Evolved:</option>])
    .concat(evolved)
}

export default stateful({render, onCreate})

var _id = 0
function id () {
  return 'r' + (_id++)
}
