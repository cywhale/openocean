import { useEffect, useState, useRef } from 'preact/hooks';
//import { Fragment } from 'preact';
//import defined from 'cesium/Source/Core/defined.js';
//import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin.js';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
//import siteClusterStyling from './siteClusterStyling';
import bubble_labeler from '../Compo/bubble_labeler';
import style from './style_ctrlmodal';
//import '../style/style_bubblelabel.scss';
//import '../style/style_arialabel.scss';
//import {Checkbox} from '@rmwc/checkbox';

const CtrlModal = (props) => {
  const { scene, dataSource } = props; //Pins, removeListener, siteClusterStyling
//const { scene } = viewer;
  const ctrlRef = useRef(null);
  const [state, setState] = useState(false);
  const [viewModel, setViewModel] = useState({
    enabled: true, //clusterEnable,
    pixelRange: 15, //clusterRange,
    minimumClusterSize: 3
  });

  useEffect(() => {
      knockout.track(viewModel);
      knockout.applyBindings(viewModel, ctrlRef.current);
      setViewModel(kobind());
      setState(true);
      bubble_labeler(".ctrlrange-wrap");
  }, []);

  const kobind = () => {
    function subscribeParameter(name) {
      knockout
        .getObservable(viewModel, name)
        .subscribe(function (newValue) {
           dataSource.clustering[name] = newValue;
        });
    }
    return({ enabled: subscribeParameter("enabled"),
             pixelRange: subscribeParameter("pixelRange"),
             minimumClusterSize: subscribeParameter("minimumClusterSize") })
  };

  //https://knockoutjs.com/documentation/enable-binding.html
  //<button data-bind="submit: siteClusterStyling()">Custom styling</button>
  //<input type="text" size="2" data-bind="value: pixelRange" />
  //<input type="text" size="2" data-bind="value: minimumClusterSize" />
  //<Checkbox label='Marker Clustering' checked="true"  data-bind="checked: enabled" />
  //const className=`"bubble" ${style.bubblex}`
  return (
    <div id="sitectrl" ref={ctrlRef}>
      <table class={style.thinx}>
        <tbody>
         <tr>
          <td>Marker Clustering</td>
          <td>
            <div class={style.ctrlEnDiv}><input type='checkbox' checked="true" data-bind="checked: enabled" /></div>
          </td>
         </tr>
         <tr>
          <td>Clustering Range</td>
          <td><span class="ctrlrange-wrap">
            <input type="range" class="range" style="height:20px;" min="1" max="200" step="1" data-bind="value: pixelRange, valueUpdate: 'input'" />
            <output class="bubble" style="font-size:9px;position:relative;top:-6px;" />
            </span>
          </td>
         </tr>
         <tr>
          <td>Minimum Cluster Size</td>
          <td><span class="ctrlrange-wrap">
            <input type="range" class="range" style="height:20px;" min="2" max="20" step="1" data-bind="value: minimumClusterSize, valueUpdate: 'input'" />
            <output class="bubble" style="font-size:9px;position:relative;top:-6px;" />
            </span>
          </td>
         </tr>
        </tbody>
      </table>
    </div>
  );
};
export default CtrlModal;
