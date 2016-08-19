var data = {
  13: {
    id: 13,
    name: 'Weedle',
    evolvesTo: 14,
    candiesToEvolve: 12
  },
  14: {
    id: 14,
    name: 'Kakuna',
    evolvesFrom: 13,
    evolvesTo: 15,
    candiesToEvolve: 50
  },
  15: {
    id: 15,
    name: 'Beedrill',
    evolvesFrom: 14
  },
  16: {
    id: 16,
    name: 'Pidgey',
    evolvesTo: 17,
    candiesToEvolve: 12,
  },
  17: {
    id: 17,
    name: 'Pidgeotto',
    evolvesFrom: 16,
    evolvesTo: 18,
    candiesToEvolve: 16
  },
  18: {
    id: 18,
    name: 'Pidgeot',
    evolvesFrom: 17
  },
  19: {
    id: 19,
    name: 'Ratatta',
    evolvesTo: 20,
    candiesToEvolve: 25
  },
  20: {
    id: 20,
    name: 'Raticate',
    evolvesFrom: 19
  }
}

/**
 * evolvables:
 * Non-evolved pokemon
 */

const evolvables = [ 13, 16, 19 ]

module.exports = { data, evolvables }
