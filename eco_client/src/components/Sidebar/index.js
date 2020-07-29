//import { h } from 'preact';
import { useState } from 'preact/hooks'; //, useEffect, useCallback
import UserHandler from '../UserHandler';
//import BasemapPicker from '../Earth/BasemapPicker';
import style from './style';

//export default class Sidebar extends Component {
const Sidebar = () => { //props
//const {scene} = props;
  const [menuItem, setMenuItem] = useState({
      onSidebar: false
  });
/*
  useEffect(() => {
    console.log("Now onSidebar is: " + menuItem.onSidebar);
    toggleSidebar();
  }, [toggleSidebar]);

  const toggleSidebar = useCallback(() => {
    setMenuItem(itemState => ({
      //...itemState,
      onSidebar: itemState.onSidebar? false: true
    }));
  }, []);
*/
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
          <button class = {style.menuButn} type="button" 
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
