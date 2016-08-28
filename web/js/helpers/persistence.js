import PokeJSON from './compress_form'

export function fromURL () {
  if (window.location.hash.substr(0, 3) !== '#J:') return
  return PokeJSON.parse(window.location.hash.substr(3))
}

export function fromStorage () {
  if (window.localStorage.weedlecalcForm) {
    return JSON.parse(window.localStorage.weedlecalcForm)
  }
}

export function saveToStorage (data) {
  // If it's the same as the default state, there's no sense in
  // saving it.
  if (JSON.stringify(data) === JSON.stringify(defaultState())) {
    delete window.localStorage.weedlecalcForm
  } else {
    window.localStorage.weedlecalcForm = JSON.stringify(data)
  }
}

export function saveToURL (data) {
  window.history.replaceState({}, '', '#J:' + PokeJSON.stringify(data))
}

export function getSaveURL (data) {
  return window.location.protocol + '//'
    + window.location.host
    + window.location.pathname
    + window.location.search
    + '#J:' + PokeJSON.stringify(data)
}

export function defaultState () {
  return {
    transfer: true,
    pokemon: {
      0: { id: 13 },
      1: { id: 16, count: 22, candies: 168 },
      2: { id: 19 }
    }
  }
}
