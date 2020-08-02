//import { csConsumer } from '../Earth'; //csLoader
import { useRef, useState, useEffect, useMemo } from 'preact/hooks'; // useContext
//import { useContext } from 'react';
import BaseLayerPicker from 'cesium/Source/Widgets/BaseLayerPicker/BaseLayerPicker';
import createDefaultImageryProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultImageryProviderViewModels';
import createDefaultTerrainProviderViewModels from 'cesium/Source/Widgets/BaseLayerPicker/createDefaultTerrainProviderViewModels';
import buildModuleUrl from 'cesium/Source/Core/buildModuleUrl';
import UrlTemplateImageryProvider from 'cesium/Source/Scene/UrlTemplateImageryProvider';
import ProviderViewModel from 'cesium/Source/Widgets/BaseLayerPicker/ProviderViewModel';
import 'cesium/Source/Widgets/widgets.css';
import style from './style_basemapPicker';
//import './csviewer.css'

//const imageryViewModels = createDefaultImageryProviderViewModels()[8,10,11,12,14];
//const terrainModels = createDefaultTerrainProviderViewModels();

const BasemapPicker = (props) => {
  const {scene} = props; //loaded
  const [basemap, setBasemap] = useState(null);
  const [state, setState] = useState(false);

  const baseContainer = useRef(null);
  //const { loaded, viewer } = useContext(csLoader);

  useEffect(() => {
    //if (loaded) {
    console.log('Initialize BasemapModels');
    initBasemap();
    //}
  }, []); //loaded

  const initBasemap = () => {
    if (scene) {
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
      [4,6,8,9,11,13,14].map(i => imgModels.push(defModels[i]));

      createDefaultImageryProviderViewModels();
      setBasemap(async () => {
        basemap: await new BaseLayerPicker(baseContainer.current, {
          globe: scene.globe,
          imageryProviderViewModels: imgModels,
          terrainProviderViewModels: createDefaultTerrainProviderViewModels()
        })
      });
      setState(true);
    }
  };

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
