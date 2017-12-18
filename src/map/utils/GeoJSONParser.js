goog.provide('anychart.mapModule.utils.GeoJSONParser');
goog.require('anychart.core.reporting');
goog.require('anychart.mapModule.geom');
//goog.require('acgraph.math');



/**
 * Geo JSON parser class.
 * @constructor
 */
anychart.mapModule.utils.GeoJSONParser = function() {
};
goog.addSingletonGetter(anychart.mapModule.utils.GeoJSONParser);


/**
 * Returns parser type.
 * @return {anychart.enums.MapGeoDataTypes}
 */
anychart.mapModule.utils.GeoJSONParser.prototype.getType = function() {
  return anychart.enums.MapGeoDataTypes.GEO_JSON;
};


/**
 * Parse geo JSON data.
 * @param {Object} data GeoJSON data to parse.
 * @return {!Array.<anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection>} .
 */
anychart.mapModule.utils.GeoJSONParser.prototype.parse = function(data) {
  var i, len;
  var objects = [];

  this.projection = data['ac-tx'];
  this.ratio = this.projection && this.projection['ac-ratio'] ? this.projection['ac-ratio'] : 1;
  this.idField = goog.isDef(data['ac-geoFieldId']) ? data['ac-geoFieldId'] : 'id';


  switch (data['type']) {
    case 'FeatureCollection':
      if (!data['features']) {
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'FeatureCollection object missing \'features\' member.');
      } else {
        var features = data['features'];
        for (i = 0, len = features.length; i < len; i++) {
          var feature = features[i];
          objects.push(this.parseGeometry_(feature['geometry'], feature['properties']));
        }
      }
      break;

    case 'GeometryCollection':
      if (!data['geometries']) {
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geometries = data['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          objects.push(this.parseGeometry_(geometries[i], geometries[i]['properties']));
        }
      }
      break;

    case 'Feature':
      if (!(data['properties'] && data['geometry'])) {
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Feature object missing \'properties\' or \'geometry\' member.');
      } else {
        objects.push(this.parseGeometry_(data['geometry'], data['properties']));
      }
      break;

    case 'Point':
    case 'MultiPoint':
    case 'LineString':
    case 'MultiLineString':
    case 'Polygon':
    case 'MultiPolygon':
      if (data['coordinates']) {
        objects.push(this.parseGeometry_(data, null));
      } else {
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Geometry object missing \'coordinates\' member.');
      }
      break;

    default:
      anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeoJSON object must be one of \'Point\',' +
          ' \'LineString\', \'Polygon\', \'MultiPolygon\', \'Feature\', \'FeatureCollection\' or \'GeometryCollection\'.');
  }

  return objects;
};


/**
 * @param {Object.<*>} geojsonGeometry .
 * @param {Object.<*>} properties .
 * @return {null|anychart.mapModule.geom.Point|anychart.mapModule.geom.Line|anychart.mapModule.geom.Polygon|anychart.mapModule.geom.Collection}
 * @private
 */
anychart.mapModule.utils.GeoJSONParser.prototype.parseGeometry_ = function(geojsonGeometry, properties) {
  var coord,
      path,
      polygon,
      polygons,
      i,
      j,
      obj,
      outerPath,
      holes,
      hole,
      x, y, projected;

  var geoCoords, len, len_;

  if (properties && !(properties['middle-x'] || properties['middle-y'])) {
    var geoMiddleX = goog.object.findValue(properties, function(value, key) {
      return (/middle-x/).test(key);
    });
    var geoMiddleY = goog.object.findValue(properties, function(value, key) {
      return (/middle-y/).test(key);
    });

    var middleX = /** @type {number}*/(geoMiddleX || .5);
    var middleY = /** @type {number}*/(geoMiddleY || .5);

    properties['middle-x'] = middleX;
    properties['middle-y'] = middleY;
  }

  var id = properties[this.idField];
  var projectionSrc = this.projection[id] || this.projection['default'] || anychart.charts.Map.DEFAULT_TX['default'];
  var projection = anychart.mapModule.projections.getProjection(projectionSrc.crs);
  // var projection = new anychart.mapModule.projections.Bonne();
  var scale = goog.isDef(projectionSrc.scale) ? projectionSrc.scale : 1;
  // var scale = 1;
  var xoffset = (projectionSrc.xoffset || 0);
  // var xoffset = 0;
  var yoffset = (projectionSrc.yoffset || 0);
  // var yoffset = 0;

  switch (geojsonGeometry['type']) {
    case 'Point':
      coord = geojsonGeometry['coordinates'];
      projected = this.applyProjection(coord, projection, scale, xoffset, yoffset);
      x = projected[0];
      y = projected[1];

      return {
        'coordinates': [x, y],
        'properties': properties
      };
      break;

    case 'MultiPoint':
      var coordinates = [];
      geoCoords = geojsonGeometry['coordinates'];
      for (i = 0, len = geoCoords.length; i < len; i++) {
        coord = geoCoords[i];
        projected = this.applyProjection(coord, projection, scale, xoffset, yoffset);
        x = projected[0];
        y = projected[1];

        coordinates.push(x, y);
      }
      return {'coordinates': coordinates, 'properties': properties};
      break;

    case 'LineString':
      path = [];
      geoCoords = geojsonGeometry['coordinates'];
      for (i = 0, len = geoCoords.length; i < len; i++) {
        coord = geoCoords[i];
        projected = this.applyProjection(coord, projection, scale, xoffset, yoffset);
        x = projected[0];
        y = projected[1];

        path.push(x, y);
      }
      return {'paths': [path], 'properties': properties};
      break;

    case 'MultiLineString':
      var paths = [];
      var strings = geojsonGeometry['coordinates'];
      for (i = 0, len = strings.length; i < len; i++) {
        path = [];
        geoCoords = strings[i];
        for (j = 0, len_ = geoCoords.length; j < len_; j++) {
          coord = geoCoords[j];
          projected = this.applyProjection(coord, projection, scale, xoffset, yoffset);
          x = projected[0];
          y = projected[1];

          path.push(x, y);
        }
        paths.push(path);
      }
      return {'paths': paths, 'properties': properties};
      break;

    case 'Polygon':
      outerPath = [];
      holes = [];
      polygon = geojsonGeometry['coordinates'];
      for (i = 0, len = polygon.length; i < len; i++) {
        if (i != 0) hole = [];
        geoCoords = polygon[i];
        for (j = 0, len_ = geoCoords.length; j < len_; j++) {
          coord = geoCoords[j];
          projected = this.applyProjection(coord, projection, scale, xoffset, yoffset);
          x = projected[0];
          y = projected[1];

          if (!i) {
            outerPath.push(x, y);
          } else {
            hole.push(x, y);
          }
        }
        if (hole) holes.push(hole);
      }

      return {'polygones': [{'outerPath': outerPath, 'holes': holes}], 'properties': properties};
      break;

    case 'MultiPolygon':
      polygons = [];
      var geoPolygons = geojsonGeometry['coordinates'];
      for (i = 0, len = geoPolygons.length; i < len; i++) {
        outerPath = [];
        holes = [];
        polygon = geoPolygons[i];
        for (j = 0, len_ = polygon.length; j < len_; j++) {
          if (j != 0) hole = [];
          geoCoords = polygon[j];
          for (var k = 0, len__ = geoCoords.length; k < len__; k++) {
            coord = geoCoords[k];
            projected = this.applyProjection(coord, projection, scale, xoffset, yoffset);
            x = projected[0];
            y = projected[1];

            if (!j) {
              outerPath.push(x, y);
            } else {
              hole.push(x, y);
            }
          }
          if (hole) holes.push(hole);
        }
        polygon = {'outerPath': outerPath, 'holes': holes};
        polygons.push(polygon);
      }
      return {'polygones': polygons, 'properties': properties};
      break;

    case 'GeometryCollection':
      if (!geojsonGeometry['geometries']) {
        anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'GeometryCollection object missing \'geometries\' member.');
      } else {
        var geoms = [];
        var geometries = geojsonGeometry['geometries'];
        for (i = 0, len = geometries.length; i < len; i++) {
          obj = this.parseGeometry_(geometries[i], geometries[i]['properties']);
          if (goog.isDef(obj)) {
            geoms.push(obj);
          } else {
            break;
          }
        }
        return {'geometries': geoms, 'properties': properties || null};
      }
      break;

    default:
      anychart.core.reporting.error(anychart.enums.ErrorCode.INVALID_GEO_JSON_OBJECT, 'Geometry object must be one of ' +
          '\'Point\', \'LineString\', \'Polygon\' or \'MultiPolygon\'.');
      return null;
      break;
  }
  return null;
};


/**
 * Export geo data to GeoJSON format.
 * @param {Object} gdom Geo data object.
 * @param {Object} tx Object with transformation for geo data.
 * @return {Object}
 */
anychart.mapModule.utils.GeoJSONParser.prototype.exportToGeoJSON = function(gdom, tx) {
  var geojson = {
    'type': 'FeatureCollection',
    'crs': gdom['crs'] || {
      'type': 'name',
      'properties': {
        'name': tx['default']['src-code']
      }
    },
    'features': []
  };
  geojson['ac-tx'] = {};
  goog.object.forEach(tx, function(value, key) {
    if (key == 'ac-ratio') {
      geojson['ac-tx'][key] = 1;
    } else {
      var tx_ = {};

      if (goog.isDef(value.crs)) tx_['crs'] = value.crs;
      if (goog.isDef(value.scale)) tx_['scale'] = value.scale;
      if (goog.isDef(value.xoffset)) tx_['xoffset'] = value.xoffset;
      if (goog.isDef(value.yoffset)) tx_['yoffset'] = value.yoffset;
      if (goog.isDef(value.heatZone)) tx_['heatZone'] = value.heatZone.serialize();

      geojson['ac-tx'][key] = tx_;
    }
  });

  var features = geojson['features'];

  for (var i = 0; i < gdom.length; i++) {
    var region = gdom[i];
    var feature = {
      'type': 'Feature',
      'properties': region['properties'],
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': []
      }
    };

    for (var j = 0; j < region['polygones'].length; j++) {
      var coords = [];
      var polygon = region['polygones'][j];

      for (var k = 0; k < polygon['outerPath'].length - 1; k += 2) {
        coords.push([polygon['outerPath'][k], polygon['outerPath'][k + 1]]);
      }
      feature['geometry']['coordinates'].push([coords]);
    }

    features.push(feature);
  }

  return geojson;
};


/**
 *
 * @param {Array.<number>} coord .
 * @param {anychart.mapModule.projections.Base} projection .
 * @param {number} scale .
 * @param {number} xoffset .
 * @param {number} yoffset .
 * @return {Array.<number>} .
 */
anychart.mapModule.utils.GeoJSONParser.prototype.applyProjection = function(coord, projection, scale, xoffset, yoffset) {
  var x = coord[0] / this.ratio;
  var y = coord[1] / this.ratio;

  var projected = projection.forward(x, y);

  x = projected[0] * scale + xoffset;
  y = projected[1] * scale + yoffset;

  return [x, y];
};
