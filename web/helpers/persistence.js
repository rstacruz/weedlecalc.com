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
  window.localStorage.weedlecalcForm = JSON.stringify(data)
}

export function saveToURL (data) {
  window.history.replaceState({}, '', '#J:' + PokeJSON.stringify(data))
}

export function defaultState () {
  return {
    transfer: true,
    pokemon: {
      r0: { id: 16, count: 22, candies: 168 },
      r1: { id: 13 },
      r2: { id: 19 }
    }
  }
}
