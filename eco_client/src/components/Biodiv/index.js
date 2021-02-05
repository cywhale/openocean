import { useEffect, useState, useCallback, useContext } from 'preact/hooks';
import SvgLoading from 'async!../Compo/SvgLoading';
import { LayerContext } from "../Layer/LayerContext";
//import { OccurContext } from './OccurContext';
//move into GBifContainer
//import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';
//import knockout from 'cesium/Source/ThirdParty/knockout.js';
import GbifContainer from './GbifContainer';

const Biodiv = (props) => {
  const { viewer, occur } = props;
  const { imageryLayers } = viewer;
  const { laypars } = useContext(LayerContext);
  const { layerprops, setLayerprops } = laypars;
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
    setLayerprops((prev) => ({
      ...prev,
      layerNoKnock: [...prev.layerNoKnock, name],
    }));
  //knockout.track(layer, ["alpha", "show", "name"]);
    return(layer);
  }

  const initGbif = () => {
    return(
      setGbif(new GbifContainer({viewer: viewer}))
    )
  }

  useEffect(() => {
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
        console.log("GBIF imagery initialized: ", layerprops.layerNoKnock);
      }
      setState((preState) => ({
           ...preState,
           isLoading: false,
      }));
    } else if (state.init) {
      let wlay = imageryLayers.get(gbif.layeridx);
// imageryLayers sync by reference, so no need here...
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
  }, [state.init, occur.selgbif, imageryLayers]);

  return (
    <SvgLoading enable = {occur.selgbif} isLoading = {state.isLoading} />
  );
};
export default Biodiv;

