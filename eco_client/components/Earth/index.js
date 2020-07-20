import { Viewer } from 'cesium';
import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
import Rectangle from 'cesium/Source/Core/Rectangle'
//import Cesium from "cesium/Cesium";
import { useState, useEffect, useRef} from 'preact/hooks';
//import { Component } from 'preact';
import style from './style';
import '../../node_modules/cesium/Build/Cesium/Widgets/widgets.css'; //require('cesium/Widgets/widgets.css'); //

const Earth = () => {
  const [viewer, setGlobe] = useState(null);
  const csContainer = useRef(null);

  const bnds = [-180 * Math.PI / 180.0,
                -90 * Math.PI / 180.0,
                180 * Math.PI / 180.0,
                90 * Math.PI / 180.0] //[[-90, -180], [90, 180]]; // * Math.PI / 180.0,
  const evlay01url = 'https://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1787328&cs=rgb&format=PNG&width=3600&height=1800';
  const sTileImg = new SingleTileImageryProvider({
    url: evlay01url,
    rectangle: new Rectangle(bnds[0], bnds[1], bnds[2], bnds[3]),
    numberOfLevelZeroTilesX: 1,
    numberOfLevelZeroTilesY: 1,
  });

  useEffect(() => {
    console.log('Initialize Viewer');
    initGlobe();
  }, [csContainer]);

//https://github.com/preactjs/preact/issues/1788
  const initGlobe = () => {
    setGlobe({
      viewer: new Viewer(csContainer.current, {
        //geocode: false,
        imageryProvider: sTileImg
      })
      //viewerLoad: true,
    });
  };

  //  <div id="loadingOverlay"><h1>Loading...</h1></div>    
  return (
    <div style={style.csdiv}>
    <div id="cesiumContainer" 
      ref = {csContainer} 
      class={style.fullSize} />
    <div id="toolbar" class={style.toolbar}></div>
    </div>
  );

};
export default Earth;
