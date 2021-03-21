import { useState, useEffect, useCallback, useMemo, useContext } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource.js';
//import React from "preact/compat";
//import ReactDOM from "preact/compat";
//import Select, { components } from 'react-select';
//import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { ClusterContext } from "../SiteCluster/ClusterContext";
import { FlowContext } from "../Flows/FlowContext";
import { OccurContext } from "../Biodiv/OccurContext";
import { TerrainContext } from "../Bathymetry/TerrainContext";
import { SateContext } from "../Satellite/SateContext";
import { MultiSelectContainer } from './MultiSelectContainer';
import WebGLGlobeDataSource from './WebGLGlobeDataSource';

import(/* webpackMode: "lazy" */
       /* webpackPrefetch: true */
       'react-dropdown-tree-select/dist/styles.css');
import(/* webpackMode: "lazy" */
       /* webpackPrefetch: true */
       '../../style/style_dropdown.scss');
import data from './data.json';
const { layerConfig } = require('../Layer/.setting.js');

const DataCube = (props) => {
  const { viewer } = props;
  const { dataSources } = viewer;
  const { clpars } = useContext(ClusterContext);
  const { cluster, setCluster } = clpars;
  const { fpars } = useContext(FlowContext);
  const { flow, setFlow } = fpars;
  const { opars } = useContext(OccurContext);
  const { occur, setOccur } = opars;
  const { terrpars } = useContext(TerrainContext);
  const { terrain, setTerrain } = terrpars;
  const { satepars } = useContext(SateContext);
  const { satellite, setSatellite } = satepars;
/*const regionOptions = [
    { value: 0, label: 'White Dolphin Reserve' },
    { value: 1, label: 'Wild Animal Habitat' },
    { value: 2, label: 'Natural Reserve' },
  ];*/
  const defOpts = [//[loaded, setLoaded] = useState([
    //{ loaded: false, show: false, index: -1, urlfile:
    { name: 'whitedolphin', color: Color.HOTPINK },
    { name: 'wildanimalreserve', color: Color.GOLD },
    { name: 'naturalreserve', color: Color.GREEN }
  ];

  const [ selected, setSelected ] = useState({
    val: [],
    type: [],
    format: [],
  });
  const [ loaded, setLoaded ] = useState({
    value: [],
    shown: [],
    index: [], //originally treat as zIndex, now keep viewer.dataSources index
  });
  //const [datasrc, setDatasrc] = useState([]);
  //const [selected, setSelected] = useState(null); //React.useState
  //regionOptions[4],
  //regionOptions[5],
  //]);
  const [ model3d, setModel3d ] = useState({
    wind_idx: -1, //see original code in gits/preact_cesium DataCube
    cluster_idx: -1,
    //initScene3D: false,
    //initCurrEvent: false,
    cube_idx: -1, // index in state, for demo data_cube (population temp)
    cube: null,
    occur_idx: -1,
    terr_idx: -1,
    sate_idx: -1,
  });

  const rdata = [...data]; //data.map(v => ({...v, loaded: false, show: false, index: -1}));
  const onChange = useMemo(() => (_, selectedNodes) => { //async (curNode, selectedNodes) => {
    //console.log('onChange::', curNode, selectedNodes)
    let valx = [];
    let typex = [];
    let formatx = [];
    //let curridx = 0;

    const getCurrDataFormat = (item) => { //, idx //some nodes have type/format key, but childrens may not.
      if (item.hasOwnProperty('type')) {
        //if (idx === typex.length) {
          typex.push(item.type);
        //} else { // children has this key, and replace parents' type by this
        //  typex = [...typex.slice(0,typex.length - 1), item.type]; //, ...typex.slice(typex.length)];
        //}
      }
      if (item.hasOwnProperty('format')) {
        //if (idx === formatx.length) {
          formatx.push(item.format);
        //} else {
        //  formatx = [...formatx.slice(0,formatx.length - 1), item.format]; //, ...formatx.slice(formatx.length)];
        //}
      }
    };

    selectedNodes.map((item) => {
      //curridx = valx.length;
      if (item.hasOwnProperty('_children')) {
        //getCurrDataFormat(item, curridx);
        item._children.map((child) => {
          //curridx = valx.length;
          let nodex = child.substring(6).split("-").reduce(
            (prev, curr) => {
              let leaf = prev[parseInt(curr)];
              //getCurrDataFormat(leaf, curridx);

              if (leaf.hasOwnProperty('children')) {
                return leaf.children;
              } else {
                getCurrDataFormat(leaf);
                return leaf.value;
              }
            },
            rdata
          ); //rdts1-0-0-0
          if (typeof nodex !== 'string' && nodex.length>1) {
            nodex.map((item) => {
              getCurrDataFormat(item);
              valx.push(item.value);
            });
          } else {
            valx.push(nodex);
          }
        });
      } else {
        getCurrDataFormat(item);
        valx.push(item.value);
      }
    });
    //console.log('Get leaf value: ', valx);
    //console.log('Get leaf type: ', typex);
    //handleLeafSelect(valx);
    setSelected((preState) => ({
      ...preState,
      val: [...valx],
      type: [...typex],
      format: [...formatx]
    }));
  }, []);

  const updateDataSourceList = useCallback(() => {
    //if (selected) {
      const promises = [];
      const nlayers = selected.val.length; //regionOptions.length;
      let vidx, didx; //[-1];
/*    if (selected) {
        valx = selected.map((item) => item.value); //return value obj .map(({ value }) => ({ value }))
      }
      let loadk = [...loaded];*/
      let optname = defOpts.map(e => e.name);

      const regionLoad = (i) => { //, selIdx
            let optidx = optname.indexOf(selected.val[i]);
            //viewer.dataSources.add( //urlbasse + loadk[i].urlfile + '.geojson' for old react-select
            GeoJsonDataSource.load(layerConfig.base + 'geojson/region/' + //selected.type[i] + '/' +
                                   selected.val[i] + '.geojson', { //selected.format[i]
              stroke: optidx === -1? Color.KHAKI : defOpts[optidx].color,
            //fill: Color.PINK.withAlpha(0.5),
              strokeWidth: 2,
              //zIndex: nlayers-selIdx //first selected will be upper layer
            //}
            })
            .then(function(data) {
              //let leng = dataSources._dataSources.length;
              data.name = selected.val[i];
              dataSources.add(data);
              //setDatasrc(datasrc.push(data));
              /*setLoaded((state) => {
                state[i].loaded = true;
                state[i].show = true;
                state[i].index = dataSources._dataSources.length-1;
                return(state);
              });
              */
              setLoaded((prev) => ({
                  ...prev,
                  value: [...prev.value, selected.val[i]],
                  shown: [...prev.shown, 1],
                  index: [...prev.index, loaded.value.length], //leng, but cannot be leng. dataSources.length != loaded.value.length
              }))
            })
            .otherwise(err => console.log("Fetching region got load err: ", err));
      };

      const cubeLoad = (i) => {
        const dataSource = new WebGLGlobeDataSource();
        dataSource
          .loadUrl(layerConfig.base + 'json/cube/' + //selected.type[i] + '/' +
                   selected.val[i] + '.json') //selected.format[i]
          .then(function () {
          //After the initial load, create buttons to let the user switch among series.
            dataSource.name = selected.val[i];
            function createSeriesSetter(seriesName) {
              return function () {
                dataSource.seriesToDisplay = seriesName;
              };
            }
//          for (let i = 0; i < dataSource.seriesNames.length; i++) {
//            let seriesName = dataSource.seriesNames[i];
//            Sandcastle.addToolbarButton(
//              seriesName,
//              createSeriesSetter(seriesName)
//            );
//          }
          })
          .otherwise(err => console.log("Fetching data cube got load err: ", err));
//        viewer.clock.shouldAnimate = false;
        //let leng = dataSources._dataSources.length;
          dataSources.add(dataSource);

          setModel3d((preMdl) => ({
                ...preMdl,
                cube_idx: loaded.value.length, //viewer.dataSources._dataSources.length - 1,
                cube: dataSource, //layername can use __seriesToDisplay,
          }));

          setLoaded((prev) => ({
                  ...prev,
                  value: [...prev.value, selected.val[i]],
                  shown: [...prev.shown, 1],
                  index: [...prev.index, loaded.value.length],
          }));
      };

      for (let i = nlayers - 1; i >= 0; --i) {
        vidx = loaded.value.indexOf(selected.val[i]); //Check Not loaded, or not shown, or de-selected
        if (vidx === -1) { //Not Loaded
          if (selected.format[i] === 'geojson' && selected.type[i] === 'region') {
            promises.push(regionLoad(i));//, selIdx));
          } else if (selected.format[i] === 'json' && selected.type[i] === 'cube') {
            promises.push(cubeLoad(i));
          } else {
            //let leng = dataSources._dataSources.length;
            if (selected.type[i] === 'terrain') {
              setTerrain((preState) => ({
                ...preState,
                selwreck: true,
              }));
              setModel3d((preMdl) => ({
                ...preMdl,
                terr_idx: loaded.value.length,
              }));

            } else if (selected.type[i] === 'wmts') {
              setSatellite((preState) => ({
                ...preState,
                selmodis_truecolor: true,
              }));

              setModel3d((preMdl) => ({
                ...preMdl,
                sate_idx: loaded.value.length,
              }));

            } else if (selected.type[i] === 'wms') {
              setOccur((preState) => ({
                ...preState,
                selgbif: true,
              }));

              setModel3d((preMdl) => ({
                ...preMdl,
                occur_idx: loaded.value.length,
              }));
            } else if (selected.format[i] === 'geojson' && selected.type[i] === 'sitecluster') {
              //SiteCluster will also add dataSource into viewer.dataSources, but will cause collision if also handle here
              setCluster((preState) => ({
                ...preState,
                showCluster: true,
                siteurl: layerConfig.base + 'geojson/sitecluster/' + selected.val[i] + '.geojson',
              }));

              setModel3d((preMdl) => ({
                ...preMdl,
                cluster_idx: loaded.value.length,
              }));
            } else if (selected.format[i] === 'json' && selected.type[i] === 'flows') {
              setFlow((preState) => ({
                ...preState,
                selgfs: true,
                base: layerConfig.base + 'json/flows/',
              }));

              setModel3d((preMdl) => ({
                ...preMdl,
                wind_idx: loaded.value.length,
              }));
            }
            // These source are NOT in cesium's dataSources
            setLoaded((prev) => ({
              ...prev,
              value: [...prev.value, selected.val[i]],
              shown: [...prev.shown, 1],
              index: [...prev.index, loaded.value.length], //leng
            }));
          }
        } else { // already loaded, just show
          let showx = !!loaded.shown[vidx];
          didx = loaded.value[vidx]; //loaded.index[vidx];
          if (!showx) {
            if (selected.format[i] === 'json' && selected.type[i] === 'cube') {
              if (!dataSources.contains(model3d.cube)) {
                //let leng = dataSources._dataSources.length;
                dataSources.add(model3d.cube);
              } else {
                console.log("Warning: Uncertain err, cube data already in, but not shown...");
              //dataSources._dataSources[didx].show = true;
                dataSources.getByName(didx)[0].show = true;
              }
              //let tmps = loaded.shown.splice(vidx, 1, 1); //splice() return only removed items!!
              setLoaded((prev) => ({
                  ...prev,
                  shown: [...prev.shown.slice(0, vidx), 1, ...prev.shown.slice(vidx+1, loaded.shown.length)],
                //index: [...loaded.index.slice(0, vidx), leng, ...loaded.index.slice(vidx+1, loaded.index.lengt$
              }));
            } else {
              if (selected.type[i] === 'terrain') {
                setTerrain((preState) => ({
                  ...preState,
                  selwreck: true,
                }));
              } else if (selected.type[i] === 'wmts') {
                setSatellite((preState) => ({
                  ...preState,
                  selmodis_truecolor: true,
                }));
              } else if (selected.type[i] === 'wms') {
                setOccur((preState) => ({
                  ...preState,
                  selgbif: true,
                }));
              } else if (selected.format[i] === 'geojson' && selected.type[i] === 'sitecluster') {
                setCluster((preState) => ({
                  ...preState,
                  showCluster: true,
                }));
              } else if (selected.format[i] === 'json' && selected.type[i] === 'flows') {
                setFlow((preState) => ({
                  ...preState,
                  selgfs: true,
                }));
              } else { //geojson data in cesium's dataSources
                //dataSources._dataSources[loadk[i].index].zIndex = nlayers-selIdx;
                //dataSources._dataSources[didx].show = true;
                dataSources.getByName(didx)[0].show = true;
              }
              //let tmps = loaded.shown.splice(vidx, 1, 1);
              setLoaded((prev) => ({
                  ...prev,
                  shown: [...prev.shown.slice(0, vidx), 1, ...prev.shown.slice(vidx+1, loaded.shown.length)],
              }));
            }
          }
        /*setState((state) => {
            show[i].show = true;
                return(state);
            });
          }*/
        } //else {
      }
      if (promises) {
        Promise.all(promises)
           .then((results) => {
               console.log("All data layers fetched");
           })
           .catch((e) => {
               console.log("Data layers fetched may wrong: ", e);
           });
      }
      //Wanna get which failed: https://stackoverflow.com/questions/30362733/handling-errors-in-promise-all
      //const results = await Promise.all(promises.map(p => p.catch(e => console.log("Fetched layers promise err: ", e)));
      //const errIdx = results.map((e,i) => e instanceof Error ? i : undefined).filter(x => x);
      //if (errIdx && errIdx.length > 0) {}

      //Check De-select
      //let shownx = loaded.shown.filter(el => el === true)
      let chkidx;
      let noselx = loaded.value.filter(el => !selected.val.includes(el));
      if (noselx.length > 0) {
          for (let j = noselx.length - 1; j >= 0; --j) {
            chkidx = loaded.value.indexOf(noselx[j]);
            if (!!loaded.shown[chkidx]) {
              //didx = loaded.index[chkidx];
              if (chkidx === model3d.cube_idx) {
                if (dataSources.contains(model3d.cube)) {
                  dataSources.remove(model3d.cube);
                } else {
                  console.log("Warning: Uncertain err, cube data not in, but say shown...");
                }
                //let tmps = loaded.shown.splice(chkidx, 1, 0);
                setLoaded((preState) => ({
                    ...preState,
                    shown: [...loaded.shown.slice(0, chkidx), 0, ...loaded.shown.slice(chkidx+1, loaded.shown.length)],
                  //index: [...loaded.index.slice(0, chkidx),-1, ...loaded.index.slice(chkidx+1, loaded.index.length)],
                }));
              } else {
                if (chkidx === model3d.terr_idx) {
                  setTerrain((preState) => ({
                    ...preState,
                    selwreck: false,
                  }));
                } else if (chkidx === model3d.sate_idx) {
                  setSatellite((preState) => ({
                    ...preState,
                    selmodis_truecolor: false,
                  }));
                } else if (chkidx === model3d.occur_idx) {
                  setOccur((preState) => ({
                    ...preState,
                    selgbif: false,
                  }));
                } else if (chkidx === model3d.wind_idx) {
                  setFlow((preState) => ({
                    ...preState,
                    selgfs: false,
                  }));
                } else if (chkidx === model3d.cluster_idx) {
                  setCluster((preState) => ({
                    ...preState,
                    showCluster: false,
                  }));
                } else {
                  //didx = loaded.value[chkidx] //loaded.index[chkidx]; //loaded.index !== index in dataSources
                  //dataSources._dataSources[didx].show = false;
                  dataSources.getByName(noselx[j])[0].show = false;
                }
                //let tmps = loaded.shown.splice(chkidx, 1, 0);
                setLoaded((prev) => ({
                    ...prev,
                    shown: [...prev.shown.slice(0, chkidx), 0, ...prev.shown.slice(chkidx+1, loaded.shown.length)],
                }));
              }
            }
          }
      }
  }, [selected]);

  useEffect(() => {
    updateDataSourceList();
  }, [updateDataSourceList]);

  return(
    <MultiSelectContainer data={data} onChange={onChange} inlineSearchInput={true} />
  );
}
export default DataCube;
