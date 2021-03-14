import { useEffect, useState, useRef, useContext } from 'preact/hooks';
import { Fragment, render } from 'preact';
import Color from 'cesium/Source/Core/Color.js';
//import Credit from 'cesium/Source/Core/Credit';
//import JulianDate from 'cesium/Source/Core/JulianDate';
//import TimeIntervalCollection from 'cesium/Source/Core/TimeIntervalCollection';
//import BoundingSphere from 'cesium/Source/Core/BoundingSphere';
import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import Rectangle from 'cesium/Source/Core/Rectangle';
//import WebMercatorTilingScheme from 'cesium/Source/Core/WebMercatorTilingScheme';
//import GeographicTilingScheme from 'cesium/Source/Core/GeographicTilingScheme';
//import ImageryLayer from 'cesium/Source/Scene/ImageryLayer';
//import ImageryLayerCollection from 'cesium/Source/Scene/ImageryLayerCollection';
import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
//import GlobeSurfaceTileProvider from 'cesium/Source/Scene/GlobeSurfaceTileProvider.js';
//import GridImageryProvider from 'cesium/Source/Scene/GridImageryProvider';
import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';
import WebMapTileServiceImageryProvider from 'cesium/Source/Scene/WebMapTileServiceImageryProvider';
import ArcGisMapServerImageryProvider from 'cesium/Source/Scene/ArcGisMapServerImageryProvider';
//import TileCoordinatesImageryProvider from 'cesium/Source/Scene/TileCoordinatesImageryProvider';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
//import Biodiv from 'async!../Biodiv';
import WmtsLayer from 'async!../Satellite/WmtsLayer';
// follow SiteCluster/CtrlModal.js knouout code, also ref cesium ex: https://bit.ly/3hMA5bJ
import bubble_labeler from '../Compo/bubble_labeler';
import style from './style_layermodal.scss';
import(/* webpackPrefetch: true */
       /* webpackPreload: true */
       '../../style/style_layerctrl.scss');
//import '../style/style_bubblelabel.scss';
//import { LayerContext } from './LayerContext';
import { DateContext } from '../Datepicker/DateContext';
import { SateContext } from '../Satellite/SateContext';
const { wmsConfig } = require('./.setting.js');

const LayerModal = (props) => { //baseName: from BasemapPicker; userBase: user cookies (not yet)
  const { viewer, baseName, userBase, laypars } = props; //, hashstate, hashHandler
  const { imageryLayers } = viewer; //basemapLayerPicker
  const layerctrlRef = useRef(null);
//const [state, setState] = useState(false);
//const { laypars } = useContext(LayerContext);
  const { layerprops, setLayerprops } = laypars;
  const { satepars } = useContext(SateContext);
  const { satellite, setSatellite } = satepars;
  const { tkpars } = useContext(DateContext);
  const { clocktime, setClocktime } = tkpars;

  const [viewModel, setModel] = useState({
    loaded: false,
    layers: [],
    sImg: [],
    excludedLayer: [],
    selectedLayer: null,
    selbase: userBase,
    baselayer: imageryLayers.get(0),
    //selwmts: '', //for WMTS layer with time-dimension that can animate
    //wmtslayer: null,
    //selectedImagery: null, //move to BasemapPicker
    //selectedTerrain: null,
    upLayer: null,
    downLayer: null,
    onLayerChange: function (init=false, excludedLayer=[], bubble=true) {
      updateLayerList(this.selbase, this.baselayer, excludedLayer, init, bubble);
    },
    isSelectableLayer: function (layer) {
        return this.sImg.indexOf(layer.imageryProvider) >= 0;
    },
    raise: function (layer, index) {
        imageryLayers.raise(layer);
        viewModel.upLayer = layer;
        viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
        viewModel.onLayerChange(); //call from here will lost other states outside viewModel
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
        viewModel.onLayerChange();
        window.setTimeout(function () {
          viewModel.upLayer = viewModel.downLayer = null;
        }, 10);
    },
    canRaise: function (index) {
        return index > 0;
    },
    canLower: function (index) {
        return index >= 0 && index < this.layers.length - 1;
    },
  });

  const updateBaseLayer = () => { //BaseLayer changed from BasemapPicker, so need update viewModel
    if (baseName !== viewModel.selbase && viewModel.layers.length) {
      let vlay = viewModel.layers;
      let blay = imageryLayers.get(0);
      let bidx = vlay.indexOf(viewModel.baselayer);
      blay.name = baseName;
      //blay.show = vlay[bidx].show;
      //blay.alpha= vlay[bidx].alpha;
      vlay.splice(bidx, 1, blay);

      setLayerprops((preMdl) => ({ //dynamically add/remove layer from WMTS & set base name correctly when update
        ...preMdl,
        basename: baseName,
        baselayer: blay,
      }));
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
  const add_gbloverlay = (url, name, alpha, show, rectangle=null, credit='', provider='SingleTileImageryProvider',
                          layer='', style='default', format='image/png', tileMatrixSetID='default028mm') => {
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
    let lay;
    if (provider=='ArcGisMapServerImageryProvider') {
      lay = new ArcGisMapServerImageryProvider({
                url : url,
                credit : credit,
                proxy : new DefaultProxy('/proxy/')
      });
    } else if (provider=='WebMapTileServiceImageryProvider') {
      lay = new WebMapTileServiceImageryProvider({
                url : url,
                layer : layer,
                style : style,
                format : format,
                tileMatrixSetID : tileMatrixSetID,
                //tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
                //tilingScheme: new WebMercatorTilingScheme(),
                //maximumLevel: 21,
                credit : credit,
                proxy : new DefaultProxy('/proxy/')
      });
    } else {
      lay = //new ImageryLayer(name, //imageryLayers.addImageryProvider(
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
          credit: credit,
          proxy : new DefaultProxy('/proxy/')
        });
    }
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
    return(layer);
  }

  useEffect(() => {
  /*if (!state && userBase && userBase!=="") {
      setBase({ name: userBase });
    }*/
    if (!viewModel.loaded) {
      knockout.track(viewModel);
      //setModel(kobind());
      viewer.scene.globe.baseColor = Color.BLACK;

      setupLayers();
      viewModel.onLayerChange(true, [], false);
      //updateLayerList(viewModel.selbase, viewModel.baselayer, [], true)
      render_kocomp();
      knockout.applyBindings(viewModel, layerctrlRef.current);
      bubble_labeler(".ctrlrange-wrap2");

      setLayerprops((preMdl) => ({ //dynamically add/remove layer from WMTS & set base name correctly when update
          ...preMdl,
          basename: viewModel.selbase,
          baselayer: viewModel.baselayer,
      }));
      setModel((preMdl) => ({ //setModel(kobind());
        ...preMdl,
        ...bindSelLayer(),
        loaded: true,
      }));
//  } else if (JSON.stringify(layerprops.layerNoKnock) !== JSON.stringify(viewModel.excludedLayer)) {
// For-loop cause each state update and when next push, lost viewModel.loaded (become unknown)
/*    let layt = viewModel.excludedLayer.splice(0, viewModel.excludedLayer.length);
      for (let i = 0; i < layerprops.layerNoKnock; i++) {
        layt.push(layerprops.layerNoKnock[i])
      } */
//    setModel((state) => {
//      state.excludedLayer = [...layerprops.layerNoKnock]
//    });
    //console.log("Debug excludedLayer (layt): ", viewModel.excludedLayer, layerprops.layerNoKnock);
    } else if (baseName !== null && baseName !== '') {
      updateBaseLayer();
    }/* else if (hashstate.handling && hashstate.hash === '#search') {
        let el = document.getElementById("tab-4");
        //simuClick(el);
        if (typeof el.click == 'function') {
          el.click()
        } else if(typeof el.onclick == 'function') {
          el.onclick()
        }
        let uri = window.location.toString();
        let clean_uri = uri.substring(0, uri.indexOf("#"));
        //history.pushState(null, null, '#handling');
        //window.dispatchEvent(new HashChangeEvent('hashchange'));
        history.replaceState({}, document.title, clean_uri);
        hashHandler({
          handling: false,
          hash: '',
        });
    }*/
  }, [viewModel.loaded, baseName]);//, layerprops.layerNoKnock, hashstate.handling]);

  const updateLayerList = (selBase, baseLayer, excludedLayer=[], init=false, bubble=true) => {
    const nlayers = imageryLayers.length;
    let vlay = viewModel.layers;
    let blay, bidx;
    if (init) { //(!vlay.length) {
      blay = imageryLayers.get(0);
      blay.name = selBase;
      vlay.splice(0, vlay.length);
      for (var i = nlayers - 1; i >= 1; --i) {
        vlay.push(imageryLayers.get(i));
      }
      vlay.push(blay);
    } else { //seems when raise/lower call updateLayerList cannot get correct external variable baseLayer/...
    //bidx = imageryLayers.indexOf(baseLayer);
      vlay.splice(0, vlay.length);
      let excluded = excludedLayer.length==0? layerprops.layerNoKnock : excludedLayer;
    //console.log("Debug in updateLayer for excludedLayer: ", viewModel.excludedLayer, excludedLayer);
      for (let i = nlayers - 1; i >= 0; --i) {
        blay = imageryLayers.get(i);
      //if (i===bidx) { blay.name = selBase }
        if (excluded.length === 0 || excluded.indexOf(blay.name) === -1) {
          vlay.push(blay);
        }
      }
    }
    if (bubble) { bubble_labeler(".ctrlrange-wrap2"); }
    return(
      setModel((preMdl) => ({
        ...preMdl,
        layers: vlay,
      }))
    );
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
          //if (selLayer.constructor.name === "SingleTileImageryProvider") {
            nowLayer = imageryLayers.addImageryProvider(selLayer, nlayers - activeLayerIndex - 1);
          //} else {
          //  imageryLayers.add(selLayer, nlayers - activeLayerIndex - 1);
          //  nowLayer = imageryLayers.get(activeLayerIndex);
          //}
          nowLayer.show = show;
          nowLayer.alpha = alpha;
          nowLayer.name = selLayer.name;
          //}
          //let simg = viewModel.sImg; //Not sure why this will trigger knockout and infinite loop
          //simg.splice(selidx, 1, nowLayer);
          //let vlay = viewModel.layers;
          //vlay.splice(activeLayerIndex, 1, nowLayer);
          viewModel.onLayerChange();
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
/* move to single checkbox item
    add_gbloverlay('https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_contours/MapServer/WMTS',
                   'GEBCO contours', 1.0, false, grect,
                   'General Bathymetric Chart of the Oceans (GEBCO); NOAA National Centers for Environmental Information (NCEI)',
                   'WebMapTileServiceImageryProvider',
                   'GEBCO_contours', //layer
                   'default', 'image/png', 'default028mm');
*/
    add_gbloverlay('https://maps.ccom.unh.edu/server/rest/services/GEBCO2020/GEBCO_2020_Depths/MapServer',
                   'GEBCO 2020 Depths', 0.5, false, grect, 'GEBCO 2020 Depths',
                   'ArcGisMapServerImageryProvider');
    //add_gbloverlay('ftp://ftp.sos.noaa.gov/sosrt/rt/noaa/sat/linear/raw/linear_rgb_cyl_20201114_1440.jpg',
    //               'Clouds Earth, NOAA', 0.5, false, grect);
    //'https://ecodata.odb.ntu.edu.tw/pub/img/chla_neo_202004.png'
/* TRY to move to Geoserver Cloud Imagery...
    add_gbloverlay('https://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1787328&cs=rgb&format=PNG&width=3600&height=1800',
                   'NASA_NEO_Chla_origin', 0.5, false, grect, 'NASA Earth Observations (NEO)');

    add_gbloverlay('https://ecodata.odb.ntu.edu.tw/pub/img/neo_AQUA_MODIS_20200628.png',
                   'NASA_false_color', 0.5, false, grect, 'NASA Earth Observations (NEO)');
*/
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
/*
    addAdditionalLayerOption(
      "United States Weather Radar",
      new WebMapServiceImageryProvider({
        url: "https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?",
        layers: "nexrad-n0r",
        credit: "Radar data courtesy Iowa Environmental Mesonet",
        parameters: {
          transparent: "true",
          format: "image/png",
        },
      })
    );
*/
// https://sandcastle.cesium.com/index.html?src=Web%2520Map%2520Tile%2520Service%2520with%2520Time.html
/*
    Date.prototype.today = function () {
      return ((this.getDate() < 10)?"0":"") + this.getDate() +"-"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ this.getFullYear();
    }
// For the time now, use currdtime.today(), currdtime.timeNow()
    Date.prototype.timeNow = function () {
      return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    }
    let currdtime = new Date();
*/
//  let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
//  let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
//  https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products
/*  console.log("In Layer times:", wmts.times);
    let wmtslay = addAdditionalLayerOption(
      wmts.name,
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
      }),
      0.5, false
    );

    setWmts((preState) => ({
        ...preState,
        imglayer: wmtslay,
        //index: imageryLayers.indexOf(wmtslay)
    }));
    //console.log("Wmtslay index: ", imageryLayers.indexOf(wmtslay));
*/
    let sbbox = wmsConfig.tw_substrate_area_bbox;
    addAdditionalLayerOption(
      "Taiwan offshore substrate (Area)",
      new WebMapServiceImageryProvider({
        url: wmsConfig.tw_substrate_area_url,
        layers: wmsConfig.tw_substrate_area_layer,
        credit: "臺灣電子航行圖中心及海軍大氣海洋局",
        rectangle:Rectangle.fromDegrees(sbbox[0], sbbox[1], sbbox[2], sbbox[3]),
        //tilingScheme: new WebMercatorTilingScheme(),
        parameters: {
          transparent: "true",
          styles: 'substrate', //'Polygon_near_white',
          format: "image/png",
          //bbox: wmsConfig.tw_substrate_area_bbox.toString(),
          width: 749,
          height: 768
        },
        proxy : new DefaultProxy('/proxy/')
      }),
      1.0, false
    );
/*
    let boundingSphere = new BoundingSphere();
    addAdditionalLayerOption(
      "GBIF ocean occurrence",
      new WebMapServiceImageryProvider({
        url: wmsConfig.gbifocean_url,
        layers: wmsConfig.gbifocean_layer,
        credit: "GBIF.org (25 March 2020) GBIF Occurrence Download https://doi.org/10.15468/dl.lnpxuq",
        rectangle: grect,
        parameters: {
          transparent: "true",
          styles: "gbifocean_vary", //'Polygon_near_white',
          format: "image/png",
          width: 768,
          height: 358,
          viewparams: 'viewScale:' + viewer.camera.getPixelSize(boundingSphere, viewer.scene.drawingBufferWidth, viewer.scene.drawingBufferHeight)
        },
        proxy : new DefaultProxy('/proxy/')
      }),
      1.0, false
    );

  let scbox = wmsConfig.tw_shipwreck_ne_bbox;
  console.log("bbox: ", scbox, Rectangle.fromDegrees(scbox[0], scbox[1], scbox[2], scbox[3]));
  let terrx = new WebMapServiceImageryProvider({
          //new GeoserverTerrainProvider({
            url: wmsConfig.tw_shipwreck_ne_url,
            layers: wmsConfig.tw_shipwreck_ne_layer, //layerName
            //styleName: 'default',//'terrain_0_shipwreck',
            //waterMask: false,
            credit: "IONTU, Taiwan",
            rectangle:Rectangle.fromDegrees(scbox[0], scbox[1], scbox[2], scbox[3]),
            //tilingScheme: new WebMercatorTilingScheme(), //GeographicTilingScheme({
              //numberOfLevelZeroTilesX: 2,
              //numberOfLevelZeroTilesY: 1
            //}),
            //tileHeight: 512,
            //tileWidth: 512,
            parameters: {
               transparent: "true",
               styles: '', //terrain_0_shipwreck',
               bbox: "120.393319,22.346852998720003,120.39905199712001,22.351569",
               format: "image/png",
               width: 768,
               height: 631
            },
            proxy : new DefaultProxy('/proxy/')
          });

    //viewer.scene.globe.terrainProvider = terrx;
    //var terrGlobe = windyGlobe(viewer);
    //terrGlobe.terrainProvider = terrx;
    addAdditionalLayerOption(
      "Shipwrecks off NorthEast Taiwan",
      terrx,
      1.0, false
    );
*/
    //viewer.terrainProvider = terrx;
/*  var hand = new Cesium.ScreenSpaceEventHandler(canvas);
  	// return altitude with double click in console.log!!
    hand.setInputAction(
            function (movement) {
                if(movement.position != null) {
                    var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    if (cartesian) {
                        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
                        cartographic.height=globe.getHeight(cartographic);
                        console.log("lat= "+(cartographic.latitude*180/Math.PI)+"°; long="+(cartographic.longitude*180/Math.PI)+"°; altitude="+cartographic.height+" meters")
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
*/
    addAdditionalLayerOption(
      'GEBCO contours',
      new WebMapTileServiceImageryProvider({
                url : 'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_contours/MapServer/WMTS',
                layer : 'GEBCO_contours',
                style : 'default',
                format : 'image/png',
                tileMatrixSetID : 'default028mm',
                //tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
                //tilingScheme: new WebMercatorTilingScheme(),
                //maximumLevel: 21,
                credit : 'General Bathymetric Chart of the Oceans (GEBCO); NOAA National Centers for Environmental Information (NCEI)',
                proxy : new DefaultProxy('/proxy/')
      }),
      1.0, false
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
    );
    addAdditionalLayerOption(
      "Grid",
      new GridImageryProvider(),
      1.0, false
    );*/
/*  addAdditionalLayerOption(
      "ODB Copepod",
      new WebMapServiceImageryProvider({
            url : 'https://odbwms.oc.ntu.edu.tw/odbintl/rasters/odbwms/',
            layers : 'odb_copepod_abund201808',
            credit : 'ODB Bio-database',
            parameters : {
              transparent : 'true'//,
              //format : 'image/png'
            },
            proxy : new DefaultProxy('/proxy/')
          }),
      1.0, false
    );
    addAdditionalLayerOption(
      "Sea area of Dongsha Atoll National Park",
      new WebMapServiceImageryProvider({
            url : 'http://ogcmap.tgos.nat.gov.tw/TGOS_UserServices/2770/DongShaOcean/SimpleWMS.aspx', //?REQUEST=GetMap&SERVICE=WMS&VERSION=1.1.1',
            //LAYERS=DongShaOcean&STYLES=&FORMAT=image/png&BGCOLOR=0xFFFFFF&TRANSPARENT=TRUE&SRS=EPSG:4326&BBOX=115.924463110184,20.1528810111254,118.116972122111,21.2306444772295&WIDTH=1660&HEIGHT=816',
            layers : 'DongShaOcean',
            credit : '內政部營建署海洋國家公園管理處, Taiwan',
            parameters : {
              transparent : 'true',
              format : 'image/png'
            },
            proxy : new DefaultProxy('/proxy/')
          }),
      1.0, false
    );
*/

/* https://maps.nlsc.gov.tw/S09SOA/ (chrome) not work for cors
    addAdditionalLayerOption(
      "Taiwan administrative district",
      new WebFeatureServiceImageryProvider({
             url: 'https://wfs.nlsc.gov.tw',
             layers: 'WFS:VILLAGE_NLSC', //need auth: 'EMAP_COASTLINE',
             viewer: viewer,
             paramCaps: true,
             paramMore: 'SRSNAME=EPSG4326&outputFormat="GML"&',
             bboxDisable: true
      }),
      1.0, false
    );
*/
/*  addAdditionalLayerOption(
      "Tile Coordinates",
      new TileCoordinatesImageryProvider(),
      1.0, false
    );*/
  }
/*Move to upper (Layer/) to modify layerprops.layerNoKnock in LayerContext
  const render_gbifoccur = () => {
    return(<Biodiv viewer={viewer} />)
  }
*/
  const render_satellite = () => {
    //if (satellite.selmodis_truecolor) {
      return(
        render(<WmtsLayer viewer={viewer} clocktime={clocktime} satellite={satellite} layerprops={layerprops}
               addLayer={addAdditionalLayerOption} updateLayer={updateLayerList} />,
               document.getElementById('ctrlwmtslayer'))
      )
    //}
    //return null;
  };

/*Note that if Biodiv here, cannot render async after Satellite/WmtsLayer, that cause some asyn_load problem
  { render_gbifoccur() }, then { render_satellite() } */
  const render_kocomp = () => {
  //if (layerctrlRef.current) {
      return render(
      <table class={style.thinx}>
        <tbody data-bind="foreach: layers">
          <tr data-bind="css: { up: $parent.upLayer === $data, down: $parent.downLayer === $data }">
            <td class={style.smalltd}><input class={style.laychkbox} type="checkbox" data-bind="checked: show" /></td>
            <td class={style.smalltd}>
              <span data-bind="text: name, visible: !$parent.isSelectableLayer($data)"></span>
              <select class={style.simgsel} data-bind="visible: $parent.isSelectableLayer($data), options: $parent.sImg, optionsText: 'name', value: $parent.selectedLayer"></select>
            </td>
            <td class={style.mediumtd}><span class="ctrlrange-wrap2">
              <input type="range" class="range" min="0.0" max="1.0" step="0.01" data-bind="value: alpha, valueUpdate: 'input'" />
              <output class="bubble" style="font-size:9px;position:relative;top:0px;" /></span>
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
      </table>, layerctrlRef.current);
  //}
  //return null;
  }

  return (
    <Fragment>
      <div id="layerctrl" ref={layerctrlRef} />
      { render_satellite() }
    </Fragment>
  )
};
export default LayerModal;
