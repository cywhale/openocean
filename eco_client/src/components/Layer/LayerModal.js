import { useEffect, useState, useRef } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color.js';
import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import Rectangle from 'cesium/Source/Core/Rectangle';
import SingleTileImageryProvider from 'cesium/Source/Scene/SingleTileImageryProvider';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
// follow SiteCluster/CtrlModal.js knouout code
import bubble_labeler from '../Compo/bubble_labeler';
import '../style/style_bubblelabel.scss';

const LayerModal = (props) => {
  const {viewer} = props;
  const layers = viewer.imageryLayers;
  const baseLayer = layers.get(0);
  const ctrlRef = useRef(null);
  //const [state, setState] = useState(false);
  const [viewModel, setViewModel] = useState({
    imgalpha: 0.5
  });

  useEffect(() => {
      knockout.track(viewModel);
      knockout.applyBindings(viewModel, ctrlRef.current);
      setViewModel(kobind());
      //setState(true);
      bubble_labeler(".ctrlrange-wrap2");
  }, []);

  const kobind = () => {
    function subscribeParameter(name) {
      knockout
        .getObservable(viewModel, name)
        .subscribe(function (newValue) {
           sTileImg.alpha = newValue;
        });
    }
    return({ imgalpha: subscribeParameter("imgalpha") })
  };

  //if add a new layer...
  const evlay01url = 'https://ecodata.odb.ntu.edu.tw/pub/img/chla_neo_202004.png'; //'https://neo.sci.gsfc.nasa.gov/servlet/RenderData?si=1787328&cs=rgb&format=PNG&width=3600&height=1800';
  //baseLayer.colorToAlpha = new Color(0.0, 0.016, 0.059);
  //baseLayer.colorToAlphaThreshold = 0.5;

  const sTileImg = layers.addImageryProvider(
      new SingleTileImageryProvider({
        url: evlay01url,
        //rectangle: new Cesium.Rectangle(bnds[0], bnds[1], bnds[2], bnds[3]),
        rectangle: Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
        //numberOfLevelZeroTilesX: 1,
        //numberOfLevelZeroTilesY: 1,
        defaultAlpha: 0.5,
        //parameters: {transparent : 'true',
        //           //alpha: 0.5,
        //             format : 'image/png'},
        proxy : new DefaultProxy('/proxy/') //https://github.com/CesiumGS/EarthKAMExplorer/blob/master/server/server.js
      })
  );

  sTileImg.alpha = 0.5

  //const tms = new Cesium.UrlTemplateImageryProvider({...})
  //tms.alpha = 0.7;
/*
    viewer.imageryLayers.addImageryProvider(tms);
    var options = {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
    };*/

  return (
    <div ref={ctrlRef}>
      <table style="color:antiquewhite;">
      <tbody>
       <tr>
         <td>Overlay transparency</td>
         <td><span class="ctrlrange-wrap2">
          <input type="range"  class="range" min="0.0" max="1.0" step="0.01" data-bind="value: imgalpha, valueUpdate: 'input'" />
          <output class="bubble" />
          </span>
         </td>
       </tr>
      </tbody>
      </table>
    </div>
  )
}
export default LayerModal;
