// windpower geojson, from 3826 to 4326 
// data source: https://pro.twtpo.org.tw/GIS/
const geox = {
    "displayFieldName":"TNAME",
    "fieldAliases":{"OBJECTID":"OBJECTID","COMPANY":"開發廠商","COUNTY":"縣市","TNAME":"鄉鎮市","SiteName":"風場名稱","Brand":"風機廠牌","InstallCap":"裝置容量(MW)","CommYear":"商轉年份"},
    "geometryType":"esriGeometryPoint",
    "spatialReference":{"wkid":102443,"latestWkid":3826},
    "fields":[{"name":"OBJECTID","type":"esriFieldTypeOID","alias":"OBJECTID"},
              {"name":"COMPANY","type":"esriFieldTypeString","alias":"開發廠商","length":16},
              {"name":"COUNTY","type":"esriFieldTypeString","alias":"縣市","length":8},
              {"name":"TNAME","type":"esriFieldTypeString","alias":"鄉鎮市","length":12},
              {"name":"SiteName","type":"esriFieldTypeString","alias":"風場名稱","length":20},
              {"name":"Brand","type":"esriFieldTypeString","alias":"風機廠牌","length":12},
              {"name":"InstallCap","type":"esriFieldTypeDouble","alias":"裝置容量(MW)"},
              {"name":"CommYear","type":"esriFieldTypeString","alias":"商轉年份","length":4}
            ],
    "features":[
        {"attributes":{"OBJECTID":1,"COMPANY":"苗栗風力","COUNTY":"苗栗縣","TNAME":"後龍鎮","SiteName":"大鵬風場","Brand":"Enercon","InstallCap":2,"CommYear":"2006"},
         "geometry":{"x":224090.97819999978,"y":2722280.0749999993}},
        {"attributes":{"OBJECTID":2,"COMPANY":"苗栗風力","COUNTY":"苗栗縣","TNAME":"後龍鎮","SiteName":"大鵬風場","Brand":"Enercon","InstallCap":2,"CommYear":"2006"},
         "geometry":{"x":223745.9793999996,"y":2722498.0742000006}},
        {"attributes":{"OBJECTID":3,"COMPANY":"苗栗風力","COUNTY":"苗栗縣","TNAME":"後龍鎮","SiteName":"大鵬風場","Brand":"Enercon","InstallCap":2,"CommYear":"2006"},
         "geometry":{"x":223404.9804999996,"y":2722710.0734000001}},
        {"attributes":{"OBJECTID":721,"COMPANY":"台電","COUNTY":"桃園市","TNAME":"蘆竹區","SiteName":"蘆竹風場","Brand":"Enercon","InstallCap":0.90000000000000002,"CommYear":"2015"},
         "geometry":{"x":277761.34999999963,"y":2778843.5500000007}},
        {"attributes":{"OBJECTID":722,"COMPANY":"台電","COUNTY":"桃園市","TNAME":"蘆竹區","SiteName":"蘆竹風場","Brand":"Enercon","InstallCap":0.90000000000000002,"CommYear":"2015"},
         "geometry":{"x":277894.04999999981,"y":2778831.1999999993}},
        {"attributes":{"OBJECTID":723,"COMPANY":"台電","COUNTY":"桃園市","TNAME":"蘆竹區","SiteName":"蘆竹風場","Brand":"Enercon","InstallCap":0.90000000000000002,"CommYear":"2015"},
         "geometry":{"x":278026.40000000037,"y":2778810.5800000001}}
        ]
    };

//yarn add proj4
const proj4 = require('proj4');
console.log(proj4.defs['EPSG:4326']);
console.log(proj4.defs['EPSG:3826']); //undifned

proj4.defs["EPSG:3826"] = "+title=TWD97 TM2+proj=tmerc +lat_0=0 +lon_0=121 +k=0.9999 +x_0=250000 +y_0=0 +ellps=GRS80 +units=m +no_defs"; //+units=公尺
console.log(proj4.defs['EPSG:3826']); 

let tst1 = proj4(proj4.defs['EPSG:3826'], proj4.defs['EPSG:4326'], [278026.40000000037, 2778810.5800000001]);
console.log(tst1);

const towgsx = (crd) => {
    let crdx = proj4(proj4.defs['EPSG:3826'], proj4.defs['EPSG:4326'],
                     [parseFloat(crd[0]), parseFloat(crd[1])]);
    return([crdx[1], crdx[0]])
};

const windst2Pt = function(geojson) {
    return geojson.features.map(function(feature) {
      let coord = towgsx([feature.geometry.x, feature.geometry.y]);
      let id = feature.attributes.OBJECTID; 
      let site = feature.attributes.SiteName; 
      let dt = { id: [id], site: [site], coords: coord };
      return dt;
    });
};
console.log(windst2Pt(geox));