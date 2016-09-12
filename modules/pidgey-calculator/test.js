const test = require('tape-plus')
const calc = require('./index').calc
const PC = require('./index')

const PIDGEY = 16
const PIDGEOTTO = 17

test.group('calc()', test => {
  test('12 pidgeys, 12 candy, evo-transfer', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 12,
          candies: 12
        }
      },
      transfer: true
    }

    let result = calc(have)
    let {presteps, steps} = result

    t.deepEqual(presteps[1].action, 'transfer')
    t.deepEqual(presteps[1].pokemonId, PIDGEY)
    t.deepEqual(presteps[1].count, 10)
    t.deepEqual(presteps[1].inventory[PIDGEY].count, 12 - 10)
    t.deepEqual(presteps[1].inventory[PIDGEY].candies, 12 + 10)

    t.deepEqual(steps[0].action, 'evolve-transfer')
    t.deepEqual(steps[0].pokemonId, PIDGEY)
    t.deepEqual(steps[0].count, 1)
    t.deepEqual(steps[0].inventory[PIDGEY].count, 12 - 10 - 1)
    t.deepEqual(steps[0].inventory[PIDGEY].candies, 12 + 10 - 10)

    t.deepEqual(steps[1].action, 'evolve')
    t.deepEqual(steps[1].pokemonId, PIDGEY)
    t.deepEqual(steps[1].count, 1)
    t.deepEqual(steps[1].inventory[PIDGEY].count, 12 - 10 - 1 - 1)
    t.deepEqual(steps[1].inventory[PIDGEY].candies, 12 + 10 - 10 - 11)
    t.deepEqual(steps[1].inventory[PIDGEOTTO].count, 1)

    t.equal(result.totals.duration, 85)
    t.equal(result.totals.exp, 2000)
  })

  test('96 pidgeys, 1 candy', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 96,
          candies: 1
        }
      }
    }

    let result = calc(have)
    let {presteps, steps} = result

    t.deepEqual(presteps[0].action, 'start')
    t.deepEqual(presteps[0].inventory[PIDGEY].count, 96)
    t.deepEqual(presteps[0].inventory[PIDGEY].candies, 1)

    t.deepEqual(presteps[1].action, 'transfer')
    t.deepEqual(presteps[1].pokemonId, PIDGEY)
    t.deepEqual(presteps[1].count, 88)
    t.deepEqual(presteps[1].inventory[PIDGEY].count, 96 - 88)
    t.deepEqual(presteps[1].inventory[PIDGEY].candies, 1 + 88)

    t.deepEqual(steps[0].action, 'evolve')
    t.deepEqual(steps[0].pokemonId, PIDGEY)
    t.deepEqual(steps[0].count, 8)
    t.deepEqual(steps[0].inventory[PIDGEY].count, 96 - 88 - 8)
    t.deepEqual(steps[0].inventory[PIDGEY].candies, 1 + 88 - 11 * 8)
    t.deepEqual(steps[0].inventory[PIDGEOTTO].count, 8)

    t.equal(result.totals.duration, 320)
    t.equal(result.totals.exp, 8000)
  })

  test('1 pidgey, 1 candy', t => {
    const have = {
      pokemon: {
        16: {
          id: PIDGEY,
          count: 1,
          candies: 1
        }
      }
    }

    let result = calc(have)
    t.equal(result.steps.length, 0)
  })

  test('12 pidgeys, 1 candy', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 12,
          candies: 1
        }
      }
    }

    let result = calc(have)
    t.equal(result.presteps[1].action, 'transfer')
    t.equal(result.presteps[1].pokemonId, PIDGEY)
    t.equal(result.presteps[1].count, 11)
    t.equal(result.presteps[1].inventory[PIDGEY].count, 1)

    t.equal(result.steps[0].action, 'evolve')
    t.equal(result.steps[0].pokemonId, PIDGEY)
    t.equal(result.steps[0].count, 1)
    t.equal(result.steps[0].exp, 1000)
    t.equal(result.steps[0].inventory[PIDGEY].count, 0)
    t.equal(result.steps[0].inventory[PIDGEOTTO].count, 1)

    t.equal(result.totals.duration, 40)
    t.equal(result.totals.exp, 1000)
  })

  test.skip('14 pidgeys, 11 pidgeottos, 1 candy', t => {
    // two transfers
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 14,
          candies: 1
        },
        [PIDGEOTTO]: {
          id: PIDGEOTTO,
          count: 11
        }
      }
    }

    let result = calc(have)
    console.log('result:', require('util').inspect(result, { depth: null, colors: true }))
  })

  test('transfer, 25x pidgeys (2)', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 25,
          candies: 1
        }
      },
      transfer: true
    }

    let result = calc(have)

    t.equal(result.presteps[1].action, 'transfer')
    t.equal(result.presteps[1].pokemonId, PIDGEY)
    t.equal(result.presteps[1].count, 21)
    t.equal(result.presteps[1].inventory[PIDGEY].count, 25 - 21)
    t.equal(result.presteps[1].inventory[PIDGEY].candies, 1 + 21)

    t.equal(result.steps[0].action, 'evolve-transfer')
    t.equal(result.steps[0].pokemonId, PIDGEY)
    t.equal(result.steps[0].count, 1)
    t.equal(result.steps[0].inventory[PIDGEY].count, 25 - 21 - 1)
    t.equal(result.steps[0].inventory[PIDGEY].candies, 1 + 21 - 10)

    t.equal(result.steps[1].action, 'evolve')
    t.equal(result.steps[1].pokemonId, PIDGEY)
    t.equal(result.steps[1].count, 1)
    t.equal(result.steps[1].inventory[PIDGEY].count, 25 - 21 - 1 - 1)
    t.equal(result.steps[1].inventory[PIDGEY].candies, 1 + 21 - 10 - 11)
    t.equal(result.steps[1].inventory[PIDGEOTTO].count, 1)

    t.equal(result.totals.duration, 85)
    t.equal(result.totals.exp, 2000)
  })

  test.skip('transfer, 3x pidgey, 25x candies', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 3,
          candies: 25
        }
      },
      transfer: true
    }

    let result = calc(have)
    console.log('result:', require('util').inspect(result, { depth: null, colors: true }))
  })

  test('zeroes', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 0,
          candies: 0
        }
      }
    }

    let result = calc(have)
    t.equal(result.steps.length, 0)
  })

  test('zeroes, transfer', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 0,
          candies: 0
        }
      }
    }

    let result = calc(have, { transfer: true })
    t.equal(result.steps.length, 0)
  })

  test('transfer, 25x pidgeys', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 25,
          candies: 1
        }
      },
      transfer: true
    }

    let result = calc(have)

    t.equal(result.presteps[1].action, 'transfer')
    t.equal(result.presteps[1].pokemonId, PIDGEY)
    t.equal(result.presteps[1].count, 21)
    t.equal(result.presteps[1].inventory[PIDGEY].count, 25 - 21)
    t.equal(result.presteps[1].inventory[PIDGEY].candies, 1 + 21)

    t.equal(result.steps[0].action, 'evolve-transfer')
    t.equal(result.steps[0].pokemonId, PIDGEY)
    t.equal(result.steps[0].count, 1)
    t.equal(result.steps[0].inventory[PIDGEY].count, 25 - 21 - 1)
    t.equal(result.steps[0].inventory[PIDGEY].candies, 1 + 21 - 10)

    t.equal(result.steps[1].action, 'evolve')
    t.equal(result.steps[1].pokemonId, PIDGEY)
    t.equal(result.steps[1].count, 1)
    t.equal(result.steps[1].inventory[PIDGEY].count, 25 - 21 - 1 - 1)
    t.equal(result.steps[1].inventory[PIDGEY].candies, 1 + 21 - 10 - 11)

    t.equal(result.totals.duration, 85)
    t.equal(result.totals.exp, 2000)
  })

  test.skip('transfer, 3x pidgey, 25x candies', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 3,
          candies: 25
        }
      },
      transfer: true
    }

    let result = calc(have)
    console.log('result:', require('util').inspect(result, { depth: null, colors: true }))
  })

  test('spare test', t => {
    const have = {
      pokemon: {
        [PIDGEY]: {
          id: PIDGEY,
          count: 20,
          candies: 200
        }
      },
      transfer: true
    }

    let result = calc(have)
    t.equal(result.steps[0].action, 'evolve-transfer')
    t.equal(result.steps[0].count, 14)
    t.equal(result.steps[1].action, 'evolve')
    t.equal(result.steps[1].count, 5)
    t.equal(result.steps[1].inventory[PIDGEOTTO].count, 5)
    t.equal(result.totals.duration, 830)
    t.equal(result.totals.exp, 19000)
  })
})

test.group('getMaxTransferable', test => {
 // Returns a tuple of `[pidgeysToTransfer, pidgeottosToTransfer, pidgeysToEvolve]`
  const TNL = 12

  test('evolve only', t => {
    // Given 14 pidgeys, 0 pidgeottos, 12 candies...
    // then transfer 12 pidgeys, 0 pidgeottos, and evolve 2
    eo(t, [14, 0, 12], [11, 0, 2])
    eo(t, [13, 0, 12], [11, 0, 2])
    eo(t, [12, 0, 12], [0, 0, 1])
    eo(t, [1, 12, 0], [0, 12, 1])
  })

  test('evolve and transfer', t => {
    ent(t, [14, 0, 12], [10, 0, 2])
    ent(t, [13, 0, 12], [10, 0, 2])
    ent(t, [12, 0, 12], [10, 0, 2])
    ent(t, [1, 12, 0], [0, 12, 1])
  })

  function eo (t, [pidgeys, pidgeottos, candy], expected) {
    let result = PC.getMaxTransferable(pidgeys, pidgeottos, candy, TNL)
    t.deepEqual(result, expected, `${pidgeys}p ${pidgeottos}P ${candy}c = ${expected.join(', ')}`)
  }

  function ent (t, [pidgeys, pidgeottos, candy], expected) {
    let result = PC.getMaxTransferable(pidgeys, pidgeottos, candy, TNL, { transfer: true })
    t.deepEqual(result, expected, `${pidgeys}p ${pidgeottos}P ${candy}c = ${expected.join(', ')}`)
  }
})
