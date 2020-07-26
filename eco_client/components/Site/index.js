import { useRef, useState, useEffect, useMemo } from 'preact/hooks';
//import proj4 from 'proj4'
//import BillboardVisualizer from 'cesium/Source/DataSources/BillboardVisualizer.js';
import Color from 'cesium/Source/Core/Color.js';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource.js';
import PinBuilder from 'cesium/Source/Core/PinBuilder.js';
import defined from 'cesium/Source/Core/defined.js';
import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin.js';
import HeadingPitchRange from 'cesium/Source/Core/HeadingPitchRange.js';
impoty knockout from 'cesium/Source/ThirdParty/knockout.js';

const Site = (props) => {
  const [state, setState] = useState(false);

  const {dataurl, datacrs, icon, color, viewer, bindRef} = props;

  const fetchSiteData = () => {
    if (viewer && dataurl) {
    const crs = datacrs|'EPSG:4326';
    //const dataurl = 'https://odbwms.oc.ntu.edu.tw/odbintl/rasters/getcplan/?name=bio_r0043'

      const dataSourcePromise = viewer.dataSources.add(
        GeoJsonDataSource.load(dataurl, {
          crsNames: crs,
          clampToGround: true,
          //verticalOrigin : Cesium.VerticalOrigin.BOTTOM
          //stroke: Cesium.Color.fromBytes(127, 127, 127, 10),
          //markerColor: Cesium.Color.fromHsl(0, 0, 0, 0.01) //https://github.com/CesiumGS/cesium/issues/6307
        })
      );

      dataSourcePromise.then(function (dataSource) {
        const iconurl = icon|'../../assets/icons/grey-ring-ss.png'; //'https://ecodata.odb.ntu.edu.tw/pub/$
        const colorname = color|'cyan';
        if (colorname==="cyan") {
          let palette = ['#E0FFFF','#00FFFF','#7FFFD4','#40E0D0','#20B2AA','#008080'];
        }
        const pixelRange = clusterRange | 15;
        const minimumClusterSize = 3; //minCluster | 3;
        const enabled = clusterEnable === undefined? true: clusterEnable;

        dataSource.clustering.enabled = enabled;
        dataSource.clustering.pixelRange = pixelRange;
        dataSource.clustering.minimumClusterSize = minimumClusterSize;

        const entities = dataSource.entities.values;
        let entity;
        entities.forEach(entity => {
          entity.billboard.image = iconurl; //https://groups.google.com/forum/#!topic/cesium-dev/Nc0EO5IUN4o
        });

        var removeListener;

        const pinBuilder = new PinBuilder();
        const pin50 = pinBuilder
          .fromText("50+", Color.fromCssColorString(palette[5]), 40)
          .toDataURL();
        const pin40 = pinBuilder
          .fromText("40+", Color.fromCssColorString(palette[4]), 40)
          .toDataURL();
        const pin30 = pinBuilder
          .fromText("30+", Color.fromCssColorString(palette[3]), 40)
          .toDataURL();
        const pin20 = pinBuilder
          .fromText("20+", Color.fromCssColorString(palette[2]), 40)
          .toDataURL();
        const pin10 = pinBuilder //Cesium.when(
          .fromText("10+", Color.fromCssColorString(palette[1]), 40)
          .toDataURL();

        let singleDigitPins = new Array(8);
        for (var i = 0; i < singleDigitPins.length; ++i) {
          singleDigitPins[i] = pinBuilder
            .fromText("" + (i + 2), Color.fromCssColorString(palette[0]), 4-)
            .toDataURL();
        }

        function customStyle() {
          if (defined(removeListener)) {
            removeListener();
            removeListener = undefined;
          } else {
            removeListener = dataSource.clustering.clusterEvent.addEventListener(

            function (clusteredEntities, cluster) {
              cluster.label.show = false;
              cluster.billboard.show = true;
              cluster.billboard.id = cluster.label.id;
              cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

              if (clusteredEntities.length >= 50) {
                cluster.billboard.image = pin50;
              } else if (clusteredEntities.length >= 40) {
                cluster.billboard.image = pin40;
              } else if (clusteredEntities.length >= 30) {
                cluster.billboard.image = pin30;
              } else if (clusteredEntities.length >= 20) {
                cluster.billboard.image = pin20;
              } else if (clusteredEntities.length >= 10) {
                cluster.billboard.image = pin10;
              } else {
                cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
              }
            } // function for listener
            );// listener
          } // else

          // force a re-cluster with the new styling
          let pr = dataSource.clustering.pixelRange;
          dataSource.clustering.pixelRange = 0;
          dataSource.clustering.pixelRange = pr;
        }

        // start with custom style
        customStyle();

        const viewModel = {
          pixelRange: pixelRange,
          minimumClusterSize: minimumClusterSize,
        };
        knockout.track(viewModel);

        //var toolbar = document.getElementById("toolbar");
        knockout.applyBindings(viewModel, useRef(bindRef));

        function subscribeParameter(name) {
          knockout
            .getObservable(viewModel, name)
            .subscribe(function (newValue) {
              dataSource.clustering[name] = newValue;
            });
        }
        subscribeParameter("pixelRange");
        subscribeParameter("minimumClusterSize");

      //https://sandcastle.cesium.com/?src=Imagery%20Color%20To%20Alpha.html
      /*
      knockout
        .getObservable(viewModel, "threshold")
        .subscribe(function (newValue) {
        sTileImg.alpha = parseFloat( //colorToAlphaThreshold
          viewModel.threshold
        );
      });
      */
        viewer.flyTo(dataSource, {
          offset: new HeadingPitchRange(0, (-Math.PI / 2)+0.0000001, 8000000) //-Cesium.Math.PI_OVER_FOUR, 20000000)
        })
      //Sandcastle.addToggleButton("Enabled", true, function (checked) {
      //  dataSource.clustering.enabled = checked;
      //});

      //Sandcastle.addToggleButton("Custom Styling", true, function (
      //  checked
      //) {
      //  customStyle();
      //});
/*
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (movement) {
      var pickedLabel = viewer.scene.pick(movement.position);
      if (Cesium.defined(pickedLabel)) {
        var ids = pickedLabel.id;
        if (Array.isArray(ids)) {
          for (var i = 0; i < ids.length; ++i) {
            ids[i].billboard.color = Color.RED;
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
*/
      });
    } /* has viewer &&  dataurl */

    setState(true); //Loading ok
  };
  return (
    <table style="color:antiquewhite;">
      <tbody>
        <tr>
          <td>Pixel Range</td>
          <td>
            <input type="range" min="1" max="200" step="1" data-bind="value: pixelRange, valueUpdate: 'input'">
            <input type="text" size="2" data-bind="value: pixelRange">
          </td>
        </tr>
        <tr>
          <td>Minimum Cluster Size</td>
          <td>
            <input type="range" min="2" max="20" step="1" data-bind="value: minimumClusterSize, valueUpdate: 'input'">
            <input type="text" size="2" data-bind="value: minimumClusterSize">
          </td>
        </tr>
        <tr>
          <td>Threshold</td>
          <td>
            <input type="range" min="0.0" max="1.0" step="0.01" data-bind="value: threshold, valueUpdate: 'input'">
          </td>
        </tr>
      </tbody>
    </table>
  );
};

