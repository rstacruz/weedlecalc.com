const test = require('tape-plus')
const calc = require('./index').calc

const PIDGEY = 16
const PIDGEOTTO = 17

test.group('calc()', test => {
  const have = {
    pokemon: {
      16: {
        id: PIDGEY,
        count: 96,
        candies: 1
      }
    }
  }

  test('96 pidgeys, 1 candy', t => {
    let result = calc(have)
    let steps = result.steps
    t.deepEqual(steps[0].action, 'start')
    t.deepEqual(steps[0].inventory[PIDGEY].count, 96)
    t.deepEqual(steps[0].inventory[PIDGEY].candies, 1)

    t.deepEqual(steps[1].action, 'transfer')
    t.deepEqual(steps[1].pokemonId, PIDGEY)
    t.deepEqual(steps[1].count, 83)
    t.deepEqual(steps[1].inventory[PIDGEY].count, 96 - 83)
    t.deepEqual(steps[1].inventory[PIDGEY].candies, 84)

    t.deepEqual(steps[2].action, 'evolve')
    t.deepEqual(steps[2].pokemonId, PIDGEY)
    t.deepEqual(steps[2].count, 7)
    t.deepEqual(steps[2].inventory[PIDGEY].count, 96 - 83 - 7)
    t.deepEqual(steps[2].inventory[PIDGEY].candies, 0)
    t.deepEqual(steps[2].inventory[PIDGEOTTO].count, 7)

    t.deepEqual(steps[3].action, 'transfer')
    t.deepEqual(steps[3].pokemonId, PIDGEOTTO)
    t.deepEqual(steps[3].count, 7)
    t.deepEqual(steps[3].inventory[PIDGEY].count, 96 - 83 - 7)
    t.deepEqual(steps[3].inventory[PIDGEY].candies, 7)
    t.deepEqual(steps[3].inventory[PIDGEOTTO].count, 0)

    t.deepEqual(steps[4].action, 'transfer')
    t.deepEqual(steps[4].pokemonId, PIDGEY)
    t.deepEqual(steps[4].count, 5)
    t.deepEqual(steps[4].inventory[PIDGEY].count, 96 - 83 - 7 - 5)
    t.deepEqual(steps[4].inventory[PIDGEY].candies, 7 + 5)

    t.deepEqual(steps[5].action, 'evolve')
    t.deepEqual(steps[5].pokemonId, PIDGEY)
    t.deepEqual(steps[5].count, 1)
    t.deepEqual(steps[5].inventory[PIDGEY].count, 96 - 83 - 7 - 5 - 1)
    t.deepEqual(steps[5].inventory[PIDGEY].candies, 0)
    // console.log('result:', require('util').inspect(result, { depth: null, colors: true }))
  })
})
