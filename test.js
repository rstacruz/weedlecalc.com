const test = require('tape-plus')
const calc = require('./index').calc

test.group('calc()', test => {
  const have = {
    pokemon: {
      16: {
        id: 16,
        count: 96,
        candies: 1
      }
    }
  }

  test('96 pidgeys, 1 candy', t => {
    let result = calc(have)
    console.log('result:', require('util').inspect(result, { depth: null, colors: true }))
  })
})
