goog.provide('anychart.chartEditorModule.XAxesPanel');

goog.require('anychart.chartEditorModule.AxesPanelBase');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.AxesPanelBase}
 */
anychart.chartEditorModule.XAxesPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.XAxesPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'X Axes';
  this.xOrY = 'x';
};
goog.inherits(anychart.chartEditorModule.XAxesPanel, anychart.chartEditorModule.AxesPanelBase);
