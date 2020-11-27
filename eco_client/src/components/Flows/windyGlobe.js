// The code is modified from https://github.com/vensing/cesium-wind globe.js
import Cartesian3 from 'cesium/Source/Core/Cartesian3.js';
import Cartographic from 'cesium/Source/Core/Cartographic.js';
import SceneTransforms from 'cesium/Source/Scene/SceneTransforms.js';
import CesiumMath from 'cesium/Source/Core/Math.js';

export default function windyGlobe (viewer) {
    var G = viewer;
    function view2D() {
        for (var e, t, n, a, r = G.canvas.width / 2, o = G.canvas.height / 2, s = r, c = 0; c < G.canvas.height; c++)
            if (e = cesiumWindowToWGS84(s, c)) {
                e = e[1];
                break
            }
        for (var s = r, c = G.canvas.height - 1; c >= 0; c--)
            if (t = cesiumWindowToWGS84(s, c)) {
                t = t[1];
                break
            }
        for (var s = 0, c = o; s < G.canvas.width; s++)
            if (a = cesiumWindowToWGS84(s, c)) {
                a = a[0];
                break
            }
        for (var s = G.canvas.width, c = o; s >= 0; s--)
            if (n = cesiumWindowToWGS84(s, c)) {
                n = n[0];
                break
            }
        return {
            east: n,
            west: a,
            north: e,
            south: t
        }
    }

    function viewRect() {
        var east, west, north, south;
        var camera = G.scene.camera, r = (G.scene.mapProjection.ellipsoid, camera.computeViewRectangle(G.scene.globe.ellipsoid));
        return r ? (east = 360 * r.east / 2 / Math.PI,
            west = 360 * r.west / 2 / Math.PI,
            north = 360 * r.north / 2 / Math.PI,
            south = 360 * r.south / 2 / Math.PI) : (r = view2D(),
                east = r.east,
                west = r.west,
                north = r.north,
                south = r.south),
        {
            east: east,
            west: west,
            north: north,
            south: south
        }
    }

    function cesiumWGS84ToWindowCoord(point) {
        var scene = G.scene;
        var lonlat = Cartesian3.fromDegrees(point[0], point[1]);
        var coord = SceneTransforms.wgs84ToWindowCoordinates(scene, lonlat);
        return [coord.x, coord.y]
    }

    function cesiumWindowToWGS84(x, y) {
        var point = {
            x: x,
            y: y
        };
        var scene = G.scene;
        var cartesian = G.camera.pickEllipsoid(point, scene.globe.ellipsoid);
        if (cartesian) {
            var cartographic = Cartographic.fromCartesian(cartesian);
            return [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)]
        }
    }

    return {
        viewRect: viewRect,
        cesiumWGS84ToWindowCoord: cesiumWGS84ToWindowCoord,
        cesiumWindowToWGS84: cesiumWindowToWGS84
    }

};
