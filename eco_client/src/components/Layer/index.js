import { Fragment } from 'preact'; //render, createContext
import { useEffect, useState, useContext } from 'preact/hooks';
//import Color from 'cesium/Source/Core/Color.js';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
//import defined from 'cesium/Source/Core/defined.js';
//import Rectangle from 'cesium/Source/Core/Rectangle';
//import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
//import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import Datepicker from 'async!../Datepicker';
import LayerModal from 'async!./LayerModal';
import DataCube from 'async!../DataCube'; //Region (old) + MultiSelectSort
import Flows from 'async!../Flows';
import SiteCluster from 'async!../SiteCluster';
import Biodiv from 'async!../Biodiv';
import Bathymetry from 'async!../Bathymetry';
import Coast from 'async!./Coast';
import MousePos from 'async!./MousePos';
import UserSearch from 'async!../UserSearch';
import { EarthContext } from "../Earth/EarthContext";
import { FlowContext } from "../Flows/FlowContext";
import { ClusterContext } from "../SiteCluster/ClusterContext";
import { TerrainContext } from "../Bathymetry/TerrainContext";
import { OccurContext } from "../Biodiv/OccurContext";
import { LayerContext, LayerContextProvider } from "./LayerContext";
//import { SateContextProvider } from "../Satellite/SateContext"; //for WMTS, sateliite layers
//import { DateContext } from "../Datepicker/DateContext"; //move into LayerModal, otherwise choose date'll update panel
import draggable_element from '../Compo/draggable_element';
import style from './style_modal';
import '../../style/style_modal_tab.scss'

const Layer = (props) => {
  const { viewer, baseName, userBase } = props;
//const [ searchLayer, setSearchLayer ] = useState(null);
  const [ isOpen, setIsOpen ] = useState(false);
  const { gpars } = useContext(EarthContext);
  const { earth, setEarth } = gpars;
  const { clpars } = useContext(ClusterContext);
  const { cluster, setCluster } = clpars;
  const { fpars } = useContext(FlowContext);
  const { flow, setFlow } = fpars;
  const { opars } = useContext(OccurContext);
  const { occur, setOccur } = opars;
  const { terrpars } = useContext(TerrainContext);
  const { terrain, setTerrain } = terrpars;
  const { laypars } = useContext(LayerContext);
  const { layerprops, setLayerprops } = laypars;
//const { tkpars } = useContext(DateContext);
//const { clocktime, setClocktime } = tkpars;
  const [hashstate, setHashState] = useState({
    handling: false,
    hash: '',
  //chk1: 'true',
  //chk4: 'false',
  });

  const clear_uri = () => {
    let uri = window.location.toString();
    let clean_uri = uri.substring(0, uri.indexOf("#"));
    history.replaceState({}, document.title, clean_uri);
    return(
      setHashState((prev) => ({
        ...prev,
        handling: false,
        hash: '',
      }))
    )
  };
  const toggleBtnx = () => {setIsOpen(!isOpen)}
  const closeBtnx = () => {
    setIsOpen(false);
    //clean_uri(true);
  };
/*
  const enable_modalToggle = async () => {
    let togglebtn= document.getElementById("toolButn");
    //let closebtn = document.getElementById("toolClose");
    await togglebtn.addEventListener('click', toggleBtnx.bind(null), false);
    //await closebtn.addEventListener('click', closeBtnx, false);
  }
*/
/* https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/
 * Simulate a click event.
 * @public
 * @param {Element} elem  the element to simulate a click on
  const simuClick = (elem) => {
	// Create our event (with options)
	var evt = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		view: window
	});
	// If cancelled, don't dispatch our event
	var canceled = !elem.dispatchEvent(evt);
  };*/
  useEffect(() => {
    if (!earth.loaded) {
      const drag_opts = { dom: "#ctrl", dragArea: '#ctrlheader' };
      draggable_element(drag_opts);
      document.getElementById('tab-1').checked = true; // give a default
      //enable_search_listener();
      window.addEventListener("hashchange", function(e) {
        setHashState((prev) => ({
          ...prev,
          hash: window.location.hash,
        }))
      }, false);

    //sitePicker();
      setEarth((preState) => ({
        ...preState,
        loaded: true,
      }));
    }
    if (hashstate.hash !== '' && !hashstate.handling) {
      if (hashstate.hash === "#search") {
        setIsOpen(true);
        setHashState((prev) => ({
          ...prev,
          handling: true,
          //chk1: 'false',
          //chk4: 'true',
        }));
      } else { //temporarily not handle other location.hash
        clear_uri();
      }
    } else if (hashstate.handling) {
        let el = document.getElementById("tab-4");
        //simuClick(el);
        if (typeof el.click == 'function') {
          el.click()
        } else if(typeof el.onclick == 'function') {
          el.onclick()
        }
        //document.getElementById('tab-1').checked = false;
        //document.getElementById('tab-4').checked = true;
        clear_uri(); //false
    }
  },[earth.loaded, hashstate]);
/*
  const sitePicker = async () => { //useCallback(
    const {scene} = viewer;
    //const sitePickedLabel = () => {
    let handler = new ScreenSpaceEventHandler(scene.canvas);
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
*/
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
      return(//<LayerContextProvider>
             <LayerModal {...props} laypars={laypars} />); //hashstate={hashstate} hashHandler={setHashState}
    }
    return null;
  };

  const render_MousePos = () => {
    let terr_opts = {
      enable: terrain.selwreck,
      min: terrain.wreck_min, //tiff->terrain with missing value (e.g. -9999) cause undesired interpolated values?
      max: terrain.wreck_max,
    };
    if (earth.loaded) {
      return(<MousePos viewer={viewer} terr_opts={terr_opts} />);
    }
    return null;
  };

  let modalClass;
  if (!isOpen) {
    modalClass=`${style.modalOverlay} ${style.notshown}`;
  } else {
    modalClass=`${style.modalOverlay}`
  }
  //console.log("Toggle modal: " + modalClass + " when isOpen is: " + isOpen);
  //<a href="#ctrl" and in css use &:target{display:block} to show modal
  /*      { <div class="cesium-widget-credits" id="searchxdiv" data-searchin="" data-searchout="" style="display:none">
           Now searching: {searchLayer}</div> }*/
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
            <input id="tab-1" type="radio" name="tabs" aria-hidden="true" />
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
                      <div id="ctrllayerbut" style="display:inline-flex;justify-content:center;flex-direction:row;">
                        <div><Coast viewer={viewer} /></div>
                        <div>{ render_MousePos() }</div>
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
                      <div id="ctrlwmtslayer" />
                    </div>
                  </section>
              </div>
            <label class="tablab" for="tab-3" tabindex="2" />
            <input id="tab-3" type="radio" name="tabs" aria-hidden="true" />
            <h2 data-toggle="tab">Details</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                    { cluster.showCluster && <span style="font-size:0.8em;color:grey">Clustering</span> }
                      <div id="ctrlsectdiv1" />
                    { terrain.selwreck && <span style="font-size:0.8em;color:grey">3D-Terrain view</span> }
                      <div id="ctrlsectdiv1_terr" />
                    </div>
                  </section>
              </div>
            <label class="tablab" for="tab-4" tabindex="3" />
            <input id="tab-4" type="radio" name="tabs" aria-hidden="true" />
            <h2 data-toggle="tab">Search</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                      <span style="font-size:0.8em;color:grey">Searching...</span>
                      <div id="searchxdiv" data-searchin="" data-searchout="" />
                      <div id="resultxdiv" />
                    </div>
                  </section>
              </div>
          </div>
        </div>
      </div>
      <UserSearch viewer={viewer} />
      <Flows viewer={viewer} flow={flow} />
      <SiteCluster viewer={viewer} cluster={cluster} />
      <Bathymetry viewer={viewer} terrain={terrain} />
      <Biodiv viewer={viewer} occur={occur} />
      <div id="dclickPopupdiv" />
    </Fragment>
  );
};
export default Layer;
