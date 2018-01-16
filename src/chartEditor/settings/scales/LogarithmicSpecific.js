goog.provide('anychart.chartEditorModule.settings.scales.LogarithmicSpecific');

goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Labels');
goog.require('anychart.chartEditorModule.settings.Stagger');
goog.require('anychart.chartEditorModule.settings.Ticks');
goog.require('anychart.chartEditorModule.settings.Title');
goog.require('anychart.chartEditorModule.settings.scales.LinearSpecific');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.settings.scales.LinearSpecific}
 */
anychart.chartEditorModule.settings.scales.LogarithmicSpecific = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.scales.LogarithmicSpecific.base(this, 'constructor', model, opt_domHelper);

  this.allowEnabled(false);
};
goog.inherits(anychart.chartEditorModule.settings.scales.LogarithmicSpecific, anychart.chartEditorModule.settings.scales.LinearSpecific);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.scales.LogarithmicSpecific.CSS_CLASS = goog.getCssName('anychart-settings-panel-scale-logarithmic');


/** @override */
anychart.chartEditorModule.settings.scales.LogarithmicSpecific.prototype.createDom = function() {
  anychart.chartEditorModule.settings.scales.LogarithmicSpecific.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.scales.LogarithmicSpecific.CSS_CLASS);

  //var content = this.getContentElement();
  //var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  console.log("LogarithmicSpecific");
  goog.dom.removeChildren(this.getContentElement());
  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps'), 'Logarithmic Scale'));
};
