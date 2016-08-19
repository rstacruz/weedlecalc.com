import {element} from 'decca'
import PidgeyForm from './pidgey_form'
import Results from './results'

function App ({props, context}) {
  return <div class="app-root">
    <h1>Pidgey Calculator</h1>

    <PidgeyForm />

     {context.result
       ? <Results result={context && context.result} />
       : null}
  </div>
}

export default App
