import { useEffect, useState, useRef } from 'preact/hooks';
//import defined from 'cesium/Source/Core/defined.js';
//import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin.js';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
//import siteClusterStyling from './siteClusterStyling';
import style from './style_ctrlmodal';
import '../style/style_bubblelabel.scss';
//import '../style/style_arialabel.scss';

const CtrlModal = (props) => {
  const {scene, dataSource} = props; //Pins, removeListener, siteClusterStyling
  const ctrlRef = useRef(null);
  const [state, setState] = useState(false);
  const [viewModel, setViewModel] = useState({
    enabled: true, //clusterEnable,
    pixelRange: 15, //clusterRange,
    minimumClusterSize: 3
  });

  //https://css-tricks.com/value-bubbles-for-range-inputs/
  const bubble_labeler = () => {
    const setBubble = (range, bubble) => {
      const val = range.value;
      const min = range.min ? range.min : 0;
      const max = range.max ? range.max : 100;
      const newVal = Number(((val - min) * 100) / (max - min));
      bubble.innerHTML = val;
      // Sorta magic numbers based on size of the native UI thumb
      bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
    };

    const allRanges = document.querySelectorAll(".ctrlrange-wrap");
    allRanges.forEach(wrap => {
      const range = wrap.querySelector(".range");
      const bubble = wrap.querySelector(".bubble");
      range.addEventListener("input", () => {
        setBubble(range, bubble);
      });
      setBubble(range, bubble);
    });
  };

  useEffect(() => {
      knockout.track(viewModel);
      knockout.applyBindings(viewModel, ctrlRef.current);
      setViewModel(kobind());
      setState(true);
      bubble_labeler();
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
  return (
    <div ref={ctrlRef}>
      <table style="color:antiquewhite;">
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
            <input type="range" class="range" min="1" max="200" step="1" data-bind="value: pixelRange, valueUpdate: 'input'" />
            <output class="bubble" />
            </span>
          </td>
         </tr>
         <tr>
          <td>Minimum Cluster Size</td>
          <td><span class="ctrlrange-wrap">
            <input type="range" class="range" min="2" max="20" step="1" data-bind="value: minimumClusterSize, valueUpdate: 'input'" />
            <output class="bubble" />
            </span>
          </td>
         </tr>
        </tbody>
      </table>
    </div>
  );
};
export default CtrlModal;
