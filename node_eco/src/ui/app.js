'use strict';
// if need version htm@3.0.4 or from module //'https://unpkg.com/preact?module';
import { html, Component, render } from 'https://unpkg.com/htm/preact/standalone.module.js';

class App extends Component {
  constructor () {
    super();
    this.onInput = e => {
      this.setState({ value: e.target.value });
    }
    
    this.onSubmit = e => {
      e.preventDefault();
      this.setState({ name: this.state.value });
    }  
  }

  async componentDidMount () {
    try {
      this.setState({ loading: true, time: null, value: '', name: 'user' })
      await fetch('/api/time')
        .then(response => response.json())
        .then(data => this.setState({ loading: false, time: data.time }))
    } catch(err) {
      console.log(err)
    }
  }
  render (props, state) {
    return html`
      <div>
        <div>
          <h1>Hello, ${state.name}!</h1>
          <form onSubmit=${this.onSubmit}>
            <input type="text" value=${state.value} onInput=${this.onInput} />
            <button type="submit">Update</button>
          </form>
        </div>
        <h3>say hello from ECO NODE</h3>
        <div>
          ${ state.loading &&
            html`
              <p>😴 Loading time from server...</p>
            `
          }
          ${ state.time &&
            html`
              <p>Site under construction...</p>
              <p>⏱ Update : <i>${state.time}</i></p>
              <hr />
                <p>Just try: </p>
                <p> /api/time</p>
                <p> /map</p>
            `
          }
        </div>  
        <hr />
      </div>
    `
  }
}

render(html`<${App}/>`, document.getElementById('app'));
