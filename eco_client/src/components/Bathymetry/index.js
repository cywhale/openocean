import { Fragment, render } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import CesiumTerrainProvider from 'cesium/Source/Core/CesiumTerrainProvider';
import Rectangle from 'cesium/Source/Core/Rectangle';
//import NearFarScalar from 'cesium/Source/Core/NearFarScalar';
//import Color from 'cesium/Source/Core/Color';
import TerrainViewModel from 'async!./TerrainViewModel';

const Bathymetry = (props) => {
  const { viewer, terrain } = props;
  const [bathy, setBathy] = useState(null);
  const [state, setState] = useState({
    init: false,
    isLoading: true,
    oriTerrLoader: null,
    oriUnderColor: null,
  //oriNearFar: null,
  })

  const setUnderwaterTerrain = () => {
    //console.log("Debug: Before setup terrain...");
    //console.log("terrainProvider: ", viewer.terrainProvider); //EllipsoidTerrainProvide
    //console.log("enableLighting: ", viewer.scene.globe.enableLighting); //false
    //console.log("enableCollisionDetection: ", viewer.scene.screenSpaceCameraController.enableCollisionDetection); //true
      viewer.terrainProvider = bathy
      viewer.camera.flyTo({
        destination: Rectangle.fromDegrees(120.393319, 22.34583600000001, 120.399052, 22.351569)
      });
      viewer.undergroundColor = undefined;
      viewer.scene.globe.enableLighting = true;
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
      viewer.scene.globe.translucencyEnabled = true;
    //viewer.scene.globe.translucency.frontFaceAlpha = 0.05; //move to TerrainViewModel
    //viewer.scene.globe.frontFaceAlphaByDistance = new NearFarScalar(1000.0, 0, 1000000.0, 1.0);
    //viewer.scene.globe.showGroundAtmosphere = false;
    //viewer.scene.globe.baseColor = Color.TRANSPARENT; //viewer.scene.globe.baseColor = Color.BLACK; //in LayerModel.js
    //viewer.scene.globe.undergroundColor = undefined;
      viewer.scene.globe.translucency.rectangle = Rectangle.fromDegrees(
          120.393319, 22.34583600000001, 120.399052, 22.351569
      );
  }

  const resetUnderwaterTerrain = () => {
      viewer.undergroundColor = state.oriUnderColor;
    //viewer.scene.globe.frontFaceAlphaByDistance = state.oriNearFar;
      viewer.scene.globe.enableLighting = false;
      viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
      viewer.scene.globe.translucencyEnabled = false;
      viewer.terrainProvider = state.oriTerrLoader;
      viewer.camera.flyHome(0.35);
  }

  const getWreckareef = () => {
      let terr = new CesiumTerrainProvider({
            url: "https://eco.odb.ntu.edu.tw/tilesets/wreckareef",
              requestWaterMask: false,
              requestVertexNormals: true,
      })
      return(setBathy(terr));
  }

  const render_terrainctrl = () => {
    //if (terrain.selwreck) {
    //return(
        render(<TerrainViewModel scene={viewer.scene} />, document.getElementById('ctrlsectdiv1_terr'))
    //)
    //} else {
    //  return null;
    //}
  };

  useEffect(() => {
    if (terrain.selwreck && !state.init) {
      getWreckareef()
      setState((preState) => ({
         ...preState,
         init: true,
         oriTerrLoader: viewer.terrainProvider,
         oriUnderColor: viewer.undergroundColor,
       //oriNearFar: viewer.scene.globe.frontFaceAlphaByDistance,
      }));
    } else if (state.init && state.isLoading) {
      setUnderwaterTerrain();
      console.log("Bathymetry terrain loaded.");
      setState((preState) => ({
           ...preState,
           isLoading: false,
      }));
    } else if (state.init) {
      if (terrain.selwreck) {
          console.log("Re-show Bathymetry..")
          setUnderwaterTerrain();
      } else if (!terrain.selwreck) {
          console.log("Disable GBIF layer..")
          resetUnderwaterTerrain();
      }
    }
  }, [state.init, terrain.selwreck]);

  return (
    <Fragment>
      { terrain.selwreck && render_terrainctrl() }
    </Fragment>
  );
};
export default Bathymetry;
