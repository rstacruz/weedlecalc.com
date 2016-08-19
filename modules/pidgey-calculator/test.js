const test = require('tape-plus')
const calc = require('./index').calc

const PIDGEY = 16
const PIDGEOTTO = 17

test.group('calc()', test => {
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
    t.deepEqual(presteps[1].count, 83)
    t.deepEqual(presteps[1].inventory[PIDGEY].count, 96 - 83)
    t.deepEqual(presteps[1].inventory[PIDGEY].candies, 84)

    t.deepEqual(steps[0].action, 'evolve')
    t.deepEqual(steps[0].pokemonId, PIDGEY)
    t.deepEqual(steps[0].count, 7)
    t.deepEqual(steps[0].inventory[PIDGEY].count, 96 - 83 - 7)
    t.deepEqual(steps[0].inventory[PIDGEY].candies, 0)
    t.deepEqual(steps[0].inventory[PIDGEOTTO].count, 7)

    t.deepEqual(steps[1].action, 'transfer')
    t.deepEqual(steps[1].pokemonId, PIDGEOTTO)
    t.deepEqual(steps[1].count, 7)
    t.deepEqual(steps[1].inventory[PIDGEY].count, 96 - 83 - 7)
    t.deepEqual(steps[1].inventory[PIDGEY].candies, 7)
    t.deepEqual(steps[1].inventory[PIDGEOTTO].count, 0)

    t.deepEqual(steps[2].action, 'transfer')
    t.deepEqual(steps[2].pokemonId, PIDGEY)
    t.deepEqual(steps[2].count, 5)
    t.deepEqual(steps[2].inventory[PIDGEY].count, 96 - 83 - 7 - 5)
    t.deepEqual(steps[2].inventory[PIDGEY].candies, 7 + 5)

    t.deepEqual(steps[3].action, 'evolve')
    t.deepEqual(steps[3].pokemonId, PIDGEY)
    t.deepEqual(steps[3].count, 1)
    t.deepEqual(steps[3].inventory[PIDGEY].count, 96 - 83 - 7 - 5 - 1)
    t.deepEqual(steps[3].inventory[PIDGEY].candies, 0)

    t.equal(result.totals.duration, 380)
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
    t.equal(result.presteps[1].count, 22)
    t.equal(result.presteps[1].inventory[PIDGEY].count, 25 - 22)
    t.equal(result.presteps[1].inventory[PIDGEY].candies, 1 + 22)

    t.equal(result.steps[0].action, 'evolve-transfer')
    t.equal(result.steps[0].pokemonId, PIDGEY)
    t.equal(result.steps[0].count, 1)
    t.equal(result.steps[0].inventory[PIDGEY].count, 25 - 22 - 1)
    t.equal(result.steps[0].inventory[PIDGEY].candies, 1 + 22 - 11)

    t.equal(result.steps[1].action, 'evolve')
    t.equal(result.steps[1].pokemonId, PIDGEY)
    t.equal(result.steps[1].count, 1)
    t.equal(result.steps[1].inventory[PIDGEY].count, 25 - 22 - 1 - 1)
    t.equal(result.steps[1].inventory[PIDGEY].candies, 1 + 22 - 11 - 12)
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
    t.equal(result.presteps[1].count, 22)
    t.equal(result.presteps[1].inventory[PIDGEY].count, 25 - 22)
    t.equal(result.presteps[1].inventory[PIDGEY].candies, 1 + 22)

    t.equal(result.steps[0].action, 'evolve-transfer')
    t.equal(result.steps[0].pokemonId, PIDGEY)
    t.equal(result.steps[0].count, 1)
    t.equal(result.steps[0].inventory[PIDGEY].count, 25 - 22 - 1)
    t.equal(result.steps[0].inventory[PIDGEY].candies, 1 + 22 - 11)

    t.equal(result.steps[1].action, 'evolve')
    t.equal(result.steps[1].pokemonId, PIDGEY)
    t.equal(result.steps[1].count, 1)
    t.equal(result.steps[1].inventory[PIDGEY].count, 25 - 22 - 1 - 1)
    t.equal(result.steps[1].inventory[PIDGEY].candies, 1 + 22 - 11 - 12)
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
})
