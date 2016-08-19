import {element} from 'decca'
import {pokedex} from '../../modules/pidgey-calculator'
import reduce from 'lodash/reduce'
import map from 'lodash/map'
import ms from 'ms'
import numberFormat from 'number-format.js'

const fmt = numberFormat.bind(null, '#,###.')

function Results ({props}) {
  const {result} = props

  return <div class="calculator-results">
    <div class="calculator-steps">
      {map(result.presteps, step => <ResultStep step={step} />)}
      {result.steps.length > 0
        ? <ResultStep step={{action: 'egg'}} />
        : null}
      {map(result.steps, step => <ResultStep step={step} />)}
      {result.totals && result.totals.duration > 0
        ? <ResultTotal total={result.totals} />
        : null}
    </div>
    {window.location.search.indexOf('debug') > -1
      ? <details class="debug-details">
        <summary>Debug</summary>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </details>
      : null}
  </div>
}

function ResultTotal ({props}) {
  const {total} = props
  return <div class="calculator-step -total">
    <span class="direction">Total:</span>
    <span class="meta">
      <span class="exp">{fmt(total.exp)} EXP</span>
      <span class="duration">{ms(total.duration * 1000)}</span>
    </span>
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
  const name = pokedex.data[step.pokemonId].name

  return <details>
    <summary class="calculator-step -transfer">
      <span class="direction">
        Transfer <strong>{step.count}</strong> {plural(step.count, name)}.
      </span>

      <span class="meta">
        <span class="duration">{ms(step.duration * 1000)}</span>
      </span>
    </summary>

    <Inventory
      inventory={step.inventory}
      id={step.unevolvedPokemonId || step.pokemonId} />
  </details>
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
  const name = pokedex.data[step.pokemonId].name
  const id = step.pokemonId

  return <details>
    <summary class="calculator-step -evolve">
      <span class="direction">
        Evolve <strong>{step.count}</strong> {plural(step.count, name)}.
      </span>
      <span class="meta">
        <span class="exp">{fmt(step.exp)} EXP</span>
        <span class="duration">{ms(step.duration * 1000)}</span>
      </span>
    </summary>
    <Inventory inventory={step.inventory} id={step.pokemonId} />
  </details>
}

function Inventory ({props}) {
  const {id, inventory} = props
  const name = pokedex.data[id].name
  const nextId = pokedex.data[id].evolvesTo
  const nextName = nextId && pokedex.data[nextId].name

  return <div class="calculator-details">
    <span class="item">
      {inventory[id].count} {plural(inventory[id].count, name)}
    </span>
    {inventory[nextId] && inventory[nextId].count > 0
      ? <span class="item">
        {inventory[nextId].count} {plural(inventory[nextId].count, nextName)}
      </span>
      : null}
    <span class="item">
      {inventory[id].candies} {name} {plural(inventory[id].candies, 'candy')}
    </span>
  </div>
}

function EvolveTransferStep ({props}) {
  const {step} = props
  const name = pokedex.data[step.pokemonId].name

  return <details>
    <summary class="calculator-step -evolve">
      <span class="direction">
        Evolve <strong>{step.count}</strong> {plural(step.count, name)} and transfer immediately.
      </span>
      <span class="meta">
        <span class="exp">{fmt(step.exp)} EXP</span>
        <span class="duration">{ms(step.duration * 1000)}</span>
      </span>
    </summary>
    <Inventory
      inventory={step.inventory}
      id={step.pokemonId} />
  </details>
}

/**
 * Internal: pluralizes `str` based on count `n`.
 */

function plural (n, str) {
  if (n === 1) return str
  if (/y$/.test(str)) return str.replace(/y$/, 'ies')
  return str + 's'
}

export default Results
