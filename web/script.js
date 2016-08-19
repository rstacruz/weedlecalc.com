import { createStore, applyMiddleware, compose } from 'redux'
import { dom, element } from 'decca'
import App from './components/app'

function buildStore () {
  var enhancer = compose(
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
  return createStore(reducer, {}, enhancer)
}

function reducer (state, action) {
  switch (action.type) {
    case 'init':
      return state

    case 'results':
      return { ...state, result: action.payload }

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
