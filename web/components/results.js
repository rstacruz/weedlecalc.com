import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import map from 'lodash/map'
import ms from 'ms'

function Results ({props}) {
  const {result} = props

  return <div class="calculator-results">
    <div class="calculator-steps">
      {map(result.presteps, step => <ResultStep step={step} />)}
      {result.steps.length > 0
        ? <ResultStep step={{action: 'egg'}} />
        : null}
      {map(result.steps, step => <ResultStep step={step} />)}
    </div>
    <details class="debug-details">
      <summary>Debug</summary>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </details>
  </div>
}

function ResultStep ({props}) {
  const {step} = props
  switch (step.action) {
    case 'egg':
      return <EggStep step={step} />
    case 'transfer':
      return <TransferStep step={step} />
    case 'evolve-transfer':
      return <EvolveTransferStep step={step} />
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
      Transfer <strong>{step.count}</strong> {pokedex.data[step.pokemonId].name}.
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
      Evolve <strong>{step.count}</strong> {pokedex.data[step.pokemonId].name}.
    </span>
    <span class="meta">
      <span class="exp">{step.exp} EXP</span>
      <span class="duration">{ms(step.duration * 1000)}</span>
    </span>
  </div>
}

function EvolveTransferStep ({props}) {
  const {step} = props
  return <div class="calculator-step -evolve">
    <span class="direction">
      Evolve and transfer <strong>{step.count}</strong> {pokedex.data[step.pokemonId].name}.
    </span>
    <span class="meta">
      <span class="exp">{step.exp} EXP</span>
      <span class="duration">{ms(step.duration * 1000)}</span>
    </span>
  </div>
}

export default Results
