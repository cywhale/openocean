import { csViewer } from '../Earth';
//import proj4 from 'proj4'
//import BillboardVisualizer from 'cesium/Source/DataSources/BillboardVisualizer.js';
import Color from 'cesium/Source/Core/Color.js';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource.js';
import PinBuilder from 'cesium/Source/Core/PinBuilder.js';
/*
const options = {
    camera: csViewer.scene.camera,
    canvas: csViewer.scene.canvas,
};
*/
const siteurl = 'https://ecodata.odb.ntu.edu.tw/pub/windpower.geojson';
const sitecrs = 'EPSG:3826'
const dataSourcePromise = csViewer.dataSources.add(
    //Cesium.KmlDataSource.load("../SampleData/kml/facilities/facilities.kml",options
    GeoJsonDataSource.load(siteurl, {
        crsNames: sitecrs,
        stroke: Color.fromBytes(127, 127, 127, 10),
        markerColor: Color.fromHsl(0, 0, 0, 0.01) //https://github.com/CesiumGS/cesium/issues/6307
    })
);
dataSourcePromise.then(function (dataSource) {
    const pixelRange = 15;
    const minimumClusterSize = 3;
    const enabled = true;

    //Get the array of entities
    const entities = dataSource.entities.values;
    let entity;
    //var colorHash = {};
    entities.forEach(entity => {
      entity.billboard.add({ //https://groups.google.com/forum/#!topic/cesium-dev/Nc0EO5IUN4o
        image : '../../assets/icons/windpower_ blue01s.png'
      });

    }) 
  
    dataSource.clustering.enabled = enabled;
    dataSource.clustering.pixelRange = pixelRange;
    dataSource.clustering.minimumClusterSize = minimumClusterSize;
  
    var removeListener;
  
    const pinBuilder = new PinBuilder();
    const pin50 = pinBuilder
      .fromText("50+", Color.RED, 48)
      .toDataURL();
    const pin40 = pinBuilder
      .fromText("40+", Color.ORANGE, 48)
      .toDataURL();
    const pin30 = pinBuilder
      .fromText("30+", Color.YELLOW, 48)
      .toDataURL();
    const pin20 = pinBuilder
      .fromText("20+", Color.GREEN, 48)
      .toDataURL();
    const pin10 = pinBuilder
      .fromText("10+", Color.BLUE, 48)
      .toDataURL();
  
    let singleDigitPins = new Array(8);
    singleDigitPins.foreEach((x, i) => {
      x = pinBuilder
        .fromText("" + (i + 2), Color.VIOLET, 48)
        .toDataURL();
    })
  
    function customStyle() {
      if (Cesium.defined(removeListener)) {
        removeListener();
        removeListener = undefined;
      } else {
        removeListener = dataSource.clustering.clusterEvent.addEventListener(
          function (clusteredEntities, cluster) {
            cluster.label.show = false;
            cluster.billboard.show = true;
            cluster.billboard.id = cluster.label.id;
            cluster.billboard.verticalOrigin =
              Cesium.VerticalOrigin.BOTTOM;
  
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
              cluster.billboard.image =
                singleDigitPins[clusteredEntities.length - 2];
            }
          }
        );
      }
  
      // force a re-cluster with the new styling
      var pixelRange = dataSource.clustering.pixelRange;
      dataSource.clustering.pixelRange = 0;
      dataSource.clustering.pixelRange = pixelRange;
    }
  
    // start with custom style
    customStyle();
  
    const viewModel = {
      pixelRange: pixelRange,
      minimumClusterSize: minimumClusterSize,
    };
    Cesium.knockout.track(viewModel);
  
    var toolbar = document.getElementById("toolbar");
    Cesium.knockout.applyBindings(viewModel, toolbar);
  
    function subscribeParameter(name) {
      Cesium.knockout
        .getObservable(viewModel, name)
        .subscribe(function (newValue) {
          dataSource.clustering[name] = newValue;
        });
    }
  
    subscribeParameter("pixelRange");
    subscribeParameter("minimumClusterSize");
  
    Sandcastle.addToggleButton("Enabled", true, function (checked) {
      dataSource.clustering.enabled = checked;
    });
  
    Sandcastle.addToggleButton("Custom Styling", true, function (
      checked
    ) {
      customStyle();
    });
  
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
  });
  