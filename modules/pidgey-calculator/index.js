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
  inventory = update(inventory, `${pokemonId}.candies`, c => c - toEvolve * (tnl - 1))
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

  // Try to optimize by minimizing evolve-transfers.  If we try to
  // transfer-evolve everything, we'll have this many candies left...
  const candiesLeft = candies - toEvolve * (tnl - 2)

  // If that's too many, maybe we can do with less. Every "extra"
  // transfer gets you 2 candy to spare. That is, for every 2 candy
  // left, you can choose not to transfer that instead. We'll "spare"
  // them; that is, they won't be transfered because that's just
  // extra time.
  const toSpare = Math.min(Math.floor(candiesLeft / 2), toEvolve)
  const toTransEvolve = toEvolve - toSpare

  // Transfer-evolve
  if (toTransEvolve > 0) {
    inventory = update(inventory, `${pokemonId}.count`, c => c - toTransEvolve)
    inventory = update(inventory, `${pokemonId}.candies`, c => c - toTransEvolve * (tnl - 2))
    steps = push(steps, {
      action: 'evolve-transfer',
      pokemonId,
      nextId,
      count: toTransEvolve,
      exp: toTransEvolve * 1000,
      duration: toTransEvolve * TRANSFER_EVOLVE_DURATION,
      inventory
    })
  }

  // Evolve only
  if (toSpare > 0) {
    inventory = update(inventory, `${pokemonId}.count`, c => c - toSpare)
    inventory = update(inventory, `${pokemonId}.candies`, c => c - toSpare * (tnl - 1))
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

    // Given `newCandies`, how many can we evolve?
    const evolvable = options.transfer
      ? Math.min(pidgeysLeft, getEvolvable(newCandies, tnl, 2))
      : Math.min(pidgeysLeft, getEvolvable(newCandies, tnl, 1))

    const result = [pidgeysToTransfer, pidgeottosToTransfer, evolvable]

    // Let's find the maximum number of ${evolvable},
    // with the least number of ${i}.
    if (last && evolvable < last[2]) return last
    last = result
  }

  return last
}

/*
 * Internal: given `candies`, how many can you evolve?
 *
 * `tnl` is how many candies to evolve (eg, 12 for Pidgey).
 * `extra` is how much you get out of an evolution (eg, 2 if
 * evolve-and-transfer, 1 if evolve-only).
 */

function getEvolvable (candies, tnl, extra) {
  // How many evolutions can you get? If extra is `2` (ie, evolve-and-transfer),
  // then it takes 10 candies to evolve one Pidgey.
  var n = Math.floor(candies / (tnl - extra))

  // ...But if you have less than `2` candies left, that means you're lacking
  // candies for one evolution, so subtract 1 from the result in that case.
  //
  // Eg:
  //
  //   21 candies
  //   12 candy to evolve (`tnl`)
  //   2 extra
  //   21 - 12 + 2 - 12 + 2 = 1
  //   Result = Math.floor(21 / 10) - 1 = 1
  //
  // Since 1 is less than 2, subtract 1 from the result. You can evolve only
  // 1 Pidgey. This is true, because after the first evolution 21 - 12 + 2 = 11,
  // not enough candy for another evolution.
  var left = candies - n * (tnl - extra)
  return left >= extra ? n : n - 1
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
