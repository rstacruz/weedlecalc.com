import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import map from 'lodash/map'
import ms from 'ms'

function Results ({props}) {
  const {result} = props

  return <div class="calculator-results">
    <div class="calculator-steps">
      {map(result.presteps, step => <ResultStep step={step} />)}
      <ResultStep step={{action: 'egg'}} />
      {map(result.steps, step => <ResultStep step={step} />)}
    </div>
  </div>
}

function ResultStep ({props}) {
  const {step} = props
  switch (step.action) {
    case 'egg':
      return <EggStep step={step} />
    case 'transfer':
      return <TransferStep step={step} />
    case 'evolve':
      return <EvolveStep step={step} />
    default:
      return <noscript />
  }
}

function TransferStep ({props}) {
  const {step} = props
  return <div class="calculator-step -transfer">
    <span class="direction">
      Transfer {step.count}x {pokedex.data[step.pokemonId].name}.
    </span>

    <span class="meta">
      <span class="duration">{ms(step.duration * 1000)}</span>
    </span>
  </div>
}

function EggStep ({props}) {
  return <div class="calculator-step -egg">
    <span class="direction">
      Activate the lucky egg.
    </span>
  </div>
}

function EvolveStep ({props}) {
  const {step} = props
  return <div class="calculator-step -evolve">
    <span class="direction">
      Evolve {step.count}x {pokedex.data[step.pokemonId].name}.
    </span>
    <span class="meta">
      <span class="exp">{step.exp} EXP</span>
      <span class="duration">{ms(step.duration * 1000)}</span>
    </span>
  </div>
}

export default Results
