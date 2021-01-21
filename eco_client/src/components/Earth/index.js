import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
//var Cesium = require('cesium/Source/Cesium');
//import CesiumWidget from 'cesium/Source/Widgets/CesiumWidget/CesiumWidget';
//import { Scene } from 'cesium/Source/Scene/Scene';
//import Globe from 'cesium/Source/Scene/Globe';
//import MapProjection from 'cesium/Source/Core/MapProjection';
//import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
//import createWorldTerrain from 'cesium/Source/Core/createWorldTerrain';
//import Credit from 'cesium/Source/Core/Credit';
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';
import { render, Fragment } from 'preact'; //createContext seems can be used only within Parent DOM..
import { useState, useEffect } from 'preact/hooks'; //useRef, useImperativeHandle
//import { forwardRef } from 'preact/compat';
import BasemapPicker from 'async!./BasemapPicker';
import Layer from 'async!../Layer';
import { DateContextProvider } from "../Datepicker/DateContext";
import { FlowContextProvider } from "../Flows/FlowContext"; //current, flow for Windjs
import { ClusterContextProvider } from "../SiteCluster/ClusterContext";
import { OccurContextProvider } from "../Biodiv/OccurContext"; //for GBIF occurrence
//import { UserContext } from '../UserHandler/UserContext';
import style from './style';
//import 'cesium/Source/Widgets/widgets.css';
import '../../style/style_earth.css';

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
  const [userScene, setUserScene] = useState({ baseLayer: "" });
  const [globe, setGlobe] = useState({
    loaded: false,
    baseLoaded: false,
    viewer: null
  });
  const [basePick, setBasePick] = useState({ name: "" });

  useEffect(() => {
    console.log('Initialize Viewer after appstate'); // + appstate);
    if (!globe.loaded) {
      //setUserScene({ baseLayer: "NOAA ETOPO\u00a0I" });
      setUserScene({ baseLayer: "Esri Firefly" });
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
      //baseLoaded: false,
      viewer: new Viewer(ref.current, {
        timeline: true,
        animation: true,
        geocoder: true,
        baseLayerPicker: false, //basemapPicker,
        imageryProvider: false, //sTileImg,
        mapProjection : new WebMercatorProjection,
        requestRenderMode : true, //https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/#handling-simulation-time-changes
        maximumRenderTimeChange : Infinity
        //terrainProvider: createWorldTerrain(),
        //globe: new Globe(MapProjection.ellipsoid),
      }),
    });
  };

  const render_basemap = () => {
    if (globe.loaded) {
      //const {_scene} = viewer.viewer._cesiumWidget;
      const {scene} = globe.viewer;
      //const {globe} = scene.globe;
      setGlobe((preState) => ({
        ...preState,
      //  baseLayerPicker: basemap_module(globe.viewer),
        baseLoaded: true,
      }));

      return (
        <BasemapPicker scene={scene} basePick={basePick} onchangeBase={setBasePick}/>
      ); //<Sidebar scene={_scene} />
    }
    return null;
  };

  const render_layer = () => {
    if (globe.loaded & globe.baseLoaded) {
      return (
        <DateContextProvider><FlowContextProvider><ClusterContextProvider><OccurContextProvider>
          <Layer viewer={globe.viewer} baseName={basePick.name} userBase={userScene.baseLayer} />
        </OccurContextProvider></ClusterContextProvider></FlowContextProvider></DateContextProvider>
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
      //let wfsCredit = new Credit('Coastline');// 1:10m ©Natural Earth');//, showOnScreen: true});
      //globe.viewer.scene.frameState.creditDisplay.addCredit(wfsCredit);
      let creditx = document.querySelector('.cesium-credit-textContainer')
      creditx.style.display = 'none';
  };
  wait_until_viewer();

/*<csLoader.Provider value={{csloaded: globe.loaded, csviewer: globe.viewer}}>
    <div style="display:block"><div class={style.basepicker}>
    { props.children }
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
