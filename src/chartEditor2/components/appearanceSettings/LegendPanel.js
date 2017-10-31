goog.provide('anychart.chartEditor2Module.LegendPanel');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.Legend');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.LegendPanel = function(model, opt_domHelper) {
  anychart.chartEditor2Module.LegendPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Legend';

  this.legends_ = [];
};
goog.inherits(anychart.chartEditor2Module.LegendPanel, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.LegendPanel.prototype.enterDocument = function() {
  anychart.chartEditor2Module.LegendPanel.base(this, 'enterDocument');
  this.createLegends();
};


/** @inheritDoc */
anychart.chartEditor2Module.LegendPanel.prototype.exitDocument = function() {
  this.removeAllLegends();
  anychart.chartEditor2Module.LegendPanel.base(this, 'exitDocument');
};


/**
 * Create legend settings panels.
 */
anychart.chartEditor2Module.LegendPanel.prototype.createLegends = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var mappings = model.getValue([['dataSettings'], 'mappings']);

  var plotIndex;
  var legend;
  for (var i = 0; i < mappings.length; i++) {
    plotIndex = chartType == 'stock' ? i : void 0;
    legend = new anychart.chartEditor2Module.settings.Legend(model, plotIndex);
    legend.allowEnabled(true);
    this.legends_.push(legend);
    this.addChild(legend, true);
  }
};


/**
 * Removes all legend panels elements from panel.
 * @private
 */
anychart.chartEditor2Module.LegendPanel.prototype.removeAllLegends = function() {
  for (var i = 0; i < this.legends_.length; i++) {
    this.removeChild(this.legends_[i], true);
    this.legends_[i].dispose();
  }
  this.legends_.length = 0;
};


/** @override */
anychart.chartEditor2Module.LegendPanel.prototype.disposeInternal = function() {
  this.removeAllLegends();
  anychart.chartEditor2Module.LegendPanel.base(this, 'disposeInternal');
};
