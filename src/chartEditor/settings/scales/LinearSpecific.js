goog.provide('anychart.chartEditorModule.settings.scales.LinearSpecific');

goog.require('anychart.chartEditorModule.SettingsPanel');
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


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.scales.LinearSpecific = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.scales.LinearSpecific.base(this, 'constructor', model, null, opt_domHelper);

  this.allowEnabled(false);
};
goog.inherits(anychart.chartEditorModule.settings.scales.LinearSpecific, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.scales.LinearSpecific.CSS_CLASS = goog.getCssName('anychart-settings-panel-scale-linear');


/** @override */
anychart.chartEditorModule.settings.scales.LinearSpecific.prototype.createDom = function() {
  anychart.chartEditorModule.settings.scales.LinearSpecific.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.scales.LinearSpecific.CSS_CLASS);

  //var content = this.getContentElement();
  //var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
console.log("LinearSpecific");
  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps'), 'Linear Scale'));
};
