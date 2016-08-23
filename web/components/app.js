import {element} from 'decca'
import PidgeyForm from './pidgey_form'
import Results from './results'
import SaveForLater from './save_for_later'

function App ({props, context, dispatch}) {
  return <div class="app-root">
    <div class='fixed'>
      <PidgeyForm />
    </div>

    <div class='grow'>
       {context.result
         ? <Results result={context && context.result} />
         : null}
    </div>

    <div class='fixed'>
      <SaveForLater />
    </div>
  </div>
}

export default App
