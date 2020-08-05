import { Fragment } from 'preact'; //render, createContext
import Color from 'cesium/Source/Core/Color.js';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import defined from 'cesium/Source/Core/defined.js';
//import Rectangle from 'cesium/Source/Core/Rectangle';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import SiteCluster from 'async!../SiteCluster'; //{ SiteConsumer }
//import sitePickedLabel from 'async!../SiteCluster/sitePickedLabel';

import style from './style_Modal';
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

  const sitePicker = () => { //async
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

  //<div style="max-width:100px">
  return (
    <Fragment>
    <div style="display:flex;height:auto;" id="ctrlmodal">
      <div class={style.toolToggle}>
         <a class={style.toolButn} href="#ctrl"><i></i></a>
      </div>
      <div id="ctrl" class={style.modaloverlay}>
        <div class={style.modal}>
          <a href="#" class={style.close}>&times;</a>

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
    </div>
    { render_datasource() }
    { sitePicker() }
    </Fragment>
  );
};
export default Layer;
