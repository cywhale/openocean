import { Viewer } from 'cesium';
//import Cesium from "cesium/Cesium";
import { useState, useEffect, useRef} from "preact/hooks";
//import { Component } from 'preact';
import style from './style';
import '../../node_modules/cesium/Build/Cesium/Widgets/widgets.css'; //require('cesium/Widgets/widgets.css'); //

const Earth = () => {
  const [viewer, setGlobe] = useState(null);
  const csContainer = useRef(null);

  useEffect(() => {
    console.log('Initialize Viewer');
    initGlobe();
  }, [csContainer]);

//https://github.com/preactjs/preact/issues/1788 
  const initGlobe = () => {
    setGlobe({
      viewer: new Viewer(csContainer.current)
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