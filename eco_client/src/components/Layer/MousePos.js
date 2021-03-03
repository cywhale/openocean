import { Fragment, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import defined from 'cesium/Source/Core/defined';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';
//import Rectangle from 'cesium/Source/Core/Rectangle';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import HorizontalOrigin from 'cesium/Source/Scene/HorizontalOrigin';
import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin';
import style from './style_modal';
import style_ctrl from '../style/style_layerctrl.scss';

const MousePos = (props) => {
  const { viewer, terr_opts } = props;
  const { scene } = viewer;
  const [state, setState] = useState({
    init: false,
    show: 'none', //'show', 'none', 'dclick'
    dclick: false,// instead of double-click(cannot used on mobile), click button to switch state, then click on canvas
    dclick_pos: null,
    posPrint: [],
    posMove: viewer.entities.add({
        position: null,
        label: {
            show: false,
            showBackground: true,
            font: "12px monospace",
            horizontalOrigin: HorizontalOrigin.LEFT,
            verticalOrigin: VerticalOrigin.TOP,
            pixelOffset: new Cartesian2(15, 0)
        }
    }),
    handlerMove: new ScreenSpaceEventHandler(scene.canvas),
    handlerDclick: new ScreenSpaceEventHandler(scene.canvas),
  });

  const showPosPick = () => {
    let showx = '';
    let entity = state.posMove;
    if (state.show === 'dclick') {
      showx = 'none';
      state.handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      entity.label.show = false;
    } else {
      if (state.show == 'show') {
        showx = 'dclick';
        state.handlerDclick.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        sitePicker(true);
      } else {
        showx = 'show';
      }
      if (terr_opts.enable) {
        posElevPicker(terr_opts.min, terr_opts.max);
      } else {
        posPicker();
      }
    }
    return (
      setState((prev) => ({
        ...prev,
        show: showx,
      }))
    )
  }
/*
  const labelCoordinates = (cartographic) => {
    let position = Cartographic.toCartesian(cartographic);
    let latitude = toDegrees(cartographic.latitude).toFixed(4);
    let longitude = toDegrees(cartographic.longitude).toFixed(4);
    let label = "lat: " + latitude + "°\nlon: " + longitude + "°";

    return (
      setState((prev) => ({
        ...prev,
        posPrint: viewer.entities.add({
          position: position,
          label: {
            text: label,
            showBackground: true,
            font: "12px monospace",
          }
        })
      }))
    )
  }
*/
  const sitePicker = (dclick=false) => { //useCallback(
    //const {scene} = viewer;
    //let handler = new ScreenSpaceEventHandler(scene.canvas);
    state.handlerDclick.setInputAction(function (movement) {
        if (dclick) {
          let ray = viewer.camera.getPickRay(movement.position);
          let cartesian = scene.globe.pick(ray, scene);

          if (defined(cartesian)) {
            setState((prev) => ({
              ...prev,
              dclick: true,
              dclick_pos: cartesian
            }))
          }
        }

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
  }

  const labelPosition = (cartesian, enable_elev=false, min=null, max=null, return_pos=false) => {
          let cartographic = Cartographic.fromCartesian(cartesian);
          let lon = CesiumMath.toDegrees(cartographic.longitude);
          let lat = CesiumMath.toDegrees(cartographic.latitude);
          let longitudeString = Number(lon).toFixed(4);
          let latitudeString = Number(lat).toFixed(4);

          let ltext =
            "Lon: " +
            ("   " + longitudeString).slice(-9) +
            "\u00B0" +
            "\nLat: " +
            ("   " + latitudeString).slice(-9) +
            "\u00B0";
          if (enable_elev) {
            let elevation = viewer.scene.globe.getHeight(cartographic)
            let eleString = Number(elevation).toFixed(2) + "m";
            if (min !== null) {
              if (elevation < min) eleString = Number(min).toFixed(2) + "m (minimum)"
            }
            if (max !== null) {
              if (elevation > max) eleString = Number(max).toFixed(2) + "m (maximum)"
            }
            ltext = ltext + "\nElevation: " + eleString;
          }

          if (!return_pos) {
            return(ltext)
          } else {
            return({lon: lon, lat: lat, label: ltext})
          }
  }

  const posPicker = () => {
    //const {scene} = viewer;
    //let handler = new ScreenSpaceEventHandler(scene.canvas);

    state.handlerMove.setInputAction(function (movement) {
      let entity = state.posMove;
      //if (state.show !== 'none') {
        let cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          scene.globe.ellipsoid
        );
        if (cartesian) {
          entity.position = cartesian;
          entity.label.show = true;
          entity.label.text = labelPosition(cartesian, false);
        } else {
          entity.label.show = false;
        }
      //} else {
      //  entity.label.show = false;
      //}
      scene.requestRender();
    }, ScreenSpaceEventType.MOUSE_MOVE);
  };

  const posElevPicker = (terr_min=null, terr_max=null) => {
    state.handlerMove.setInputAction(function (movement) {
      let entity = state.posMove;
        let cartesian = viewer.camera.pickEllipsoid(
          movement.endPosition,
          scene.globe.ellipsoid
        );

        if (cartesian) {
          entity.position = cartesian;
          entity.label.show = true;
          entity.label.text = labelPosition(cartesian, true, terr_min, terr_max);
        } else {
          entity.label.show = false;
        }
      scene.requestRender();
    }, ScreenSpaceEventType.MOUSE_MOVE);
  };

  useEffect(() => {
    if (!state.init) {
      sitePicker();
      //dclickPicker();
      setState((prev) => ({
         ...prev,
         init: true,
      }))
    }
    if (terr_opts.enable) {
      if (state.show === 'none') {
        setState((prev) => ({
          ...prev,
           show: 'show',
        }))
      }
      state.handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      posElevPicker(terr_opts.min, terr_opts.max);
    } else if (!terr_opts.enable && state.show !== 'none') {
      state.handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      posPicker();
    }
  }, [terr_opts.enable])

/* Double_click to set point and set home // But cannot used on mobile
  const dclickPicker = () => {
    state.handlerDclick.setInputAction(function (movement) {
        let ray = viewer.camera.getPickRay(movement.position);
        let cartesian = scene.globe.pick(ray, scene);

        if (defined(cartesian)) {
          setState((prev) => ({
            ...prev,
            dclick: true,
            dclick_pos: cartesian
          }))
        }
      //scene.requestRender();
    }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  };
*/
  const closeDclickBtnx = () => {
      setState((prev) => ({
         ...prev,
         dclick: false,
      }))
  };

  const render_popupModal = () => {
    let posx;
    if (state.dclick_pos === null) {
      console.log("Warning: not received double_click position");
    } else {
      if (terr_opts.enable) {
        posx = labelPosition(state.dclick_pos, true, terr_opts.min, terr_opts.max, true);
      } else {
        posx = labelPosition(state.dclick_pos, false, null, null, true);
      }
    }
    return(
      render(
      <Fragment>
      { state.dclick &&
        <div class={style.dclickdiv} style="width:auto;max-width:18em;top:15%;left:18%;position:absolute;">
        <div id="dclick" class={style.modalOverlay}>
          <div class={style.modalHeader} id="dclickHeader" style="width:98%;min-width:98%">
            <a id="dclickClose" class={style.close} onClick={()=>{closeDclickBtnx()}}>&times;</a>
          </div>
          <div class={style.modal} style="width:98%;min-width:98%">
            <div class={style.ctrlwrapper}>
              <section class={style.ctrlsect}>
                <div class={style.ctrlcolumn}>
                  <span>Location: {posx.label}</span>
                </div>
              </section>
            </div>
          </div>
        </div></div>
      }
      </Fragment>, document.getElementById("dclickPopupdiv"))
    );
  };

  return (
      <Fragment>
          <button class={style_ctrl.ctrlbutn} id="pospickbutn" onClick={showPosPick}>
            {state.show === 'none'? 'Show position' : state.show === 'show'? 'Set position' : 'Position off'}</button>
          { render_popupModal() }
      </Fragment>
  )
};
export default MousePos;
