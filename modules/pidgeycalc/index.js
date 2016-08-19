const pokedex = require('./pokedex')
const set = require('101/put')
const each = require('lodash/forEach')
const reduce = require('lodash/reduce')

/**
 * Calculates.
 * Return an object with:
 *
 * - `steps` - the steps to do
 * - `inventory` - final inventory
 */

function calc ({pokemon}) {
  let steps = []
  let state = {
    inventory: pokemon,
    presteps: [
      {
        action: 'start',
        inventory: pokemon
      }
    ],
    steps: []
  }

  state = reduce(pokedex.evolvables, (state, id) => {
    if (!pokemon[id]) return state
    return evolve(state, { pokemonId: id })
  }, state)

  return state
}

/**
 * evolve:
 * Creates a transfer and evolve steps (multiple times).
 */

function evolve ({presteps, steps, inventory}, {pokemonId}) {
  let newSteps = []

  // Find the Pidgey
  const thisItem = inventory[pokemonId]
  const thisPoke = pokedex.data[pokemonId]

  // Find the Pidgeotto
  let nextItem, nextPoke
  if (thisPoke.evolvesTo) {
    nextPoke = pokedex.data[thisPoke.evolvesTo]
    nextItem = inventory[thisPoke.evolvesTo]
  }

  let candies = thisItem.candies
  let count = thisItem.count
  let evolvedCount = (nextItem ? nextItem.count : 0)
  const tnl = thisPoke.candiesToEvolve

  while (true) {
    const [pidgeysToTransfer, pidgeottosToTransfer, toEvolve] =
      getMaxTransferable(count, evolvedCount, candies, tnl)

    if (toEvolve === 0) break

    // Transfer Pidgettos
    if (pidgeottosToTransfer > 0) {
      evolvedCount -= pidgeottosToTransfer
      candies += pidgeottosToTransfer
      inventory = set(inventory, `${nextPoke.id}.id`, nextPoke.id)
      inventory = set(inventory, `${nextPoke.id}.count`, evolvedCount)
      inventory = set(inventory, `${pokemonId}.candies`, candies)

      newSteps = push(newSteps, {
        action: 'transfer',
        pokemonId: nextPoke.id,
        unevolvedPokemonId: pokemonId,
        count: pidgeottosToTransfer,
        inventory: inventory
      })
    }

    // Transfer Pidgeys
    if (pidgeysToTransfer > 0) {
      count -= pidgeysToTransfer
      candies += pidgeysToTransfer
      inventory = set(inventory, `${pokemonId}.count`, count)
      inventory = set(inventory, `${pokemonId}.candies`, candies)

      newSteps = push(newSteps, {
        action: 'transfer',
        pokemonId,
        count: pidgeysToTransfer,
        inventory
      })
    }

    // Evolve
    count -= toEvolve
    evolvedCount += toEvolve
    candies -= toEvolve * tnl
    inventory = set(inventory, `${pokemonId}.count`, count)
    inventory = set(inventory, `${pokemonId}.candies`, candies)
    inventory = set(inventory, `${nextPoke.id}.count`, evolvedCount)
    newSteps = push(newSteps, {
      action: 'evolve',
      pokemonId,
      count: toEvolve,
      exp: toEvolve * 1000,
      inventory
    })
  }

  // Put the first transfer as part of pre-egg steps
  // TODO: even pidgeotto transfers should count before the egg
  if (newSteps.length > 1 && newSteps[0].action === 'transfer') {
    presteps = presteps.concat(newSteps.slice(0, 1))
    steps = steps.concat(newSteps.slice(1))
  } else {
    steps = steps.concat(newSteps)
  }

  return { inventory, presteps, steps }
}

/*
 * Given `evolvedCount` pidgeottos, `count` pidgeys, and `candies`, find out
 * the best number to evolve.
 *
 * Returns a tuple of `[pidgeysToTransfer, pidgeottosToTransfer, pidgeysToEvolve]`.
 */
function getMaxTransferable (count, evolvedCount, candies, tnl) {
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
