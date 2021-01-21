import { useEffect, useState, useCallback } from 'preact/hooks';
import SvgLoading from 'async!../Compo/SvgLoading';
//import { OccurContext } from './OccurContext';
//move into GBifContainer
//import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';
import GbifContainer from './GbifContainer';

const Biodiv = (props) => {
  const { viewer, occur } = props;
  const { imageryLayers } = viewer;
//const { opars } = useContext(OccurContext);
//const { occur, setOccur } = opars;
//const scaleSet = wmsConfig.gbifocean_scaleSet;
  const [gbif, setGbif] = useState(null); //{
  //layeridx: -1,
  //lastSize: null, //viewer.camera.getPixelSize(new BoundingSphere(), viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight)
  //})
  const [state, setState] = useState({
    init: false,
    isLoading: true,
    unsubscriber: null,
  })

  const addLayer = (name, imageryProvider, alpha=0.5, show=true) => {
    const layer= imageryLayers.addImageryProvider(imageryProvider);
    layer.show = show;
    layer.alpha= alpha;
    layer.name = name;
    //knockout.track(layer, ["alpha", "show", "name"]);
    /*setGbif((preState) => ({
         ...preState,
         layeridx: imageryLayers.length - 1,
    }));*/
    return(layer);
  }

  const initGbif = () => {
/*  const pixelSize = viewer.camera.getPixelSize(new BoundingSphere(), viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight)
    const wms = new WebMapServiceImageryProvider({
        url: wmsConfig.gbifocean_url,
        layers: wmsConfig.gbifocean_layer,
        credit: "GBIF.org (25 March 2020) GBIF Occurrence Download https://doi.org/10.15468/dl.lnpxuq",
        rectangle: Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
        parameters: {
          transparent: "true",
          styles: "gbifocean_vary",
          format: "image/png",
          width: 768,
          height: 358,
          viewparams: encodeURIComponent('viewScale:').replace(/%3A/g,':') + pixelSize
        },
        proxy : new DefaultProxy('/proxy/')
    });*/
//  addLayer("GBIF ocean occurrence", wms, 0.75, true);
    return(
      setGbif(new GbifContainer({viewer: viewer}))
//    setGbif((preState) => ({
//        ...preState,
/*        wfs: new WebFeatureServiceImageryProvider({
             url: wfsBioConfig.gbifocean_url,
             layers: wfsBioConfig.gbifocean_layer,
             viewer: viewer,
             scaleSet: wfsBioConfig.gbifocean_scaleSet,
             //credit: 'GBIF.org (25 March 2020) GBIF Occurrence Download https://doi.org/10.15468/dl.lnpxuq'
          }),*/
          //provider: wms,
//        lastSize: pixelSize,
//        layeridx: imageryLayers.length - 1,
//    }))
    )
  }

  const showGbif = (show) => {
    //const layidx = gbif.layeridx;
    if (show && gbif === null) { //layidx < 0
      initGbif();
      gbif.imagery = addLayer("GBIF ocean occurrence", gbif.provider, 0.75, true);
      gbif.imageryLayers = imageryLayers;
      gbif.layeridx = imageryLayers.length - 1;
      console.log("GBIF imagery initialized: ", gbif.layeridx);
    } else if (show && gbif !== null) {
      console.log("Re-show GBIF layer..")
      let wlay = imageryLayers.get(gbif.layeridx);
      wlay.show = true;
      gbif.addMoveEndTrig();
    } else if (!show && gbif !== null) {
      console.log("Disable GBIF layer..")
      let wlay = imageryLayers.get(gbif.layeridx);
      wlay.show = false;
      gbif.unsubscriber();
    }
    setState((preState) => ({
         ...preState,
         isLoading: false,
    }));
  };
/*
  const varyHandler = (gb) => {
      if (gb.layeridx >= 0) {
        let wlay = imageryLayers.get(gb.layeridx);
        if (wlay.show) {
          let pixelSize = viewer.camera.getPixelSize(new BoundingSphere(),
                          viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight);
          if (gb.lastSize !== null && gb.lastSize != pixelSize) {
            if ((gb.lastSize < scaleSet[0] && pixelSize >= scaleSet[0]) ||
                (gb.lastSize < scaleSet[1] && pixelSize >= scaleSet[1]) ||
                (gb.lastSize >= scaleSet[1] && pixelSize < scaleSet[1]) ||
                (gb.lastSize >= scaleSet[0] && pixelSize < scaleSet[0])) {
              //let wlay = imageryLayers.get(gb.layeridx);
              let show = wlay.show
              let alpha= wlay.alpha
              let wms = new WebMapServiceImageryProvider({
                url: wmsConfig.gbifocean_url,
                layers: wmsConfig.gbifocean_layer,
                credit: "GBIF.org (25 March 2020) GBIF Occurrence Download https://doi.org/10.15468/dl.lnpxuq",
                rectangle: Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
                parameters: {
                  transparent: "true",
                  styles: "gbifocean_vary",
                  format: "image/png",
                  width: 768,
                  height: 358,
                  viewparams: encodeURIComponent('viewScale:').replace(/%3A/g,':') + pixelSize
                },
                proxy : new DefaultProxy('/proxy/')
              })
              console.log("Warning: WMS should load finer or coarser features due to viewparams changes", pixelSize)
              let newlay = imageryLayers.addImageryProvider(wms, gb.layeridx);
              newlay.show = show | true;
              newlay.alpha= alpha| 0.75;
              newlay.name = 'GBIF ocean occurrence';
              return(
                setGbif((preState) => ({
                  ...preState,
                  lastSize: pixelSize,
                }))
              )
            }
          }
        }
      }
  };

  const moveEndTrig = useCallback(() => {
    return(viewer.camera.moveEnd.addEventListener(function() {varyHandler(gbif)}))
  }, [gbif]);
*/
/*const disactMoveEnd = () => {
    viewer.camera.moveEnd.removeEventListener(moveEndCallback)
  }; */

  useEffect(() => {
  //showGbif(occur.selgbif);
  //if (occur.selgbif && gbif === null) {
    if (occur.selgbif && !state.init) {
      initGbif();
      setState((preState) => ({
         ...preState,
         init: true,
      }));
    } else if (state.init && state.isLoading) {
      if (gbif.imagery === null) {
        gbif.imagery = addLayer("GBIF ocean occurrence", gbif.provider, 0.75, true);
        gbif.imageryLayers = imageryLayers;
        gbif.layeridx = imageryLayers.length - 1;
        console.log("GBIF imagery initialized: ", gbif.layeridx);
      }
      setState((preState) => ({
           ...preState,
           isLoading: false,
      }));
    } else if (state.init) {
      let wlay = imageryLayers.get(gbif.layeridx);
/*    if (wlay !== gbif.imagery) {
        console.log("Sync imageryLayers due to viewparams:viewScale change..");
        let show = wlay.show
        let alpha= wlay.alpha
        let newlay = imageryLayers.addImageryProvider(gbif.provider, gbif.layeridx);
        newlay.show = show | true;
        newlay.alpha= alpha| 0.75;
        newlay.name = 'GBIF ocean occurrence';
        gbif.imagery = newlay;
        gbif.imageryLayers = imageryLayers;
      } else */
      if (imageryLayers.length !== gbif.imageryLayers.length) {
        console.log("Warning: Sync imageryLayers due to external add layer..");
        gbif.imageryLayers = imageryLayers;
      } else {
        if (occur.selgbif) { //&& gbif !== null) {
          console.log("Re-show GBIF layer..")
          wlay.show = true;
          //gbif.imagery.show = true;
          gbif.addMoveEndTrig();
        } else if (!occur.selgbif) { //&& gbif !== null) {
          console.log("Disable GBIF layer..")
          wlay.show = false;
          //gbif.imagery.show = false;
          gbif.unsubscriber();
        }
      }
    }
/*  if (occur.selgbif) {
      setState((preState) => ({
          ...preState,
          unsubscriber: moveEndTrig(),
      }));
    }*/
  }, [state.init, occur.selgbif, imageryLayers]);

  return (
    <SvgLoading enable = {occur.selgbif} isLoading = {state.isLoading} />
  );
};
export default Biodiv;

