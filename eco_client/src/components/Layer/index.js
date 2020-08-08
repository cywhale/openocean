import { Fragment } from 'preact'; //render, createContext
import { useEffect, useState } from 'preact/hooks';
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
//import CtrlModal from 'async!./CtrlModal';
/*
  export const siteLoader = createContext({
    loaded: false,
    cluster: null,
    customstyle: null
});
*/
const Layer = (props) => {
  const {viewer} = props;
  const [searchLayer, setSearchLayer] = useState(null);
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
  useEffect(() => {
    const drag_opts = { dom: "#ctrl", dragArea: '#ctrlheader' };
    draggable_element(drag_opts);
    enable_search_listener();
  }, []);

  const render_datasource = () => {
      const opts = { // temporarily hard-coded here
        dataname: 'windpower',
        dataurl: 'https://ecodata.odb.ntu.edu.tw/pub/windpower_multi_4326.geojson',
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


  //<div style="display:flex;height:auto;position:absolute;bottom:29px;left:400px">
  return (
    <Fragment>
      <div class={style.toolToggle}>
         <a class={style.toolButn} href="#ctrl"><i></i></a>
      </div>
      <div id="ctrl" class={style.modalOverlay}>
        <div class={style.modalHeader} id="ctrlheader">
          Contrl clustering
          <a href="#" class={style.close}>&times;</a>
        </div>
        <div class={style.modal}>
          <div class={style.ctrlwrapper}>
            <section class={style.ctrlsect}>
              <div class={style.ctrlcolumn}>
                <div id="ctrlsectdiv1" />
                <div id="ctrlsectdiv2" />
              </div>
            </section>
          </div>
        </div>
      </div>
      { render_datasource() }
      { sitePicker() }
      { <div class="cesium-widget-credits" id="searchx" data-searchin="" data-searchout="",style="display:none">
           Now searching: {searchLayer}</div> }
    </Fragment>
  );
};
export default Layer;
