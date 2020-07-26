import Viewer from 'cesium/Source/Widgets/Viewer/Viewer';
//import CesiumWidget from 'cesium/Source/Widgets/CesiumWidget/CesiumWidget';
//import { Scene } from 'cesium/Source/Scene/Scene';
//import Globe from 'cesium/Source/Scene/Globe';
//import MapProjection from 'cesium/Source/Core/MapProjection';
//import basemapPicker from './basemapPicker';
//import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
//import createWorldTerrain from 'cesium/Source/Core/createWorldTerrain'
import Rectangle from 'cesium/Source/Core/Rectangle';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import WebMercatorProjection from 'cesium/Source/Core/WebMercatorProjection';
//import Cesium from "cesium/Cesium";
import { useState, useEffect, useRef } from 'preact/hooks';
//import { createContext } from 'preact';
//import Sidebar from '../Sidebar';
import BasemapPicker from './BasemapPicker'; 
import style from './style';
import 'cesium/Source/Widgets/widgets.css'; //import '../../node_modules/cesium/Build/Cesium/Widgets/widgets.css';
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
/*
  const bnds = [-180 * Math.PI / 180.0,
                -90 * Math.PI / 180.0,
                180 * Math.PI / 180.0,
                90 * Math.PI / 180.0] //[[-90, -180], [90, 180]]; // * Math.PI / 180.0, */
/*
  const evlay01url = 'https://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1787328&cs=rgb&format=PNG&width=3600&height=1800';
  const sTileImg = new SingleTileImageryProvider({
    url: evlay01url,
    //rectangle: new Rectangle(bnds[0], bnds[1], bnds[2], bnds[3]),
    rectangle: Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
    //numberOfLevelZeroTilesX: 1,
    //numberOfLevelZeroTilesY: 1,
    proxy : new DefaultProxy('/proxy/') //https://github.com/CesiumGS/EarthKAMExplorer/blob/master/server/server.js
  });
*/
  useEffect(() => {
    console.log('Initialize Viewer');
    initGlobe();
  }, [csContainer]);

//https://github.com/preactjs/preact/issues/1788
  const initGlobe = () => {
    setGlobe({ //(csobj) => ({
      //...csobj,
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
    }); //);
    setState(true);
  };

  const render_csloaded = () => {
    if (state) {
      const {_scene} = viewer.viewer._cesiumWidget;
      return (<BasemapPicker scene={_scene} />); //<Sidebar scene={_scene} />
    }
    return null;
  };

  // <div id="loadingOverlay"><h1>Loading...</h1></div>
  // <csLoader.Provider value={{loaded: state, viewer: viewer}}>
  // </csLoader.Provider>
  return (
    <div style={style.csdiv}>
        { render_csloaded() }
        <div id="cesiumContainer"
          ref = {csContainer}
          class={style.fullSize} />
        <div id="toolbar" class={style.toolbar}></div>
    </div>
  );

};
export default Earth;
//export { csLoader };
