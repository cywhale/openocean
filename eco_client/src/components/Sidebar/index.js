import { useState, useEffect, useCallback, useContext } from 'preact/hooks';
import { UserContext } from "../UserHandler/UserContext";
import { EarthContext } from "../Earth/EarthContext";
import UserHandler from 'async!../UserHandler';
//import BasemapPicker from '../Earth/BasemapPicker';
import style from './style';

//export default class Sidebar extends Component {
const Sidebar = () => { //props
//const {scene} = props;
  const { user, setUser } = useContext(UserContext);
  const { earth, setEarth } = useContext(EarthContext);
  const [menuItem, setMenuItem] = useState({
      onSidebar: false
  });
  const [hide, setHide] = useState(false);

  const toggleHidex = () => {
    console.log("Now hide is:", hide, " & user.init is:", user.init, " & viewer:", earth.loaded);
    toolbarToggle(!hide, user.init, " & viewer:", earth.loaded)
    setHide(!hide, user.init && earth.loaded);
  };

  const toolbarToggle = useCallback((hided, enable) => {
    if (enable) {
      document.querySelector(".cesium-viewer-toolbar").style.display = hided? 'none': 'block';
      document.querySelector(".cesium-viewer-animationContainer").style.display = hided? 'none': 'block';
      document.querySelector(".cesium-viewer-bottom").style.display = hided? 'none': 'block';
      document.querySelector(".cesium-viewer-timelineContainer").style.display = hided? 'none': 'block';
      document.getElementById("toolbar").style.display = hided? 'none': 'block';
      document.getElementById("toolToggle").style.display = hided? 'none': 'block';
      document.getElementById("rightarea").style.display = hided? 'none': 'block';
      document.getElementById("ctrl").style.display = hided? 'none': 'block';
      document.getElementById("menuButn").style.setProperty('--background', hided? "url('../../assets/icons/geometry.png')": "url('../../assets/icons/menu-blue96.png')");
      setMenuItem(itemState => ({
        onSidebar: hided? false: true
      }));
    }
  },[]);

  useEffect(() => {
    document.getElementById("menuButn").style.setProperty('--background', "url('../../assets/icons/menu-blue96.png')");
  }, []);

  let className;
  if (menuItem.onSidebar) {
    className=`${style.sideContainer} ${style.open_sidebar}`;
  } else {
    className=`${style.sideContainer}`
  }
/*
  const render_sceneloaded = () => {
    let content = null;
    if (scene) {
      return (<BasemapPicker scene={scene} />);
    }
    return null;
  };
*/
//{ render_sceneloaded() }
  return (
    <div class = {style.sideblock}>
      <div id="swipex" class = {style.swipe_area}></div>
      <div class = {style.menuToggle}>
          <div class = {style.menuBtn_in_span}>
          <button id="menuButn" class = {style.menuButn} type="button"
            onClick={() => setMenuItem(itemState => ({
              onSidebar: itemState.onSidebar? false: true
            }))}>
            <i></i>
          </button>
          </div>
      </div>
      <div id="sideBar" class={className}>
          <div class = {style.sidemenu}>
            <ul>
              <li><a href="#"><UserHandler /></a></li>
              <li><button style="padding:6px 8px;margin:12px" class="button" onClick={toggleHidex}>{hide? 'Show all': 'Hide all'}</button></li>
              <li><a href="#">Setting</a>
                <ul>
                  <li><a href="#">Test Widget</a></li>
                  <li><a href="#">Look 2th</a>
                    <ul>
                      <li><a href="#">It 3rd</a></li>
                      <li class = {style.menu_item_divided}><a href="#">End</a>
                      </li>
                    </ul>
                  </li>
                  <li class = {style.menu_item_divided}><a href="#">Services</a>
                  </li>
                </ul>
              </li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
      </div>
    </div>
  );
};

export default Sidebar;
