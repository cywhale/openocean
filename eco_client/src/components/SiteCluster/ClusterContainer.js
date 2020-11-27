//import proj4 from 'proj4'
//import { lazy } form 'preact/compat';
import { render } from 'preact';
import { useState, useEffect, useCallback, useContext } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource.js';
import PinBuilder from 'cesium/Source/Core/PinBuilder.js';
import defined from 'cesium/Source/Core/defined.js';
import HeadingPitchRange from 'cesium/Source/Core/HeadingPitchRange.js';
//import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin.js';
//import siteClusterStyling from './siteClusterStyling';
import CtrlModal from 'async!./CtrlModal';
import SvgLoading from 'async!../Compo/SvgLoading';
//import { ClusterContext } from "./ClusterContext";
//import style from './style';

const ClusterContainer = (props) => {
  const { viewer, cluster } = props;
  //const { cluster, setCluster } = useContext(ClusterContext);
  //const {dataname, dataurl, datacrs, icon, color, cluster.showCluster, viewer} = opts;
  const defOpts = { // temporarily hard-coded here
        //dataname: 'windpower',
        //dataurl: cluster.siteurl,
          crs: 'EPSG:4326',
          icon: '../../assets/icons/windpower_blue01s.png',
          color: 'cyan'
        };
  //const enable = cluster.showCluster;
  //};
  const [out, setOut] = useState({
    dataSource: null,
    dataURL: '',
//  Pins: null,
//  removeListener: null
  });
  const [state, setState] = useState({
    isLoading: true
    //svgClass: `${style.Redo}`
  });
  const {dataSources, scene} = viewer;

  //let clusterRange, minCluster, clusterEnable; //temporarily, may useContext
  const waitData = useCallback((dataurl, opts) => {
    const fetchingData = async () => {
      await dataLoader(dataurl, opts);
      //if (out.dataSource) {
      //await setState({
          //isLoading: false
          //svgClass: `${style.Redo} ${style.notbusy}`
      //});
      //}
      console.log("Now await dataLoader and isLoading is: " + state.isLoading);
    };

    setState({
      isLoading: true
      //svgClass: `${style.Redo}`
    });
    fetchingData();
  }, []);

  useEffect(() => {
    //if (state.isLoading) {
    console.log("Fetch site data...")
    if (cluster.showCluster && cluster.siteurl !== '' && (out.dataURL !== cluster.siteurl || out.dataSource === null)) {
      waitData(cluster.siteurl, defOpts);
    } else if (cluster.showCluster && out.dataSource !== null) {
      out.dataSource.show = true;
    } else if (!cluster.showCluster && out.dataSource !== null) {
      out.dataSource.show = false;
      // Move into promise then for use customStyilng function
      // const {scene} = viewer;
      // render(<CtrlModal scene={scene} dataSource={out.dataSource} Pins={out.Pins} removeListener={out.removeListener} />,
      //        document.getElementById('ctrlsect'));
    }
  }, [cluster.showCluster, cluster.siteurl, waitData]); //isLoading

  const dataLoader = async (dataurl, opts) => {
    //if (viewer && dataurl) {
    //const crs = 'EPSG:4326'; //datacrs | //temporarily only handle 4326
    //const dataurl = 'https://odbwms.oc.ntu.edu.tw/odbintl/rasters/getcplan/?name=bio_r0043'
    //const dataLoader = async () => { await
    const dataSourcePromise = dataSources.add(
    //const dataSourcePromise = viewer.viewer._dataSourceCollection.__proto__.add(
    //const gjdata = new GeoJsonDataSource(dataname); //.load(dataurl, { //(dataname).load
          new GeoJsonDataSource.load(dataurl, {
            crsNames: opts.crs,
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
        //const { clusterEnable, clusterRange, minCluster } = clusterOpts;
        const iconurl = defOpts.icon; //|'../../assets/icons/grey-ring-ss.png'; //'https://ecodata.odb.ntu.edu.tw/pub/$
        const colorname = defOpts.color; //|'cyan';
        let palette = [];
        if (colorname==="cyan") {
          ['#E0FFFF','#00FFFF','#7FFFD4','#40E0D0','#20B2AA','#008080'].map(x => palette.push(x));
        }
        dataSource.clustering.enabled = true; //clusterEnable === undefined? true: clusterEnable;
        dataSource.clustering.pixelRange = 15; //clusterRange | 15; //pixelRange
        dataSource.clustering.minimumClusterSize = 6; //minCluster | 6; //minimumClusterSize

        const entities = dataSource.entities.values;
        entities.forEach(entity => {
          entity.billboard.image = iconurl; //https://groups.google.com/forum/#!topic/cesium-dev/Nc0EO5IUN4o
        });

        const pinBuilder = new PinBuilder();
        let singleDigitPins = new Array(8);
        for (var i = 0; i < singleDigitPins.length; ++i) {
          singleDigitPins[i] = pinBuilder
            .fromText("" + (i + 2), Color.fromCssColorString(palette[0]), 40)
            .toDataURL();
        }
        const Pins = {
          pin50: pinBuilder
            .fromText("50+", Color.fromCssColorString(palette[5]), 40)
            .toDataURL(),
          pin40: pinBuilder
            .fromText("40+", Color.fromCssColorString(palette[4]), 40)
            .toDataURL(),
          pin30: pinBuilder
            .fromText("30+", Color.fromCssColorString(palette[3]), 40)
            .toDataURL(),
          pin20: pinBuilder
            .fromText("20+", Color.fromCssColorString(palette[2]), 40)
            .toDataURL(),
          pin10: pinBuilder //Cesium.when(
            .fromText("10+", Color.fromCssColorString(palette[1]), 40)
            .toDataURL(),
          singleDigitPins: singleDigitPins
        };

        let removeListener;
        // start with custom style, BUT cannot work by calling module siteClusterStyling
        //const styOpts = { dataSource: dataSource, Pins: Pins, removeListener: removeListener };
        //removeListener = siteClusterStyling(styOpts);
        const siteClusterStyling = () => { //props //var {dataSource, Pins, removeListener} = props;
          if (defined(removeListener)) {
              removeListener();
              removeListener = undefined; //toggle: disable listener
          } else { //toggle: enable listener
              removeListener = dataSource.clustering.clusterEvent.addEventListener(
                function (clusteredEntities, cluster) {
                  cluster.label.show = false;
                  cluster.billboard.show = true;
                  cluster.billboard.id = cluster.label.id;
                  cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

                  if (clusteredEntities.length >= 50) {
                      cluster.billboard.image = Pins.pin50;
                  } else if (clusteredEntities.length >= 40) {
                      cluster.billboard.image = Pins.pin40;
                  } else if (clusteredEntities.length >= 30) {
                      cluster.billboard.image = Pins.pin30;
                  } else if (clusteredEntities.length >= 20) {
                      cluster.billboard.image = Pins.pin20;
                  } else if (clusteredEntities.length >= 10) {
                      cluster.billboard.image = Pins.pin10;
                  } else {
                      cluster.billboard.image = Pins.singleDigitPins[clusteredEntities.length-2];
                  }
                } // function for listener
              );// listener
          }
          let pr = dataSource.clustering.pixelRange;
          dataSource.clustering.pixelRange = 0;
          dataSource.clustering.pixelRange = pr;
          //return removeListener;
        };
        siteClusterStyling();

        viewer.flyTo(dataSource, {
          offset: new HeadingPitchRange(0, (-Math.PI / 2)+0.0000001, 8000000) //-Cesium.Math.PI_OVER_F$
        })

        setOut({ dataSource: dataSource, dataURL: cluster.siteurl }); //Pins: Pins, removeListener: removeListener });
        setState({
          isLoading: false
          //svgClass: `${style.Redo} ${style.notbusy}`
        });

        //let resolve; //https://codesandbox.io/s/resolve-unmounted-suspense-ppfgc?file=/src/index.js:142-267
        const waitCtrlRender = () => {//lazy(() => {
          //const ctrlModalPromise =
          new Promise((resolve) => {//, reject) => {
            //try {
            render(<CtrlModal scene={scene} dataSource={dataSource} />, document.getElementById('ctrlsectdiv1'));
                    /*{ async () => { // Cannot work when stylingButn is null even render CtrlModal
                      let stybutn = await this.base.querySelector('#stylingButn');
                      await render(<button data-bind="submit: siteClusterStyling()">Custom styling</button>,
                                   stybutn); //document.getElementById('stylingButn'));
                    } }
                </CtrlModal>, document.getElementById('ctrlsect')); */
            resolve();
            //} catch (err) {
            //    reject(err)
            //}
          });
        //ctrlModalPromise.then(component => {
        }
        //const waitBindStyling = async () => {
        waitCtrlRender(); //await
          /*await render(
            <div>
              <table style="color:antiquewhite;">
              <tbody>
                <tr>
                  <td>
                    <button data-bind="submit: siteClusterStyling()">Custom styling</button>
                 </td>
                </tr>
              </tbody>
              </table>
            </div>, document.getElementById('ctrlsectdiv2'));
        };*/
        //waitBindStyling();
    }) // End of dataSourcePromise.then
    //}/* has viewer &&  dataurl */
  }; // End of dataLoader
/*
  let svgClass;
  if (!enable) {
    svgClass=`${style.Redo} ${style.notbusy}`;
  } else {
    if (!state.isLoading) {
      svgClass=`${style.Redo} ${style.notbusy}`;
    } else {
      svgClass=`${style.Redo}`
    }
  }
  console.log("Toggle svgClasss: " + svgClass + " when isLoaing is: " + state.isLoading);
*/
//svg for loading
//<Site.Provider value={{loaded: isLoading, cluster: dataOut, customstyle: null}}></Site.Provider>
//{ console.log("Now site cluster loading is: " + isLoading) }
//<div class={svgClass} isLoading={state.isLoading}>
  return (
    <SvgLoading enable = {cluster.showCluster} isLoading = {state.isLoading} />
  );
};
export default ClusterContainer;
