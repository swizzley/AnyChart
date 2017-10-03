goog.provide('anychart.chartEditor2Module.Chart');

goog.require('anychart.bindingModule.entry');
goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.EditorModel');


/**
 * Chart widget.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.Chart = function(model, opt_domHelper) {
  anychart.chartEditor2Module.Chart.base(this, 'constructor', opt_domHelper);

  this.setModel(model);

  this.anychart = /** @type {Object} */(goog.dom.getWindow()['anychart']);

  /**
   * @type {string}
   * @private
   */
  this.containerId_ = 'chart-container-' + goog.string.createUniqueString();
};
goog.inherits(anychart.chartEditor2Module.Chart, anychart.chartEditor2Module.Component);


/** @inheritDoc */
anychart.chartEditor2Module.Chart.prototype.createDom = function() {
  anychart.chartEditor2Module.Chart.base(this, 'createDom');


  goog.dom.classlist.add(this.getElement(), 'chart-container');
  // var dom = this.getDomHelper();

  this.getDomHelper().setProperties(this.getElement(), {'id': this.containerId_});
};


/** @inheritDoc */
anychart.chartEditor2Module.Chart.prototype.enterDocument = function() {
  anychart.chartEditor2Module.Chart.base(this, 'enterDocument');
  this.update();
  this.getHandler().listen(/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()),
      anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE, this.update);
};


/** @inheritDoc */
anychart.chartEditor2Module.Chart.prototype.update = function() {
  var self = this;
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var rawData = model.getRawData();
  var settings = model.getModel();
  var chartType = settings['chart']['type'];
  var rebuild = !arguments.length || arguments[0].rebuildChart;

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
    var dsCtor = anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['dataSetCtor'];
    var opt_keyColumnIndex = dsCtor == 'table' ? settings['dataSettings']['field'] : void 0;
    var dataSet = this.anychart['data'][dsCtor](opt_keyColumnIndex);

    if (dsCtor == 'table')
      dataSet['addData'](rawData);
    else
      dataSet['data'](rawData);

    // create mapping and series
    for (var i = 0; i < settings['dataSettings']['mappings'].length; i++) {
      var plotMapping = settings['dataSettings']['mappings'][i];
      for (var j = 0; j < plotMapping.length; j++) {
        var seriesMapping = plotMapping[j]['mapping'];
        var mappingObj = {'x': settings['dataSettings']['field']};
        for (var k in seriesMapping) {
          if (seriesMapping.hasOwnProperty(k))
            mappingObj[k] = seriesMapping[k];
        }

        var mappingInstance = dataSet['mapAs'](mappingObj);

        var singleSeriesChart = !!anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['singleSeries'];
        if (singleSeriesChart) {
          this.chart_['data'](mappingInstance);

        } else {
          var seriesCtor = plotMapping[j]['ctor'];
          var series;
          if (chartType == 'stock') {
            var plot = this.chart_['plot'](i);
            series = plot[seriesCtor](mappingInstance);
          } else {
            if (chartType == 'map') {
              seriesCtor = seriesCtor.split('-')[0];
            }
            series = this.chart_[seriesCtor](mappingInstance);
          }

          series['id'](plotMapping[j]['id']);
        }
      }
    }
  }

  // Chart settings
  console.log("=== Chart draw ===");
  console.log(settings['chart']['settings']);
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
};


/** @inheritDoc */
anychart.chartEditor2Module.Chart.prototype.dispose = function() {
  if (this.chart_ && typeof this.chart_['dispose'] == 'function') {
    this.chart_['dispose']();
    this.chart_ = null;
  }

  anychart.chartEditor2Module.Chart.base(this, 'dispose');
};