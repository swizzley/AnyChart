goog.provide('anychart.chartEditor2Module.GridsPanel');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.PlotGrids');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.GridsPanel = function(model, opt_domHelper) {
  anychart.chartEditor2Module.GridsPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Grids';

  this.stringId = 'grids';

  this.plotGrids_ = [];
};
goog.inherits(anychart.chartEditor2Module.GridsPanel, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.GridsPanel.prototype.enterDocument = function() {
  anychart.chartEditor2Module.GridsPanel.base(this, 'enterDocument');
  this.createPlotGrids();
};


/** @inheritDoc */
anychart.chartEditor2Module.GridsPanel.prototype.exitDocument = function() {
  this.removeAllPlotGrids();
  anychart.chartEditor2Module.GridsPanel.base(this, 'exitDocument');
};


/**
 * Create plotGrids settings panels.
 */
anychart.chartEditor2Module.GridsPanel.prototype.createPlotGrids = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var mappings = model.getValue([['dataSettings'], 'mappings']);

  var plotIndex;
  var plotGrids;
  for (var i = 0; i < mappings.length; i++) {
    plotIndex = chartType == 'stock' ? i : void 0;
    plotGrids = new anychart.chartEditor2Module.settings.PlotGrids(model, plotIndex);
    plotGrids.allowEnabled(false);
    this.plotGrids_.push(plotGrids);
    this.addChild(plotGrids, true);
  }
};


/**
 * Removes all plotGrids panels elements from panel.
 * @private
 */
anychart.chartEditor2Module.GridsPanel.prototype.removeAllPlotGrids = function() {
  for (var i = 0; i < this.plotGrids_.length; i++) {
    this.removeChild(this.plotGrids_[i], true);
    this.plotGrids_[i].dispose();
  }
  this.plotGrids_.length = 0;
};


/** @override */
anychart.chartEditor2Module.GridsPanel.prototype.disposeInternal = function() {
  this.removeAllPlotGrids();
  anychart.chartEditor2Module.GridsPanel.base(this, 'disposeInternal');
};
