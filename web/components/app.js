import {element} from 'decca'
import PidgeyForm from './pidgey_form'
import Results from './results'
import {saveFormState} from '../actions'

function App ({props, context, dispatch}) {
  return <div class="app-root">
    <PidgeyForm />

     {context.result
       ? <Results result={context && context.result} />
       : null}
  </div>
}

export default App
