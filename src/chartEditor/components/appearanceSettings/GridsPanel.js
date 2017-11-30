goog.provide('anychart.chartEditorModule.GridsPanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.PlotGrids');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.GridsPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.GridsPanel.base(this, 'constructor', model, 'Grids', opt_domHelper);

  this.stringId = 'grids';

  this.plotGrids_ = [];
};
goog.inherits(anychart.chartEditorModule.GridsPanel, anychart.chartEditorModule.SettingsPanel);


/** @inheritDoc */
anychart.chartEditorModule.GridsPanel.prototype.enterDocument = function() {
  anychart.chartEditorModule.GridsPanel.base(this, 'enterDocument');
  this.createPlotGrids();
};


/** @inheritDoc */
anychart.chartEditorModule.GridsPanel.prototype.exitDocument = function() {
  this.removeAllPlotGrids();
  anychart.chartEditorModule.GridsPanel.base(this, 'exitDocument');
};


/**
 * Create plotGrids settings panels.
 */
anychart.chartEditorModule.GridsPanel.prototype.createPlotGrids = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var mappings = model.getValue([['dataSettings'], 'mappings']);

  var plotIndex;
  var plotGrids;
  for (var i = 0; i < mappings.length; i++) {
    plotIndex = chartType == 'stock' ? i : void 0;
    plotGrids = new anychart.chartEditorModule.settings.PlotGrids(model, plotIndex);
    plotGrids.allowEnabled(false);
    this.plotGrids_.push(plotGrids);
    this.addChild(plotGrids, true);
  }
};


/**
 * Removes all plotGrids panels elements from panel.
 * @private
 */
anychart.chartEditorModule.GridsPanel.prototype.removeAllPlotGrids = function() {
  for (var i = 0; i < this.plotGrids_.length; i++) {
    this.removeChild(this.plotGrids_[i], true);
    this.plotGrids_[i].dispose();
  }
  this.plotGrids_.length = 0;
};


/** @override */
anychart.chartEditorModule.GridsPanel.prototype.disposeInternal = function() {
  this.removeAllPlotGrids();
  anychart.chartEditorModule.GridsPanel.base(this, 'disposeInternal');
};
