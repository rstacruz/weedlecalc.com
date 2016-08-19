const pokedex = require('./pokedex')
const set = require('101/put')

const TRANSFER_DURATION = 10
const TRANSFER_EVOLVE_DURATION = 30
const EVOLVE_DURATION = 25

/**
 * Calculates.
 * Return an object with:
 *
 * - `steps` - the steps to do
 * - `inventory` - final inventory
 */

function calc ({pokemon, transfer}) {
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

  if (!transfer) {
    state = pokedex.evolvables.reduce((state, id) => {
      if (!pokemon[id]) return state
      return evolveWithoutTransfer(state, { pokemonId: id })
    }, state)
  } else {
    state = pokedex.evolvables.reduce((state, id) => {
      if (!pokemon[id]) return state
      return evolveWithTransfer(state, { pokemonId: id })
    }, state)
  }

  return state
}

/**
 * lol
 */

function evolveWithTransfer({presteps, steps, inventory}, {pokemonId}) {
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

  // Step 1: transfer enough for 12 candies
  // Step 2: evolve and transfer
  // Step 3: evolve the last one
  while (true) {
    const [pidgeysToTransfer, pidgeottosToTransfer, toEvolve] =
      getMaxTransferable(count, evolvedCount, candies, tnl, { transfer: true })

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
        duration: pidgeottosToTransfer * TRANSFER_DURATION,
        inventory
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
        duration: pidgeysToTransfer * TRANSFER_DURATION,
        inventory
      })
    }

    // Evolve
    if (toEvolve > 1) {
      count -= toEvolve - 1
      candies -= (toEvolve - 1) * (tnl - 1)
      inventory = set(inventory, `${pokemonId}.count`, candies)
      inventory = set(inventory, `${pokemonId}.candies`, candies)
      newSteps = push(newSteps, {
        action: 'transfer-evolve',
        pokemonId,
        count: toEvolve - 1,
        duration: (toEvolve - 1) * TRANSFER_EVOLVE_DURATION,
        inventory
      })
    }

    if (toEvolve > 0) {
      candies -= tnl
      evolvedCount += 1
      inventory = set(inventory, `${pokemonId}.candies`, candies)
      inventory = set(inventory, `${nextPoke.id}.count`, evolvedCount)
      newSteps = push(newSteps, {
        action: 'evolve',
        pokemonId,
        count: 1,
        duration: 1 * EVOLVE_DURATION,
        inventory
      })
    }
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

/**
 * evolveWithoutTransfer:
 * Creates a transfer and evolve steps (multiple times).
 */

function evolveWithoutTransfer ({presteps, steps, inventory}, {pokemonId}) {
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
        duration: pidgeottosToTransfer * TRANSFER_DURATION,
        inventory
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
        duration: pidgeysToTransfer * TRANSFER_DURATION,
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
      duration: toEvolve * EVOLVE_DURATION,
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
function getMaxTransferable (count, evolvedCount, candies, tnl, options) {
  let last

  for (let i = (evolvedCount + count); i >= 0; i--) {
    const pidgeottosToTransfer = i > evolvedCount ? evolvedCount : i
    const pidgeysToTransfer = i > evolvedCount ? (i - evolvedCount) : 0

    // By transfering ${i} pidgeys and pidgeottos (${pidgeys} left), you
    // can evolve ${evolvable}` Pidgeys. Let's find the maximum number of
    // ${evolvable}, with the least number of ${i}.
    const pidgeys = count - pidgeysToTransfer
    const newCandies = candies + i
    const evolvable = options && options.transfer
      ? Math.min(pidgeys, Math.floor((newCandies - 1) / (tnl - 1)))
      : Math.min(pidgeys, Math.floor(newCandies / tnl))

    const result = [pidgeysToTransfer, pidgeottosToTransfer, evolvable]
    if (last && evolvable < last[2]) return last
    last = result
  }

  return last
}

function push (list, item) {
  return list.concat([item])
}

module.exports = { calc, pokedex }
