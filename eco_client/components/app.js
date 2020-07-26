//import { Component } from 'preact';
//import { Router } from 'preact-router';
import Sidebar from './Sidebar';
import Earth from './Earth';
import style from './style';

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
   	<div id="app">
	  <div path="/" class={style.home}>
            <Earth />
            <Sidebar />
	  </div>
	</div>
     );
  //}
}
export default App;
