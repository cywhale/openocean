/* global htmPreact */
const { html, Component, render } = htmPreact

class App extends Component {
  async componentDidMount () {
    try {
      this.setState({ loading: true, time: null })
      await fetch('/api/time')
        .then(response => response.json())
        .then(data => this.setState({ loading: false, time: data.time }))
    } catch(err) {
      console.log(err)
    }
  }
  render (props, state) {
    return html`
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col">
            <h1>Hello from ECO NODE</h1>
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
        </div>
      </div>
    `
  }
}

render(html`<${App}/>`, document.getElementById('app'))
