//import { csConsumer } from '../Earth'; //csLoader
import { useRef, useState, useEffect, useMemo } from 'preact/hooks'; // useContext
//import { useContext } from 'react';
import BaseLayerPicker from 'cesium/Source/Widgets/BaseLayerPicker/BaseLayerPicker';
import createDefaultImageryProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultImageryProviderViewModels';
//Needed if terrain can be selected 202012 modified
//import createDefaultTerrainProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultTerrainProviderViewModels';
import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
//import Credit from 'cesium/Source/Core/Credit';
import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
//import WebMercatorTilingScheme from 'cesium/Source/Core/WebMercatorTilingScheme';
import UrlTemplateImageryProvider from 'cesium/Source/Scene/UrlTemplateImageryProvider';
import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';
import WebMapTileServiceImageryProvider from 'cesium/Source/Scene/WebMapTileServiceImageryProvider';
import ProviderViewModel from 'cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
//import 'cesium/Source/Widgets/widgets.css';
import(/* webpackPreload: true */
       '../../style/style_basemapPicker');
//import './csviewer.css'
//const imageryViewModels = createDefaultImageryProviderViewModels()[8,10,11,12,14];
//const terrainModels = createDefaultTerrainProviderViewModels();

const BasemapPicker = (props) => {
  const {scene, basePick, onchangeBase} = props;
  const [basemap, setBasemap] = useState({
    picker: null,
    selectedImagery: null,
//Needed if terrain can be selected 202012 modified
//  selectedTerrain: null,
  });
  const [state, setState] = useState(false);
  //const { loaded, viewer } = useContext(csLoader);
  const baseContainer = useRef(null);

  useEffect(() => {
    if (!state) {
      console.log('Initialize BasemapModels');
      initBasemap();
    } else {
    /*  if (!basemap.binded) {
        setBasemap((preState) => ({
            ...preState,
            binded: true,
        }));
        knockout.track(basemap);
        //knockout.applyBindings(basemap, baseContainer.current);
      }
    */ // already knockout track when build basemap picker (cesium internally)
      setBasemap((preState) => ({
        ...preState,
        selectedImagery: bindSelImagery(),
      }));
/* temporarily removed 202012 // Needed if terrain can be selected
      setBasemap((preState) => ({
        ...preState,
        selectedTerrain: bindSelTerrain(),
      })); */
    }
  }, [state]);

  const initBasemap = () => {
    //if (scene) { //Now globe.loaded detect in Earth
      const getImgModels = () => {
        const defModels = createDefaultImageryProviderViewModels();
        let imgModels = [];

//https://noaa.maps.arcgis.com/home/item.html?id=89dbb3a8eb294652adae4e8a7c92ad24
        imgModels.push(new ProviderViewModel({
           name : 'NOAA ETOPO\u00a0I', //https://ecodata.odb.ntu.edu.tw/pub/icon/etopo1_64x64.png
           iconUrl : buildModuleUrl('../../assets/img/etopo1_hillshade_s1.png'), //'https://noaa.maps.arcgis.com/sharing/rest/content/items/89dbb3a8eb294652adae4e8a7c92ad24/info/thumbnail/etopo1_hillshade.png'),
            tooltip : 'NOAA Etopo',
            category: "Other",
            creationFunction : function() {
//            return new UrlTemplateImageryProvider({
//              url : buildModuleUrl('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer/tile/{z}/{y}/{x}?blankTile=True'),
              return new WebMapServiceImageryProvider({
                url : 'https://ecodata.odb.ntu.edu.tw/geoserver/noaa/wms',
                layers : 'noaa:Etopo1_hillshade',
                enablePickFeatures: false,
                credit : 'NOAA etopo1 hillshade', //new Credit('©
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));

        imgModels.push(new ProviderViewModel({
           name : 'Esri Firefly',
           iconUrl : buildModuleUrl('../../assets/img/esri_firefly.jpeg'), //'https://www.arcgis.com/sharing/rest/content/items/a66bfb7dd3b14228bf7ba42b138fe2ea/info/thumbnail/thumbnail1578354023212.jpeg'),
            tooltip : 'Esri World Imagery (Firefly)',
            category: 'Other', //'Cesium ion'
            creationFunction : function() {
              return new UrlTemplateImageryProvider({
                url : buildModuleUrl('https://fly.maptiles.arcgis.com/arcgis/rest/services/World_Imagery_Firefly/MapServer/tile/{z}/{y}/{x}?blankTile=True'),
                credit : '© Esri', //new Credit('Esri', 'https://downloads.esri.com/blogs/arcgisonline/esrilogo_new.png', 'https://www.arc$
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));

//https://noaa.maps.arcgis.com/home/item.html?id=e11ebaeb19544bb18c2afe440f063062
        imgModels.push(new ProviderViewModel({
           name : 'NOAA DEM Global',
           iconUrl : buildModuleUrl('../../assets/img/noaa_dem_global_s1.png'), //'https://noaa.maps.arcgis.com/sharing/rest/content/items/e11ebaeb19544bb18c2afe440f063062/info/thumbnail/thumbnail1599599541626.png'),
            tooltip : 'DEM Global Mosaic (Color Shaded Relief)',
            category: 'Other', //'Cesium ion'
            creationFunction : function() {
              return new WebMapServiceImageryProvider({
                url : 'https://gis.ngdc.noaa.gov/arcgis/services/DEM_mosaics/DEM_global_mosaic_hillshade/ImageServer/WMSServer',
                layers : 'DEM_global_mosaic_hillshade:ColorHillshade',
                enablePickFeatures: false,
                credit : 'NOAA National Centers for Environmental Information (NCEI)',
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));
//https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_grayscale_basemap_NCEI/MapServer?cacheKey=986e87178fc31c54
        imgModels.push(new ProviderViewModel({
           name : 'GEBCO 2020 Grayscale',
           iconUrl : buildModuleUrl('../../assets/img/gebco2020_grey_s1.png'), //'https://noaa.maps.arcgis.com/sharing/rest/content/items/766fe2c6985e43d7a86fc39134b4f0f6/info/thumbnail/thumbnail1596833199248.png'),
            tooltip : 'GEBCO_2020 Grayscale Basemap',
            category: 'Other', //'Cesium ion'
            creationFunction : function() {
              return new WebMapTileServiceImageryProvider({
                url : 'https://tiles.arcgis.com/tiles/C8EMgrsFcRFL6LrL/arcgis/rest/services/GEBCO_grayscale_basemap_NCEI/MapServer/WMTS',
                layer : 'GEBCO_grayscale_basemap_NCEI',
                style : 'default',
                format : 'image/png',
                tileMatrixSetID : 'default028mm',
                enablePickFeatures: false,
                credit : 'General Bathymetric Chart of the Oceans (GEBCO); NOAA National Centers for Environmental Information (NCEI)',
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));

        imgModels.push(new ProviderViewModel({
           name : 'GMRT',
           iconUrl : buildModuleUrl('../../assets/img/gmrt_icon_s1.png'), //'https://www.gmrt.org/apple-touch-icon.png'),
            tooltip : 'Global Multi-Resolution Topography (GMRT)',
            category: "Other",
            creationFunction : function() {
              return new WebMapServiceImageryProvider({
                url : 'https://www.gmrt.org/services/mapserver/wms_merc', //'https://ecodata.odb.ntu.edu.tw/geoserver/gmrt/wms',
                layers : 'GMRT', //'gmrt:GMRT',
                //rectangle:Rectangle.fromDegrees(sbbox[0], sbbox[1], sbbox[2], sbbox[3]),
                //tilingScheme: new WebMercatorTilingScheme(),
                //parameters: {
                //  transparent: "true",
                //  style: 'substrate', //'Polygon_near_white',
                //  format: "image/png",
                //  width: 749,
                //  height: 768
                //},
                enablePickFeatures: false,
                credit : 'Bathemetry ©2020 GMRT',
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));

// https://tiles.emodnet-bathymetry.eu/#baselayer
/* cannot properly work seems projection or tile numbering error, but work on EMODnet cesium https://portal.emodnet-bathymetry.eu/
        imgModels.push(new ProviderViewModel({
           name : 'EMODnet baselayer', //'EMODnet mean_multicolour',
           iconUrl : buildModuleUrl('https://ecodata.odb.ntu.edu.tw/pub/icon/EMODnet_earth_s.png'),
            tooltip : 'EMODnet baselayer',
            category: "Other",
            creationFunction : function() {
              //return new WebMapTileServiceImageryProvider({ //v9/mean_multicolour /2020/baselayer
                //url : 'https://tiles.emodnet-bathymetry.eu/2020/baselayer/{TileMatrixSet}/{TileMatrix}/{TileCol}/{TileRow}.png',
                //layer : 'baselayer',
                //format : 'image/png',
                //style : 'default',
                //tileMatrixSetID : 'inspire_quad',
              return new WebMapServiceImageryProvider({
                url : 'https://ecodata.odb.ntu.edu.tw/geoserver/emodnet/wms',
                layers : 'baselayer',
                //tilingScheme: new WebMercatorTilingScheme(),
                credit : 'EMODnet Bathymetry',
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));
*/
/* Sinica's Bing map work in QGIS, but strangely not work here
        imgModels.push(new ProviderViewModel({
           name : 'Bing Aerial',
           iconUrl : buildModuleUrl('Widgets/Images/ImageryProviders/bingAerial.png'),
            tooltip : 'Bing Aerial',
            category: "Other",
            creationFunction : function() {
              return new WebMapTileServiceImageryProvider({
                url : 'https://gis.sinica.edu.tw/worldmap/wmts',
                layer : 'BingA',
                style : '_null',
                format : 'image/jpeg',
                tileMatrixSetID : 'GoogleMapsCompatible',
                //tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
                tilingScheme: new WebMercatorTilingScheme(),
                //maximumLevel: 21,
                credit : 'Microsoft® Bing™ Maps',
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));
*/
/* EMAP works but seems overlap with OpenStreet
        imgModels.push(new ProviderViewModel({
           name : 'Taiwan Emap',
           iconUrl : buildModuleUrl('../../assets/icons/taiwan-map_s.png'),
            tooltip : 'Taiwan Emap',
            category: "Other",
            creationFunction : function() {
              return new WebMapTileServiceImageryProvider({
                url : 'https://wmts.nlsc.gov.tw/wmts',
                layer : 'EMAP',
                style : 'default',
                format : 'image/jpeg',
                tileMatrixSetID : 'GoogleMapsCompatible',
                tilingScheme: new WebMercatorTilingScheme(),
                //maximumLevel: 21,
                credit : '',
                proxy : new DefaultProxy('/proxy/')
              });
            }
        }));
*/
//https://github.com/cywhale/preact_cesium/commit/441d3735dfdd110a2cc9ae8e990f8790ab16a608
//https://github.com/CesiumGS/cesium/blob/1.74/Source/Widgets/BaseLayerPicker/createDefaultImageryProviderViewModels.js
//https://github.com/CesiumGS/cesium/issues/9211
//0 "Bing Maps Aerial","Bing Maps Aerial with Labels","Bing Maps Roads",
//3 "ESRI World Imagery", "ESRI World Street Map", "ESRI National Geographic",
//6 "Open\u00adStreet\u00adMap","Stamen Watercolor", "Stamen Toner",
//9-12 "Sentinel-2","Blue Marble","Earth at night", "Natural Earth\u00a0II",
        [6,8,9,10,11].map(i => imgModels.push(defModels[i])); //4: Mapbox Streets
        return imgModels;
      };

      setBasemap((preState) => ({ //async //await new
        ...preState,
        picker: new BaseLayerPicker(baseContainer.current, {
          globe: scene.globe,
          imageryProviderViewModels: getImgModels() //,
// if want to turn off requestWaterMask : true, cannot use Default Terrain Provider
// https://github.com/CesiumGS/cesium/blob/1.76/Source/Widgets/BaseLayerPicker/createDefaultTerrainProviderViewModels.js
// temporarily removed 202012 //Needed if terrain can be selected 202012 modified
//        terrainProviderViewModels: createDefaultTerrainProviderViewModels()
        })
      }));
      setState(true);
    //}
  };

  const bindSelImagery = () => {
    const {viewModel} = basemap.picker; //original: baseLayerPicker.viewModel.selectedImagery
    knockout
      .getObservable(viewModel, 'selectedImagery') //baseLayerPicker.viewModel
      .subscribe(function() {
        const baseImg = viewModel.selectedImagery.name;
        if (baseImg !== basePick.name && baseImg !== basemap.selectedImagery) {
          onchangeBase({ name: baseImg });
        }
        return ({ selectedImagery: baseImg });
      });
  }
/* Needed if terrain can be selected 202012 modified
  const bindSelTerrain = () => {
    const {viewModel} = basemap.picker; //original: baseLayerPicker.viewModel.selectedTerrain
    knockout
      .getObservable(viewModel, 'selectedTerrain') //baseLayerPicker.viewModel
      .subscribe(function() {
        const baseTerrain = viewModel.selectedTerrain.name;
        if (baseTerrain !== basePick.name && baseTerrain !== basemap.selectedTerrain) {
          onchangeBase({ name: baseTerrain });
        }
        return ({ selectedTerrain: baseTerrain });
      });
  }
*/
  //{ initBasemap(loaded) }
  return useMemo (() => {
    return(
      <div style="display:flex;">
        <div id="baseLayerPickerContainer"
          ref = {baseContainer}
          class="baseContainer" />
      </div>
    );
  }, [state]);
};

export default BasemapPicker;
