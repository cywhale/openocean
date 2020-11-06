import { Fragment } from 'preact'; //render, createContext
import { useEffect, useState, useContext } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import defined from 'cesium/Source/Core/defined.js';
//import Rectangle from 'cesium/Source/Core/Rectangle';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import SiteCluster from 'async!../SiteCluster'; //{ SiteConsumer }
//import sitePickedLabel from 'async!../SiteCluster/sitePickedLabel';
import draggable_element from '../Compo/draggable_element';
import style from './style_modal';
import LayerModal from 'async!./LayerModal';
import Region from 'async!./Region';
import { EarthContext } from "../Earth/EarthContext";
import '../../style/style_modal_tab.scss'
/*
  export const siteLoader = createContext({
    loaded: false,
    cluster: null,
    customstyle: null
});
*/
const Layer = (props) => {
  const {viewer, baseName, userBase} = props;
  const [searchLayer, setSearchLayer] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { earth, setEarth } = useContext(EarthContext);
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
    const drag_opts = { dom: "#ctrl", dragArea: '#ctrlheader' };
    draggable_element(drag_opts);
    //enable_modalToggle();
    enable_search_listener();
    setEarth((preState) => ({
      ...preState,
      loaded: true,
    }));
  }, []);

  const render_datasource = () => {
      const opts = { // temporarily hard-coded here
        dataname: 'windpower',
        dataurl: 'https://ecodata.odb.ntu.edu.tw/pub/geojson/site/windpower_multi_4326.geojson',
        datacrs: 'EPSG:4326',
        icon: '../../assets/icons/windpower_blue01s.png',
        color: 'cyan',
        viewer: viewer
      };
      return (
        <SiteCluster opts={opts} />
      );
  };

  const sitePicker = () => {
    const {scene} = viewer;
    //const sitePickedLabel = () => {
      var handler = new ScreenSpaceEventHandler(scene.canvas);
      handler.setInputAction(function (movement) {
        let pickedLabel = scene.pick(movement.position);
        if (defined(pickedLabel)) {
          const ids = pickedLabel.id;
          if (Array.isArray(ids)) {
            for (var i = 0; i < ids.length; ++i) {
              ids[i].billboard.color = Color.fromCssColorString('#ff77ff');
            }
          }
        }
      }, ScreenSpaceEventType.LEFT_CLICK);
    //};
    // await sitePickedLabel();
    return(<div style="display:none" />);
  }

  const render_ImgLayer = () => {
    //render(<LayerModal viewer={viewer} />, document.getElementById('ctrlsectdiv2'));
    //userBase: default baselayer, but can be changed after user cookies set
    return(<LayerModal viewer={viewer} baseName={baseName} userBase={userBase} />);
  }

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
  console.log("Toggle modal: " + modalClass + " when isOpen is: " + isOpen);
  //<a href="#ctrl" and in css use &:target{display:block} to show modal
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
            <label for="tab-1" tabindex="0" />
            <input id="tab-1" type="radio" name="tabs" checked="true" aria-hidden="true" />
            <h2 data-toggle="tab">Layers</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                      <div id="regionsectdiv"><Region viewer={viewer} /></div>
                      <div id="ctrlsectdiv2">
                        { render_ImgLayer() }
                      </div>
                    </div>
                  </section>
              </div>
            <label for="tab-2" tabindex="1" />
            <input id="tab-2" type="radio" name="tabs" aria-hidden="true" />
            <h2 data-toggle="tab">Time</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                      <div id="timepicker">Just Test</div>
                    </div>
                  </section>
              </div>
            <label for="tab-3" tabindex="2" />
            <input id="tab-3" type="radio" name="tabs" aria-hidden="true" />
            <h2 data-toggle="tab">Clustering</h2>
              <div class={style.ctrlwrapper}>
                  <section class={style.ctrlsect}>
                    <div class={style.ctrlcolumn}>
                      <div id="ctrlsectdiv1" />
                    </div>
                  </section>
              </div>
          </div>
        </div>
      </div>
      { render_datasource() }
      { sitePicker() }
      { <div class="cesium-widget-credits" id="searchx" data-searchin="" data-searchout="" style="display:none">
           Now searching: {searchLayer}</div> }
    </Fragment>
  );
};
export default Layer;
