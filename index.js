const pokedex = require('./pokedex')
const set = require('101/put')

function calc ({pokemon}) {
  let steps = []
  // pidgey: 96x, 1 candies
  //  -> transfer 88x (=8x =89c)
  //  -> egg
  //  -> evolve 7 (=1x =5c)
  //  -> transfer 7 pidgeot (=12c)
  //  -> evolve 1 (=0x =0c)
  //
  let state = {
    inventory: pokemon,
    steps: []
  }

  state = evolve(state, { pokemonId: 16 })

  return state
}

/**
 * evolve:
 * Creates a transfer and evolve step.
 */

function evolve (state, {pokemonId}) {
  // Find the Pidgey
  const thisItem = state.inventory[pokemonId]
  const thisPoke = pokedex.data[pokemonId]

  // Find the Pidgeotto
  let nextItem, nextPoke
  if (thisPoke.evolvesTo) {
    nextPoke = pokedex.data[thisPoke.evolvesTo]
    nextItem = state.inventory[thisPoke.evolvesTo]
  }

  let candies = thisItem.candies
  let count = thisItem.count
  let evolvedCount = (nextItem ? nextItem.count : 0)
  const tnl = thisPoke.candiesToEvolve

  while (true) {
    const [pidgeysToTransfer, pidgeottosToTransfer, toEvolve] =
      getMaxTransferable(evolvedCount, count, candies, tnl)

    if (toEvolve === 0) break

    if (pidgeysToTransfer > 0) {
      state.steps.push({
        action: 'transfer',
        pokemonId,
        count: pidgeysToTransfer
      })
    }

    if (pidgeottosToTransfer > 0) {
      state.steps.push({
        action: 'transfer',
        pokemonId: nextPoke.id,
        count: pidgeottosToTransfer
      })
    }

    state.steps.push({ action: 'evolve', pokemonId, count: toEvolve })

    count = count - pidgeysToTransfer - toEvolve
    candies = candies + pidgeysToTransfer + pidgeottosToTransfer - toEvolve * tnl
    evolvedCount = (nextItem ? nextItem.count : 0) + toEvolve

    // Update inventory
    let inventory = state.inventory
    inventory = set(inventory, `${pokemonId}.count`, count)
    inventory = set(inventory, `${pokemonId}.candies`, count)
    inventory = set(inventory, `${nextPoke.id}.id`, nextPoke.id)
    inventory = set(inventory, `${nextPoke.id}.count`, evolvedCount)
    state.steps.push({ action: 'remaining', inventory: inventory })
  }

  return state
}

function getMaxTransferable (evolvedCount, count, candies, tnl) {
  let last

  for (let i = (evolvedCount + count); i >= 0; i--) {
    const pidgeottosToTransfer = i > evolvedCount ? evolvedCount : i
    const pidgeysToTransfer = i > evolvedCount ? (i - evolvedCount) : 0

    // By transfering ${i} pidgeys and pidgeottos (${pidgeys} left), you
    // can evolve ${evolvable}` Pidgeys. Let's find the maximum number of
    // ${evolvable}, with the least number of ${i}.
    const pidgeottos = evolvedCount - pidgeottosToTransfer
    const pidgeys = count - pidgeysToTransfer
    const newCandies = candies + i
    const evolvable = Math.min(pidgeys, Math.floor(newCandies / tnl))

    const result = [pidgeysToTransfer, pidgeottosToTransfer, evolvable]
    if (last && evolvable < last[2]) return last
    last = result
  }

  return last
}

function push (list, item) {
  return list.concat([item])
}

module.exports = { calc }
