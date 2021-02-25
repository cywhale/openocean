import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
//import CesiumTerrainProvider from 'cesium/Source/Core/CesiumTerrainProvider'; //Move to Bathymetry/
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
import { TerrainContextProvider } from "../Bathymetry/TerrainContext"; //for 3D terrain
import { OccurContextProvider } from "../Biodiv/OccurContext"; //for GBIF occurrence
import { SateContextProvider } from "../Satellite/SateContext"; //for WMTS, sateliite layers
import { LayerContextProvider } from "../Layer/LayerContext";
//import { UserContext } from '../UserHandler/UserContext';
import style from './style';
//import 'cesium/Source/Widgets/widgets.css'; //move to ../../index.js
import '../../style/style_earth.css';

//var csLoader = { csloaded: false, csviewer: null };
//export const csLoader = createContext({
//  csloaded: false,
//  csviewer: null
//}); //{ csProvider, csConsumer }

const Earth = (props, ref) => { //forwardRef((props, ref) => {
  //const ref = useRef(null);
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
      //setUserScene({ baseLayer: "Esri Firefly" });
      setUserScene({ baseLayer: "NOAA ETOPO\u00a0I" });
      initGlobe();
    } else {
      render(render_basemap(), document.getElementById('rightarea'))
    }
    //const { loaded: csloaded, viewer: csviewer } = {...globe};
    //csLoader = Object.assign({}, { csloaded, csviewer });
  }, [globe.loaded]);

//https://github.com/preactjs/preact/issues/1788
  const initGlobe = () => {
    let gviewer = new Viewer(ref.current, {
        timeline: true,
        animation: true,
        geocoder: true,
        baseLayerPicker: false, //basemapPicker,
        imageryProvider: false, //sTileImg,
        mapProjection : new WebMercatorProjection, //used in 2D/2.5D
        requestRenderMode : true, //https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/#handling-simulation-$
        maximumRenderTimeChange : Infinity,
        //terrainProvider: new CesiumTerrainProvider({ //createWorldTerrain(),
        //    url: "https://eco.odb.ntu.edu.tw/tilesets/wreckareef",
        //      //requestWaterMask: false,
        //     requestVertexNormals: true,
        //})
        //globe: new Globe(MapProjection.ellipsoid),
    });

    setGlobe({
      loaded: true,
      viewer: gviewer,
    });
  };

  const render_basemap = () => {
    if (globe.loaded) {
      //const {_scene} = viewer.viewer._cesiumWidget;
      const {scene} = globe.viewer;
      setGlobe((preState) => ({
        ...preState,
      //baseLayerPicker: basemap_module(globe.viewer),
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
        <DateContextProvider><FlowContextProvider><ClusterContextProvider><TerrainContextProvider><OccurContextProvider><LayerContextProvider><SateContextProvider>
          <Layer viewer={globe.viewer} baseName={basePick.name} userBase={userScene.baseLayer} />
        </SateContextProvider></LayerContextProvider></OccurContextProvider></TerrainContextProvider></ClusterContextProvider></FlowContextProvider></DateContextProvider>
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
