import { useEffect, useState, useRef } from 'preact/hooks';
//import NearFarScalar from 'cesium/Source/Core/NearFarScalar';
import knockout from 'cesium/Source/ThirdParty/knockout.js';
import bubble_labeler from '../Compo/bubble_labeler';
import style from '../style/style_ctrlmodal';

const TerrainViewModal = (props) => {
  const {scene} = props;
  const {globe} = scene;
  const ctrlRef = useRef(null);
//const [state, setState] = useState(false);
  const defValue = {
    near: 1000.0,
    far: 1000000.0,
    nearValue: 0.0,
    farValue: 1.0
  };
  const [viewModel, setViewModel] = useState({
  //enabled: true,
    near: defValue.near,
    far: defValue.far,
    nearValue: defValue.nearValue,
    farValue: defValue.farValue,
  });

  useEffect(() => {
      knockout.track(viewModel);
      knockout.applyBindings(viewModel, ctrlRef.current);
      setViewModel(kobind());
//    setState(true);
      bubble_labeler(".terrviewrange-wrap");
  }, []);

  const kobind = () => {
    function subscribeParameter(name) {
      knockout
        .getObservable(viewModel, name)
        .subscribe(function (newValue) {
           let nv = Number(newValue);
           nv = isNaN(nv)? defValue[name]: nv;
           globe._undergroundColorAlphaByDistance[name] = nv; //https://cesium.com/docs/cesiumjs-ref-doc/Globe.html
           //globe.frontFaceAlphaByDistance[name] = nv; //https://cesium.com/docs/cesiumjs-ref-doc/GlobeTranslucency.html
           return(nv);
        });
    }
    return({ near: subscribeParameter("near"),
             far: subscribeParameter("far"),
             nearValue: subscribeParameter("nearValue"),
             farValue: subscribeParameter("farValue") })
  };

  return (
    <div id="terrainviewctrl" ref={ctrlRef}>
      <table class={style.thinx}>
        <tbody>
         <tr>
          <td>Near distance</td>
          <td><span class="terrviewrange-wrap">
            <input type="range" class="range" style="height:20px;" min="0.0" max="1000000.0" step="1.0" data-bind="value: near, valueUpdate: 'input'" />
            <output class="bubble" style="font-size:9px;position:relative;top:-6px;" /></span>
          </td>
          <td>
            <input type="text" size="5" data-bind="value: near" />
          </td>
         </tr>
         <tr>
          <td>Far distance</td>
          <td><span class="terrviewrange-wrap">
            <input type="range" class="range" min="100000.0" max="3000000.0" step="1.0" data-bind="value: far, valueUpdate: 'input'" />
            <output class="bubble" style="font-size:9px;position:relative;top:0px;" /></span>
          </td>
          <td>
            <input type="text" size="5" data-bind="value: far" />
          </td>
         </tr>
         <tr>
          <td>Near alpha</td>
          <td><span class="terrviewrange-wrap">
            <input type="range" class="range" min="0.0" max="1.0" step="0.01" data-bind="value: nearValue, valueUpdate: 'input'" />
            <output class="bubble" style="font-size:9px;position:relative;top:0px;" /></span>
          </td>
          <td>
            <input type="text" size="5" data-bind="value: nearValue" />
          </td>
         </tr>
         <tr>
          <td>Far alpha</td>
          <td><span class="terrviewrange-wrap">
            <input type="range" class="range" min="0.0" max="1.0" step="0.01" data-bind="value: farValue, valueUpdate: 'input'" />
            <output class="bubble" style="font-size:9px;position:relative;top:0px;" /></span>
          </td>
          <td>
            <input type="text" size="5" data-bind="value: farValue" />
          </td>
         </tr>
        </tbody>
      </table>
    </div>
  );
};
export default TerrainViewModal;
