import Color from 'cesium/Source/Core/Color.js';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import defined from 'cesium/Source/Core/defined.js';
import Rectangle from 'cesium/Source/Core/Rectangle';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import SiteCluster, { SiteConsumer } from './SiteCluster';
import CtrlModal from './CtrlModal';

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

  const render_ctrlmodal = () => {
      const {scene} = viewer;

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

      return (
        <SiteConsumer>
        { data => {
          const {loaded, cluster, customstyle} = data;
          //if (loaded) {
            return (<CtrlModal scene={scene} dataSource={cluster} customstyle={customstyle}/>);
          }
        }
        </SiteConsumer>
      );
  };

  return (
    <div style="max-width:100px">
        { render_ctrlmodal() }
        { render_datasource() }
    </div>
  );


};
export default Layer;

