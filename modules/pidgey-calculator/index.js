const pokedex = require('./pokedex')
const get = require('101/pluck')
const set = require('101/put')
const push = require('./helpers').push
const update = require('./helpers').update

const TRANSFER_DURATION = 5
const TRANSFER_EVOLVE_DURATION = 45
const EVOLVE_DURATION = 40

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

  let options = { transfer }

  state = pokedex.evolvables.reduce((state, id) => {
    if (!pokemon[id]) return state
    return evolve(state, id, options)
  }, state)

  state.totals = getTotals(state.steps)

  return state
}

/**
 * evolve:
 * Creates a transfer and evolve steps (multiple times).
 */

function evolve ({presteps, steps, inventory}, pokemonId, options = {}) {
  let newSteps = []

  // Find the Pidgey
  const thisItem = inventory[pokemonId]
  const thisPoke = pokedex.data[pokemonId]

  // Find the Pidgeotto
  const nextId = thisPoke.evolvesTo && pokedex.data[thisPoke.evolvesTo].id
  const tnl = thisPoke.candiesToEvolve

  while (true) {
    let candies = get(inventory, `${pokemonId}.candies`)
    let count = get(inventory, `${pokemonId}.count`)
    let evolvedCount = get(inventory, `${nextId}.count`)
    const [pidgeysToTransfer, pidgeottosToTransfer, toEvolve] =
      getMaxTransferable(count, evolvedCount, candies, tnl, options)

    if (toEvolve <= 0) break

    // Transfer Pidgettos
    if (pidgeottosToTransfer > 0) {
      [inventory, newSteps] =
        transferPidgeottos([inventory, newSteps], pokemonId, nextId, pidgeottosToTransfer)
    }

    // Transfer Pidgeys
    if (pidgeysToTransfer > 0) {
      [inventory, newSteps] =
        transferPidgeys([inventory, newSteps], pokemonId, pidgeysToTransfer)
    }

    // Evolve
    if (options.transfer) {
      [inventory, newSteps] =
        evolveAndTransfer([inventory, newSteps], pokemonId, nextId, toEvolve, tnl)
    } else {
      [inventory, newSteps] =
        evolveOnly([inventory, newSteps], pokemonId, nextId, toEvolve, tnl)
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

/*
 * Transfer pokemon
 */

function transferPidgeottos ([inventory, steps], pokemonId, nextId, toTransfer) {
  inventory = update(inventory, `${nextId}.count`, c => c - toTransfer)
  inventory = update(inventory, `${pokemonId}.candies`, c => +c + toTransfer)

  steps = push(steps, {
    action: 'transfer',
    pokemonId: nextId,
    unevolvedPokemonId: pokemonId,
    count: toTransfer,
    duration: toTransfer * TRANSFER_DURATION,
    inventory
  })

  return [inventory, steps]
}

/**
 * Internal: Transfer pidgeys
 */

function transferPidgeys ([inventory, steps], pokemonId, toTransfer) {
  inventory = update(inventory, `${pokemonId}.count`, c => c - toTransfer)
  inventory = update(inventory, `${pokemonId}.candies`, c => c + toTransfer)

  steps = push(steps, {
    action: 'transfer',
    pokemonId,
    count: toTransfer,
    duration: toTransfer * TRANSFER_DURATION,
    inventory
  })

  return [inventory, steps]
}

/**
 * Internal: adds `evolve` steps
 */

function evolveOnly ([inventory, steps], pokemonId, nextId, toEvolve, tnl) {
  inventory = update(inventory, `${pokemonId}.count`, c => c - toEvolve)
  inventory = update(inventory, `${pokemonId}.candies`, c => c - toEvolve * tnl)
  inventory = update(inventory, `${nextId}.count`, c => c + toEvolve)

  steps = push(steps, {
    action: 'evolve',
    pokemonId,
    nextId,
    count: toEvolve,
    exp: toEvolve * 1000,
    duration: toEvolve * EVOLVE_DURATION,
    inventory
  })

  return [inventory, steps]
}

/**
 * Internal: adds `evolve-transfer` steps
 */

function evolveAndTransfer ([inventory, steps], pokemonId, nextId, toEvolve, tnl) {
  const candies = inventory[pokemonId].candies
  const toSpare = Math.min(candies - toEvolve * (tnl - 1), toEvolve)
  const toTransfer = toEvolve - toSpare

  // Transfer-evolve
  if (toTransfer > 0) {
    inventory = update(inventory, `${pokemonId}.count`, c => c - toTransfer)
    inventory = update(inventory, `${pokemonId}.candies`, c => c - toTransfer * (tnl - 1))
    steps = push(steps, {
      action: 'evolve-transfer',
      pokemonId,
      nextId,
      count: toTransfer,
      exp: toTransfer * 1000,
      duration: toTransfer * TRANSFER_EVOLVE_DURATION,
      inventory
    })
  }

  // Evolve only
  if (toSpare > 0) {
    inventory = update(inventory, `${pokemonId}.count`, c => c - toSpare)
    inventory = update(inventory, `${pokemonId}.candies`, c => c - toSpare * tnl)
    inventory = update(inventory, `${nextId}.count`, c => c + toSpare)
    steps = push(steps, {
      action: 'evolve',
      pokemonId,
      nextId,
      count: toSpare,
      exp: toSpare * 1000,
      duration: toSpare * EVOLVE_DURATION,
      inventory
    })
  }

  return [inventory, steps]
}

/*
 * Given `count` Pidgeys, `pidgeottos` Pidgeottos, and `candies`, find out
 * the best number to evolve.
 *
 * Returns a tuple of `[pidgeysToTransfer, pidgeottosToTransfer, pidgeysToEvolve]`.
 */
function getMaxTransferable (pidgeys, pidgeottos, candies, tnl, options = {}) {
  let last

  for (let i = (pidgeottos + pidgeys); i >= 0; i--) {
    // Try transfering all Pidgeottos and Pidgeys (eg, 10) and see how many you
    // can evolve afterwards. (Later, try that with 1 less (eg, 9), and so on.)
    const pidgeottosToTransfer = i > pidgeottos ? pidgeottos : i
    const pidgeysToTransfer = i > pidgeottos ? (i - pidgeottos) : 0

    // Let's transfer ${i} Pidgeys and Pidgeottos.
    const pidgeysLeft = pidgeys - pidgeysToTransfer

    // Get candies after pre-transfering.
    const newCandies = candies + i

    // How many can we evolve?
    const evolvable = options.transfer
      ? Math.min(pidgeysLeft, Math.floor((newCandies - 1) / (tnl - 1)))
      : Math.min(pidgeysLeft, Math.floor((newCandies - 0) / (tnl - 0)))

    const result = [pidgeysToTransfer, pidgeottosToTransfer, evolvable]

    // Let's find the maximum number of ${evolvable},
    // with the least number of ${i}.
    if (last && evolvable < last[2]) return last
    last = result
  }

  return last
}

/**
 * Internal: summarizes totals
 */

function getTotals (steps) {
  return (steps || []).reduce((result, step) => {
    if (step.duration) {
      result.duration += step.duration
    }
    if (step.exp) {
      result.exp += step.exp
    }
    return result
  }, { duration: 0, exp: 0 })
}

module.exports = { calc, pokedex, getMaxTransferable }
