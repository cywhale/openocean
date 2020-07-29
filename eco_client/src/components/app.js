//import { h, render } from 'preact'; //Component
import { Router } from 'preact-router';
//import { createHashHistory } from 'history';
import Sidebar from './Sidebar';
import Earth from 'async!./Earth';
import style from './style';
/** @jsx h */

const App = () => { //class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 *
		handleRoute = e => {
			this.currentUrl = e.url;
		};
		<Router onChange={this.handleRoute}>
			<div path="/" class={style.home} />
	    </Router>
	*/
  //render() {
  return (
  //const Main = () => { <Router history={createHashHistory()}>
    <div id="app">
      <Router>
        <div path="/" class={style.home}>
          <Sidebar />
          <Earth />
        </div>
      </Router>
    </div>
  //};
  );
  //render(<Main /> , document.body);
}
export default App;
