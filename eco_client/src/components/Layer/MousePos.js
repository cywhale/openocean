import { Fragment, render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import Color from 'cesium/Source/Core/Color';
//import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import defined from 'cesium/Source/Core/defined';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
import Cartographic from 'cesium/Source/Core/Cartographic';
import CesiumMath from 'cesium/Source/Core/Math';
//import Rectangle from 'cesium/Source/Core/Rectangle';
import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType';
import HorizontalOrigin from 'cesium/Source/Scene/HorizontalOrigin';
import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin';
import style from './style_modal';
import style_ctrl from '../style/style_ctrlcompo.scss';

const MousePos = (props) => {
  const { viewer, terr_opts } = props;
  const { scene } = viewer;
  const [state, setState] = useState({
    init: false,
    show: 'none', //'show', 'none', 'dclick'
    dclick: 0,// instead of double-click(cannot used on mobile), click button to switch state, then click on canvas
    dclick_chk_dialog: false,
    dclick_pos: null,
    posHome: null,
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
      state.handlerDclick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
      sitePicker(false);
      state.handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      entity.label.show = false;
    } else {
      if (state.show == 'show') {
        showx = 'dclick';
        state.handlerDclick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
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
            //dclick: true,
              dclick_pos: cartesian
            }))

            if (!state.dclick_chk_dialog) { //auto open dialog to see point position
              history.pushState(null, null, '#details');
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
            getDclickPos(cartesian);
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
    }, ScreenSpaceEventType.LEFT_DOWN);
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

          let elevation = null;
          if (enable_elev) {
            elevation = viewer.scene.globe.getHeight(cartographic)
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
            return({lon: lon, lat: lat, elevation: elevation, label: ltext})
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
    /*if (state.dclick) {
        state.handlerDclick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
        sitePicker(true);
      }
      setState((prev) => ({
         ...prev,
         dclick: false,
      }))*/
      history.pushState(null, null, '#close');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  const getDclickPos = (cartesian) => {
    let posx;
  //let cartesian = state.dclick_pos;
  //if (state.dclick_pos === null) {
  //} else {
      if (terr_opts.enable) {
        posx = labelPosition(cartesian, true, terr_opts.min, terr_opts.max, true);
      } else {
        posx = labelPosition(cartesian, false, null, null, true);
      }
  //}
    if (posx.lon && posx.lat) {
      document.getElementById("lontxt").value=Number(posx.lon).toFixed(4);
      document.getElementById("lattxt").value=Number(posx.lat).toFixed(4);
      document.getElementById("eletxt").value=posx.elevation===null? '' : posx.elevation;
      document.getElementById("labeltxt").value=posx.label;
    }
  };

  const getInputPos = () => {
    let lon = parseFloat(document.getElementById("lontxt").value);
    let lat = parseFloat(document.getElementById("lattxt").value);
    let ele = parseFloat(document.getElementById("eletxt").value);
    let elex= isNaN(ele)? 1000000.0 : ele;
    console.log("Debug set elevation: ", elex);


    if (isNaN(lon) || isNaN(lat) || lon > 180.0 || lon < -180.0 || lat > 90.0 || lat < -90.0) {
      alert("Wrong format of decimal longitude/latitude. Check it!\n" +
            "請檢查是否為錯誤的經緯度十進位格式");
      return null;
    }
    return(Cartesian3.fromDegrees(lon, lat, elex));
  };

  const labelBtnx = () => {
    let ltext = document.getElementById("labeltxt").value;
    let namex = (state.dclick + 1).toString();
    let posx = getInputPos();

    if (posx !== null) {
      let entity = viewer.entities.add({
          position: posx,
          name: namex,
          label: {
            text: ltext === ''? namex: ltext,
            showBackground: true,
            font: "12px monospace",
          }
      });
      return (
        setState((prev) => ({
          ...prev,
          dclick: prev.dclick + 1,
          posPrint: [...prev.posPrint, entity],
        }))
      )
    }
  };

  const delLabelBtnx = (index) => {
    let entity = state.posPrint[index];
    if (viewer.entities.contains(entity)) {
      viewer.entities.remove(entity)
    }
    return (
      setState((prev) => ({
          ...prev,
          posPrint: [...prev.posPrint.slice(0, index), ...prev.posPrint.slice(index+1, state.posPrint.length)],
      }))
    )
  };

  const flyToBtnx = () => {
    let posx = getInputPos();
    if (posx !== null) {
      viewer.camera.flyTo({
        destination: posx,
      /*orientation: {
        heading: Cesium.Math.toRadians(20.0),
        pitch: Cesium.Math.toRadians(-35.0),
        roll: 0.0,
      },*/
      });
    }
  };

  const onHomex = (position) => {
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
      function(e) {
        e.cancel = true;
        console.log("Debug fly home: ", position);
        viewer.camera.flyTo({destination: position});
    });

  }
  const asHomeBtnx = async (position) => {
    if (position && position !== null) {
      let entity = viewer.entities.add({
          position: position,
      });
      console.log("Debug set home: ", entity.position);
      entity.show = false;

      if (state.posHome !== null) {
        viewer.entities.remove(state.posHome);
        viewer.homeButton.viewModel.command.beforeExecute.removeEventListener(onHomex, viewer);
      }
      setState((prev) => ({
          ...prev,
          posHome: entity,
      }))
      onHomex(position);
    }
  };

  const render_popupModal = () => {
/*    { state.dclick &&
      <div class={style.dclickdiv} style="width:auto;max-width:18em;top:15%;left:18%;position:absolute;">
        <div id="dclick" class={style.modalOverlay}>
          <div class={style.modalHeader} id="dclickHeader" style="width:98%;min-width:98%">
            <a id="dclickClose" class={style.close} onClick={()=>{closeDclickBtnx()}}>&times;</a>
          </div>
        </div></div> }
          {Array.from({ length: this.state.periods }, (_, index) => (
            <PeriodButtonContainer key={index} />
          ))}*/
    return(
      render(
      <Fragment>
          <div class={style.modal} style="width:98%;min-width:98%">
            <div class={style.ctrlwrapper}>
              <section class={style.ctrlsect}>
                <div class={style.ctrlcolumn}>
                  <p class={style_ctrl.flexpspan}>
                    <span>Lon/Lat/Elevation:&nbsp;
                           <input id="lontxt" type="text" size="9" style="max-width:63px;" />°&nbsp;
                           <input id="lattxt" type="text" size="9" style="max-width:63px;" />°&nbsp;
                           <input id="eletxt" type="text" size="9" style="max-width:63px;" />(m)</span>
                  </p>
                  <p class={style_ctrl.flexpspan}>
                    <span>Label:&nbsp;<textarea id="labeltxt" style="max-width:130px;height:auto" /></span>
                    <span><button id="labelbutn" class={style_ctrl.ctrlbutn} onClick={()=>{labelBtnx()}}>Label position</button></span>
                  </p><hr/>
                  <div class={style_ctrl.flexpspan}>
                    {Array.from({ length: state.posPrint.length }, (_, index) => (
                        <button key={index} class={style_ctrl.ctrlbutn}
                                onClick={()=>{delLabelBtnx(index)}}>Delete {state.posPrint[index].name}
                        </button>
                    ))}
                    <button id="flytobutn" class={style_ctrl.ctrlbutn} onClick={()=>{flyToBtnx()}}>Flyto position</button>
                    <button id="ashomebutn" class={style_ctrl.ctrlbutn}
                            onClick={()=>{
                              let position = getInputPos();
                              asHomeBtnx(position);
                            }}>Set as home</button>
                    <button id="dclickClose" class={style_ctrl.ctrlbutn} onClick={()=>{closeDclickBtnx()}}>Ok</button>
                    <span><input id="manopenchk" style="width:auto;" type="checkbox"
                        onClick={() => {
                          setState((prev) => ({
                            ...prev,
                            dclick_chk_dialog: !prev.dclick_chk_dialog,
                          }))
                        }}
                        aria-label='Manually open dialog 手動開啟對話窗' />Manually open dialog</span>
                </div>
                </div>
              </section>
            </div>
          </div>
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
