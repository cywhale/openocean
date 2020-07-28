import { useEffect, useRef } from 'preact/hooks';
import defined from 'cesium/Source/Core/defined.js';
import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin.js';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
//import customStyle from '../Earth/SiteCluster';
import style from './style_Modal.scss'; //https://codepen.io/thomgriggs/pen/EbGAK

var viewModel = {
    clusterEnable: true, //clusterEnable,
    clusterRange: 15, //clusterRange,
    minCluster: 3,
    transparency: 0.5
};

const CtrlModal = (props) => {
  const {scene, dataSource, customstyle} = props;
  const toolmodal = useRef(null);

  useEffect(() => {
    kobind();
  }, [dataSource]);

  const kobind = () => {
    if (dataSource) {
        knockout.track(viewModel);

        //var toolbar = document.getElementById("toolbar");
        knockout.applyBindings(viewModel, toolmodal.current);

        function subscribeParameter(name) {
          knockout
            .getObservable(viewModel, name)
            .subscribe(function (newValue) {
              dataSource.clustering[name] = newValue;
            });
        }
        subscribeParameter("clusterEnable");
        subscribeParameter("clusterRange");
        subscribeParameter("minCluster");
        subscribeParameter("transparency");


      //Sandcastle.addToggleButton("Enabled", true, function (checked) {
      //  dataSource.clustering.enabled = checked;
      //});

      //Sandcastle.addToggleButton("Custom Styling", true, function (
      //  checked
      //) {
      //  customStyle();
      //});
    } // has dataSource
  };

  return (
    <div style="display:flex;height:auto;">
      <div class={style.toolToggle}>
         <a class={style.toolButn} href="#ctrl"><i></i></a>
      </div>
      <div id="ctrl" class={style.modaloverlay}>
        <div class={style.modal} ref= {toolmodal}>
          <a href="#" class={style.close}>&times;</a>

      <div class={style.ctrlwrapper}>
      <section class={style.ctrlsect}>
	<div class={style.ctrlcolumn}>
        <table style="color:antiquewhite;">
        <tbody>
         <tr>
          <td>Marker Clustering</td>
          <td>
           <input type='checkbox' checked="true" data-bind="checked: clusterEnable" />
           <button data-bind="enable: customstyle()">Custom styling</button>
          </td>
         </tr>
         <tr>
          <td>Clustering Range</td>
          <td>
            <input type="range" min="1" max="200" step="1" data-bind="value: clusterRange, valueUpdate: 'input'" />
            <input type="text" size="2" data-bind="value: clusterRange" />
          </td>
         </tr>
         <tr>
          <td>Minimum Cluster Size</td>
          <td>
            <input type="range" min="2" max="20" step="1" data-bind="value: minCluster, valueUpdate: 'input'" />
            <input type="text" size="2" data-bind="value: minCluster" />
          </td>
         </tr>
        </tbody>
        </table>
        </div>

        <div class={style.ctrlcolumn}>
        <table style="color:antiquewhite;">
        <tbody>
         <tr>
           <td>Overlay transparency</td>
           <td>
            <input type="range" min="0.0" max="1.0" step="0.01" data-bind="value: transparency, valueUpdate: 'input'" />
           </td>
         </tr>
        </tbody>
        </table>
        </div>
      </section>
      </div>

      </div>
     </div>
   </div>
  );
};
export default CtrlModal;
export const clusterOpts = {
        clusterEnable: viewModel.clusterEnable,
	clusterRange: viewModel.clusterRange,
        minCluster: viewModel.minCluster };
export const overlayOpts = { transparency: viewModel.transparency };
