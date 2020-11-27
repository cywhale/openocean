import windyGlobe from './windyGlobe';
import Windy from './Windy';
//const { layerConfig } = require('../Layer/.setting.js');

export default class WindyContainer {
    constructor(props) {
      const { viewer, dataurl } = props;
      this.viewer = viewer;
      this.windGlobe = windyGlobe(viewer);
      this.canvas = getCanvas();
      //this windy = null;
      this.started = false;

      function getCanvas() {
        //let canvasx = document.querySelector("#cesiumContainer > div > div.cesium-viewer-cesiumWidgetContainer > div > canvas"$
        let canvasx = document.getElementById("wind");
        if (!canvasx || canvasx === null) {
            canvasx = document.createElement("canvas");
            canvasx.setAttribute("id", "wind");
            canvasx.setAttribute("style", "display: block; left:0; top:0; position:absolute; z-index:3; pointer-events: none;");
            canvasx.width = parseInt(viewer.canvas.width);
            canvasx.height = parseInt(viewer.canvas.height);
            let container = document.querySelector("#cesiumContainer > div > div.cesium-viewer-cesiumWidgetContainer > div")
            container.appendChild(canvasx);
        } else {
          canvasx.width = parseInt(viewer.canvas.width);
          canvasx.height = parseInt(viewer.canvas.height);
        }
        //var context = canvas.getContext("2d");
        return canvasx;
      };

      //async function initDraw (canvas, globe) {
      //await
      fetch(dataurl)//layerConfig.base + 'json/flows/gfs_' + flowdata.date.replace(/-/g, '') + flowdata.time + '.json')
            .then(response => response.json())
            .catch(err => console.error('Fetch Wind Json Error:', err))
            .then(data => {
                this.windy = new Windy({ canvas: this.canvas, data: data, windGlobe: this.windGlobe });
                this.redraw();
                this.setupEventListeners();
            });
      //};
      //initDraw(this.canvas, this.windGlobe);
    }

    redraw() {
        let width = this.viewer.canvas.width;
        let height = this.viewer.canvas.height;
        let wind = document.getElementById("wind");
        wind.width = width;
        wind.height = height;
        this.windy.stop();

        this.started = this.windy.start(
            [[0, 0], [width, height]],
            width,
            height
        );
        wind.style.display = 'block';
    };

    stop() {
      let wind = document.getElementById("wind");
      wind.style.display = 'none';
      this.windy.stop();
    };

    setupEventListeners() {
      const that = this;
      this.viewer.camera.moveStart.addEventListener(function () {
        //console.log("move start...");
        let wind = document.getElementById("wind");
        wind.style.display = 'none';
        if (!!that.windy && that.started) {
            that.windy.stop();
        }
      });

      this.viewer.camera.moveEnd.addEventListener(function () {
        //console.log("move end...");
        let wind = document.getElementById("wind");
        wind.style.display = 'none';
        if (!!that.windy && that.started) {
            that.redraw();
        }
      });
    }
/*  const flow = {
        windy: windy,
        started: started,
        redraw: redraw,
        stop: stop
    };
    return flow;
*/
};
