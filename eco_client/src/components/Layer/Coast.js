import { Fragment } from 'preact';
import { useState } from 'preact/hooks';
import WebFeatureServiceImageryProvider from './WebFeatureServiceImageryProvider';
import style from '../style/style_layerctrl.scss';
const { wfsConfig } = require('./.setting.js');

const Coast = (props) => {
  const { viewer } = props;

  const [coast, setCoast] = useState({
    wfs: null,
    hide: true,
    forcestop: false,
  });

  const stopWFSlisten = async () => {
    const force = !coast.forcestop;
    const hide= coast.hide;
    const wfs = coast.wfs;
    const intStop = coast.wfs.intStopWFS;

    if (intStop) {
      console.log("Internally WFS stopped because all data fetched");
      await setCoast((preState) => ({
         ...preState,
         forcestop: true,
      }));
    } else {
      if (force && !hide && wfs !== null) {
        console.log("Disable WFS loading..")
        await wfs.unsubscribeTicks();
      } else if (!force && wfs !== null) {
        console.log("Re-enable WFS loading..")
        await wfs.addTicksTrig();
      }
      await setCoast((preState) => ({
         ...preState,
         forcestop: !coast.forcestop,
      }));
    }
  }; //, [coast.forcestop]);

  const initCoastline = () => {
    //let wfsCredit = new Credit('Coastline 1:10m ©Natural Earth');//, showOnScreen: true});
    //viewer.scene.frameState.creditDisplay.addDefaultCredit(wfsCredit);
    setCoast((preState) => ({
          ...preState,
          wfs: new WebFeatureServiceImageryProvider({
             url: wfsConfig.coast,
             layers: wfsConfig.coast_10m_layer,
             viewer: viewer,
             //paramMore: 'SRSNAME=EPSG:3857&',
             //credit: 'Coastline 1:10m ©Natural Earth'
          }),
    }));
  }

  const showCoastline = async () => {
    const hide = !coast.hide;
    const wfs = coast.wfs;
    const force = coast.forcestop;

    if (force) {
      //alert("Note: You force WFS stopped, so now coastline or other features stop loading. Re-enable it if needed.")
      if (wfs != null) {
        if (!hide) {
          console.log("Re-show WFS layer..")
          await wfs.showCollection();
        } else {
          console.log("Disable WFS layer..")
          await wfs.hideCollection();
        }
      }
    } else {
      if (!hide && wfs === null) {
        await initCoastline();

      } else if (!hide && wfs !== null) {
        console.log("Re-show WFS layer..")
        await wfs.showCollection();
        await wfs.addTicksTrig();
      } else if (hide && wfs !== null) {
        console.log("Disable WFS layer..")
        await wfs.unsubscribeTicks();
        await wfs.hideCollection();
      }
    }
    await setCoast((preState) => ({ //forcestop only stop WFS loading, not affect show/hide
         ...preState,
         hide: !coast.hide,
    }));
  }; //, [coast.hide]);

//<div class={style.smalltd} style="display:inline-flex;justify-content:center;flex-direction:row;">
  return (
      <Fragment>
            <button class={style.ctrlbutn} id="hidecoastbutn" onClick={showCoastline}>
               {coast.hide? 'Show coastline': 'Hide coastline'}</button>
            <button style="display:none;" class={style.ctrlbutn} id="stopwfsbutn" onClick={stopWFSlisten}>
               {coast.forcestop? 'Remain WFS': 'Stop WFS'}</button>
      </Fragment>
  )
};
export default Coast;

