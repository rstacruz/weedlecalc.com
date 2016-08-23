import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { dom, element } from 'decca'
import set from '101/put'
import del from '101/del'
import App from './components/app'
import qs from 'qs'
import { recalculate } from './actions'
import { fromURL, fromStorage, defaultState } from './helpers/persistence'

function buildStore () {
  var enhancer = compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
  return createStore(reducer, {}, enhancer)
}

function reducer (state, action) {
  switch (action.type) {
    case 'init':
      return state

    case 'results':
      return set(state, 'result', action.payload)

    case 'form:set':
      return set(state, `form.${action.key}`, action.value)

    case 'form:load':
      return set(state, `form`, action.payload)

    case 'form:delete':
      return del(state, `form.${action.key}`)

    default:
      return state
  }
}

const store = buildStore()
const render = dom.createRenderer(document.getElementById('app'), store.dispatch)
function update () {
  render(<App />, store.getState())
}
store.subscribe(update)
update()

let formState = fromURL() ||
  fromStorage() ||
  defaultState()

store.dispatch({ type: 'form:load', payload: formState })
store.dispatch(recalculate())
