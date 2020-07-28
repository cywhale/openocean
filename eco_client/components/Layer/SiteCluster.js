//import proj4 from 'proj4'
import { useState, useEffect, useCallback } from 'preact/hooks';
import { createContext } from 'preact';
import Color from 'cesium/Source/Core/Color.js';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource.js';
import PinBuilder from 'cesium/Source/Core/PinBuilder.js';
import defined from 'cesium/Source/Core/defined.js';
import HeadingPitchRange from 'cesium/Source/Core/HeadingPitchRange.js';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin.js';
import { clusterOpts } from './CtrlModal';
import style from './style_sitecluster.scss';

const Site = createContext({
  loaded: false,
  cluster: null,
  customstyle: null
});

const SiteCluster = (props) => {
  const {opts} = props;
  const {dataname, dataurl, datacrs, icon, color, viewer} = opts;
  const [dataOut, setData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const {dataSources} = viewer;

  //let clusterRange, minCluster, clusterEnable; //temporarily, may useContext

  const waitData = useCallback(() => {
    const fetchingData = async () => {
      await dataLoader(); //const dataCurr = //await setData(dataCurr);
      await setLoading(false);
    };
    setLoading(true);

    fetchingData();
  }, []);

  useEffect(() => {
    console.log("Fetch site data...")
    waitData();
  }, [waitData]);

  const dataLoader = async () => {
    //if (viewer && dataurl) {
    const crs = 'EPSG:4326'; //datacrs | //temporarily only handle 4326
    //const dataurl = 'https://odbwms.oc.ntu.edu.tw/odbintl/rasters/getcplan/?name=bio_r0043'
    //const dataLoader = async () => { await
    const dataSourcePromise = dataSources.add(
    //const dataSourcePromise = viewer.viewer._dataSourceCollection.__proto__.add(
    //const gjdata = new GeoJsonDataSource(dataname); //.load(dataurl, { //(dataname).load
          new GeoJsonDataSource.load(dataurl, {
            crsNames: crs,
            clampToGround: true,
            //verticalOrigin : Cesium.VerticalOrigin.BOTTOM
            //stroke: Cesium.Color.fromBytes(127, 127, 127, 10),
            //markerColor: Cesium.Color.fromHsl(0, 0, 0, 0.01) //https://github.com/CesiumGS/cesium/issues/6307
          })
    );
    //gjdata.crsNames = crs;
    //gjdata.clampToGround = true;
    /*
    const cs_data_fetch = async () => {
      const cs_data_load = () => new Promise((resolve, reject) => {
        try {
          const fetching = viewer.viewer._dataSourceCollection.__proto__.add(gjdata.load(dataurl));
          resolve(fetching);
        } catch (err) {
          reject(err);
        }
      });
      const fetched = await cs_data_load();
      return fetched;
    }*/
    //const dataSources = await cs_data_fetch();

    //fetch(dataurl)
    //gjdata.load(dataurl)
    //.then(data => { viewer.viewer._dataSourceCollection.__proto__.add(gjdata.load(data)) })
    //.then(dataSources => {
    //  const dataSource = dataSources.get(dataSources.length-1);
    dataSourcePromise.then(dataSource => {
        const { clusterEnable, clusterRange, minCluster } = clusterOpts;
        const iconurl = icon; //|'../../assets/icons/grey-ring-ss.png'; //'https://ecodata.odb.ntu.edu.tw/pub/$
        const colorname = color; //|'cyan';
        let palette = [];
        if (colorname==="cyan") {
          ['#E0FFFF','#00FFFF','#7FFFD4','#40E0D0','#20B2AA','#008080'].map(x => palette.push(x));
        }
        dataSource.clustering.enabled = clusterEnable === undefined? true: clusterEnable;
        dataSource.clustering.pixelRange = clusterRange | 15; //pixelRange
        dataSource.clustering.minimumClusterSize = minCluster | 6; //minimumClusterSize

        const entities = dataSource.entities.values;
        entities.forEach(entity => {
          entity.billboard.image = iconurl; //https://groups.google.com/forum/#!topic/cesium-dev/Nc0EO5IUN4o
        });

        const pinBuilder = new PinBuilder();
        const pin50 = pinBuilder
          .fromText("50+", Color.fromCssColorString(palette[5]), 40)
          .toDataURL();
        const pin40 = pinBuilder
          .fromText("40+", Color.fromCssColorString(palette[4]), 40)
          .toDataURL();
        const pin30 = pinBuilder
          .fromText("30+", Color.fromCssColorString(palette[3]), 40)
          .toDataURL();
        const pin20 = pinBuilder
          .fromText("20+", Color.fromCssColorString(palette[2]), 40)
          .toDataURL();
        const pin10 = pinBuilder //Cesium.when(
          .fromText("10+", Color.fromCssColorString(palette[1]), 40)
          .toDataURL();

        let singleDigitPins = new Array(8);
        for (var i = 0; i < singleDigitPins.length; ++i) {
          singleDigitPins[i] = pinBuilder
            .fromText("" + (i + 2), Color.fromCssColorString(palette[0]), 40)
            .toDataURL();
        }
// Should be moved to with viewModel in ToolModa

        let removeListener;
        const customStyling = () => {
          if (defined(removeListener)) {
            removeListener();
            removeListener = undefined;
          } else {
            removeListener = dataSource.clustering.clusterEvent.addEventListener(

            function (clusteredEntities, cluster) {
              cluster.label.show = false;
              cluster.billboard.show = true;
              cluster.billboard.id = cluster.label.id;
              cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

              if (clusteredEntities.length >= 50) {
                cluster.billboard.image = pin50;
              } else if (clusteredEntities.length >= 40) {
                cluster.billboard.image = pin40;
              } else if (clusteredEntities.length >= 30) {
                cluster.billboard.image = pin30;
              } else if (clusteredEntities.length >= 20) {
                cluster.billboard.image = pin20;
              } else if (clusteredEntities.length >= 10) {
                cluster.billboard.image = pin10;
              } else {
                cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
              }
            } // function for listener
            );// listener
          } // else
          // force a re-cluster with the new styling
          let pr = dataSource.clustering.pixelRange;
          dataSource.clustering.pixelRange = 0;
          dataSource.clustering.pixelRange = pr;
        }

        // start with custom style
        customStyling();

        viewer.flyTo(dataSource, {
          offset: new HeadingPitchRange(0, (-Math.PI / 2)+0.0000001, 8000000) //-Cesium.Math.PI_OVER_F$
        })

        setData(dataSource);
    }); // End of dataSourcePromise.then
    //}/* has viewer &&  dataurl */
  }; // End of dataLoader

  let className;
  if (!isLoading) {
    className=`${style.Redo} ${style.notbusy}`;
  } else {
    className=`${style.Redo}`
  }
  return (
    <Site.Provider value={{loaded: isLoading, cluster: dataOut, customstyle: null}}>
      { console.log("Now loading is: " + isLoading) }
      <div class={className}>

  <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     width="24px" height="30px" viewBox="0 0 24 30" style="enable-background:new 0 0 50 50;" xmlSpace="preserve">
    <rect x="0" y="10" width="4" height="10" fill="#333" opacity="0.2">
      <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite" />
    </rect>
    <rect x="8" y="10" width="4" height="10" fill="#333"  opacity="0.2">
      <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite" />
    </rect>
    <rect x="16" y="10" width="4" height="10" fill="#333"  opacity="0.2">
      <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
      <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite" />
    </rect>
  </svg>

      </div>
    </Site.Provider>
  );
};

export default SiteCluster;
export { Site }; // Need to debug...
export const SiteConsumer = Site.Consumer;
