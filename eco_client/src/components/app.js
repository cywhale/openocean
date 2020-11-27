import { createRef } from 'preact'; // h, Component, render, toChildArray
import { Router } from 'preact-router';
//import { useRef } from 'preact/hooks'; //useContext
//import { createHashHistory } from 'history';
import Sidebar from 'async!./Sidebar';
import Earth from 'async!./Earth'; // {csConsumer}
import UserCookies from 'async!./UserHandler/UserCookies';
import { UserContextProvider } from "./UserHandler/UserContext";
import { EarthContextProvider } from "./Earth/EarthContext";
import style from './style/style_app';
//import BasemapPicker from './Earth/BasemapPicker'; //async!
//import Layer from './Layer';
/** @jsx h */
/*
export let csLoader = createContext({
  csloaded: false,
  csviewer: null,
});
*/
const App = (props) => { //class App extends Component {
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
//const [appstate, setState] = useState(false);
//const [cs, setCS] = useState({
//  csloaded: false,
//  csviewer: null
//});
  const ref = createRef();
/*
  const getGlobe = async () => {
    if (ref.current && "globe" in ref.current) {
       let {globe} = await ref.current;
       return globe;
    }
    return ({ loaded: false, viewr: null });
    //const { csloaded: loaded, csviewer: viewer } = {...globe}
    //let tmpcs = Object.assign(
    //            {},  { loaded, viewer });
  }
  const waitCS = useCallback(() => {
    console.log('Wait csViewer...');

//  const until = function (condition) {
//    const poll = resolve => {
//      if(condition()) resolve();
//      else setTimeout(_ => poll(resolve), 400);
//    }
//    return new Promise(poll);
//  };
//    const wait_until_viewer = async () => {
//      await until(_ => getGlobe().loaded? true: false);
      let { loaded, viewer } = getGlobe();
      setCS({ csloaded: loaded, csviewer: viewer});
//    };
//    wait_until_viewer();
  }, [ref]);
  useEffect(() => {
      waitCS();
  }, []); //ref, waitCS()
*/

//const {_scene} = viewer.viewer._cesiumWidget;
/*const render_basemap = (eRef) => {
    if (eRef && eRef.current && !('globe' in eRef.current)) waitCS()
    const { csloaded, csviewer } = cs; //csLoader; //useContext(csLoader);
    if (csloaded) {
      return(
//      <csConsumer>
//      {ctx => { ctx.csloaded? (
          <div class={style.right_area}>
            <BasemapPicker viewer={csviewer.viewer} />
          </div>
      );
    }
    return null;
//      </csConsumer>
  };
  const render_layer = (eRef) => {
    if (eRef && eRef.current && !('globe' in eRef.current)) waitCS();
    const { csloaded, csviewer } = cs; //csLoader; //useContext(csLoader);
    if (csloaded) {
      return(
//      <csConsumer>
//      {ctx => {ctx.csloaded? (
        <Layer viewer={csviewer.viewer} />
      );
    }
    return null;
//      </csConsumer>
  };
*/
  return (
  //const Main = () => { <Router history={createHashHistory()}>
    <div id="app">
      <Router>
      <div path='/' class={style.home}>
        <div class={style.right_area} id="rightarea" />
        <UserContextProvider>
          <EarthContextProvider>
            <Sidebar />
            <Earth ref={ref} />
          </EarthContextProvider>
        </UserContextProvider>
        <UserCookies />
      </div>
      </Router>
    </div>
  //};
  );
  //render(<Main /> , document.body);
}
export default App;
