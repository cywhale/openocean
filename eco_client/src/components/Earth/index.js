import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
//var Cesium = require('cesium/Source/Cesium');
//import CesiumWidget from 'cesium/Source/Widgets/CesiumWidget/CesiumWidget';
//import { Scene } from 'cesium/Source/Scene/Scene';
//import Globe from 'cesium/Source/Scene/Globe';
//import MapProjection from 'cesium/Source/Core/MapProjection';
//import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
//import createWorldTerrain from 'cesium/Source/Core/createWorldTerrain'
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';
import { render, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks'; //useRef, useImperativeHandle
//import { forwardRef } from 'preact/compat';
//import { createContext } from 'preact'; //createContext seems can be used only within Parent DOM..
//import Sidebar from '../Sidebar';
import BasemapPicker from 'async!./BasemapPicker';
import Layer from 'async!../Layer';
import style from './style';
import 'cesium/Source/Widgets/widgets.css';

//var csLoader = { csloaded: false, csviewer: null };
//export const csLoader = createContext({
//  csloaded: false,
//  csviewer: null
//}); //{ csProvider, csConsumer }

const Earth = (props, ref) => { //forwardRef((props, ref) => {
  //const ref = useRef(null);
  //const [state, setState] = useState(false);
  //const {appstate} = props;
  //const { Provider, Consumer } = csLoader;
  const [globe, setGlobe] = useState({
    loaded: false,
    viewer: null
  });

  useEffect(() => {
    console.log('Initialize Viewer after appstate'); // + appstate);
    if (!globe.loaded) {
      initGlobe();
    } else {
        render(render_basemap(), document.getElementById('rightarea'))
    }
    //const { loaded: csloaded, viewer: csviewer } = {...globe};
    //csLoader = Object.assign({}, { csloaded, csviewer });
  }, [globe.loaded]);

//https://github.com/preactjs/preact/issues/1788
  const initGlobe = () => {
    setGlobe({
      loaded: true,
      viewer: new Viewer(ref.current, {
        timeline: true,
        animation: true,
        geocoder: true,
        baseLayerPicker: false, //basemapPicker,
        imageryProvider: false, //sTileImg,
        mapProjection : new WebMercatorProjection,
        //terrainProvider: createWorldTerrain(),
        //globe: new Globe(MapProjection.ellipsoid),
      }),
    });
  };

  const render_basemap = () => {
    if (globe.loaded) {
      //const {_scene} = viewer.viewer._cesiumWidget;
      const {scene} = globe.viewer;
      return (
        <BasemapPicker scene={scene} />
      ); //<Sidebar scene={_scene} />
    }
    return null;
  };
  const render_layer = () => {
    if (globe.loaded) {
      return (
        <Layer viewer={globe.viewer} />
      );
    }
    return null;
  };

/*const getGlobe = () => ({loaded: globe.loaded, viewer: globe.viewer });
  useImperativeHandle(ref, () => {
    if (globe.loaded) {
      return ({
        ...ref.current,
        globe: globe
      });
    }
    return ref.current;
  }, [globe])
  const globe_handler = () => {
    if (globe.loaded) {
      useImperativeHandle(ref.current, () => ({
        globe: globe
      }), [ref.current, globe]);
      //const { loaded: csloaded, viewer: csviewer } = {...globe};
      //csLoader = Object.assign({}, { csloaded, csviewer });
    }
    return (<div style="display:none" id="csLoader" csLoader={globe} />);
  }*/

  const until = function (condition) {
      const poll = resolve => {
        if(condition()) resolve();
        else setTimeout(_ => poll(resolve), 400);
      }
      return new Promise(poll);
  };
  const wait_until_viewer = async () => {
      await until(_ => globe.loaded? true: false);
      let creditx = document.querySelector('.cesium-credit-textContainer')
      creditx.style.display = 'none';
  };
  wait_until_viewer();

/*<csLoader.Provider value={{csloaded: globe.loaded, csviewer: globe.viewer}}>
    <div style="display:block"><div class={style.basepicker}>
    { props.children }
    { render_basemap() }
    { globe_handler() }
    </div></csLoader.Provider>*/
  return (
    <Fragment>
      <div id="cesiumContainer"
          ref = {ref}
          class={style.fullSize} />
      <div id="toolbar" class={style.toolbar} />
      { render_layer() }
    </Fragment>
  );
};
export default Earth;
//export { csLoader }; //const {csProvider, csConsumer} = csLoader;