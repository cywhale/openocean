import { Fragment, render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
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
import Dialog from '../Compo/Dialog';
import style from './style_modal';
import style_ctrl from '../style/style_ctrlcompo.scss';

const MousePos = (props) => {
  const { viewer, terr_opts } = props;
  const { scene } = viewer;
  const [homepopup, setHomepopup] = useState(false);
  const [state, setState] = useState({
    init: false,
    show: 'none', //'show', 'none', 'dclick'
    dclick: 0,// instead of double-click(cannot used on mobile), click button to switch state, then click on canvas
    dclick_chk_dialog: false,
    dclick_pos: null,
    prefer_home_chk: false,
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
      sitePicker(false, state.dclick_chk_dialog, terr_opts.enable);
      state.handlerMove.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      entity.label.show = false;
    } else {
      if (state.show == 'show') {
        showx = 'dclick';
        state.handlerDclick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
        sitePicker(true, state.dclick_chk_dialog, terr_opts.enable);
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

  const sitePicker = (dclick=false, checked=false, terr_enable=false) => {
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

            if (!checked) { //auto open dialog to see point position
              history.pushState(null, null, '#details');
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
            getDclickPos(cartesian, terr_enable);
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
            elevation = viewer.scene.globe.getHeight(cartographic);
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
      sitePicker(false, false, false);
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

  const chkDclickDialog = (e) => {
    e.preventDefault();
    let checked = !state.dclick_chk_dialog;
    state.handlerDclick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
    sitePicker(true, checked, terr_opts.enable);

    setState((prev) => ({
      ...prev,
      dclick_chk_dialog: checked,
    }))
  };

  const getDclickPos = (cartesian, terr_enable) => {
    let posx;
    if (terr_enable) {
        posx = labelPosition(cartesian, true, terr_opts.min, terr_opts.max, true);
      } else {
        posx = labelPosition(cartesian, false, null, null, true);
      }
    if (posx.lon && posx.lat) {
      document.getElementById("lontxt").value=Number(posx.lon).toFixed(4);
      document.getElementById("lattxt").value=Number(posx.lat).toFixed(4);
      document.getElementById("eletxt").value=posx.elevation===null? '' : posx.elevation;
      document.getElementById("labeltxt").value=posx.label;
    }
  };

  const onLonInput = (e) => {
    let ltext =
        "Lon: " +
        ("   " + e.target.value).slice(-9) +
        "\u00B0";
    let latx = document.getElementById("lattxt").value;
    if (latx !== "") {
        ltext = ltext + "\nLat: " + ("   " + latx).slice(-9) + "\u00B0";
    }
    let elex = document.getElementById("eletxt").value;
    if (elex !== "") {
        ltext = ltext + "\nElevation: " + elex + "m";
    }
    document.getElementById("labeltxt").value = ltext;
  }

  const onLatInput = (e) => {
    let ltext = "";
    let lonx = document.getElementById("lontxt").value;
    if (lonx !== "") {
        ltext = "Lon: " + ("   " + lonx).slice(-9) + "\u00B0";
    }
    ltext = ltext +
        "\nLat: " +
        ("   " + e.target.value).slice(-9) +
        "\u00B0";
    let elex = document.getElementById("eletxt").value;
    if (elex !== "") {
        ltext = ltext + "\nElevation: " + elex + "m";
    }
    document.getElementById("labeltxt").value = ltext;
  }

  const onEleInput = (e) => {
    let ltext = "";
    let lonx = document.getElementById("lontxt").value;
    if (lonx !== "") {
        ltext = "Lon: " + ("   " + lonx).slice(-9) + "\u00B0";
    }
    let latx = document.getElementById("lattxt").value;
    if (latx !== "") {
        ltext = ltext + "\nLat: " + ("   " + latx).slice(-9) + "\u00B0";
    }
    ltext = ltext + "\nElevation: " + e.target.value + "m";

    document.getElementById("labeltxt").value = ltext;
  }

  const getInputPos = () => {
    let lon = parseFloat(document.getElementById("lontxt").value);
    let lat = parseFloat(document.getElementById("lattxt").value);
    let ele = parseFloat(document.getElementById("eletxt").value);
    let elex= isNaN(ele)? 1000000.0 : ele;

    if (isNaN(lon) || isNaN(lat) || lon > 180.0 || lon < -180.0 || lat > 90.0 || lat < -90.0) {
      alert("Wrong format of decimal longitude/latitude. Check it!\n" +
            "請檢查是否為錯誤的經緯度十進位格式");
      return null;
    }
    return(Cartesian3.fromDegrees(lon, lat, elex));
  };

  const labelBtnx = () => {
    if (state.show !== 'dclick') {
      if (state.show === 'none') {
        if (terr_opts.enable) {
          posElevPicker(terr_opts.min, terr_opts.max);
        } else {
          posPicker();
        }
      }
      setState((sta) => {
        sta.show = 'dclick'
        return(sta);
      });
      state.handlerDclick.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);
      sitePicker(true, state.dclick_chk_dialog, terr_opts.enable);
    }
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
    //flyToBtnx(posx);
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

  const flyToBtnx = (position) => {
    let posx;
    if (position !== undefined) {
      posx = position
    } else {
      posx = getInputPos();
    }
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
        viewer.camera.flyTo({destination: position});
    });

  }
  const asHomeBtnx = (position) => {
    if (position && position !== null) {
      let entity = viewer.entities.add({
          position: position,
      });
      entity.show = false;

      if (state.posHome !== null) {
        viewer.entities.remove(state.posHome);
        viewer.homeButton.viewModel.command.beforeExecute.removeEventListener(onHomex, viewer);
      }
      onHomex(position);
    //flyToBtnx(position);
      showHomepopup();
      return(
        setState((prev) => ({
          ...prev,
          posHome: entity,
        }))
      )
    }
  };

  const showHomepopup = useCallback(() => setHomepopup(true), []);
  const closeHomepopup = useCallback(() => setHomepopup(false), []);

  const resetHomeBtnx = () => {
    console.log("Reset default home");
  };

  const chkPreferHome = () => {
    console.log("Set as default home");
  };

  const render_homePopup = () => {
    return(
/*  render(
      <Fragment>
      { state.homePopup &&
        <div style="width:auto;max-width:18em;top:15%;left:18%;position:absolute;">
          <div id="homepopup" class={style.modalOverlay}>
            <div class={style.modalHeader} id="homepopupHeader" style="width:98%;min-width:98%">
              <a id="homepopupClose" class={style.close} onClick={()=>{closeHomePopupBtnx()}}>&times;</a>
            </div>
            <div class={style.ctrlwrapper}>
              <section class={style.ctrlsect}>
              </section>
            </div>
          </div>
        </div> }
      </Fragment>, document.getElementById("homePopupdiv"))*/
      <Dialog onCloseClick={closeHomepopup} isOpen={homepopup}>
              <span>Now you set Home in a new location, and can use Home Button in topright corner to fly-to.</span>
              <p class={style_ctrl.flexpspan}><span>More operations:&nbsp;</span>
                <span><input id="preferhomechk" style="width:auto;" type="checkbox" checked={state.prefer_home_chk}
                       onChange={chkPreferHome} aria-label='As a preference (need cookie permission) 設為偏好，但須允許客戶端儲存' />Set as default</span>
                <button id="resetHomebutn" class={style_ctrl.ctrlbutn} onClick={()=>{resetHomeBtnx()}}>Reset Home</button>
              </p>
      </Dialog>
    )
  };

  const render_posCtrl = () => {
    return(
      render(
      <Fragment>
          <div class={style.modal} style="width:98%;min-width:98%;min-height:auto;">
            <div class={style.ctrlwrapper}>
              <section class={style.ctrlsect}>
                <div class={style.ctrlcolumn}>
                  <p class={style_ctrl.flexpspan}>
                    <span>Lon/Lat/Elevation:&nbsp;
                      <input id="lontxt" type="text" size="9" style="max-width:63px;" onInput={onLonInput} />°&nbsp;
                      <input id="lattxt" type="text" size="9" style="max-width:63px;" onInput={onLatInput} />°&nbsp;
                      <input id="eletxt" type="text" size="9" style="max-width:63px;" onInput={onEleInput} />(m)</span>
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
                    <span><input id="manopenchk" style="width:auto;" type="checkbox" checked={state.dclick_chk_dialog}
                        onChange={chkDclickDialog} aria-label='Manually open dialog 手動開啟對話窗' />Manually open dialog</span>
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
          { render_posCtrl() }
          { render_homePopup() }
      </Fragment>
  )
};
export default MousePos;
