goog.provide('anychart.chartEditorModule.LegendPanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.Legend');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.LegendPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.LegendPanel.base(this, 'constructor', model, 'Legend', opt_domHelper);

  this.legends_ = [];
};
goog.inherits(anychart.chartEditorModule.LegendPanel, anychart.chartEditorModule.SettingsPanel);


/** @inheritDoc */
anychart.chartEditorModule.LegendPanel.prototype.enterDocument = function() {
  anychart.chartEditorModule.LegendPanel.base(this, 'enterDocument');
  this.createLegends();
};


/** @inheritDoc */
anychart.chartEditorModule.LegendPanel.prototype.exitDocument = function() {
  this.removeAllLegends();
  anychart.chartEditorModule.LegendPanel.base(this, 'exitDocument');
};


/**
 * Create legend settings panels.
 */
anychart.chartEditorModule.LegendPanel.prototype.createLegends = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var mappings = model.getValue([['dataSettings'], 'mappings']);

  var plotIndex;
  var legend;
  for (var i = 0; i < mappings.length; i++) {
    plotIndex = chartType == 'stock' ? i : void 0;
    legend = new anychart.chartEditorModule.settings.Legend(model, plotIndex);
    legend.allowEnabled(true);
    this.legends_.push(legend);
    this.addChild(legend, true);
  }
};


/**
 * Removes all legend panels elements from panel.
 * @private
 */
anychart.chartEditorModule.LegendPanel.prototype.removeAllLegends = function() {
  for (var i = 0; i < this.legends_.length; i++) {
    this.removeChild(this.legends_[i], true);
    this.legends_[i].dispose();
  }
  this.legends_.length = 0;
};


/** @override */
anychart.chartEditorModule.LegendPanel.prototype.disposeInternal = function() {
  this.removeAllLegends();
  anychart.chartEditorModule.LegendPanel.base(this, 'disposeInternal');
};
