import { useEffect, useState, useRef } from 'preact/hooks'; //useCallback
import Color from 'cesium/Source/Core/Color.js';
import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import Rectangle from 'cesium/Source/Core/Rectangle';
//import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
//import ImageryLayerCollection from 'cesium/Source/Scene/ImageryLayerCollection';
import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
import GridImageryProvider from 'cesium/Source/Scene/GridImageryProvider';
import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';
import TileCoordinatesImageryProvider from 'cesium/Source/Scene/TileCoordinatesImageryProvider';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
// follow SiteCluster/CtrlModal.js knouout code, also ref cesium ex: https://bit.ly/3hMA5bJ
import bubble_labeler from '../Compo/bubble_labeler';
import style from './style_layermodal.scss';
import './style_layerctrl.scss';
import '../style/style_bubblelabel.scss';

const LayerModal = (props) => {
  const { viewer, baseName, userBase } = props; //baseName: from BasemapPicker; userBase: user cookies (not yet)
  const { imageryLayers } = viewer; //basemapLayerPicker
  const layerctrlRef = useRef(null);
  /*const [state, setState] = useState(false); //cannot be used inside viewModel function
  const [base, setBase] = useState({
    name: userBase,
    layer: null,
  });*/
  const [viewModel, setModel] = useState({
    loaded: false,
    layers: [],
    sImg: [],
    selectedLayer: null,
    selbase: userBase,
    baselayer: imageryLayers.get(0),
    //selectedImagery: null, //move to BasemapPicker
    //selectedTerrain: null,
    upLayer: null,
    downLayer: null,
    isSelectableLayer: function (layer) {
        return this.sImg.indexOf(layer.imageryProvider) >= 0;
    },
    raise: function (layer, index) {
        imageryLayers.raise(layer);
        viewModel.upLayer = layer;
        viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
        updateLayerList(this.selbase, this.baselayer); // call from here will lost other states outside viewModel
        window.setTimeout(function () {
          viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
    },
    lower: function (layer, index) {
        imageryLayers.lower(layer);
        viewModel.upLayer =
          viewModel.layers[
            Math.min(viewModel.layers.length - 1, index + 1)
          ];
        viewModel.downLayer = layer;
        updateLayerList(this.selbase, this.baselayer);
        window.setTimeout(function () {
          viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
    },
    canRaise: function (index) {
        return index > 0;
    },
    canLower: function (index) {
        return index >= 0 && index < imageryLayers.length - 1;
    },
  });

  const updateBaseLayer = () => { //BaseLayer changed from BasemapPicker, so need update viewModel
    if (baseName!==null && baseName!=viewModel.selbase && viewModel.layers.length) {
      let vlay = viewModel.layers;
      let blay = imageryLayers.get(0);
      let bidx = vlay.indexOf(viewModel.baselayer);
      blay.name = baseName;
      blay.show = vlay[bidx].show;
      blay.alpha= vlay[bidx].alpha;
      vlay.splice(bidx, 1, blay);
      setModel((preMdl) => ({
        ...preMdl,
        selbase: baseName,
        baselayer: blay,
        layers: vlay,
      }));
      //updateLayerList();
    }
  };
  //if add a new layer...
  //const evlay01url = 'https://ecodata.odb.ntu.edu.tw/pub/img/chla_neo_202004.png';
  const add_gbloverlay = (url, name, alpha, show, rectangle) => {
    //baseLayer.colorToAlpha = new Color(0.0, 0.016, 0.059);
    //baseLayer.colorToAlphaThreshold = 0.5;
    /* layer = layers.addImageryProvider(imageryProvider);
       if (layer) {
         imageryLayers.remove(layer);
         layer = null;
       } else {
         layer = imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
           url : url,
           rectangle : Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0)
         }));
       }*/
    const lay = //new ImageryLayer(name, //imageryLayers.addImageryProvider(
      new SingleTileImageryProvider({
          url: url,
          //rectangle: new Cesium.Rectangle(bnds[0], bnds[1], bnds[2], bnds[3]),
          rectangle: rectangle, //| Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
          //numberOfLevelZeroTilesX: 1,
          //numberOfLevelZeroTilesY: 1,
          defaultAlpha: alpha | 0.5,
          //parameters: {transparent : 'true',
          //           //alpha: 0.5,
          //             format : 'image/png'},
          proxy : new DefaultProxy('/proxy/')
      });
    //);
    lay.alpha= alpha| 0.5;  //Cesium.defaultValue(alpha, 0.5);
    lay.show = show | false;//Cesium.defaultValue(show, true);
    lay.name = name;
    //knockout.track(lay, ["alpha", "show", "name"]);
    let layt;
    let simg = viewModel.sImg;
    if (!simg.length) {
      layt = imageryLayers.addImageryProvider(lay);
      layt.name = name;
      layt.show = show | false;
      layt.alpha = alpha | 0.5;
      simg.push(lay);
      setModel((preMdl) => ({
        ...preMdl,
        sImg: simg,
        selectedLayer: lay
      }));
    } else {
      simg.push(lay);
      setModel((preMdl) => ({
        ...preMdl,
        sImg: simg,
      }));
    }
  }

  const addAdditionalLayerOption = (name, imageryProvider, alpha, show) => {
    const layer= imageryLayers.addImageryProvider(imageryProvider);
    layer.show = show | false;
    layer.alpha= alpha| 0.5; //Cesium.defaultValue(alpha, 0.5);
    layer.name = name;
    knockout.track(layer, ["alpha", "show", "name"]);
  }

  useEffect(() => {
  /*if (!state && userBase && userBase!=="") {
      setBase({ name: userBase });
    }*/
    if (!viewModel.loaded) {
      knockout.track(viewModel);
      knockout.applyBindings(viewModel, layerctrlRef.current);
      //setModel(kobind());
      setupLayers();
      updateLayerList(viewModel.selbase, viewModel.baselayer);
      setModel((preMdl) => ({ //setModel(kobind());
        ...preMdl,
        ...bindSelLayer(),
        loaded: true,
      }));
      bubble_labeler(".ctrlrange-wrap2");
      //setState(true);
    } else {
      updateBaseLayer();
    }
  }, [viewModel.loaded, baseName]);
/*
  const kobind = () => {
    function subscribeParameter() {
      knockout
        .getObservable(viewModel, "imgalpha")
        .subscribe(function () {
           sTileImg.alpha = newValue;
        });
    }
    return({ imgalpha: subscribeParameter("imgalpha") })
  };
*/
  const updateLayerList = (selBase, baseLayer) => {
    const nlayers = imageryLayers.length;
    let vlay = viewModel.layers;
    let blay, bidx;
    if (!vlay.length) {
      blay = imageryLayers.get(0);
      blay.name = selBase;
      vlay.splice(0, vlay.length);
      for (var i = nlayers - 1; i >= 1; --i) {
        vlay.push(imageryLayers.get(i));
      }
      vlay.push(blay);
    } else {
      bidx = imageryLayers.indexOf(baseLayer);
      vlay.splice(0, vlay.length);
      for (var i = nlayers - 1; i >= 0; --i) {
        blay = imageryLayers.get(i);
        if (i===bidx) { blay.name = selBase }
        vlay.push(blay);
      }
    }
    setModel((preMdl) => ({
        ...preMdl,
        layers: vlay,
    }));
  }

  const bindSelLayer = () => {
    //const subscribeSelected = () => {
      knockout
        .getObservable(viewModel, "selectedLayer")
        .subscribe(function (selLayer) {
    //Handle changes to the drop-down base layer selector.
          let activeLayerIndex = 0;
          let nlayers = viewModel.layers.length;
          for (var i = 0; i < nlayers; ++i) {
            if (viewModel.isSelectableLayer(viewModel.layers[i])) {
              activeLayerIndex = i;
              break;
            }
          }
          const activeLayer = viewModel.layers[activeLayerIndex];
          const show = activeLayer.show;
          const alpha = activeLayer.alpha;
          //const actidx = viewModel.sImg.indexOf(activeLayer); //=== 0;
          const selidx = //typeof selLayer['isBaseLayer'] === 'function' && selLayer.isBaseLayer();
                         viewModel.sImg.indexOf(selLayer); // === 0;
          //if (actidx!==0)
          activeLayer.show = false;
          activeLayer.alpha = 0;
          imageryLayers.remove(activeLayer, false);
          let nowLayer;
          if (selLayer.constructor.name === "SingleTileImageryProvider") {
            nowLayer = imageryLayers.addImageryProvider(selLayer, nlayers - activeLayerIndex - 1);
          } else {
            imageryLayers.add(selLayer, nlayers - activeLayerIndex - 1);
            nowLayer = imageryLayers.get(activeLayerIndex);
          }
          nowLayer.show = show;
          nowLayer.alpha = alpha;
          nowLayer.name = selLayer.name;
          //}
          //let simg = viewModel.sImg; //Not sure why this will trigger knockout and infinite loop
          //simg.splice(selidx, 1, nowLayer);
          //let vlay = viewModel.layers;
          //vlay.splice(activeLayerIndex, 1, nowLayer);
          updateLayerList(viewModel.selbase, viewModel.baselayer); //selidx, activeLayerIndex);
          return ({ selectedLayer: nowLayer, //imageryLayers.get(activeLayerIndex),
                    //sImg: simg,
                    //layers: vlay
                 });
        });
  };

  const setupLayers = () => {
    /*Initialize baselayer, cannot setModel within updateLayerList, uncertainly always get null state
    const blay = imageryLayers.get(0);
    blay.name = viewModel.selBase;
    setModel((preMdl) => ({
      ...preMdl,
      baselayer: blay,
    }));
    */
    const grect = Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0);
    add_gbloverlay('https://ecodata.odb.ntu.edu.tw/pub/img/chla_neo_202004.png',
                   'NASA_NEO_Chla', 0.5, false, grect);

    add_gbloverlay('https://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1787328&cs=rgb&format=PNG&width=3600&height=1800',
                   'NASA_NEO_Chla_origin', 0.5, false, grect);

    add_gbloverlay('https://ecodata.odb.ntu.edu.tw/pub/img/neo_AQUA_MODIS_20200628.png',
                   'NASA_false_color', 0.5, false, grect);

    /* Create the additional layers
    addAdditionalLayerOption(
      "United States GOES Infrared",
      new Cesium.WebMapServiceImageryProvider({
        url:
          "https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?",
        layers: "goes_conus_ir",
        credit: "Infrared data courtesy Iowa Environmental Mesonet",
        parameters: {
          transparent: "true",
          format: "image/png",
        },
      })
    );*/
    addAdditionalLayerOption(
      "United States Weather Radar",
      new WebMapServiceImageryProvider({
        url:
          "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?",
        layers: "nexrad-n0r",
        credit: "Radar data courtesy Iowa Environmental Mesonet",
        parameters: {
          transparent: "true",
          format: "image/png",
        },
      })
    );
/*  addAdditionalLayerOption(
      "TileMapService Image",
      new Cesium.TileMapServiceImageryProvider({
        url: "../images/cesium_maptiler/Cesium_Logo_Color",
      }),
      0.2
    );
    addAdditionalLayerOption(
      "Single Image",
      new Cesium.SingleTileImageryProvider({
        url: "../images/Cesium_Logo_overlay.png",
        rectangle: Cesium.Rectangle.fromDegrees(
          -115.0, 38.0, -107, 39.75
        ),
      }),
      1.0
    );*/
    addAdditionalLayerOption(
      "Grid",
      new GridImageryProvider(),
      1.0, false
    );
    addAdditionalLayerOption(
      "Tile Coordinates",
      new TileCoordinatesImageryProvider(),
      1.0, false
    );
  }

  return (
    <div id="layerctrl" ref={layerctrlRef}>
      <table style="color:antiquewhite;">
        <tbody data-bind="foreach: layers">
          <tr data-bind="css: { up: $parent.upLayer === $data, down: $parent.downLayer === $data }">
            <td class={style.smalltd}><input class={style.laychkbox} type="checkbox" data-bind="checked: show" /></td>
            <td class={style.smalltd}>
              <span data-bind="text: name, visible: !$parent.isSelectableLayer($data)"></span>
              <select class={style.simgsel} data-bind="visible: $parent.isSelectableLayer($data), options: $parent.sImg, optionsText: 'name', value: $parent.selectedLayer"></select>
            </td>
            <td class={style.mediumtd}><span class="ctrlrange-wrap2">
              <input type="range" class="range" min="0" max="1" step="0.01" data-bind="value: alpha, valueUpdate: 'input'" />
              <output class="bubble" /></span>
            </td>
            <td class={style.smalltd}>
              <button type="button" class={style.modalbutton} data-bind="click: function() { $parent.raise($data, $index()); }, visible: $parent.canRaise($index())">
                ▲
              </button>
            </td>
            <td class={style.smalltd}>
              <button type="button" class={style.modalbutton} data-bind="click: function() { $parent.lower($data, $index()); }, visible: $parent.canLower($index())">
                ▼
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default LayerModal;
