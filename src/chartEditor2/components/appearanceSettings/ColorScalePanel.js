goog.provide('anychart.chartEditor2Module.ColorScalePanel');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.ColorScale');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.ColorScalePanel = function(model, opt_domHelper) {
  anychart.chartEditor2Module.ColorScalePanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Color Scale';
  this.stringId = 'colorScale';
};
goog.inherits(anychart.chartEditor2Module.ColorScalePanel, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.ColorScalePanel.prototype.createDom = function() {
  anychart.chartEditor2Module.ColorScalePanel.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  goog.dom.classlist.add(element, 'settings-panel-color-scale');

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var chartColorScale = new anychart.chartEditor2Module.settings.ColorScale(model, null);
  chartColorScale.allowEnabled(false);
  chartColorScale.setKey([['chart'], ['settings'], 'colorScale()']);
  this.addChild(chartColorScale, true);
};
