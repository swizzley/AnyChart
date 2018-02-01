goog.provide('anychart.chartEditorModule.settings.axes.Cartesian');

goog.require('anychart.chartEditorModule.settings.axes.Linear');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {number} index
 * @param {string} xOrY
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.settings.axes.Linear}
 */
anychart.chartEditorModule.settings.axes.Cartesian = function(model, index, xOrY, opt_domHelper) {
  anychart.chartEditorModule.settings.axes.Cartesian.base(this, 'constructor', model, index, null, opt_domHelper);

  this.xOrY = xOrY;
  this.name = this.xOrY + 'Axis(' + this.index_ + ')';
  this.key = [['chart'], ['settings'], this.xOrY + 'Axis(' + this.index_ + ')'];

  this.addClassName(goog.getCssName('anychart-settings-panel-axis-cartesian'));
};
goog.inherits(anychart.chartEditorModule.settings.axes.Cartesian, anychart.chartEditorModule.settings.axes.Linear);
