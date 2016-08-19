import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import PidgeyForm from './pidgey_form'
import map from 'lodash/map'

function App ({props, context}) {
  return <div>
    <h1>Pidgey Calculator!</h1>
    <PidgeyForm />

     {context.result
       ? <Results result={context && context.result} />
       : null}
  </div>
}

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
    case 'start':
      return <StartStep step={step} />
    case 'egg':
      return <EggStep step={step} />
    case 'transfer':
      return <TransferStep step={step} />
    case 'evolve':
      return <EvolveStep step={step} />
    default:
      return null
  }
}

function StartStep ({props}) {
  return <div class="calculator-step -start">
    <span class="direction">
      Let's begin.
    </span>
  </div>
}
function TransferStep ({props}) {
  const {step} = props
  return <div class="calculator-step -transfer">
    <span class="direction">
      Transfer {step.count}x {pokedex.data[step.pokemonId].name}.
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
    <span class="exp">
      {step.exp} EXP
    </span>
  </div>
}

export default App
