import {element} from 'decca'
import stateful from 'deku-stateful'
import {getSaveURL} from '../helpers/persistence'

function SaveForLater ({dispatch, state, setState}) {
  return <div class='save-for-later'>
    {(state && state.url)
      ? <div class='save-for-later-popup'>
        <button class='close'
          onclick={close(setState)}>&times;</button>
        <p>Keep or share this URL:</p>
        <textarea>{state.url}</textarea>
      </div>
      : null
    }

    <button class='button'
      onclick={saveForLater(dispatch, setState)}>
      Save for later
    </button>
  </div>
}

function saveForLater (dispatch, setState) {
  return e => {
    e.preventDefault()
    dispatch((dispatch, getState) => {
      let url = getSaveURL(getState().form)
      setState({ url: url })
    })
  }
}

function close (setState) {
  return e => {
    e.preventDefault()
    setState({ url: undefined })
  }
}

export default stateful(SaveForLater)
