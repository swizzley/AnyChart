goog.provide('anychart.chartEditor2Module.EditorModel');

goog.require('goog.events.EventTarget');
goog.require('goog.format.JsonPrettyPrinter');
goog.require('goog.format.JsonPrettyPrinter.SafeHtmlDelimiters');


/**
 * Model!
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
anychart.chartEditor2Module.EditorModel = function() {
  anychart.chartEditor2Module.EditorModel.base(this, 'constructor');

  /**
   * Data container
   * @type {Object}
   * @private
   */
  this.data_ = {};

  /**
   * Data sets descriptions container
   * @type {Array}
   * @private
   */
  this.preparedData_ = [];

  this.generateInitialMappingsOnChangeView_ = true;

  /**
   * Model structure
   * @type {anychart.chartEditor2Module.EditorModel.Model}
   * @private
   */
  this.model_ = {
    'dataSettings': {
      'active': null,
      'activeGeo': null,
      'field': null,
      'mappings': [
        // [ // plot
        //   {ctl: 'line', mapping: {value: 1}},
        //   {ctl: 'column', mapping: {value: 2}}
        // ]
      ]
    },
    'anychart': {},
    'chart': {
      'type': null,
      'seriesType': null,
      'settings': {
        //'getSeriesAt(0).name()': 'my series'
      }
    },
    'outputSettings': null
  };

  /**
   * Default model values.
   * @type {Array}
   * @private
   */
  this.defaults_ = [];

  /**
   * Data set analysis result
   * @type {Object}
   * @private
   */
  this.fieldsState_ = {};

  this.suspendQueue_ = 0;

  /**
   * Callback with string names.
   * @type {Object}
   * @private
   */
  this.callbacks_ = {
    'setActiveAndField': this.setActiveAndField,
    'setActiveGeo': this.setActiveGeo,
    'setChartType': this.setChartType,
    'setSeriesType': this.setSeriesType,
    'setTheme': this.setTheme,
    'setSettingForSeries': this.setSettingForSeries,
    'setContextMenuItemEnable': this.setContextMenuItemEnable
  };

  /**
   * @type {Object}
   * @private
   */
  this.contextMenuItems_ = {
    'exclude': {'items': ['exclude-points-point', 'exclude-points-list', 'exclude-points-keep-only', 'exclude-points-separator'], 'enabled': true},
    'marquee': {'items': ['select-marquee-start', 'zoom-marquee-start', 'select-marquee-separator'], 'enabled': true},
    'saveAs': {'items': 'save-chart-as', 'enabled': true},
    'saveDataAs': {'items': 'save-data-as', 'enabled': true},
    'shareWith': {'items': 'share-with', 'enabled': true},
    'printChart': {'items': 'print-chart', 'enabled': true},
    'about': {'items': ['about', 'exporting-separator'], 'enabled': true},
    'fullScreen': {'items': ['full-screen-enter', 'full-screen-exit', 'full-screen-separator'], 'enabled': true}
  };

  /**
   * @type {Array}
   * @private
   */
  this.geoDataIndex_ = [];
};
goog.inherits(anychart.chartEditor2Module.EditorModel, goog.events.EventTarget);


/**
 * @typedef {Array.<(Array|string)>}
 */
anychart.chartEditor2Module.EditorModel.Key;


/**
 * @typedef {{
 *  dataSettings:
 *  {
 *      active: ?string,
 *      activeGeo: ?string,
 *      field: ?string,
 *      mappings: Array
 *  },
 *  anychart: Object,
 *  chart:
 *  {
 *      type: ?string,
 *      seriesType: ?string,
 *      settings: Object
 *  },
 *  outputSettings: ?anychart.chartEditor2Module.EditorModel.OutputOptions
 * }}
 */
anychart.chartEditor2Module.EditorModel.Model;


/**
 * @typedef {{
 *  minify: boolean,
 *  container: string,
 *  wrapper: (string),
 *  addData: boolean,
 *  addGeoData: boolean
 * }}
 */
anychart.chartEditor2Module.EditorModel.OutputOptions;


// region Structures
/**
 * @enum {string}
 */
anychart.chartEditor2Module.EditorModel.DataType = {
  CUSTOM: 'c',
  PREDEFINED: 'p',
  GEO: 'g'
};


/**
 * @type {Object}
 */
anychart.chartEditor2Module.EditorModel.ChartTypes = {
  // 'cartesian': {
  //   'value': 'cartesian',
  //   'name': 'cartesian',
  //   'icon': 'line-chart-1.svg', // 'http://www.anychart.com/_design/img/upload/charts/types/'
  //   'series': ['line', 'spline', 'column', 'area', 'ohlc'], // first value is default
  //   'dataSetCtor': 'set',
  //   'panelsExcludes' : ['colorScale']
  // },
  'line': {
    'value': 'line',
    'name': 'Line',
    'icon': 'line-chart-1.svg', // 'http://www.anychart.com/_design/img/upload/charts/types/'
    'series': ['line', 'spline', 'area', 'splineArea', 'column', 'ohlc'], // first value is default
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'area': {
    'value': 'area',
    'name': 'Area',
    'icon': 'area-chart.svg',
    'series': ['area', 'splineArea', 'line', 'spline', 'column', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'area-stacked-value': {
    'value': 'area',
    'stackMode': 'value',
    'name': 'Area stacked (value)',
    'icon': 'stacked-area-chart.svg',
    'series': ['area', 'splineArea', 'line', 'spline', 'column', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'area-stacked-percent': {
    'value': 'area',
    'stackMode': 'percent',
    'name': 'Area stacked (percent)',
    'icon': 'percent-stacked-area-chart.svg',
    'series': ['area', 'splineArea', 'line', 'spline', 'column', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'bar': {
    'value': 'bar',
    'name': 'Bar',
    'icon': 'bar-chart.svg',
    'series': ['bar', 'line', 'spline', 'area', 'splineArea', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'bar-stacked-value': {
    'value': 'bar',
    'stackMode': 'value',
    'name': 'Bar stacked (value)',
    'icon': 'stacked-bar-chart.svg',
    'series': ['bar', 'line', 'spline', 'area', 'splineArea', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'bar-stacked-percent': {
    'value': 'bar',
    'stackMode': 'percent',
    'name': 'Bar stacked (percent)',
    'icon': 'percent-stacked-bar-chart.svg',
    'series': ['bar', 'line', 'spline', 'area', 'splineArea', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'column': {
    'value': 'column',
    'name': 'Column',
    'icon': 'column-chart.svg',
    'series': ['column', 'line', 'spline', 'area', 'splineArea', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'column-stacked-value': {
    'value': 'column',
    'stackMode': 'value',
    'name': 'Column stacked (value)',
    'icon': 'stacked-column-chart.svg',
    'series': ['column', 'line', 'spline', 'area', 'splineArea', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'column-stacked-percent': {
    'value': 'column',
    'stackMode': 'percent',
    'name': 'Column stacked (percent)',
    'icon': 'percent-stacked-step-line-area-chart.svg',
    'series': ['column', 'line', 'spline', 'area', 'splineArea', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'scatter': {
    'value': 'scatter',
    'name': 'Scatter',
    'icon': 'scatter-chart.svg',
    'series': ['marker', 'bubble', 'line'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  },
  'pie': {
    'value': 'pie',
    'name': 'Pie',
    'icon': 'pie-chart.svg',
    'series': ['pie'],
    'dataSetCtor': 'set',
    'singleSeries': true,
    'panelsExcludes' : ['series', 'grids', 'axes', 'colorScale']
  },
  'funnel': {
    'value': 'funnel',
    'name': 'Funnel',
    'icon': 'funnel-chart.svg',
    'series': ['funnel'],
    'dataSetCtor': 'set',
    'singleSeries': true,
    'panelsExcludes' : ['series', 'grids', 'axes', 'colorScale']
  },
  'map': {
    'value': 'map',
    'name': 'Map',
    'icon': 'choropleth-map.svg',
    'series': ['marker-by-id', 'marker-by-coordinates', 'bubble-by-id', 'bubble-by-coordinates', 'choropleth'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['grids', 'axes', 'colorScale'],
    'settingsExcludes': ['animation().enabled()']
  },
  'stock': {
    'value': 'stock',
    'name': 'Stock',
    'icon': 'stock-chart.svg',
    'series': ['ohlc', 'candlestick', 'line', 'spline', 'column', 'area', 'splineArea'],
    'dataSetCtor': 'table',
    'panelsExcludes' : ['data-labels', 'axes', 'colorScale'],
    'settingsExcludes': ['palette()', 'legend().enabled()', 'animation().enabled()']
  },
  'heatMap': {
    'value': 'heatMap',
    'name': 'Heat Map',
    'icon': 'heatmap-chart.svg',
    'series': ['heatMap'],
    'dataSetCtor': 'set',
    'singleSeries': true,
    'panelsExcludes' : ['series'],
    'settingsExcludes': ['palette()', 'animation().enabled()']
  },
  'box': {
    'value': 'box',
    'name': 'Box',
    'icon': 'box-chart.svg',
    'series': ['box', 'line', 'spline', 'column', 'area', 'marker', 'bubble', 'ohlc'],
    'dataSetCtor': 'set',
    'panelsExcludes' : ['colorScale']
  }
};


/**
 * @type {Object}}
 */
anychart.chartEditor2Module.EditorModel.Series = {
  'line': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'spline': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'column': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'bar': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'area': {
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'splineArea': {
    'name': 'Spline Area',
    'fields': [{'field': 'value', 'name': 'Y Value'}]
  },
  'ohlc': {
    'fields': [
      {'field': 'open', 'name': 'Open Value'},
      {'field': 'high', 'name': 'High Value'},
      {'field': 'low', 'name': 'Low Value'},
      {'field': 'close', 'name': 'Close Value'}]
  },
  'candlestick': {
    'fields': [
      {'field': 'open'},
      {'field': 'high'},
      {'field': 'low'},
      {'field': 'close'}]
  },
  'box': {
    'fields': [
      {'field': 'lowest'},
      {'field': 'q1'},
      {'field': 'median'},
      {'field': 'q3'},
      {'field': 'highest'},
      {'field': 'value'},
      {'field': 'outliers'}]
  },
  'pie': {
    'fields': [{'field': 'value', 'name': 'Value'}]
  },
  'funnel': {
    'fields': [{'field': 'value', 'name': 'Value'}]
  },
  'marker': {
    'fields': [{'field': 'value', 'name': 'Value'}]
  },
  'bubble': {
    'fields': [
      {'field': 'value', 'name': 'Value'},
      {'field': 'size', 'name': 'Size'}]
  },
  // map series
  'marker-by-id': {
    'name': 'Marker (by geo Id)',
    'fields': [
      {'field': 'id', 'name': 'Id'}
    ]
  },
  'marker-by-coordinates': {
    'name': 'Marker (by coordinates)',
    'fields': [
      {'field': 'lat', 'name': 'Latitude'},
      {'field': 'long', 'name': 'Longitude'}
    ]
  },
  'bubble-by-id': {
    'name': 'Bubble (by geo Id)',
    'fields': [
      {'field': 'id', 'name': 'Id'},
      {'field': 'size', 'name': 'Size'}
    ]
  },
  'bubble-by-coordinates': {
    'name': 'Bubble (by coordinates)',
    'fields': [
      {'field': 'lat', 'name': 'Latitude'},
      {'field': 'long', 'name': 'Longitude'},
      {'field': 'size', 'name': 'Size'}
    ]
  },
  'choropleth': {
    'fields': [
      {'field': 'id', 'name': 'Id'},
      {'field': 'value', 'name': 'Value'}
    ]
  },
  'heatMap': {
    'fields': [
      {'field': 'y', 'name': 'Y'},
      {'field': 'heat', 'name': 'Heat'}
    ]
  }
};
// endregion


// region Model initialization
/**
 * Processes analysis of active data set.  Need ['dataSettings']['active'] to be set.
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.analyzeDataBeforeFieldChoose_ = function() {
  this.fieldsState_ = {
    numbersCount: 0,
    coordinates: [],
    numbers: []
  };

  var rawData = this.getRawData();
  var dataRow = rawData[0];
  var fieldValue;
  var numberValue;
  var key;

  for (key in dataRow) {
    fieldValue = dataRow[key];
    numberValue = goog.string.toNumber(fieldValue);

    if (!this.fieldsState_.date && goog.isString(fieldValue) && isNaN(numberValue) && new Date(fieldValue).getTime()) {
      // Full valid date by string ("2010-05-17")
      this.fieldsState_.date = key;
    }

    if (!this.fieldsState_.date_short && !isNaN(numberValue) && /^[0-2]\d{3}$/.test(fieldValue)) {
      // Short date ("2010")
      this.fieldsState_.date_short = key;
    }

    if (!isNaN(numberValue)) {
      if (this.fieldsState_.coordinates.length < 2 && new RegExp(/^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/).exec(fieldValue)) {
        this.fieldsState_.coordinates.push(key);
      }

    } else if (goog.isString(fieldValue)) {
      this.fieldsState_.firstString = goog.isDef(this.fieldsState_.firstString) ? this.fieldsState_.firstString : key;

      if (!this.fieldsState_.geoId && this.isGeoId_(fieldValue))
        this.fieldsState_.geoId = key;
    }
  }

  if (this.fieldsState_.coordinates.length < 2)
    this.fieldsState_.coordinates = [];
};


/**
 * Processes analysis of active data set. Need ['dataSettings']['field'] to be set.
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.analyzeDataAfterFieldChoose_ = function() {
  var rawData = this.getRawData();
  var dataRow = rawData[0];
  var numberValue;
  var key;

  // Counting numbers
  for (key in dataRow) {
    if (this.model_['dataSettings']['field'] == key)
      continue;

    numberValue = goog.string.toNumber(dataRow[key]);
    if (!isNaN(numberValue)) {
      this.fieldsState_.numbers.push(key);
      this.fieldsState_.numbersCount++;
    }
  }
};


/**
 * Processes analysis of active data set and sets field.
 *
 * @param {string=} opt_active Active data set id
 * @param {string=} opt_field Field id
 */
anychart.chartEditor2Module.EditorModel.prototype.chooseActiveAndField = function(opt_active, opt_field) {
  this.dropChartSettings();

  var preparedData = this.getPreparedData();
  this.model_['dataSettings']['active'] = goog.isDefAndNotNull(opt_active) ? opt_active : preparedData[0].setFullId;

  this.analyzeDataBeforeFieldChoose_();

  // Set up field
  if (goog.isDefAndNotNull(opt_field)) {
    this.model_['dataSettings']['field'] = opt_field;

  } else {
    this.model_['dataSettings']['field'] = goog.isDef(this.fieldsState_.date) ?
        this.fieldsState_.date :
        goog.isDef(this.fieldsState_.date_short) ?
            this.fieldsState_.date_short :
            goog.isDef(this.fieldsState_.firstString) ?
                this.fieldsState_.firstString :
                preparedData[0].fields[0].key;
  }

  this.analyzeDataAfterFieldChoose_();
};


/**
 * Chooses chart type.
 */
anychart.chartEditor2Module.EditorModel.prototype.chooseDefaultChartType = function() {
  var chartType = null;
  var recomendedChartType = this.data_[this.getActive()].chartType;
  if (recomendedChartType) {
    var availableTypes = goog.object.getKeys(anychart.chartEditor2Module.EditorModel.ChartTypes);
    if (goog.array.indexOf(availableTypes, recomendedChartType) !== -1)
      chartType = recomendedChartType;
  }

  if (!chartType) {
    chartType = 'line';
    var rawData = this.getRawData();

    if (this.model_['dataSettings']['field'] == this.fieldsState_.date) {
      chartType = 'stock';

    } else if (this.model_['dataSettings']['field'] == this.fieldsState_.date_short) {
      chartType = 'column';

      if (this.fieldsState_.numbersCount > 3)
        this.setStackMode('value');

    } else if (this.model_['dataSettings']['field'] == this.fieldsState_.firstString) {
      if (rawData.length <= 5 && this.fieldsState_.numbersCount == 1)
        chartType = 'pie';
      else if (this.fieldsState_.numbersCount <= 3)
        chartType = 'bar';
      else if (this.fieldsState_.numbersCount <= 5) {
        chartType = 'bar';
        this.setStackMode('value');
      }

    } else
      chartType = 'scatter';
  }

  if (chartType === 'map')
    this.initGeoData_();

  this.model_['chart']['type'] = chartType;

  // DEBUG
  // this.model_['chart']['type'] = 'heatMap';
};


/**
 * Chooses default series type.
 */
anychart.chartEditor2Module.EditorModel.prototype.chooseDefaultSeriesType = function() {
  var seriesType = null;
  var recomendedSeriesType = this.data_[this.getActive()].seriesType;
  if (recomendedSeriesType) {
    var availableTypes = anychart.chartEditor2Module.EditorModel.ChartTypes[this.model_['chart']['type']]['series'];
    if (goog.array.indexOf(availableTypes, recomendedSeriesType) !== -1)
      seriesType = recomendedSeriesType;
  }

  if (!seriesType) {
    seriesType = anychart.chartEditor2Module.EditorModel.ChartTypes[this.model_['chart']['type']]['series'][0];
    switch (this.model_['chart']['type']) {
      case 'map':
        if (this.fieldsState_.coordinates.length == 2) {
          if (this.fieldsState_.numbersCount)
            seriesType = 'bubble-by-coordinates';
          else
            seriesType = 'marker-by-coordinates';

        } else if (this.fieldsState_.geoId) {
          if (this.fieldsState_.numbersCount)
            seriesType = 'bubble-by-id';
          else
            seriesType = 'marker-by-id';
        }
        break;

      case 'stock':
        if (this.fieldsState_.numbersCount < 4 || this.fieldsState_.numbersCount > 5)
          seriesType = 'line';
        break;

      case 'scatter':
        if (!(this.fieldsState_.numbersCount % 2))
          seriesType = 'bubble';
        else
          seriesType = 'marker';
        break;
    }
  }

  this.model_['chart']['seriesType'] = seriesType;
};


/**
 * Creates default mappings for plots and series.
 */
anychart.chartEditor2Module.EditorModel.prototype.createDefaultMappings = function() {
  this.model_['dataSettings']['mappings'] = [];

  if (this.model_['chart']['type'] == 'stock') {
    this.model_['dataSettings']['mappings'] = [this.createPlotMapping()];

    if (this.model_['chart']['seriesType'] == 'ohlc' && this.fieldsState_.numbersCount == 5) {
      this.model_['chart']['seriesType'] = 'column';
      this.model_['dataSettings']['mappings'].push(this.createPlotMapping());
      this.model_['chart']['seriesType'] = 'ohlc';
    }
  }
  else
    this.model_['dataSettings']['mappings'] = [this.createPlotMapping()];
};


/**
 * Creates plot mapping. Need active data set and default series type to be chosen.
 * @return {Array}
 */
anychart.chartEditor2Module.EditorModel.prototype.createPlotMapping = function() {
  var result = [];
  var chartType = this.model_['chart']['type'];
  var seriesType = this.model_['chart']['seriesType'];
  var singleSeries = !!anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['singleSeries'];

  var numValues = 1;
  if (seriesType == 'bubble')
    numValues = 2;
  else if (seriesType == 'ohlc' || seriesType == 'candlestick')
    numValues = 4;

  var plotIndex = this.model_['dataSettings']['mappings'].length;
  var numSeries;
  var fieldIndex;
  if (singleSeries || chartType== 'map' || chartType== 'box' ||
      (chartType == 'stock' && seriesType == 'column' && plotIndex == 1))
    numSeries = 1;
  else
    numSeries = Math.floor(this.fieldsState_.numbersCount / numValues);

  if (chartType== 'stock' && seriesType == 'column' && plotIndex == 1)
    fieldIndex = 4; // try to set volume plot

  for (var i = 0; i < numSeries; i += numValues) {
    var seriesConfig = this.createSeriesConfig(i, /** @type {string} */(seriesType), void 0, fieldIndex);
    result.push(seriesConfig);
  }

  return result;
};


/**
 * Creates series config.
 * @param {number} index
 * @param {string} type Series type.
 * @param {string=} opt_id Series id.
 * @param {number=} opt_startFieldIndex Index of number to start from.
 * @return {Object}
 */
anychart.chartEditor2Module.EditorModel.prototype.createSeriesConfig = function(index, type, opt_id, opt_startFieldIndex) {
  var config = {'ctor': type, 'mapping': {}};
  config['id'] = goog.isDef(opt_id) ? opt_id : goog.string.createUniqueString();

  var numbers = goog.array.clone(this.fieldsState_.numbers);
  if (this.model_['chart']['type'] == 'map') {
    var self = this;
    numbers = goog.array.filter(numbers, function(item){
      return goog.array.indexOf(self.fieldsState_.coordinates, item) == -1;
    });
    this.fieldsState_.numbersCount = numbers.length;
  }

  //
  var fields = anychart.chartEditor2Module.EditorModel.Series[type]['fields'];

  for (var i = 0; i < fields.length; i++) {
    if (fields[i]['field'] == 'id' && this.fieldsState_.geoId) {
      config['mapping'][fields[i]['field']] = this.fieldsState_.geoId;

    } else if (this.fieldsState_.coordinates && (fields[i]['field'] == 'lat' || fields[i]['field'] == 'long')) {
      config['mapping'][fields[i]['field']] = (fields[i]['field'] == 'lat') ?
          this.fieldsState_.coordinates[0] :
          this.fieldsState_.coordinates[1];

    } else {
      var j = index + i + (goog.isNumber(opt_startFieldIndex) ? opt_startFieldIndex : 0);
      var numberIndex = numbers.length > j ? j : j % numbers.length;
      config['mapping'][fields[i]['field']] = numbers[numberIndex];

      // Set series name if possible
      if (fields.length == 1 && this.model_['chart']['type'] != 'stock' && String(numbers[numberIndex]).length > 1) {
        var stringKey = 'getSeries(\'' + config['id'] + '\').name()';
        var key = [['chart'], ['settings'], stringKey];
        this.setValue(key, numbers[numberIndex], true, true, true);
      }
    }
  }
  return config;
};


/**
 * Checks if current mapping are not compatible with new chart and series types.
 *
 * @param {string} prevChartType
 * @param {string} prevSeriesType
 * @return {boolean} true if mappings are not compatible.
 */
anychart.chartEditor2Module.EditorModel.prototype.needResetMappings = function(prevChartType, prevSeriesType) {
  if (goog.array.indexOf(anychart.chartEditor2Module.EditorModel.ChartTypes[this.model_['chart']['type']]['series'], prevSeriesType) == -1)
    return true;

  var chartType = this.model_['chart']['type'];

  return (prevChartType == 'stock' || chartType == 'stock') ||
      (prevChartType == 'map' || chartType == 'map') ||
      (prevChartType == 'heatMap' || chartType == 'heatMap') ||
      chartType == 'pie';
};


/**
 * Checks if fields of two series types are compatible.
 *
 * @param {string} seriesType1
 * @param {string} seriesType2
 * @return {boolean} true if compatible
 */
anychart.chartEditor2Module.EditorModel.prototype.checkSeriesFieldsCompatible = function(seriesType1, seriesType2) {
  var fields1 = anychart.chartEditor2Module.EditorModel.Series[seriesType1]['fields'];
  var fields2 = anychart.chartEditor2Module.EditorModel.Series[seriesType2]['fields'];
  var compatible = true;
  if (fields1.length == fields2.length) {
    for (var i = fields1.length; i--;) {
      if (fields1[i]['field'] != fields2[i]['field']) {
        compatible = false;
        break;
      }
    }
  } else
    compatible = false;

  return compatible;
};


/** @return {?Array.<Object>} */
anychart.chartEditor2Module.EditorModel.prototype.getGeoDataIndex = function() {
  return this.geoDataIndex_.length ? this.geoDataIndex_ : null;
};


/** @private */
anychart.chartEditor2Module.EditorModel.prototype.initGeoData_ = function() {
  var activeGeo = goog.isString(this.model_['dataSettings']['activeGeo']) ?
      this.model_['dataSettings']['activeGeo'].substring(1) :
      this.data_[this.getActive()].activeGeo;

  if (this.geoDataIndex_.length)
    this.loadGeoData_(activeGeo);
  else {
    this.dispatchEvent({
      type: anychart.chartEditor2Module.events.EventType.WAIT,
      wait: true
    });

    var self = this;
    goog.net.XhrIo.send('https://cdn.anychart.com/anydata/geo/index.json',
        function(e) {
          var xhr = e.target;
          var indexJson = xhr.getResponseJson();
          if (indexJson['sets']) {
            for (var i in indexJson['sets']) {
              self.geoDataIndex_[indexJson['sets'][i]['id']] = indexJson['sets'][i];
            }
          }

          self.dispatchEvent({
            type: anychart.chartEditor2Module.events.EventType.GEO_DATA_INDEX_LOADED,
            data: self.geoDataIndex_
          });

          self.loadGeoData_(activeGeo);
        });
  }
};


/**
 * @param {number=} opt_setId
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.loadGeoData_ = function(opt_setId) {
  var setId = goog.isDef(opt_setId) ? opt_setId : 0;
  var setFullId = anychart.chartEditor2Module.EditorModel.DataType.GEO + setId;

  if (setFullId != this.model_['dataSettings']['activeGeo'] || !this.data_[setFullId]) {
    this.dispatchEvent({
      type: anychart.chartEditor2Module.events.EventType.WAIT,
      wait: true
    });

    var setUrl = 'https://cdn.anychart.com/geodata/1.2.0' + this.geoDataIndex_[setId]['data'];
    var self = this;
    goog.net.XhrIo.send(setUrl,
        function(e) {
          if (e.target.getStatus() == 200) {
            var json = e.target.getResponseJson();
            var dataType = anychart.chartEditor2Module.EditorModel.DataType.GEO;
            self.addData({
              type: anychart.chartEditor2Module.events.EventType.DATA_ADD,
              data: json,
              dataType: dataType,
              setId: setId,
              setFullId: dataType + setId,
              title: self.geoDataIndex_[setId]['name']
            });
          }

          self.dispatchEvent({
            type: anychart.chartEditor2Module.events.EventType.WAIT,
            wait: false
          });
        });
  }
};

// endregion


// region Public and controls callback functions
/**
 *
 * @param {Object} chart
 * @param {boolean} rebuild
 */
anychart.chartEditor2Module.EditorModel.prototype.onChartDraw = function(chart, rebuild) {
  this.dispatchEvent({
    type: anychart.chartEditor2Module.events.EventType.CHART_DRAW,
    chart: chart,
    rebuild: rebuild
  });
};

/**
 * Calls callback function by unminified method name.
 * @param {string} methodName
 * @param {...*} var_args
 */
anychart.chartEditor2Module.EditorModel.prototype.callbackByString = function(methodName, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  this.callbacks_[methodName].apply(this, args);
};


/**
 * Drops all or some chart settings.
 * @param {(Object|string)=} opt_pattern Regular extperrion or string
 */
anychart.chartEditor2Module.EditorModel.prototype.dropChartSettings = function(opt_pattern) {
  if (goog.isDef(opt_pattern)) {
    for (var key in this.model_['chart']['settings']) {
      var found = false;
      if (typeof opt_pattern == 'object') {
        var r = new RegExp(opt_pattern);
        found = r.test(key);
      } else
        found = key.indexOf(opt_pattern) >= 0;

      if (found)
        delete this.model_['chart']['settings'][key];
    }
  } else {
    this.resetContextMenuItems();
    this.model_['chart']['settings'] = {};
  }

  this.applyDefaults_();
};



/**
 * Initializes default values for types selects.
 */
anychart.chartEditor2Module.EditorModel.prototype.onChangeView = function() {
  if (this.generateInitialMappingsOnChangeView_) {
    this.generateInitialMappingsOnChangeView_ = false;
    this.getPreparedData();

    if (this.preparedData_.length > 0) {
      if (this.afterSetModel_) {
        // Use predefined model
        this.initGeoData_();
        this.analyzeDataBeforeFieldChoose_();
        this.analyzeDataAfterFieldChoose_();

        this.afterSetModel_ = false;

      } else {
        this.dropChartSettings();

        this.chooseActiveAndField();
        this.chooseDefaultChartType();
        this.chooseDefaultSeriesType();
        this.createDefaultMappings();

        // Set default chart title by dataset title
        this.setValue([['chart'], ['settings'], 'title()'], this.data_[this.getActive()]['title']);
      }
    } else {
      console.warn("NO DATA");
    }
  }
};


/**
 * Adds new plot default mapping.
 */
anychart.chartEditor2Module.EditorModel.prototype.addPlot = function() {
  var mapping = this.createPlotMapping();
  this.model_['dataSettings']['mappings'].push(mapping);
  this.dispatchUpdate();
};


/**
 * Drops plot mapping by index.
 * @param {number} index
 */
anychart.chartEditor2Module.EditorModel.prototype.dropPlot = function(index) {
  if (index > 0 && this.model_['dataSettings']['mappings'].length > index) {
    this.dropChartSettings('plot(');
    goog.array.splice(this.model_['dataSettings']['mappings'], index, 1);
    this.dispatchUpdate();
  }
};


/**
 * Adds new series default mapping.
 * @param {number} plotIndex
 */
anychart.chartEditor2Module.EditorModel.prototype.addSeries = function(plotIndex) {
  var mapping = this.createSeriesConfig(
      this.model_['dataSettings']['mappings'][plotIndex].length,
      /** @type {string} */(this.model_['chart']['seriesType']));

  this.model_['dataSettings']['mappings'][plotIndex].push(mapping);
  this.dispatchUpdate();
};


/**
 * Drops series mapping by plot and series index.
 * @param {number} plotIndex
 * @param {number} seriesIndex
 */
anychart.chartEditor2Module.EditorModel.prototype.dropSeries = function(plotIndex, seriesIndex) {
  if (this.model_['dataSettings']['mappings'].length > plotIndex && this.model_['dataSettings']['mappings'][plotIndex].length > seriesIndex) {
    var removedSeries = goog.array.splice(this.model_['dataSettings']['mappings'][plotIndex], seriesIndex, 1);
    this.dropChartSettings('getSeries(\'' + removedSeries[0]['id'] + '\')');
    this.dispatchUpdate();
  }
};


/**
 * Callback function for change of active and field select.
 * @param {anychart.chartEditor2Module.controls.select.Base} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setActiveAndField = function(input) {
  var selectValue = /** @type {Object} */(input.getValue());
  var field = selectValue.value;
  var active = selectValue.active;

  this.suspendDispatch();

  if (active != this.model_['dataSettings']['active']) {
    this.dropChartSettings('getSeries');

    this.chooseActiveAndField(active, field);
    this.chooseDefaultChartType();
    this.chooseDefaultSeriesType();
    this.createDefaultMappings();

    this.dispatchUpdate();

  } else if (field != this.model_['dataSettings']['field']) {
    this.model_['dataSettings']['field'] = field;
    this.dispatchUpdate();
  }

  this.resumeDispatch();
};


/**
 * Callback function for change event of geo data select.
 * @param {anychart.chartEditor2Module.controls.select.Base} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setActiveGeo = function(input) {
  var selectValue = /** @type {Object} */(input.getValue());
  var setId = Number(selectValue.value.substr(1));
  this.loadGeoData_(setId);
};


/**
 * Callback function for change event of chart type select.
 * @param {anychart.chartEditor2Module.controls.select.Base} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setChartType = function(input) {
  var prevChartType = /** @type {string} */(this.model_['chart']['type']);
  var selectValue = /** @type {Object} */(input.getValue());
  this.model_['chart']['type'] = selectValue.value;

  var prevDefaultSeriesType = /** @type {string} */(this.model_['chart']['seriesType']);

  if (prevChartType === 'map') {
    delete this.data_[this.model_['dataSettings']['activeGeo']];
    this.preparedData_.length = 0;

  } else if (this.model_['chart']['type'] === 'map') {
    this.initGeoData_();
  }

  if (this.needResetMappings(prevChartType, prevDefaultSeriesType)) {
    this.chooseActiveAndField(/** @type {string} */(this.model_['dataSettings']['active']));
    this.chooseDefaultSeriesType();
    this.createDefaultMappings();

  } else {
    // Update default series
    this.chooseDefaultSeriesType();

    for (var i = 0; i < this.model_['dataSettings']['mappings'].length; i++) {
      for (var j = 0; j < this.model_['dataSettings']['mappings'][i].length; j++) {
        var seriesConfig = this.model_['dataSettings']['mappings'][i][j];
        if (prevDefaultSeriesType == seriesConfig['ctor']) {
          if (this.checkSeriesFieldsCompatible(prevDefaultSeriesType, /** @type {string} */(this.model_['chart']['seriesType']))) {
            this.model_['dataSettings']['mappings'][i][j]['ctor'] = this.model_['chart']['seriesType'];
          }
        }
      }
    }
  }

  this.setStackMode(selectValue.stackMode);

  this.dispatchUpdate();
};



/**
 * Updates stack mode setting in model.
 * @param {string=} opt_stackMode
 */
anychart.chartEditor2Module.EditorModel.prototype.setStackMode = function(opt_stackMode) {
  this.dropChartSettings("stackMode(");
  if (opt_stackMode) {
    if (this.model_['chart']['type'] != 'stock') {
      this.setValue([['chart'], ['settings'], 'yScale().stackMode()'], opt_stackMode, true);
    }
  }
};


/**
 * Callback function for change of series type select.
 * @param {anychart.chartEditor2Module.controls.select.Base} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setSeriesType = function(input) {
  var key = input.getKey();
  var inputValue = /** @type {Object} */(input.getValue());
  var type = inputValue.value;
  var plotIndex = key[1][1]; // see SeriesPanel.getKey()
  var seriesIndex = key[2][0];

  if (this.model_['dataSettings']['mappings'][plotIndex][seriesIndex]['ctor'] != type) {
    var oldConfig = this.model_['dataSettings']['mappings'][plotIndex][seriesIndex];
    this.model_['dataSettings']['mappings'][plotIndex][seriesIndex] = this.createSeriesConfig(seriesIndex, type, oldConfig['id']);
    this.dispatchUpdate();
  }
};


/**
 * Callback function for change of theme select.
 * @param {anychart.chartEditor2Module.controls.select.Base} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setTheme = function(input) {
  delete this.model_['chart']['settings']['palette()'];
  var inputValue = input.getValue();
  this.setValue([['anychart'], 'theme()'], inputValue.value);
  this.dispatchUpdate();
};


/**
 * Callback function for change event of chart.labels().enabled()
 * @param {anychart.chartEditor2Module.checkbox.Base} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setSettingForSeries = function(input) {
  var value = input.getChecked();
  this.suspendDispatch();

  var chartType = this.model_['chart']['type'];
  var mappings = this.model_['dataSettings']['mappings'];
  var key = input.getKey();
  var stringKey = key[key.length - 1];

  var seriesId;
  for (var i = 0; i < mappings.length; i++) {
    for (var j = 0; j < mappings[i].length; j++) {
      seriesId = mappings[i][j]['id'];
      var stringKey2 = (chartType == 'stock' ? 'plot(' + i + ').' : '') + 'getSeries(\'' + seriesId + '\').' + stringKey;
      var key2 = [['chart'], ['settings'], stringKey2];
      this.setValue(key2, value);
    }
  }

  this.setValue(input.getKey(), value);

  this.resumeDispatch();
};


/**
 * Reset this.contextMenuItems_ structure.
 */
anychart.chartEditor2Module.EditorModel.prototype.resetContextMenuItems = function() {
  goog.object.map(this.contextMenuItems_, function(item){
    item.enabled = true;
  });
};


/** @return {Object} */
anychart.chartEditor2Module.EditorModel.prototype.contextMenuItems = function() {
  return this.contextMenuItems_;
};


/**
 * Callback function for contextMenu().itemsFormatter() setting
 * @param {anychart.chartEditor2Module.checkbox.Base} input
 */
anychart.chartEditor2Module.EditorModel.prototype.setContextMenuItemEnable = function(input) {
  var stringId = input.getModel();
  this.contextMenuItems_[stringId]['enabled'] = input.getChecked();

  var key;
  var disabledItems = [];
  var exportingItems = ['saveAs', 'saveDataAs', 'shareWith', 'printChart'];
  var count = 0;
  for (key in this.contextMenuItems_) {
    if (!this.contextMenuItems_[key]['enabled']) {
      disabledItems = goog.array.concat(disabledItems, this.contextMenuItems_[key]['items']);
      if (goog.array.indexOf(exportingItems, key) != -1)
        count++;
    }
  }

  if (count == exportingItems.length)
    disabledItems = goog.array.concat(disabledItems, 'exporting-separator');
  var disabledItemsStr = disabledItems.toString();

  if (disabledItems.length) {
    this.model_['chart']['settings']['contextMenu().itemsFormatter()'] = 'function(items){\n' +
      '\tvar res = {};\n'+
      '\tvar disabledItems = "' + disabledItemsStr + '".split(",");\n' +
      '\tfor (var key in items) {\n' +
        '\t\tif (disabledItems.indexOf(key) == -1) {\n' +
          '\t\t\tres[key] = items[key];\n'+
        '\t\t}\n' +
      '\t}\n' +
      '\treturn res;\n' +
    '}';
  } else
    this.removeByKey([['chart'], ['settings'], 'contextMenu().itemsFormatter()']);

  this.dispatchUpdate();
};


/**
 * @param {string} xOrY
 * @return {number} Created axis index.
 */
anychart.chartEditor2Module.EditorModel.prototype.addAxis = function(xOrY) {
  var index = 0;
  var pattern = '^' + xOrY + 'Axis\\((\\d+)\\)\\.enabled\\(\\)$';
  var regExp = new RegExp(pattern);
  for (var key in this.model_['chart']['settings']) {
    var match = key.match(regExp);
    if (match)
      index = Math.max(match[1], index);
  }
  index += 1;

  var stringKey = xOrY + 'Axis(' + index + ').enabled()';
  this.setValue([['chart'], ['settings'], stringKey], true);

  return index;
};


/**
 * @param {string} xOrY
 * @param {number} index
 */
anychart.chartEditor2Module.EditorModel.prototype.dropAxis = function(xOrY, index) {
  var pattern = '^' + xOrY + 'Axis\\(' + index + '\\)';
  var regExp = new RegExp(pattern);
  this.dropChartSettings(regExp);
  this.dispatchUpdate(false, true);
};


/**
 * @param {anychart.chartEditor2Module.EditorModel.Model} value
 */
anychart.chartEditor2Module.EditorModel.prototype.setModel = function(value) {
  this.model_ = value;
  this.afterSetModel_ = true;
  this.dispatchUpdate();
};
// endregion


// region Editor Model API function
/**
 * Setter for model's field state
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @param {*} value
 * @param {boolean=} opt_noDispatch
 * @param {boolean=} opt_noRebuildChart
 * @param {boolean=} opt_noRebuildMapping
 * @param {boolean=} opt_noOverride Write value only if key not exists.
 */
anychart.chartEditor2Module.EditorModel.prototype.setValue = function(key, value, opt_noDispatch, opt_noRebuildChart, opt_noRebuildMapping, opt_noOverride) {
  var target = this.model_;
  for (var i = 0; i < key.length; i++) {
    var level = key[i];
    if (goog.isArray(level)) {
      // Drill down
      if (!goog.isDef(target[level[0]])) {
        if (level.length > 1)
          target[level[0]] = [];
        else
          target[level[0]] = {};
      }

      if (goog.isArray(target[level[0]]) && target[level[0]].length == level[1])
        target[level[0]].push({});

      target = goog.isArray(target[level[0]]) ? target[level[0]][level[1]] : target[level[0]];

    } else if (goog.isString(level) && target[level] != value && (!opt_noOverride || !goog.isDef(target[level]))) {
      // Set value
      target[level] = value;

      if (!opt_noDispatch)
        this.dispatchUpdate(opt_noRebuildChart, opt_noRebuildMapping, level);
    }
  }
  // console.log(this.model_['chart']['settings']);
};


/**
 * Getter for input's value
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @return {*} Input's value
 */
anychart.chartEditor2Module.EditorModel.prototype.getValue = function(key) {
  var target = this.model_;
  var level;

  for (var i = 0; i < key.length; i++) {
    level = key[i];
    if (i == key.length - 1) {
      // result
      if (goog.isArray(level))
        return target[level[0]][level[1]];
      else if (goog.isString(level))
        return target[level];

    } else {
      // drill down
      if (goog.isArray(level))
        target = goog.isArray(target[level[0]]) ? target[level[0]][level[1]] : target[level[0]];
      else if (goog.isString(level))
        target = target[level];

      if (!target)
        return void 0;
    }
  }
};


/**
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @param {boolean=} opt_noDispatch
 */
anychart.chartEditor2Module.EditorModel.prototype.removeByKey = function(key, opt_noDispatch) {
  var target = this.model_;
  var level;
  for (var i = 0; i < key.length; i++) {
    level = key[i];
    if (i == key.length - 1) {
      // remove
      if (goog.isArray(level) && goog.isArray(target[level[0]])) {
        goog.array.splice(target[level[0]], level[1], 1);
      }
      else if (goog.isString(level)) {
        delete target[level];
      }

    } else {
      // drill down
      if (goog.isArray(level))
        target = goog.isArray(target[level[0]]) ? target[level[0]][level[1]] : target[level[0]];
      else if (goog.isString(level))
        target = target[level];

      if (!target)
        break;
    }
  }
  if (!opt_noDispatch)
    this.dispatchUpdate();
};


/**
 * @param {boolean=} opt_noRebuildChart
 * @param {boolean=} opt_noRebuildMapping
 * @param {string=} opt_lastKey
 */
anychart.chartEditor2Module.EditorModel.prototype.dispatchUpdate = function(opt_noRebuildChart, opt_noRebuildMapping, opt_lastKey) {
  if (this.suspendQueue_ > 0) {
    this.needDispatch_ = true;
    return;
  }

  this.dispatchEvent({
    type: anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE,
    rebuildChart: !opt_noRebuildChart,
    rebuildMapping: !opt_noRebuildMapping,
    lastKey: opt_lastKey
  });

  this.needDispatch_ = false;
};


/**
 * Suspends update model event dispatching on one step.
 */
anychart.chartEditor2Module.EditorModel.prototype.suspendDispatch = function() {
  this.suspendQueue_++;
};


/**
 * suspend queue minus one.
 */
anychart.chartEditor2Module.EditorModel.prototype.resumeDispatch = function() {
  this.suspendQueue_--;
  if (this.suspendQueue_ == 0 && this.needDispatch_)
    this.dispatchUpdate();
};


/**
 * Converts string to valid model key.
 * @param {anychart.chartEditor2Module.EditorModel.Key} key
 * @return {string} key as a string
 */
anychart.chartEditor2Module.EditorModel.getStringKey = function(key) {
  var result;
  if (goog.isArray(key)) {
    key = /** @type {Array} */(key);
    result = /** @type {string} */(key[key.length - 1]);

    if (result.indexOf('()') == -1)
      result =  /** @type {string} */(key[key.length - 2]) + '.' + result + '()';
  }
  else
    result = String(key);

  return  result;
};

anychart.chartEditor2Module.EditorModel.prototype.getStringKey = anychart.chartEditor2Module.EditorModel.getStringKey;


/**
 * @return {Object}
 */
anychart.chartEditor2Module.EditorModel.prototype.getModel = function() {
  return this.model_;
};


/**
 * @param {Array.<{key: anychart.chartEditor2Module.EditorModel.Key, value: (string|boolean|Object) }>} values
 */
anychart.chartEditor2Module.EditorModel.prototype.setDefaults = function(values) {
  this.defaults_ = values;
};


/**
 * Applies default setting to model without override existing settings.
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.applyDefaults_ = function() {
  for (var i = 0; i < this.defaults_.length; i++) {
    this.setValue(this.defaults_[i]['key'], this.defaults_[i]['value'], true, void 0, void 0, true);
  }
};
// endregion


// region Data Model
/**
 * @param {string} dataType
 * @param {string} setId
 * @return {string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getFullId = function(dataType, setId) {
  return dataType + setId;
};


/**
 * Add data set to data container.
 * @param {Object} data
 */
anychart.chartEditor2Module.EditorModel.prototype.addData = function(data) {
  var dataType = data.dataType ? data.dataType : anychart.chartEditor2Module.EditorModel.DataType.CUSTOM;
  var setId = goog.isDef(data.setId) ? data.setId : goog.string.createUniqueString();
  var setFullId = this.getFullId(dataType, setId);

  if (!this.data_[setFullId]) {
    this.data_[setFullId] = {
      data: data.data,

      type: dataType,
      setId: setId,
      setFullId: setFullId,

      title: data.title,
      chartType: data.chartType,
      seriesType: data.seriesType,
      activeGeo: data.activeGeo,
      fieldNames: data.fieldNames
    };
  }
  this.preparedData_.length = 0;

  if (dataType == anychart.chartEditor2Module.EditorModel.DataType.GEO) {
    if (this.model_['dataSettings']['activeGeo'] != setFullId) {
      delete this.data_[this.model_['dataSettings']['activeGeo']];
      this.model_['dataSettings']['activeGeo'] = setFullId;
      this.model_['dataSettings']['geoIdField'] = null;
    }

    if (!this.model_['dataSettings']['geoIdField']) {
      // Find geoIdField
      var rawData = this.getRawData(true);

      var dataRow = rawData['features'][0]['properties'];
      for (var i in dataRow) {
        if ((!this.model_['dataSettings']['geoIdField'] || i == 'id') && this.isGeoId_(dataRow[i])) {
          this.model_['dataSettings']['geoIdField'] = i;
        }
      }
    }
  } else {
    this.generateInitialMappingsOnChangeView_ = true;
  }

  this.dispatchUpdate();
};


/**
 * Removes data set from data container.
 * @param {string} setFullId
 */
anychart.chartEditor2Module.EditorModel.prototype.removeData = function(setFullId) {
  delete this.data_[setFullId];

  if (this.model_['dataSettings']['activeGeo'] && this.preparedData_.length == 2) {
    // Geo data should not be alone
    delete this.data_[this.model_['dataSettings']['activeGeo']];
  }

  this.preparedData_.length = 0;

  this.generateInitialMappingsOnChangeView_ = true;

  this.dispatchUpdate();
};


/**
 * @return {!Array.<string>}
 */
anychart.chartEditor2Module.EditorModel.prototype.getDataKeys = function() {
  return goog.object.getKeys(this.data_);
};


/**
 * @param {string=} opt_setFullId
 * @return {Array}
 */
anychart.chartEditor2Module.EditorModel.prototype.getPreparedData = function(opt_setFullId) {
  var data = !this.preparedData_.length ? this.prepareData_() : this.preparedData_;
  if (opt_setFullId) {
    data = goog.array.filter(data, function(item) {
      return item.setFullId == opt_setFullId;
    });
  }

  return data;
};


/**
 * @param {boolean=} opt_activeGeo
 * @return {?(Array.<*>|Object)}
 */
anychart.chartEditor2Module.EditorModel.prototype.getRawData = function(opt_activeGeo) {
  var dataSet = this.data_[opt_activeGeo ? this.getActiveGeo() : this.getActive()];
  return dataSet ? dataSet.data : null;
};


/**
 * Getter for active data set id.
 * @return {?string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getActive = function() {
  return this.model_['dataSettings']['active'];
};


/**
 * Getter for active geo data set id.
 * @return {?string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getActiveGeo = function() {
  return this.model_['dataSettings']['activeGeo'];
};


/**
 * Getter for count of data sets.
 * @return {number}
 */
anychart.chartEditor2Module.EditorModel.prototype.getDataSetsCount = function() {
  return this.getPreparedData().length;
};


/**
 * Getter for geo id field.
 * @return {?string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getGeoIdField = function() {
  return this.model_['dataSettings']['geoIdField'];
};


/**
 * Returns JS code string that creates a configured chart.
 * @param {anychart.chartEditor2Module.EditorModel.OutputOptions=} opt_options
 * @return {string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getChartAsJsCode = function(opt_options) {
  return this.getChartWithJsCode_(opt_options)[0];
};


/**
 * Returns configured chart in JSON representation.
 * @return {string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getChartAsJson = function() {
  var chart = this.getChartWithJsCode_()[1];
  if (!chart) return '';
  var json = chart ? chart.toJson() : '';
  var settings = this.getModel();
  var outputSettings = settings['outputSettings'] ? settings['outputSettings'] : {};
  var minify = !!outputSettings['minify'];
  var containerId = outputSettings['container'];
  if (containerId) {
    var obj = json['chart'] || json['gauge'] || json['gantt'] || json['map'] || {};
    obj['container'] = containerId;
  }
  var printerSettings = new goog.format.JsonPrettyPrinter.TextDelimiters();
  if (minify) {
    printerSettings.lineBreak = '';
    printerSettings.space = '';
    printerSettings.propertySeparator = ',';
    printerSettings.nameValueSeparator = ':';
  }
  var printer = new goog.format.JsonPrettyPrinter(printerSettings);
  return printer.format(json);
};


/**
 * Returns configured chart in XML representation.
 * @return {string}
 */
anychart.chartEditor2Module.EditorModel.prototype.getChartAsXml = function() {
  var chart = this.getChartWithJsCode_()[1];
  return chart ? chart.toXml(false) : '';
};


/**
 * Creates a chart instance from the model and the JS code string that creates the chart.
 * @param {anychart.chartEditor2Module.EditorModel.OutputOptions=} opt_options Output options object.
 * @return {!Array} Returns [JsString, ChartInstance]
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.getChartWithJsCode_ = function(opt_options) {
  var settings = this.getModel();
  var outputSettings = settings['outputSettings'] ? settings['outputSettings'] : {};
  if (goog.isObject(opt_options))
    for (var k in opt_options) {
      outputSettings[k] = opt_options[k];
    }

  var chartType = settings['chart']['type'];

  if (!chartType)
    return ['', null];

  // SETTINGS OF THE PRINTER
  var minify = !!outputSettings['minify'];
  var containerId = goog.isDef(outputSettings['container']) ? String(outputSettings['container']) : 'container';
  var wrapper = goog.isDef(outputSettings['wrapper']) ? String(outputSettings['wrapper']) : 'function';
  var addData = !goog.isDef(outputSettings['addData']) || outputSettings['addData'];
  var addGeoData = !goog.isDef(outputSettings['addGeoData']) || outputSettings['addGeoData'];
  var eq = minify ? '=' : ' = ';

  var anychartGlobal = anychart.window['anychart'];
  var printerSettings = new goog.format.JsonPrettyPrinter.TextDelimiters();
  if (minify) {
    printerSettings.lineBreak = '';
    printerSettings.space = '';
    printerSettings.propertySeparator = ',';
    printerSettings.nameValueSeparator = ':';
  }
  var printer = new goog.format.JsonPrettyPrinter(printerSettings);
  var result = [];
  var self = this;

  // Global settings
  if (!goog.object.isEmpty(settings['anychart'])) {
    result.push('// Applying global settings');
    goog.object.forEach(settings['anychart'], function(value, key) {
      // if (anychart.bindingModule.testExec(anychartGlobal, key, value)) {
      result.push(self.printKey_(printer, 'anychart', key, value, minify));
      // }
    });
    result.push('');
  }

  var chart = anychartGlobal[chartType]();
  result.push('// Creating chart', 'var chart' + eq + 'anychart.' + chartType + '();', '');

  if (chartType == 'map') {
    var geoData = this.getRawData(true);
    if (geoData) {
      chart['geoData'](geoData);
      if (addGeoData) {
        result.push(
            '// Setting up geo data',
            'var geoData' + eq + this.printValue_(printer, geoData) + ';',
            'chart.geoData(geoData);'
        );
      } else {
        // todo: show link to geo data or something
      }

      var geoIdField = this.getGeoIdField();
      if (geoIdField) {
        chart['geoIdField'](geoIdField);
        result.push(this.printKey_(printer, 'chart', 'geoIdField()', geoIdField));
      }
    }
  }

  // Create data set
  var rawData = this.getRawData();
  var dsCtor = anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['dataSetCtor'];
  var isTableData = dsCtor == 'table';
  var dataSet = anychartGlobal['data'][dsCtor]();

  result.push('// Setting up data');

  var str = 'var rawData' + eq + (addData ? this.printValue_(printer, rawData) : '[/*Add your data here*/]') + ';';
  result.push(str);

  result.push('var data' + eq + 'anychart.data.' + dsCtor +
      (isTableData ?
          '(' + this.printValue_(printer, settings['dataSettings']['field']) + ');' :
          '();')
  );

  if (isTableData) {
    dataSet['addData'](rawData);
    result.push('data.addData(rawData);');
  } else {
    dataSet['data'](rawData);
    result.push('data.data(rawData);');
  }
  result.push('');

  // create mapping and series
  result.push('// Creating mappings');
  var isSinglePlot = settings['dataSettings']['mappings'].length == 1;
  var isSingleSeries = isSinglePlot && settings['dataSettings']['mappings'][0].length == 1;
  var mappingInstancesList = [];
  var mappingInstances, plotMapping, i, j;
  for (i = 0; i < settings['dataSettings']['mappings'].length; i++) {
    mappingInstancesList.push(mappingInstances = []);
    plotMapping = settings['dataSettings']['mappings'][i];
    for (j = 0; j < plotMapping.length; j++) {
      var seriesMapping = plotMapping[j]['mapping'];
      var mappingObj = isTableData ? {} : {'x': settings['dataSettings']['field']};
      for (var k in seriesMapping) {
        if (seriesMapping.hasOwnProperty(k))
          mappingObj[k] = seriesMapping[k];
      }

      mappingInstances.push(dataSet['mapAs'](mappingObj));
      result.push('var mapping' + (isSingleSeries ? '' : ((isSinglePlot ? '' : '_' + i) + '_' + j)) + eq + 'data.mapAs(' + this.printValue_(printer, mappingObj) + ');');
    }
  }
  result.push('');

  var singleSeriesChart = !!anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['singleSeries'];
  if (singleSeriesChart) {
    chart['data'](mappingInstancesList[0][0]);
    result.push(
        '// Setting data to the chart',
        'chart.data(mapping);'
    );
  } else {
    result.push('// Creating series and setting data to them');
    result.push('var series;');
    for (i = 0; i < settings['dataSettings']['mappings'].length; i++) {
      plotMapping = settings['dataSettings']['mappings'][i];
      for (j = 0; j < plotMapping.length; j++) {
        var seriesCtor = plotMapping[j]['ctor'];
        var series;
        var mappingPostfix = '(mapping' + (isSingleSeries ? '' : ((isSinglePlot ? '' : '_' + i) + '_' + j)) + ');';
        if (chartType == 'stock') {
          var plot = chart['plot'](i);
          series = plot[seriesCtor](mappingInstancesList[i][j]);
          result.push('series' + eq + 'chart.plot(' + i + ').' + seriesCtor + mappingPostfix);
        } else {
          if (settings['chart']['type'] == 'map') {
            seriesCtor = seriesCtor.split('-')[0];
          }
          series = chart[seriesCtor](mappingInstancesList[i][j]);
          result.push('series' + eq + 'chart.' + seriesCtor + mappingPostfix);
        }
        series['id'](plotMapping[j]['id']);
        result.push('series.id(' + this.printValue_(printer, plotMapping[j]['id']) + ');');
      }
    }
  }
  result.push('');

  if (!goog.object.isEmpty(settings['chart']['settings'])) {
    result.push('// Applying appearance settings');
    goog.object.forEach(settings['chart']['settings'], function(value, key) {
      var pVal = value;
      var force = false;
      if (key == "palette()") {
        pVal = anychartGlobal['palettes'][value];
        //pVal = 'anychart.palettes.' + value;
      } else if (key == "contextMenu().itemsFormatter()")
        force = true;

      if (anychart.bindingModule.testExec(chart, key, value)) {
        result.push(self.printKey_(printer, 'chart', key, pVal, force));
      }
    });
    result.push('');
  }

  if (containerId) {
    result.push(
        '// Settings container and calling draw',
        this.printKey_(printer, 'chart', 'container()', containerId),
        'chart.draw();'
    );
  }

  if (minify) {
    result = goog.array.map(result, function(item) {
      return goog.string.startsWith(item, '//') ? '' : item;
    });
  }
  if (wrapper === 'function' || wrapper === 'document-ready') {
    // add indentation
    if (!minify) {
      goog.array.forEach(result, function(item) {
        return '  ' + item;
      });
    }

    // wrap with function
    if (wrapper === 'function') {
        result.unshift('(function()' + (minify ? '' : ' ') + '{');
        result.push((minify ? '' : '  ') + 'return chart;');
        result.push('})();');

    // wrap with anychart.onDocumentReady
    } else if (wrapper === 'document-ready') {
        result.unshift('anychart.onDocumentReady(function()' + (minify ? '' : ' ') + '{');
        result.push('});');
    }
  }
  return [result.join(minify ? '' : '\n'), chart];
};


/**
 * @param {goog.format.JsonPrettyPrinter} printer
 * @param {string} prefix
 * @param {string} key
 * @param {*} value
 * @param {boolean=} opt_forceRawValue
 * @return {string}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.printKey_ = function(printer, prefix, key, value, opt_forceRawValue) {
  if (goog.isDef(value)) {
    var valueString = opt_forceRawValue ? '"' + String(value) + '"' : this.printValue_(printer, value);
    key = key.replace(/\)$/, valueString + ');');
  }
  return prefix + '.' + key;
};


/**
 * @param {goog.format.JsonPrettyPrinter} printer
 * @param {*} value
 * @return {string}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.printValue_ = function(printer, value) {
  if (goog.isString(value)) {
    value = value.replace(/(\r|\n|\t)/g, function(part, g1) {
      switch (g1) {
        case '\r':
          return '\\r';
        case '\n':
          return '\\n';
        case '\t':
          return '\\t';
      }
      return part;
    });
    value = '"' + value + '"';
  }
  return printer.format(value);
};


/**
 * @return {Array}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.prepareData_ = function() {
  var joinedSets = [];
  var singleSets = [];
  var geoSets = [];
  var dataSet;

  for (var i in this.data_) {
    if (this.data_.hasOwnProperty(i)) {
      dataSet = this.prepareDataSet_(this.data_[i]);

      var joined = false;
      if (dataSet.join) {
        /*
         * todo: process join
         */
        joined = true;
      }

      if (joined) {
        dataSet.title = 'Joined set ' + (joinedSets.length + 1);
        joinedSets.push(dataSet);
      } else if (dataSet.type == anychart.chartEditor2Module.EditorModel.DataType.GEO) {
        geoSets.push(dataSet);
      } else {
        dataSet.title = dataSet.title ? dataSet.title : 'Data set ' + (singleSets.length + 1);
        singleSets.push(dataSet);
      }
    }
  }

  this.preparedData_ = goog.array.concat(joinedSets, singleSets, geoSets);

  return this.preparedData_;
};


/**
 * @param {Object} dataSet
 * @return {Object}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.prepareDataSet_ = function(dataSet) {
  var result = {
    type: dataSet.type,
    setId: dataSet.setId,
    setFullId: dataSet.setFullId,
    title: dataSet.title,
    fieldNames: dataSet.fieldNames,
    fields: []
  };

  var row = dataSet.type == anychart.chartEditor2Module.EditorModel.DataType.GEO ?
      dataSet.data['features'][0]['properties'] :
      dataSet.data[0];

  var settings = new goog.format.JsonPrettyPrinter.SafeHtmlDelimiters();
  settings.lineBreak = '';
  settings.objectStart = '\n{';
  settings.arrayStart = '\n[';
  settings.space = '';
  settings.propertySeparator = ', ';
  settings.nameValueSeparator = ': ';

  var f = new goog.format.JsonPrettyPrinter(settings);
  result.sample = f.format(row);

  for (var key in row) {
    var name = result.fieldNames && goog.isDef(result.fieldNames[key]) ?
        result.fieldNames[key] :
        goog.isArray(row) ? 'Field ' + key : key;

    var field = {
      key: key,
      name: name,
      type: typeof(row[key])
    };
    result.fields.push(field);
  }

  return result;
};
// endregion


/**
 * Is string looks like geo id string.
 *
 * @param {string} value
 * @return {boolean}
 * @private
 */
anychart.chartEditor2Module.EditorModel.prototype.isGeoId_ = function(value) {
  var pattern = /^[A-z]{2,3}([\W_]([A-z]{2}|\d+))?$/;
  return Boolean(new RegExp(pattern).exec(value));
};


/**
 * Checks if setting is excluded for current chart type.
 * @param {string} stringKey
 * @return {boolean} true if excluded.
 */
anychart.chartEditor2Module.EditorModel.prototype.checkSettingForExclusion = function(stringKey) {
  var chartType = this.model_['chart']['type'];
  var excludes = anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['settingsExcludes'];
  return (excludes && goog.array.indexOf(excludes, stringKey) != -1);
};


//exports
(function() {
  var proto = anychart.chartEditor2Module.EditorModel.prototype;
  proto['getValue'] = proto.getValue;
})();
