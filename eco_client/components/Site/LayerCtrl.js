import { csViewer } from '../Earth';
//import proj4 from 'proj4'
//import BillboardVisualizer from 'cesium/Source/DataSources/BillboardVisualizer.js';
import Color from 'cesium/Source/Core/Color.js';
import GeoJsonDataSource from 'cesium/Source/DataSources/GeoJsonDataSource.js';
import PinBuilder from 'cesium/Source/Core/PinBuilder.js';

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

