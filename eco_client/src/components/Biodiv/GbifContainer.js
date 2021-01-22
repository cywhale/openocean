//import WebFeatureServiceImageryProvider from '../Earth/WebFeatureServiceImageryProvider';
import WebMapServiceImageryProvider from 'cesium/Source/Scene/WebMapServiceImageryProvider';
import BoundingSphere from 'cesium/Source/Core/BoundingSphere';
import DefaultProxy from 'cesium/Source/Core/DefaultProxy';
import Rectangle from 'cesium/Source/Core/Rectangle';
const { wmsConfig } = require('../Layer/.setting.js'); //wfsBioConfig

export default function GbifContainer(props) {
    //constructor(props) {
    //const { viewer } = props;
      this._viewer = props.viewer;
      this.url = wmsConfig.gbifocean_url;
      this.layer = wmsConfig.gbifocean_layer;
      this.scaleSet = wmsConfig.gbifocean_scaleSet;
      this.boundingSphere = new BoundingSphere();
      let ori_pixelSz = this._viewer.camera.getPixelSize(this.boundingSphere,
                        this._viewer.scene.drawingBufferWidth, this._viewer.scene.drawingBufferHeight);
      let totpixelr = ori_pixelSz * this._viewer.canvas.width/1080.0;
      let whratio = this._viewer.canvas.height <=540? 613.0 : 750.0;
      this.pixelSize= this._viewer.canvas.width >= whratio? totpixelr : totpixelr * whratio/this._viewer.canvas.width;
      this.lastSize = this.pixelSize;
      this.provider = null;
      this.imagery = null;
      this.imageryLayers = null;
      this.layeridx = -1;
      this.unsubscriber;
      this.initialize();
};

      GbifContainer.prototype.initialize = function(){
        this.provider = new WebMapServiceImageryProvider({
            url: this.url,
            layers: this.layer,
            credit: "GBIF.org (25 March 2020) GBIF Occurrence Download https://doi.org/10.15468/dl.lnpxuq",
            rectangle: Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
            parameters: {
              transparent: "true",
              styles: "gbifspnum",
              format: "image/png",
              width: 768,
              height: 358,
              viewparams: encodeURIComponent('viewScale:').replace(/%3A/g,':') + this.pixelSize
            },
            getFeatureInfoParameters: {
              viewparams: encodeURIComponent('viewScale:').replace(/%3A/g,':') + this.pixelSize
            },
            proxy : new DefaultProxy('/proxy/')
        });
        this.addMoveEndTrig();
      };

      GbifContainer.prototype.addMoveEndTrig = function() {
        var that = this;
        this.unsubscriber = this._viewer.camera.moveEnd.addEventListener(function() {
        //this.unsubscribeTicks = this._viewer.clock.onTick.addEventListener(function() {
        /* modified by cywhale 202012 to add scale parameter in wfs url */
          if (that.layeridx >= 0) {
            let wlay = that.imageryLayers.get(that.layeridx);
            if (wlay.show) {
              let ori_pixelSz = that._viewer.camera.getPixelSize(that.boundingSphere, //new BoundingSphere(),
                                that._viewer.scene.drawingBufferWidth, that._viewer.scene.drawingBufferHeight);
              let totpixelr = ori_pixelSz * that._viewer.canvas.width/1080.0;
              let whratio = that._viewer.canvas.height <=540? 613.0 : 750.0;
              that.pixelSize= that._viewer.canvas.width >= whratio? totpixelr : totpixelr * whratio/that._viewer.canvas.width;

              if (that.lastSize != that.pixelSize) {
                if ((that.lastSize < that.scaleSet[0] && that.pixelSize >= that.scaleSet[0]) ||
                    (that.lastSize < that.scaleSet[1] && that.pixelSize >= that.scaleSet[1]) ||
                    (that.lastSize >= that.scaleSet[1] && that.pixelSize < that.scaleSet[1]) ||
                    (that.lastSize >= that.scaleSet[0] && that.pixelSize < that.scaleSet[0])) {
                    //let wlay = that.imageryLayers.get(gb.layeridx);
                    //let show = wlay.show
                    //let alpha= wlay.alpha
                    that.imageryLayers.remove(wlay);
                    that.provider = new WebMapServiceImageryProvider({
                      url: that.url,
                      layers: that.layer,
                      credit: "GBIF.org (25 March 2020) GBIF Occurrence Download https://doi.org/10.15468/dl.lnpxuq",
                      rectangle: Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
                      parameters: {
                        transparent: "true",
                        styles: "gbifspnum",
                        format: "image/png",
                        width: 768,
                        height: 358,
                        viewparams: encodeURIComponent('viewScale:').replace(/%3A/g,':') + that.pixelSize
                      },
                      getFeatureInfoParameters: {
                        viewparams: encodeURIComponent('viewScale:').replace(/%3A/g,':') + that.pixelSize
                      },
                      proxy : new DefaultProxy('/proxy/')
                    });
                    that.imagery= that.imageryLayers.addImageryProvider(that.provider, that.layeridx);
                    that.imagery.show = true;
                    that.imagery.alpha= 0.75;
                    that.imagery.name = 'GBIF ocean occurrence';
                    that.lastSize = that.pixelSize;
                }
              }
            }
          }
        });
      }
//  }
//};

