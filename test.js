const test = require('tape-plus')
const calc = require('./index').calc

test.group('lol', test => {
  const have = {
    pokemon: {
      16: {
        id: 16,
        count: 96,
        candies: 1
      }
    }
  }

  test('calc', t => {
    let result = calc(have)
    console.log('result:', require('util').inspect(result, { depth: null, colors: true }))
  })
})
