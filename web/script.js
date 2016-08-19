import { calc, pokedex } from '../modules/pidgey-calculator'

import { createStore } from 'redux'
import { dom, element } from 'decca'
import App from './components/app'

function buildStore () {
  return createStore(reducer, {})
}

function reducer (state, action) {
  switch (action.type) {
    case 'init':
      return state

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
