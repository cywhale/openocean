//import { csConsumer } from '../Earth'; //csLoader
import { useRef, useState, useEffect, useMemo } from 'preact/hooks'; // useContext
//import { useContext } from 'react';
import BaseLayerPicker from 'cesium/Source/Widgets/BaseLayerPicker/BaseLayerPicker';
import createDefaultImageryProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultImageryProviderViewModels';
import createDefaultTerrainProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultTerrainProviderViewModels';
import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
import UrlTemplateImageryProvider from 'cesium/Source/Scene/UrlTemplateImageryProvider';
import ProviderViewModel from 'cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
import 'cesium/Source/Widgets/widgets.css';
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
            creationFunction : function() {
              return new UrlTemplateImageryProvider({
                url : buildModuleUrl('https://gis.ngdc.noaa.gov/arcgis/rest/services/web_mercator/etopo1_hillshade/MapServer/tile/{z}/{y}/{x}?blankTile=True'),
                credit : '© NOAA etopo1 hillshade',
              });
            }
        }));
        [6,8,9,11,12,13,14].map(i => imgModels.push(defModels[i])); //4: Mapbox Streets
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
