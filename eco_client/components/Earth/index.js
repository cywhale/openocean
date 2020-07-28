import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
//var Cesium = require('cesium/Source/Cesium');
//import CesiumWidget from 'cesium/Source/Widgets/CesiumWidget/CesiumWidget';
//import { Scene } from 'cesium/Source/Scene/Scene';
//import Globe from 'cesium/Source/Scene/Globe';
//import MapProjection from 'cesium/Source/Core/MapProjection';
//import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
//import createWorldTerrain from 'cesium/Source/Core/createWorldTerrain'
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';
import { useState, useEffect, useRef } from 'preact/hooks';
//import { createContext } from 'preact';
//import Sidebar from '../Sidebar';
import BasemapPicker from './BasemapPicker';
import Layer from '../Layer';
import style from './style';
import 'cesium/Source/Widgets/widgets.css'; //import '../../node_modules/cesium/Build/Cesium/Widgets/widgets.css';
//import './csviewer.css'
/*
const csLoader = createContext({
  loaded: false,
  viewer: null,
});
*/
//export const csConsumer = csLoader.Consumer

const Earth = () => {
  const [state, setState] = useState(false);
  const [viewer, setGlobe] = useState(null);
  const csContainer = useRef(null);

  useEffect(() => {
    console.log('Initialize Viewer');
    initGlobe();
  }, [csContainer]);

//https://github.com/preactjs/preact/issues/1788
  const initGlobe = () => {
    setGlobe({
      viewer: new Viewer(csContainer.current, {
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
    setState(true);
  };

  const render_basemap = () => {
    if (state) {
      //const {_scene} = viewer.viewer._cesiumWidget;
      const {scene} = viewer.viewer;
      return (
        <BasemapPicker scene={scene} />
      ); //<Sidebar scene={_scene} />
    }
    return null;
  };

  const render_layer = () => {
    if (state) {
      return (
        <Layer viewer={viewer.viewer} />
      );
    }
    return null;
  };

  // <div id="loadingOverlay"><h1>Loading...</h1></div>
  // <csLoader.Provider value={{loaded: state, viewer: viewer}}>
  // </csLoader.Provider>
  return (
    <div style={style.csdiv}>
        <div id="cesiumContainer"
          ref = {csContainer}
          class={style.fullSize}>
          <div style="height:100%;float:right;right:0;position:absolute;width:38px;margin:0">
             { render_basemap() }
          </div>
          <div id="toolbar" class={style.toolbar}></div>
        </div>
        { render_layer() }
    </div>
  );
};
export default Earth;
//export { csLoader };
