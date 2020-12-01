/*global define*/
// related discussion: https://community.cesium.com/t/wfs-support-in-cesium/3882
// https://groups.google.com/g/cesium-dev/c/YJVt_-U9bxo/m/yJ5qP7dxAQAJ
// https://github.com/CesiumGS/cesium/issues/6333
// modified from original author Sushru github https://github.com/sushrut141/Cesium-WebFeatureService
'use strict';
import PolygonHierarchy from 'cesium/Source/Core/PolygonHierarchy';
import CesiumMath from 'cesium/Source/Core/Math';
import Color from 'cesium/Source/Core/Color';
import PinBuilder from 'cesium/Source/Core/PinBuilder';
import Cartographic from 'cesium/Source/Core/Cartographic';
import Cartesian2 from 'cesium/Source/Core/Cartesian2';
import Cartesian3 from 'cesium/Source/Core/Cartesian3';
//import clone from 'cesium/Source/Core/clone';
import defaultValue from 'cesium/Source/Core/defaultValue';
import defined from 'cesium/Source/Core/defined';
import DeveloperError from 'cesium/Source/Core/DeveloperError';
import RequestErrorEvent from 'cesium/Source/Core/RequestErrorEvent';
import RuntimeError from 'cesium/Source/Core/RuntimeError';
import TrustedServers from 'cesium/Source/Core/TrustedServers';
import Ellipsoid from 'cesium/Source/Core/Ellipsoid';
import Event from 'cesium/Source/Core/Event';
import when from 'cesium/Source/ThirdParty/when';
import BillboardCollection from 'cesium/Source/Scene/BillboardCollection';
import Material from 'cesium/Source/Scene/Material';
import PolylineCollection from 'cesium/Source/Scene/PolylineCollection';
import PolygonGeometry from 'cesium/Source/Core/PolygonGeometry';
/* old version
'cesium/Source/Core/defineProperties'
'cesium/Source/Core/loadXML'
'cesium/Source/Core/loadText' */

/*global define
define([
        '../ThirdParty/when',
        './defaultValue',
        './defined',
        './DeveloperError',
        './RequestErrorEvent',
        './RuntimeError',
        './TrustedServers'
    ], function(
        when,
        defaultValue,
        defined,
        DeveloperError,
        RequestErrorEvent,
        RuntimeError,
        TrustedServers) {
    'use strict';
*/
    /**
     * Asynchronously loads the given URL.  Returns a promise that will resolve to
     * the result once loaded, or reject if the URL failed to load.  The data is loaded
     * using XMLHttpRequest, which means that in order to make requests to another origin,
     * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
     *
     * @exports loadWithXhr
     *
     * @param {Object} options Object with the following properties:
     * @param {String|Promise.<String>} options.url The URL of the data, or a promise for the URL.
     * @param {String} [options.responseType] The type of response.  This controls the type of item returned.
     * @param {String} [options.method='GET'] The HTTP method to use.
     * @param {String} [options.data] The data to send with the request, if any.
     * @param {Object} [options.headers] HTTP headers to send with the request, if any.
     * @param {String} [options.overrideMimeType] Overrides the MIME type returned by the server.
     * @returns {Promise.<Object>} a promise that will resolve to the requested data when loaded.
     *
     *
     * @example
     * // Load a single URL asynchronously. In real code, you should use loadBlob instead.
     * Cesium.loadWithXhr({
     *     url : 'some/url',
     *     responseType : 'blob'
     * }).then(function(blob) {
     *     // use the data
     * }).otherwise(function(error) {
     *     // an error occurred
     * });
     *
     * @see loadArrayBuffer
     * @see loadBlob
     * @see loadJson
     * @see loadText
     * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
     * @see {@link http://wiki.commonjs.org/wiki/Promises/A|CommonJS Promises/A}
     */
    const loadWithXhr = (options) => {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        //>>includeStart('debug', pragmas.debug);
        if (!defined(options.url)) {
            throw new DeveloperError('options.url is required.');
        }
        //>>includeEnd('debug');

        var responseType = options.responseType;
        var method = defaultValue(options.method, 'GET');
        var data = options.data;
        var headers = options.headers;
        var overrideMimeType = options.overrideMimeType;

        return when(options.url, function(url) {
            var deferred = when.defer();

            //loadWithXhr.
            load(url, responseType, method, data, headers, deferred, overrideMimeType);

            return deferred.promise;
        });
    }

    var dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;

    function decodeDataUriText(isBase64, data) {
        var result = decodeURIComponent(data);
        if (isBase64) {
            return atob(result);
        }
        return result;
    }

    function decodeDataUriArrayBuffer(isBase64, data) {
        var byteString = decodeDataUriText(isBase64, data);
        var buffer = new ArrayBuffer(byteString.length);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < byteString.length; i++) {
            view[i] = byteString.charCodeAt(i);
        }
        return buffer;
    }

    function decodeDataUri(dataUriRegexResult, responseType) {
        responseType = defaultValue(responseType, '');
        var mimeType = dataUriRegexResult[1];
        var isBase64 = !!dataUriRegexResult[2];
        var data = dataUriRegexResult[3];

        switch (responseType) {
            case '':
            case 'text':
                return decodeDataUriText(isBase64, data);
            case 'arraybuffer':
                return decodeDataUriArrayBuffer(isBase64, data);
            case 'blob':
                var buffer = decodeDataUriArrayBuffer(isBase64, data);
                return new Blob([buffer], {
                    type : mimeType
                });
            case 'document':
                var parser = new DOMParser();
                return parser.parseFromString(decodeDataUriText(isBase64, data), mimeType);
            case 'json':
                return JSON.parse(decodeDataUriText(isBase64, data));
            default:
                //>>includeStart('debug', pragmas.debug);
                throw new DeveloperError('Unhandled responseType: ' + responseType);
                //>>includeEnd('debug');
        }
    }

    // This is broken out into a separate function so that it can be mocked for testing purposes.
    //loadWithXhr.load =
    function load(url, responseType, method, data, headers, deferred, overrideMimeType) {
        var dataUriRegexResult = dataUriRegex.exec(url);
        if (dataUriRegexResult !== null) {
            deferred.resolve(decodeDataUri(dataUriRegexResult, responseType));
            return;
        }

        var xhr = new XMLHttpRequest();

        if (TrustedServers.contains(url)) {
            xhr.withCredentials = true;
        }

        if (defined(overrideMimeType) && defined(xhr.overrideMimeType)) {
            xhr.overrideMimeType(overrideMimeType);
        }

        xhr.open(method, url, true);

        if (defined(headers)) {
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }
        }

        if (defined(responseType)) {
            xhr.responseType = responseType;
        }

        xhr.onload = function() {
            if (xhr.status < 200 || xhr.status >= 300) {
                deferred.reject(new RequestErrorEvent(xhr.status, xhr.response, xhr.getAllResponseHeaders()));
                return;
            }

            var response = xhr.response;
            var browserResponseType = xhr.responseType;

            //All modern browsers will go into either the first if block or last else block.
            //Other code paths support older browsers that either do not support the supplied responseType
            //or do not support the xhr.response property.
            if (defined(response) && (!defined(responseType) || (browserResponseType === responseType))) {
                deferred.resolve(response);
            } else if ((responseType === 'json') && typeof response === 'string') {
                try {
                    deferred.resolve(JSON.parse(response));
                } catch (e) {
                    deferred.reject(e);
                }
            } else if ((browserResponseType === '' || browserResponseType === 'document') && defined(xhr.responseXML) && xhr.responseXML.hasChildNodes()) {
                deferred.resolve(xhr.responseXML);
            } else if ((browserResponseType === '' || browserResponseType === 'text') && defined(xhr.responseText)) {
                deferred.resolve(xhr.responseText);
            } else {
                deferred.reject(new RuntimeError('Invalid XMLHttpRequest response type.'));
            }
        };

        xhr.onerror = function(e) {
            deferred.reject(new RequestErrorEvent());
        };

        xhr.send(data);
    };

//loadWithXhr.defaultLoad = loadWithXhr.load;

//return loadWithXhr;
//});

    /**
     * Asynchronously loads the given URL as text.  Returns a promise that will resolve to
     * a String once loaded, or reject if the URL failed to load.  The data is loaded
     * using XMLHttpRequest, which means that in order to make requests to another origin,
     * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
     *
     * @exports loadText
     *
     * @param {String|Promise.<String>} url The URL to request, or a promise for the URL.
     * @param {Object} [headers] HTTP headers to send with the request.
     * @returns {Promise.<String>} a promise that will resolve to the requested data when loaded.
     *
     *
     * @example
     * // load text from a URL, setting a custom header
     * Cesium.loadText('http://someUrl.com/someJson.txt', {
     *   'X-Custom-Header' : 'some value'
     * }).then(function(text) {
     *     // Do something with the text
     * }).otherwise(function(error) {
     *     // an error occurred
     * });
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest|XMLHttpRequest}
     * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
     * @see {@link http://wiki.commonjs.org/wiki/Promises/A|CommonJS Promises/A}
     */
    const loadText = (url, headers) => {
        return loadWithXhr({
            url : url,
            headers : headers
        });
    };
//return loadText;
//});

/*global define
define([
        './loadWithXhr'
    ], function(
        loadWithXhr) {
    'use strict';
*/
    /**
     * Asynchronously loads the given URL as XML.  Returns a promise that will resolve to
     * an XML Document once loaded, or reject if the URL failed to load.  The data is loaded
     * using XMLHttpRequest, which means that in order to make requests to another origin,
     * the server must have Cross-Origin Resource Sharing (CORS) headers enabled.
     *
     * @exports loadXML
     *
     * @param {String|Promise.<String>} url The URL to request, or a promise for the URL.
     * @param {Object} [headers] HTTP headers to send with the request.
     * @returns {Promise.<XMLDocument>} a promise that will resolve to the requested data when loaded.
     *
     *
     * @example
     * // load XML from a URL, setting a custom header
     * Cesium.loadXML('http://someUrl.com/someXML.xml', {
     *   'X-Custom-Header' : 'some value'
     * }).then(function(document) {
     *     // Do something with the document
     * }).otherwise(function(error) {
     *     // an error occurred
     * });
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest|XMLHttpRequest}
     * @see {@link http://www.w3.org/TR/cors/|Cross-Origin Resource Sharing}
     * @see {@link http://wiki.commonjs.org/wiki/Promises/A|CommonJS Promises/A}
     */
    const loadXML = (url, headers) => {
        return loadWithXhr({
            url : url,
            responseType : 'document',
            headers : headers,
            overrideMimeType : 'text/xml'
        });
    };
//  return loadXML;
//});

/*
    Author : Sushrut
    Web Feature Service Provider plugin for cesium
*/
// modified by cywhale 202012
// https://github.com/sushrut141/Cesium-WebFeatureService/blob/master/WebFeatureServiceImageryProvider.js
// some discussion https://community.cesium.com/t/wfs-support-in-cesium/3882/5
/*
define('Scene/WebFeatureServiceImageryProvider',[
        '../Core/PolygonHierarchy',
        '../Core/Math',
        '../Core/Color',
        '../Core/PinBuilder',
        '../Core/Cartographic',
        '../Core/Cartesian3',
        '../Core/defaultValue',
        '../Core/defined',
        '../Core/defineProperties',
        '../Core/loadXML',
        '../Core/loadText',
        '../Core/DeveloperError',
        '../Core/Ellipsoid',
        '../Core/Event',
        '../ThirdParty/when',
        './PolylineCollection',
        './BillboardCollection',
        './Polygon'
    ],function(
        PolygonHierarchy,
        Math,
        Color,
        PinBuilder,
        Cartographic,
        Cartesian3,
        defaultValue,
        defined,
        defineProperties,
        loadXML,
        loadText,
        DeveloperError,
        Ellipsoid,
        Event,
        when,
        PolylineCollection,
        BillboardCollection,
        Polygon){
        "use strict";
*/

        function defaultCrsFunction(coordinates) {
            return Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]);
        }

        var crsNames = {
            'EPSG:4326' : defaultCrsFunction,
            'urn:ogc:def:crs:EPSG::4326' : defaultCrsFunction,
            'urn:ogc:def:crs:EPSG:6.6:4326' : defaultCrsFunction,
            'http://www.opengis.net/gml/srs/epsg.xml#4326' : defaultCrsFunction
        };

        var sizes = {
            small : 24,
            medium : 48,
            large : 64
        };

         var geometryPropertyTypes = {
            Point : processPoint,
            MultiPoint : processMultiPoint,
            LineString : processLineString,
            MultiLineString : processMultiLineString,
            Polygon : processPolygon,
            MultiPolygon : processMultiPolygon,
        };

        var surfacePropertyTypes = {
            Polygon : processPolygon,
            Surface : processSurface
        };

        var surfaceBoundaryTypes = {
            LinearRing : processLinearRing,
            Ring : processRing
        };

        var gmlns = "http://www.opengis.net/gml";

        function getCrsProperties(node, crsProperties) {
            var crsName = node.getAttribute('srsName');
            if(crsName) {
                var crsFunction = crsNames[crsName];
                if(!crsFunction) {
                    return RuntimeError('Unknown crs name: ' + crsName);
                }
                crsProperties.crsFunction = crsFunction;
            }

                var crsDimension = node.getAttribute('srsDimension');
                if(crsDimension) {
                    crsDimension = parseInt(crsDimension);
                    crsProperties.crsDimension = crsDimension;
                }
            return crsProperties;
        }


        function processFeatureCollection(that,gml) {

            var documentNode = gml.documentElement;
            var featureCollection = documentNode.getElementsByTagNameNS(gmlns, "featureMember");
            if(featureCollection.length == 0) {
                featureCollection = documentNode.getElementsByTagNameNS(gmlns, "featureMembers");
            }

            var crsProperties = {'crsFunction' : defaultCrsFunction, 'crsDimension' : 2};
             var boundedByNode = documentNode.getElementsByTagNameNS(gmlns, "boundedBy")[0];
            if(boundedByNode) {
                crsProperties = getCrsProperties(boundedByNode.firstElementChild, crsProperties);
            }

            for(var i = 0; i < featureCollection.length; i++) {
                 var features = featureCollection[i].children;
                 for(var j = 0; j < features.length; j++) {
                    processFeature(that,features[j], crsProperties);
                }
            }
        }


        function processFeature(that,feature, crsProperties) {

            /*
            when using tiled startegy features need to be rendered again
            even if they were previously rendered as they have been removied from the
            primitive collection
            */
            if(!that._tiled){
                var featureText = feature.attributes[0].textContent.split(".");
                var featureID = parseInt(featureText[1]);
                if(that._featureMap[featureID])
                    return;
                else
                    that._featureMap[featureID] = feature.attributes[0].textContent;
            }

            var i, j, geometryHandler, geometryElements = [];
            var crsFunction = defaultCrsFunction;
            var properties = {};

                var boundedByNode = feature.getElementsByTagNameNS(gmlns, "boundedBy")[0];
                if(boundedByNode) {
                    crsProperties = getCrsProperties(feature.firstElementChild, crsProperties);
                    feature.removeChild(boundedByNode);
                }

                var elements = feature.children;
                for(i = 0; i < elements.length; i++) {
                    var childCount = elements[i].childElementCount;
                    if(childCount == 0) {
                        //Non-nested non-spatial properties.
                        properties[elements[i].localName] = elements[i].textContent;
                    } else if(childCount > 0) {
                        //Nested and geometry properties.
                        var subElements = elements[i].children;
                        var prop = {};
                        for(j = 0; j < childCount; j++) {
                            if(subElements[j].namespaceURI === gmlns) {
                                geometryElements.push(subElements[j]);
                            } else {
                                prop[subElements[j].localName] = subElements[j].textContent;
                            }
                        }
                        if(Object.keys(prop).length) {
                            properties[elements[i].localName] = prop;
                        }
                    }
                }
                for(i = 0; i < geometryElements.length; i++) {
                    geometryHandler = geometryPropertyTypes[geometryElements[i].localName];
                    geometryHandler(that,geometryElements[i], properties, crsProperties);
                }
        }

        function renderLineStringAsPolyline(that){
            var coords = [];
            for(var i = 0 ; i < that._coords.length/2;i++){
                var lat = parseFloat(that._coords[2*i]);
                var lng = parseFloat(that._coords[2*i + 1]);
                coords.push(lat,lng);
            }

            that._collectionVector.push(new PolylineCollection());
            var length = that._collectionVector.length;
            that._collectionVector[length - 1].add({
                positions : Cartesian3.fromDegreesArray(coords.slice(0)),
                width : 0.75,
                material: Material.fromType('Color', {
                    color: new Color(0.9, 0.9, 0.9) //1, 0.8, 0.2
                }),
                show : true
            });
            //if (that.primitiveIndex === -1) { that.primitiveIndex = that._viewer.scene.primitives.length; }
            that._viewer.scene.primitives.add(that._collectionVector[length - 1]);
        }

        function processLineString(that,lineString, properties, crsProperties, index) {
            crsProperties = getCrsProperties(lineString, crsProperties);
            var coordString = lineString.firstElementChild.textContent;
            var splitCoords = coordString.split(" ");
            var coords_feature = [];
            that._coords.length = 0;
            //pushing lat/long values
            for(var i = 0 ; i < splitCoords.length; i++){
                var split = splitCoords[i].split(",");
                that._coords.push(split[0],split[1]);
            }
            /*that._coords.push({
                contour : index,
                positions : coords_feature.slice(0)
            });*/
            renderLineStringAsPolyline(that);


            //console.log(coordString);
            //var coordinates = processCoordinates(coordString, crsProperties);
            //createPolyline(coordinates, true, properties, crsProperties);
        }

        function processMultiLineString(that,multiLineString, properties, crsProperties) {
            crsProperties = getCrsProperties(multiLineString, crsProperties);
            var lineStringMembers = multiLineString.getElementsByTagNameNS(gmlns, "lineStringMember");
            if(lineStringMembers.length == 0) {
                lineStringMembers = multiLineString.getElementsByTagNameNS(gmlns, "lineStringMembers");
            }

            for(var i = 0; i < lineStringMembers.length; i++) {
                var lineStrings = lineStringMembers[i].children;
                for(var j = 0; j < lineStrings.length; j++) {
                    processLineString(that,lineStrings[j], properties, crsProperties, j);
                }
            }
        }

        function renderPoint(that){
            var coords = [];
            for(var i = 0 ; i < that._coords.length/2;i++){
                var lat = parseFloat(that._coords[2*i]);
                var lng = parseFloat(that._coords[2*i + 1]);
                coords.push(lat,lng);
            }

            var cart = new Cartographic();
            cart.longitude = CesiumMath.toRadians(coords[0]);
            cart.latitude = CesiumMath.toRadians(coords[1]);
            cart.height = 0;

            var billBoardPosition = Ellipsoid.WGS84.cartographicToCartesian(cart);

            that._collectionVector.push(new BillboardCollection());
            var length = that._collectionVector.length;
            var builder = new PinBuilder();
            var color = new Color(0.0,1.0,1.0);
            that._collectionVector[length - 1].add({
                image : builder.fromColor(color,16).toDataURL(),
                position : billBoardPosition
            });
            that._viewer.scene.primitives.add(that._collectionVector[length - 1]);
        }


        function processPoint(that, point, properties, crsProperties) {
            crsProperties = getCrsProperties(point, crsProperties);
            var coordString = point.firstElementChild.textContent;
            var splitCoords = coordString.split(",");
            var coords_feature = [];
            that._coords.length = 0;
            //pushing lat/long values
            for(var i = 0 ; i < splitCoords.length; i++){
                that._coords.push(splitCoords[0],splitCoords[1]);
            }
            renderPoint(that);
        }

        function processMultiPoint(that, multiPoint, properties, crsProperties) {
            crsProperties = getCrsProperties(multiPoint, crsProperties);
            var pointMembers = multiPoint.getElementsByTagNameNS(gmlns, "pointMember");
            if(pointMembers.length == 0) {
                pointMembers = multiPoint.getElementsByTagNameNS(gmlns, "pointMembers");
            }

                for(var i = 0; i < pointMembers.length; i++) {
                    var points = pointMembers[i].children;
                    for(var j = 0; j < points.length; j++) {
                        processPoint(that, points[j], properties, crsProperties);
                    }
            }
        }

        function createPolygon(that, hierarchy, properties) {
            var polygon = new PolygonGeometry({
                polygonHierarchy: hierarchy
            });
            polygon.material.uniforms.color = {
                red: CesiumMath.nextRandomNumber(),
                green: CesiumMath.nextRandomNumber(),
                blue: CesiumMath.nextRandomNumber(),
                alpha: 1.0
            };

            that._viewer.scene.primitives.add(polygon);
        }

        function processPolygon(that, polygon, properties, crsProperties) {
            crsProperties = getCrsProperties(polygon, crsProperties);
            var exterior = polygon.getElementsByTagNameNS(gmlns, "outerBoundaryIs");
            var interior = polygon.getElementsByTagNameNS(gmlns, "innerBoundaryIs");

            var surfaceBoundary;
            if(exterior.length == 0 && interior.length == 0) {
                surfaceBoundary = polygon.firstElementChild;
                surfaceBoundaryHandler = surfaceBoundaryTypes[surfaceBoundary.localName];
            }

            var holes = [], surfaceBoundaryHandler, surfaceBoundary, coordinates;
            for(var i = 0; i < interior.length; i++) {
                surfaceBoundary = interior[i].firstElementChild;
                surfaceBoundaryHandler = surfaceBoundaryTypes[surfaceBoundary.localName];
                holes.push(surfaceBoundaryHandler(surfaceBoundary, [], crsProperties));
            }

            if(exterior.length == 1) {
                exterior = exterior[0];
            }
            var surfaceBoundary = exterior.firstElementChild;
            surfaceBoundaryHandler = surfaceBoundaryTypes[surfaceBoundary.localName];
            that._hierarchy = surfaceBoundaryHandler(that, surfaceBoundary, holes, crsProperties);
            createPolygon(that, that._hierarchy, properties);
        }

        function processMultiPolygon(that, multiPolygon, properties, crsProperties) {
            crsProperties = getCrsProperties(multiPolygon, crsProperties);
            var polygonMembers = multiPolygon.getElementsByTagNameNS(gmlns, "polygonMember");
            if(polygonMembers.length == 0) {
                polygonMembers = multiPolygon.getElementsByTagNameNS(gmlns, "polygonMembers");
            }
            for(var i = 0; i < polygonMembers.length; i++) {
                var polygons = polygonMembers[i].children;
                for(var j = 0; j < polygons.length; j++) {
                    processPolygon(that, polygons[j], properties, crsProperties);
                }
            }
        }

        function processCoordinates(that,coordString) {
            var splitString = coordString.split(" ");
            var coordinates = [];
            for(var i = 0 ; i < splitString.length;i++){
                var coords = splitString[i].split(",");
                coordinates.push(coords[0],coords[1]);
            }
            return coordinates;
        }

        function processLinearRing(that,linearRing, holes, crsProperties) {
            var coordString = linearRing.firstElementChild.textContent;
            var coords = processCoordinates(that,coordString);
            var ll_coords = [];
            for(var i = 0 ; i < coords.length; i++ ){
                ll_coords.push(parseFloat(coords[i]));
            }
            that._coords = Cartesian3.fromDegreesArray(ll_coords);

            var hierarchy = new PolygonHierarchy(that._coords, holes);
            return hierarchy;
        }

        //processRing works with only LineStringSegment. Does not work with Arc,
        //CircleByCenterPoint and Circle. However, its very rare to find Arc,
        //CircleByCenterPoint and Circle as part of a polygon boundary.
        function processRing(ring, holes, crsProperties) {
            var curveMember = ring.firstElementChild.firstElementChild;
            var segments = curveMember.firstElementChild.children;
            var coordinates = [];
            for(i = 0; i < segments.length; i++) {
                if(segmengts[i].localName === "LineStringSegment") {
                    var coordString = segments[i].firstElementChild;
                    coordinates.concat(processCoordinates(coordString));
                } else {
                    //Raise error.
                }
            }
            var hierarchy = new PolygonHierarchy(coordinates, holes);
            return hierarchy;
        }

        function processSurface(that, surface, properties, crsProperties) {
            crsProperties = getCrsProperties(surface, crsProperties);
            var patches = surface.firstElementChild.children;
            for(i = 0; i < patches.length; i++) {
                processPolygon(that, patches[i], properties, crsProperties);
            }
        }

        /*
        *   options = {
                url : "http://localhost:8080/geoserver/",
                layers : "namespace:layerName",
                featureID : feature id(depthContour.3438)(optional)
            };
        */

        function compute(that){
/* modified by cywhale */
            let viewrect = that._viewer.scene.camera.computeViewRectangle(that._viewer.scene.globe.ellipsoid);
            //Rectangle: west, south, east, north
            that.S_W.lng = 180.0 * viewrect.west / Math.PI;
            that.S_W.lat = 180.0 * viewrect.south / Math.PI;
            that.N_E.lng = 180.0 * viewrect.east / Math.PI;
            that.N_E.lat = 180.0 * viewrect.north / Math.PI;
/* modified by cywhale
            var width = that._viewer.scene.canvas.width;
            var height = that._viewer.scene.canvas.height;
            var sw = new Cartesian2(0,height);

            var left = that._viewer.scene.camera.pickEllipsoid(sw, that._viewer.scene.globe.ellipsoid); //Ellipsoid.WGS84);
            if(!left){
                that._validBoundingBox = false;
                return;
            }

            var ne = new Cartesian2(width,0);
            var right = that._viewer.scene.camera.pickEllipsoid(ne, that._viewer.scene.globe.ellipsoid); //Ellipsoid.WGS84);
             if(!right){
                that._validBoundingBox = false;
                return;
            }

            var elps = Ellipsoid.WGS84;

            var SW = elps.cartesianToCartographic(left);
            var NE = elps.cartesianToCartographic(right);

            that.S_W.lng = CesiumMath.toDegrees(SW.longitude);
            that.S_W.lat = CesiumMath.toDegrees(SW.latitude);

            that.N_E.lng = CesiumMath.toDegrees(NE.longitude);
            that.N_E.lat = CesiumMath.toDegrees(NE.latitude);
*/
            that._validBoundingBox = true;

// modified by cywhale, compare current max/min of bbox to track if all data is fetched from WFS //south,west,north,east
            if (that.S_W.lat < that.bboxmax[0]) { that.bboxmax[0] = that.S_W.lat; }
            if (that.S_W.lng < that.bboxmax[1]) { that.bboxmax[1] = that.S_W.lng; }
            if (that.N_E.lat > that.bboxmax[2]) { that.bboxmax[2] = that.N_E.lat; }
            if (that.N_E.lng > that.bboxmax[3]) { that.bboxmax[3] = that.N_E.lng; }
        }

/* from cesium/Source/Core, but add params, just for new Camera(Scene)
        function clonex(object, params, deep = false) { // need params
          var result = new object.constructor(params);
          for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
              var value = object[propertyName];
              if (deep) {
                value = clone(value, deep); //note this call cesium clone
              }
             result[propertyName] = value;
            }
          }
          return(result);
       };
*/
export default function WebFeatureServiceImageryProvider(options) {
//var WebFeatureServiceImageryProvider = function(options){
            if(!defined(options.url))
                throw DeveloperError('options.url is required');

            if(!defined(options.layers))
                throw DeveloperError('options.layers is required');

            if(!defined(options.viewer))
                throw DeveloperError("viewer is required");

            //cesium viewer widget
            this._viewer = options.viewer;

            //address of server
            this._url = options.url;

            //name of the layer published in server
            this._layers = options.layers;

            //complete url generated using _url and layer name
            this._getUrl = undefined;

            //response received from server
            this._response = undefined;

            //vector of coords obtained by parsing GML object
            this._coords = [];

            //hierarchy of polygons
            this._hierarchy = undefined;

            //vector of PolylineCollections
            //used to render linestrings
            this._collectionVector = [];

            //max number of features to request
            this._maxFeatures = defaultValue(options.maxFeatures,100);

            //use bounding box
            this._bboxRequired = defaultValue(options.BBOX,true);

            //found valid bounding box
            this._validBoundingBox = false;

            //bbox south west and north east corners
            this.S_W = {};
            this.N_E = {};
            //Modified by cywhale, if query had reached max/min bbox, then internally force WFS stop listening
            this.bboxmax = [90, 180, -90, -180]; //south,west,north,east //default is inversely minimum
            this.intStopWFS = false;
            //this.extStopWFS = false;

            //this.primitiveIndex = -1;
            this.scratchLastCamera = null;
            this.scratchCamera = null;
            this.unsubscribeTicks;

            //feature map of features alrready rendered
            this._featureMap = [];

            //only render features in current tile
            this._tiled = defaultValue(options.tiled,false);

            this.buildCompleteRequestUrl();

            this.initialize();
};

        //var xhr = new XMLHttpRequest();
        //var scratchLastCamera;
        //var scratchCamera;

        Object.defineProperties(WebFeatureServiceImageryProvider.prototype,{

            url : {
                get : function(){
                    return this._url;
                }
            },

            layers : {
                get : function(){
                    return this._layers;
                }
            },

            ready : {
                get : function(){
                    return this._ready;
                }
            },

            new_url : {
                get : function(){
                    return this._getUrl;
                }
            },


            featureCount : {
                get : function(){
                    return this._coords.length;
                }
            },

            maxFeatures : {
                get : function(){
                    return this._maxFeatures;
                },

                set : function(featureLimit){
                    this._maxFeatures = featureLimit;
                }
            }
        });

        /*
        *   sends a GET request to the server and
        *   waits for a response
        *   returns undefined if response is null
        */
        //this won't work....use promises
        function getResponseFromServer(that,request){
            xhr.onreadystatechange = function(){
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if(xhr.responseText=="")
                        return undefined;
                    else{
                        //alert(xhr.responseText);
                        that._response = xhr.responseText;
                        loadGML(that, that._response);
                        //console.log(that._response);
                    }
                }
            }
            xhr.open('GET',request);
            xhr.send(null);
        }


        function loadGML(that, responseText){
            var rsp = responseText;
            var parser = new DOMParser();
            var gml = parser.parseFromString(rsp,'application/xml');
            processFeatureCollection(that, gml);
        }


        /*
        *   Example Geoserver GET request url
        *   http://localhost:8080/geoserver/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=tiger:tiger_roads&maxFeatures=50
        */
        WebFeatureServiceImageryProvider.prototype.buildCompleteRequestUrl = function(){
            var typeNameInfo = this._layers.split(":");
            var request_url = this._url + "/" + "wfs?"; //GeoServer use ows?  not wfs?
            var params = "service=WFS&version=1.0.0&";
            this._getUrl = request_url + params;
        };

        /*
        *   Start requesting and rendering features
        *   in the current rendering volume
        */
        //change equals test to equalsEpsilon to avoid multiple updates for small changes
        WebFeatureServiceImageryProvider.prototype.addTicksTrig = function(){
            var that = this;

            this.unsubscribeTicks = this._viewer.clock.onTick.addEventListener(function() {
                if (!that.scratchCamera.position.equals(that.scratchLastCamera.position) ||
                    !that.scratchCamera.direction.equals(that.scratchLastCamera.direction) ||
                    !that.scratchCamera.up.equals(that.scratchLastCamera.up) ||
                    !that.scratchCamera.right.equals(that.scratchLastCamera.right) ||
                    !that.scratchCamera.transform.equals(that.scratchLastCamera.transform) ||
                    !that.scratchCamera.frustum.equals(that.scratchLastCamera.frustum)) {
                    that.GetFeature();
                    that.scratchLastCamera = { //clonex(that.scratchCamera, that._viewer.scene, true); //.clone();
                        position: that.scratchCamera.position.clone(),
                        direction: that.scratchCamera.direction.clone(),
                        up: that.scratchCamera.up.clone(),
                        right: that.scratchCamera.right.clone(),
                        transform: that.scratchCamera.transform.clone(),
                        frustum: that.scratchCamera.frustum.clone()
                    };
                }
            });
        }

        WebFeatureServiceImageryProvider.prototype.initialize = function(){
            CesiumMath.setRandomNumberSeed(2);
            if(!this.scratchCamera)
                this.scratchCamera = this._viewer.scene.camera;
            if(!this.scratchLastCamera)
                this.scratchLastCamera = { //clonex(this.scratchCamera, this._viewer.scene, true); //.clone();
                    position: this.scratchCamera.position.clone(),
                    direction: this.scratchCamera.direction.clone(),
                    up: this.scratchCamera.up.clone(),
                    right: this.scratchCamera.right.clone(),
                    transform: this.scratchCamera.transform.clone(),
                    frustum: this.scratchCamera.frustum.clone()
                }
            this.addTicksTrig();
        }

        /*
        *   operations to be supported by WFS spec
        *   logs a string having the XML spec in the console.
        */
        WebFeatureServiceImageryProvider.prototype.GetCapabilities = function(){
            var request = "request=GetCapabilities";
            request = this._getUrl + request;
            when(loadText(request),function(response){
               console.log(response);
            });
        };

        /*
        *   returns  the feature type form
        *   contains only feature types not actual
        *   values and coordinates
        */
        WebFeatureServiceImageryProvider.prototype.DescribeFeatureType = function(){
            var request = "request=DescribeFeatureType&" +  "typeName=" + this._layers;
            request = this._getUrl + request;
            when(loadText(request),function(response){
                console.log(response);
            });
        };

        /*
        *   Default function to get the entire
        *   feature collection in one request
        */
        WebFeatureServiceImageryProvider.prototype.GetFeature = function(){
            if(this._bboxRequired)
                compute(this);
            var that = this;
            var request = "request=GetFeature&" + "typeName=" + this._layers;
            request = this._getUrl + request; // + "&maxFeatures=" + this._maxFeatures;
            if(this._bboxRequired && this._validBoundingBox){
                var bbox = "&bbox=" + this.S_W.lng.toString() + "," + this.S_W.lat.toString() + ",";
                bbox = bbox + this.N_E.lng.toString() + "," + this.N_E.lat.toString();
                request = request + bbox;
            }
            if(this._tiled){
                this.clearCollection();
            }
            when(loadText(request),function(response){
                that._response = response;
                loadGML(that,that._response);
            });

// modified by cywhale, watch if current max/min of bbox reach [-90, -180, 90, 180] //south,west,north,east
            if (this.bboxmax[0] <= -89.99 && this.bboxmax[1] <= -179.99 &&
                this.bboxmax[2] >= 89.99 && this.bboxmax[3] >= 179.99) {
              this.intStopWFS = true;
              this.unsubscribeTicks();
            }
        };

        /*
        * delete all renedered primitives
        */
        WebFeatureServiceImageryProvider.prototype.clearCollection = function(){
            //this.primitiveIndex = -1;
            if(this._collectionVector.length === 0){
                return;
            } else {
                var primitives = this._viewer.scene.primitives;
                for(var i = 0 ; i < this._collectionVector.length; i++){
                    primitives.remove(this._collectionVector[i]);
                }
            }
        };

// add by cywhale, just show or hide
        WebFeatureServiceImageryProvider.prototype.hideCollection = function(){
            if(this._collectionVector.length === 0){
                return;
            } else {
              var primitives = this._viewer.scene.primitives;
              //for(var i = 0 ; i < this._collectionVector.length; i++){
              primitives.show = false; //.getGeometryInstanceAttributes(this.primitiveIndex + i);
              //}
            }
        };

        WebFeatureServiceImageryProvider.prototype.showCollection = function(){
            if(this._collectionVector.length === 0){
                return;
            } else {
              var primitives = this._viewer.scene.primitives;
              //for(var i = 0 ; i < this._collectionVector.length; i++){
              primitives.show = true;
              //}
            }
        };
        /*
        *   Function to get specific features
        *   Specify a list of features to be queried
        *   Ex. features = ["contour.1","contour.2","contour.3"...]
        */
        WebFeatureServiceImageryProvider.prototype.GetSpecificFeatures = function(featureList){

            var f_list;
            var f_length = featureList.length;
            if(f_length === 1){
                var request = "request=GetFeature&" + "typeName=" + this._layers
                                + "&" + "featureID=" + featureList[0];
                request = this._getUrl + request;
                return getResponseFromServer(request);
            }else{
                f_list = featureList[0];
                for(var i = 1 ;i < f_length; i++){
                    f_list = f_list + "," + featureList[i];
                }
                var request = "request=GetFeature&" + "typeName=" + this._layers
                                + "&" + "featureID=" + f_list;
                request = this._getUrl + request;
                return getResponseFromServer(this, request);
            }
        };

        /*
        *   Get Feature with ID
        */
        WebFeatureServiceImageryProvider.prototype.GetFeatureWithId = function(id){
            var request = "request=GetFeature&" + "featureID=" + id;
            request = this._getUrl + request;
            //getResponseFromServer(this,request);
            var that = this;
           when(loadText(request),function(response){
                that._response = response;
                loadGML(that,that._response);
            });
        };

//      return WebFeatureServiceImageryProvider;
//  });
