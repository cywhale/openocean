import { Fragment } from 'preact';
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
import style from '../style/style_layerctrl.scss';

const MousePos = (props) => {
  const { viewer, terr_opts } = props;
  const { scene } = viewer;
  const [state, setState] = useState({
    init: false,
    show: 'none', //'show', 'label', 'none'
    //posPrint: null,
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
  });

  const showPosPick = () => {
    let showx = '';
    let entity = state.posMove;
    //if (showx === 'show') {
    //  showx = 'label'
    //} else
    if (state.show === 'show') {
      showx = 'none';
      state.handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      entity.label.show = false;
    } else {
      showx = 'show'; //'label'
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
  const sitePicker = async () => { //useCallback(
    //const {scene} = viewer;
    let handler = new ScreenSpaceEventHandler(scene.canvas);

    await handler.setInputAction(function (movement) {
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
/*      if (state.show === 'label') {
          let ray = viewer.camera.getPickRay(movement.position);
          let cartesian = scene.globe.pick(ray, scene);
          if (defined(cartesian)) {
            if (state.posPrint !== null) {
              viewer.entities.remove(state.posPrint);
            }
            labelCoordinates(cartesian);
          }
        }*/

  const labelPosition = (cartesian, enable_elev=false, min=null, max=null) => {
          let cartographic = Cartographic.fromCartesian(cartesian);
          let longitudeString = CesiumMath.toDegrees(cartographic.longitude).toFixed(4);
          let latitudeString = CesiumMath.toDegrees(cartographic.latitude).toFixed(4);

          let ltext =
            "Lon: " +
            ("   " + longitudeString).slice(-9) +
            "\u00B0" +
            "\nLat: " +
            ("   " + latitudeString).slice(-9) +
            "\u00B0";
          if (enable_elev) {
            let elevation = viewer.scene.globe.getHeight(cartographic)
            let eleString = Number(elevation).toFixed(2) + " m";
            if (min !== null) {
              if (elevation < min) eleString = Number(min).toFixed(2) + " m (minimum)"
            }
            if (max !== null) {
              if (elevation > max) eleString = Number(max).toFixed(2) + " m (maximum)"
            }
            ltext = ltext + "\nElevation: " + eleString;
          }
          return(ltext);
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

  return (
      <Fragment>
            <button class={style.ctrlbutn} id="pospickbutn" onClick={showPosPick}>
               {state.show === 'none'? 'Show position' : 'Position off'}</button>
      </Fragment>
  )
};
export default MousePos;
