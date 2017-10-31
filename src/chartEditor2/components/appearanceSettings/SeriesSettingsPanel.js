goog.provide('anychart.chartEditor2Module.SeriesSettingsPanel');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.Series');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.SeriesSettingsPanel = function(model, opt_domHelper) {
  anychart.chartEditor2Module.SeriesSettingsPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Series';

  this.stringId = 'series';

  this.series_ = [];
};
goog.inherits(anychart.chartEditor2Module.SeriesSettingsPanel, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.SeriesSettingsPanel.prototype.enterDocument = function() {
  anychart.chartEditor2Module.SeriesSettingsPanel.base(this, 'enterDocument');
  this.createSeries();
};


/** @inheritDoc */
anychart.chartEditor2Module.SeriesSettingsPanel.prototype.exitDocument = function() {
  this.removeAllSeries();
  anychart.chartEditor2Module.SeriesSettingsPanel.base(this, 'exitDocument');
};


/**
 * Create series settings panels.
 */
anychart.chartEditor2Module.SeriesSettingsPanel.prototype.createSeries = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var mappings = model.getValue([['dataSettings'], 'mappings']);

  var seriesId;
  var plotIndex;
  var series;
  for (var i = 0; i < mappings.length; i++) {
    for (var j = 0; j < mappings[i].length; j++) {
      seriesId = mappings[i][j]['id'] ? mappings[i][j]['id'] : j;
      plotIndex = chartType == 'stock' ? i : void 0;
      series = new anychart.chartEditor2Module.settings.Series(model, seriesId, j, plotIndex);
      series.allowEnabled(false);
      this.series_.push(series);
      this.addChild(series, true);
    }
  }
};


/** @override */
anychart.chartEditor2Module.SeriesSettingsPanel.prototype.disposeInternal = function() {
  this.removeAllSeries();
  anychart.chartEditor2Module.SeriesSettingsPanel.base(this, 'disposeInternal');
};


/**
 * Removes all series panels elements from panel.
 * @private
 */
anychart.chartEditor2Module.SeriesSettingsPanel.prototype.removeAllSeries = function() {
  for (var i = 0; i < this.series_.length; i++) {
    this.removeChild(this.series_[i], true);
    this.series_[i].dispose();
  }
  this.series_.length = 0;
};