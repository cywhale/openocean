//import { csConsumer } from '../Earth'; //csLoader
import { useRef, useState, useEffect, useMemo } from 'preact/hooks'; // useContext
//import { useContext } from 'react';
import BaseLayerPicker from 'cesium/Source/Widgets/BaseLayerPicker/BaseLayerPicker';
import createDefaultImageryProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultImageryProviderViewModels';
import createDefaultTerrainProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultTerrainProviderViewModels';
import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
//import Credit from 'cesium/Source/Core/Credit';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
//import WebMercatorTilingScheme from 'cesium/Source/Core/WebMercatorTilingScheme';
import UrlTemplateImageryProvider from 'cesium/Source/Scene/UrlTemplateImageryProvider';
//import WebMapTileServiceImageryProvider from 'cesium/Source/Scene/WebMapTileServiceImageryProvider';
import ProviderViewModel from 'cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
//import 'cesium/Source/Widgets/widgets.css';
import style from './style_basemapPicker';
//import './csviewer.css'
//const imageryViewModels = createDefaultImageryProviderViewModels()[8,10,11,12,14];
//const terrainModels = createDefaultTerrainProviderViewModels();

const BasemapPicker = (props) => {
  const {scene, basePick, onchangeBase} = props;
  const [basemap, setBasemap] = useState({
    picker: null,
    selectedImagery: null,
    selectedTerrain: null,
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
      setBasemap((preState) => ({
        ...preState,
        selectedTerrain: bindSelTerrain(),
      }));
    }
  }, [state]);

  const initBasemap = () => {
    //if (scene) { //Now globe.loaded detect in Earth
      const getImgModels = () => {
        const defModels = createDefaultImageryProviderViewModels();
        let imgModels = [];
        imgModels.push(new ProviderViewModel({
           name : 'NOAA ETOPO\u00a0I',
           iconUrl : buildModuleUrl('https://ecodata.odb.ntu.edu.tw/pub/icon/etopo1_64x64.png'),
            tooltip : 'NOAA Etopo',
            category: "Other",
            creationFunction : function() {
              return new UrlTemplateImageryProvider({
                url : buildModuleUrl('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer/tile/{z}/{y}/{x}?blankTile=True'),
                credit : 'NOAA etopo1 hillshade', //new Credit('©
              });
            }
        }));
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
                style : 'default',
                format : 'image/jpeg',
                tileMatrixSetID : 'GoogleMapsCompatible',
                // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
                //tilingScheme: new WebMercatorTilingScheme(),
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
//9 "Sentinel-2","Blue Marble","Earth at night", "Natural Earth\u00a0II",
        [6,8,9,10,11,12].map(i => imgModels.push(defModels[i])); //4: Mapbox Streets
        return imgModels;
      };

      setBasemap((preState) => ({ //async //await new
        ...preState,
        picker: new BaseLayerPicker(baseContainer.current, {
          globe: scene.globe,
          imageryProviderViewModels: getImgModels(),
          terrainProviderViewModels: createDefaultTerrainProviderViewModels()
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

  //{ initBasemap(loaded) }
  return useMemo (() => {
    return(
      <div style="display:flex;">
        <div id="baseLayerPickerContainer"
          ref = {baseContainer}
          class={style.baseContainer} />
      </div>
    );
  }, [state]);
};

export default BasemapPicker;
