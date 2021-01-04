import { Fragment } from 'preact'; //render, createContext
import { useEffect, useState, useContext } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import defined from 'cesium/Source/Core/defined.js';
//import Rectangle from 'cesium/Source/Core/Rectangle';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import Datepicker from 'async!../Datepicker';
import LayerModal from 'async!./LayerModal';
import DataCube from 'async!../DataCube'; //Region (old) + MultiSelectSort
import Flows from 'async!../Flows';
import SiteCluster from 'async!../SiteCluster';
import { EarthContext } from "../Earth/EarthContext";
import { FlowContext } from "../Flows/FlowContext";
import { ClusterContext } from "../SiteCluster/ClusterContext";
//import { DateContext } from "../Datepicker/DateContext"; //move into LayerModal, otherwise choose date'll update panel

import draggable_element from '../Compo/draggable_element';
import style from './style_modal';
import '../../style/style_modal_tab.scss'

const Layer = (props) => {
  const { viewer, baseName, userBase } = props;
  const [ searchLayer, setSearchLayer ] = useState(null);
  const [ isOpen, setIsOpen ] = useState(false);
  const { gpars } = useContext(EarthContext);
  const { earth, setEarth } = gpars;
  const { clpars } = useContext(ClusterContext);
  const { cluster, setCluster } = clpars;
  const { fpars } = useContext(FlowContext);
  const { flow, setFlow } = fpars;
//const { tkpars } = useContext(DateContext);
//const { clocktime, setClocktime } = tkpars;
/*
  const evlay01url = 'https://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1787328&cs=rgb&format=PNG&wi$
  const sTileImg = new SingleTileImageryProvider({
    url: evlay01url,
    //rectangle: new Rectangle(bnds[0], bnds[1], bnds[2], bnds[3]),
    rectangle: Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
    //numberOfLevelZeroTilesX: 1,
    //numberOfLevelZeroTilesY: 1,
    proxy : new DefaultProxy('/proxy/') //https://github.com/CesiumGS/EarthKAMExplorer/blob/master/ser$
  });
*/
  const toggleBtnx = () => {setIsOpen(!isOpen)};
  const closeBtnx = () => {setIsOpen(false)};
/*
  const enable_modalToggle = async () => {
    let togglebtn= document.getElementById("toolButn");
    //let closebtn = document.getElementById("toolClose");
    await togglebtn.addEventListener('click', toggleBtnx.bind(null), false);
    //await closebtn.addEventListener('click', closeBtnx, false);
  }
*/
  useEffect(() => {
    //if (!earth.loaded) {
      const drag_opts = { dom: "#ctrl", dragArea: '#ctrlheader' };
      draggable_element(drag_opts);
      //enable_modalToggle();
      enable_search_listener();
      sitePicker();
      setEarth((preState) => ({
        ...preState,
        loaded: true,
      }));
    //} //else {
      //render_windjs(flow.selgfs);
    //}
  },[]); //[earth.loaded]);//, flow.selgfs]);

  const sitePicker = async () => { //useCallback(
    const {scene} = viewer;
    //const sitePickedLabel = () => {
    var handler = new ScreenSpaceEventHandler(scene.canvas);
    await handler.setInputAction(function (movement) {
        let pickedLabel = scene.pick(movement.endPosition);
        if (defined(pickedLabel)) {
          const ids = pickedLabel.id;
          if (Array.isArray(ids)) {
            for (var i = 0; i < ids.length; ++i) {
              ids[i].billboard.color = Color.fromCssColorString('#ff77ff');
            }
          }
        }
        scene.requestRender();
    }, ScreenSpaceEventType.LEFT_CLICK);
    //};
    //await sitePickedLabel();
    //return(<div style="display:none" />);
  };//, []);

/*<FlowContextProvider>
  const render_flows = () => {
    if (earth.loaded) { // & globe.baseLoaded) {
      const dataset = { // temporarily hard-coded here
        date: '2018-06-25',
        time: '00'
      };
      return ( //globe.viewer
          <Flows viewer={viewer} flow={flow} dataset={dataset} />
      );
    }
    return null;
  };
*/
/*<ClusterContextProvider>
  const render_sitecluster = () => {
    if (earth.loaded) { // & globe.baseLoaded) {
      return (
          <SiteCluster viewer={viewer} cluster={cluster} />
      );
    }
    return null;
  };*/

  const render_Layermodal = () => {
    if (earth.loaded) {
      //console.log("Pass to layer: ", clocktime.times);
      return(<LayerModal {...props} />); //clocktimes={clocktime.times} />);
    }
    return null;
  };

  const set_searchingtext= (elem_search, dom, evt) => {
    let x = elem_search.value;
    if (x && x.trim() !== "" && x !== dom.dataset.search) {
      dom.dataset.searchin = x;
    }
  };

  const get_searchingtext = (dom, evt) => {
    //let REGEX_EAST = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u3131-\uD79D]/;
    //if (dom.dataset.search && dom.dataset.search.trim() !== "") { //|| dom.dataset.search.match(REGEX_EAST))
    setSearchLayer(dom.dataset.searchin);
    dom.dataset.searchout = dom.dataset.searchin;
  };

  const enable_search_listener = async () => {
    let elem_search = document.querySelector(".cesium-geocoder-input");
    let search_term = document.getElementById("searchx");
    let butt_search = document.querySelector(".cesium-geocoder-searchButton");
    await elem_search.addEventListener("change", set_searchingtext.bind(null, elem_search, search_term), false);
    await elem_search.addEventListener("search",get_searchingtext.bind(null, search_term), false);
    await butt_search.addEventListener("click", get_searchingtext.bind(null, search_term), false);
  }

  let modalClass;
  if (!isOpen) {
    modalClass=`${style.modalOverlay} ${style.notshown}`;
  } else {
    modalClass=`${style.modalOverlay}`
  }
  //console.log("Toggle modal: " + modalClass + " when isOpen is: " + isOpen);
  //<a href="#ctrl" and in css use &:target{display:block} to show modal
  //<div id="regionsectdiv"><Region viewer={viewer} /></div>
  /*                    <FlowContextProvider><ClusterContextProvider>
                        </ClusterContextProvider></FlowContextProvider>*/
  //console.log("in Layer start: ", clocktime.starttime);
  //console.log("in Layer times: ", clocktime.times);
  return (
    <Fragment>
      <div id="toolToggle" class={style.toolToggle}>
         <a class={style.toolButn} id="toolButn" onClick={()=>{toggleBtnx()}}><i></i></a>
      </div>
      <div id="ctrl" class={modalClass}>
        <div class={style.modalHeader} id="ctrlheader">
          <a id="toolClose" class={style.close} onClick={()=>{closeBtnx()}}>&times;</a>
        </div>
        <div class={style.modal}>
          <div class="nav-tabs">
            <label class="tablab" for="tab-1" tabindex="0" />
            <input id="tab-1" type="radio" name="tabs" checked="true" aria-hidden="true" />
            <h2 data-toggle="tab">Layers</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                      <div id="regionsectdiv">
                          <DataCube viewer={viewer} />
                      </div>
                      <div id="ctrlsectdiv2">
                        {render_Layermodal()}
                      </div>
                    </div>
                  </section>
              </div>
            <label class="tablab" for="tab-2" tabindex="1" />
            <input id="tab-2" type="radio" name="tabs" aria-hidden="true" />
            <h2 data-toggle="tab">Time</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                      <Datepicker viewer={viewer} />
                    </div>
                  </section>
              </div>
            <label class="tablab" for="tab-3" tabindex="2" />
            <input id="tab-3" type="radio" name="tabs" aria-hidden="true" />
            <h2 data-toggle="tab">Details</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                    <span style="font-size:0.8em;color:grey">Clustering</span>
                      <div id="ctrlsectdiv1" />
                    </div>
                  </section>
              </div>
          </div>
        </div>
      </div>
      <Flows viewer={viewer} flow={flow} />
      <SiteCluster viewer={viewer} cluster={cluster} />
      { <div class="cesium-widget-credits" id="searchx" data-searchin="" data-searchout="" style="display:none">
           Now searching: {searchLayer}</div> }
    </Fragment>
  );
};
export default Layer;
