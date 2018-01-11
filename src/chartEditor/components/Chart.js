goog.provide('anychart.chartEditorModule.Chart');

goog.require('anychart.bindingModule.entry');
goog.require('anychart.chartEditorModule.Component');
goog.require('anychart.chartEditorModule.EditorModel');


/**
 * Chart widget.
 *
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.Component}
 */
anychart.chartEditorModule.Chart = function(model, opt_domHelper) {
  anychart.chartEditorModule.Chart.base(this, 'constructor', opt_domHelper);

  this.setModel(model);

  this.anychart = /** @type {Object} */(goog.dom.getWindow()['anychart']);

  /**
   * @type {string}
   * @private
   */
  this.containerId_ = 'chart-container-' + goog.string.createUniqueString();
};
goog.inherits(anychart.chartEditorModule.Chart, anychart.chartEditorModule.Component);


/** @inheritDoc */
anychart.chartEditorModule.Chart.prototype.createDom = function() {
  anychart.chartEditorModule.Chart.base(this, 'createDom');


  goog.dom.classlist.add(this.getElement(), 'chart-container');
  // var dom = this.getDomHelper();

  this.getDomHelper().setProperties(this.getElement(), {'id': this.containerId_});
};


/** @inheritDoc */
anychart.chartEditorModule.Chart.prototype.enterDocument = function() {
  anychart.chartEditorModule.Chart.base(this, 'enterDocument');

  this.onModelChange(null);

  this.getHandler().listen(/** @type {anychart.chartEditorModule.EditorModel} */(this.getModel()),
      anychart.chartEditorModule.events.EventType.EDITOR_MODEL_UPDATE, this.onModelChange);
};


/**
 * Updates component on model change.
 * @param {?Object} evt
 */
anychart.chartEditorModule.Chart.prototype.onModelChange = function(evt) {
  var self = this;
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var rawData = model.getRawData();
  var settings = model.getModel();
  var chartType = settings['chart']['type'];
  var rebuild = !arguments.length || !arguments[0] || arguments[0].rebuildChart;

  if (!chartType)
    return;

  // Global settings
  goog.object.forEach(settings['anychart'], function(value, key) {
    anychart.bindingModule.exec(self.anychart, key, value);
  });

  // Chart creation
  if (rebuild) {
    if (this.chart_ && typeof this.chart_['dispose'] == 'function') {
      this.chart_['dispose']();
      this.chart_ = null;
    }

    if (chartType.indexOf('.') !== -1) {
      this.chart_ = anychart.bindingModule.exec(this.anychart, chartType + '()');
    } else
      this.chart_ = this.anychart[chartType]();

    if (chartType == 'map') {
      var geoData = model.getRawData(true);
      if (geoData) {
        this.chart_['geoData'](geoData);
        var geoIdField = model.getGeoIdField();
        if (geoIdField)
          this.chart_['geoIdField'](geoIdField);
      }
    }

    // Create data set
    var dsCtor = anychart.chartEditorModule.EditorModel.ChartTypes[chartType]['dataSetCtor'];
    var dsCtorArgs = [];
    var plotMapping;
    var seriesMapping;
    var mappingObj;

    if (dsCtor === 'table') {
      dsCtorArgs = [settings['dataSettings']['field']];

    } else if (dsCtor === 'tree') {
      mappingObj = settings['dataSettings']['mappings'][0][0]['mapping'];
      mappingObj['id'] = settings['dataSettings']['field'];
      dsCtorArgs = [void 0, void 0, void 0, mappingObj];
    }

    var dataSet = this.anychart['data'][dsCtor].apply(this.anychart['data'], dsCtorArgs);

    // Add data
    if (dsCtor === 'table')
      dataSet['addData'](rawData);
    else if (dsCtor === 'tree')
      dataSet['addData'](rawData, 'as-table');
    else
      dataSet['data'](rawData);

    // todo: debug
    if (chartType === 'gauges.circular') {
      var axis = this.chart_['axis']();
      axis.scale().minimum(0).maximum(100);
    }

    // Create mapping and series
    for (var i = 0; i < settings['dataSettings']['mappings'].length; i++) {
      plotMapping = settings['dataSettings']['mappings'][i];
      for (var j = 0; j < plotMapping.length; j++) {
        seriesMapping = plotMapping[j]['mapping'];
        
        mappingObj = dsCtor === 'table' ? {} :
            dsCtor === 'tree' ?
                {'id': settings['dataSettings']['field']} :
                {'x': settings['dataSettings']['field']};
        
        for (var k in seriesMapping) {
          if (seriesMapping.hasOwnProperty(k))
            mappingObj[k] = seriesMapping[k];
        }

        var mappingInstance = dataSet['mapAs'](mappingObj);

        var singleSeriesChart = !!anychart.chartEditorModule.EditorModel.ChartTypes[chartType]['singleSeries'];
        if (singleSeriesChart) {
          this.chart_['data'](mappingInstance);

        } else {
          // todo: debug
          if (chartType === 'gauges.circular' && i == 0 && j == 0) {
            this.chart_['data'](mappingInstance);
          }

          var seriesCtor = plotMapping[j]['ctor'];
          seriesCtor = anychart.chartEditorModule.EditorModel.Series[seriesCtor]['ctor'] || seriesCtor;

          var series;
          if (chartType == 'stock') {
            var plot = this.chart_['plot'](i);
            series = plot[seriesCtor](mappingInstance);

          } else if (chartType === 'gauges.circular') {
            // todo: debug
            series = this.chart_[seriesCtor](j/*, mappingInstance*/);
            series.dataIndex(0);

          } else {
            series = this.chart_[seriesCtor](mappingInstance);
          }

          if (series['id']) series['id'](plotMapping[j]['id']);
        }
      }
    }
  }

  // Chart settings
  // console.log("=== Chart draw ===");
  // console.log(settings['chart']['settings']);
  goog.object.forEach(settings['chart']['settings'], function(value, key) {
    //console.log("chart settings", key, value);
    if (key == 'palette()') {
      value = self.anychart['palettes'][value];
    }
    anychart.bindingModule.exec(self.chart_, key, value);
  });

  this.getHandler().listenOnce(this.chart_, 'chartdraw', function() {
    model.onChartDraw(self.chart_, rebuild);
  });

  if (rebuild) {
    this.chart_['container'](this.containerId_);
    this.chart_['draw']();
  }

  // todo: debug
  window['chart'] = this.chart_;
};


/** @inheritDoc */
anychart.chartEditorModule.Chart.prototype.dispose = function() {
  if (this.chart_ && typeof this.chart_['dispose'] == 'function') {
    this.chart_['dispose']();
    this.chart_ = null;
  }

  anychart.chartEditorModule.Chart.base(this, 'dispose');
};