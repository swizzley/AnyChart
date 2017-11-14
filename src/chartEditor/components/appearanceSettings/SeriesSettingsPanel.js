goog.provide('anychart.chartEditorModule.SeriesSettingsPanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.Series');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.SeriesSettingsPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.SeriesSettingsPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Series';

  this.stringId = 'series';

  this.series_ = [];
};
goog.inherits(anychart.chartEditorModule.SeriesSettingsPanel, anychart.chartEditorModule.SettingsPanel);


/** @inheritDoc */
anychart.chartEditorModule.SeriesSettingsPanel.prototype.enterDocument = function() {
  anychart.chartEditorModule.SeriesSettingsPanel.base(this, 'enterDocument');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  if (!model.isChartSingleSeries()) this.createSeries();
};


/** @inheritDoc */
anychart.chartEditorModule.SeriesSettingsPanel.prototype.exitDocument = function() {
  this.removeAllSeries();
  anychart.chartEditorModule.SeriesSettingsPanel.base(this, 'exitDocument');
};


/**
 * Create series settings panels.
 */
anychart.chartEditorModule.SeriesSettingsPanel.prototype.createSeries = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var mappings = model.getValue([['dataSettings'], 'mappings']);

  var seriesId;
  var plotIndex;
  var series;
  for (var i = 0; i < mappings.length; i++) {
    for (var j = 0; j < mappings[i].length; j++) {
      seriesId = mappings[i][j]['id'] ? mappings[i][j]['id'] : j;
      plotIndex = chartType == 'stock' ? i : void 0;
      series = new anychart.chartEditorModule.settings.Series(model, seriesId, j, plotIndex);
      series.allowEnabled(false);
      this.series_.push(series);
      this.addChild(series, true);
    }
  }
};


/** @override */
anychart.chartEditorModule.SeriesSettingsPanel.prototype.disposeInternal = function() {
  this.removeAllSeries();
  anychart.chartEditorModule.SeriesSettingsPanel.base(this, 'disposeInternal');
};


/**
 * Removes all series panels elements from panel.
 * @private
 */
anychart.chartEditorModule.SeriesSettingsPanel.prototype.removeAllSeries = function() {
  for (var i = 0; i < this.series_.length; i++) {
    this.removeChild(this.series_[i], true);
    this.series_[i].dispose();
  }
  this.series_.length = 0;
};