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
})
