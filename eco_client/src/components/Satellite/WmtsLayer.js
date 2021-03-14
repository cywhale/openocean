import { useEffect, useState } from 'preact/hooks';
import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import WebMapTileServiceImageryProvider from 'cesium/Source/Scene/WebMapTileServiceImageryProvider';
import gibsGeographicTilingScheme from './gibs';
//import { LayerContext } from '../Layer/LayerContext'; //Note WmtsLayer is under LayerModel and cannot directly modify LayerContext
import(/* webpackPrefetch: true */
       /* webpackPreload: true */
       '../../style/style_ctrlcompo.scss');

const WmtsLayer = (props) => {
  const { viewer, clocktime, satellite, layerprops, addLayer, updateLayer} = props;
  const { imageryLayers } = viewer;
//const { laypars } = useContext(LayerContext);
//const { layerprops, setLayerprops } = laypars;
  const [state, setState] = useState({
    init: false,
//  layerUpdate: false,
//  isLoading: true,
  })

  const [wmts, setWmts] = useState({
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg',
    name: 'GIBS (Himawari)', //default value
    layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    tileMatrixSetID : '250m',
    style : 'default',
    format : 'image/jpg',
    maximumLevel: 6,
    times: clocktime.times,
    credit : 'Global Imagery Browse Services (GIBS)',
    //provider: null,
    imglayer: null,
    //index: -1,
  });

  const applyClocktime = () => {
    if (clocktime.times !== null && wmts.times !== null && clocktime.times !== wmts.times) {
        console.log("Update WMTS layer because viewer time setting: ", clocktime.times);
        updateWmtsLayer(clocktime.times);
    }
  }; //, []);

  const updateWmtsLayer = (times) => { //WMTS layer that may change with time setting or layer changed by user
    let wlayidx = imageryLayers.indexOf(wmts.imglayer)
    if (wlayidx >= 0) {
      let wlay = imageryLayers.get(wlayidx);
      let show = wlay.show
      let alpha= wlay.alpha
      wlay.show = false;
      imageryLayers.remove(wlay); //false //true default to destroy

      let wmtslay = imageryLayers.addImageryProvider( //addAdditionalLayerOption(
        //wmts.name,
        new WebMapTileServiceImageryProvider({
//        url : 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/all/wmts.cgi',
          url : wmts.url,
//        url : 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/all/Himawari_AHI_Band13_Clean_Infrared/...
//        layer : 'Himawari_AHI_Band13_Clean_Infrared',
//        tileMatrixSetID : '2km',
//        format : 'image/png',
          layer: wmts.layer, //"MODIS_Terra_CorrectedReflectance_TrueColor",
          tileMatrixSetID : wmts.tileMatrixSetID, //'250m',
          style : wmts.style, //'default',
          format : wmts.format, //'image/jpg',
          maximumLevel: wmts.maximumLevel, //5,
          clock: viewer.clock,
          times: times,
          tileWidth: 512,
          tileHeight: 512,
          tilingScheme: gibsGeographicTilingScheme(),
          credit : wmts.credit,
          proxy : new DefaultProxy('/proxy/')
        }), wlayidx //insert in original index
        //alpha, show
      );
      wmtslay.show = show | false;
      wmtslay.alpha= alpha| 0.5;
      wmtslay.name = wmts.name;
      //knockout.track(wmtslay, ["alpha", "show", "name"]);
      console.log("Update WMTS layer OK with index: ", imageryLayers.indexOf(wmtslay));

      setWmts((preState) => ({
        ...preState,
        imglayer: wmtslay,
        times: times,
      }));
      updateLayer(layerprops.basename, layerprops.baselayer, layerprops.layerNoKnock);

    } else {
      console.log("Error because non-existed WMTS layer. Check it");
    }
  };

  const initWmtsLayer = () => {
//  console.log("In init satellite times:", wmts.times);
    let wmtslay = //addLayer(
//    wmts.name,
      new WebMapTileServiceImageryProvider({
//        url : 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/all/wmts.cgi',
          url : wmts.url,
//        url : 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/all/Himawari_AHI_Band13_Clean_Infrared/...
//        layer : 'Himawari_AHI_Band13_Clean_Infrared',
//        tileMatrixSetID : '2km',
//        format : 'image/png',
          layer: wmts.layer, //"MODIS_Terra_CorrectedReflectance_TrueColor",
          tileMatrixSetID : wmts.tileMatrixSetID, //'250m',
          style : wmts.style, //'default',
          format : wmts.format, //'image/jpg',
          maximumLevel: wmts.maximumLevel, //5,
          clock: viewer.clock,
          times: wmts.times,
          credit : wmts.credit,
          tileWidth: 512,
          tileHeight: 512,
          tilingScheme: gibsGeographicTilingScheme(),
          proxy : new DefaultProxy('/proxy/')
      });//,
    //0.5, false
    //);
/*  setWmts((preState) => ({
        ...preState,
        provider: wmtslay,
        //index: imageryLayers.indexOf(wmtslay)
    })); */
    return wmtslay;
  }
/*Note WmtsLayer is under LayerModel and cannot directly modify LayerContext
  const updateLayerprops = (nameidx, name, lay, action=0) => {
    let layt;
    if (nameidx >= 0 && action < 0) { //that means: layer name disabled, not shown on modal Layer-list, so must re-enable it.
      layt = [...lay.slice(0, nameidx), ...lay.slice(nameidx+1)];
    } else if (nameidx < 0 && action > 0) {
      layt = [...lay, name];
    }
    setLayerprops((props) => {
      props.layerNoKnock = [...layt]
    });
    //return(
    setState((prev) => ({
      ...prev,
      layerUpdate: true,
    }))
    //);
  };
*/
  useEffect(() => {
    if (!state.init) {
      if (satellite.selmodis_truecolor) {
/*    initWmtsLayer();
      setState((preState) => ({
         ...preState,
         init: true,
      }));
    } else if (state.init && state.isLoading) {
*/
        setWmts((preState) => ({
          ...preState,
          imglayer: addLayer(wmts.name, initWmtsLayer(), 0.75, true),
        }));
      //console.log("Debug in init ext WMTS: ", layerprops.basename, layerprops.baselayer, wmts.times);
        updateLayer(layerprops.basename, layerprops.baselayer, layerprops.layerNoKnock);
        setState((preState) => ({
           ...preState,
           init: true,
           //isLoading: false,
        }));
      }
/* Modify layerprops here CANNOT WORK, because WmtsLayer is under LayerModel. Must set LayerContext in LayerModal
    } else if (state.layerUpdate) {
      console.log("Debug in WMTS with layerNoKnock: ", layerprops.layerNoKnock, layerprops.basename, layerprops.baselayer);
      updateLayer(layerprops.basename, layerprops.baselayer);
      setState((prev) => ({
        ...prev,
        layerUpdate: false,
      })); */
    } else {
      let wlayidx = imageryLayers.indexOf(wmts.imglayer);
      if (wlayidx >= 0) {
        let wlay = imageryLayers.get(wlayidx);
      //let nameidx = layerprops.layerNoKnock.indexOf(wlay.name);
        if (satellite.selmodis_truecolor) {
          console.log("Re-show WMTS layer..")
        //updateLayerprops(nameidx, wlay.name, layerprops.layerNoKnock, -1);
          wlay.show = true;

        } else if (!satellite.selmodis_truecolor) {
          console.log("Disable WMTS layer..")
        //updateLayerprops(nameidx, wlay.name, layerprops.layerNoKnock, 1);
          wlay.show = false;
        }
      } else {
        console.log("Error: cannot find WMTS layer loaded. Check it.");
      }
    }
  }, [satellite.selmodis_truecolor]); //state.layerUpdate

  return (
    <Fragment>
      { satellite.selmodis_truecolor &&
        <button class="ctrlbutn" id="applyclocktime" onClick={applyClocktime}>
          Apply time setting to satellite layers</button> }
    </Fragment>
  );
};
export default WmtsLayer;

