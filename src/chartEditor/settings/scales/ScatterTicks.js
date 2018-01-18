goog.provide('anychart.chartEditorModule.settings.scales.ScatterTicks');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.scales.ScatterTicks = function(model, opt_name, opt_domHelper) {
  anychart.chartEditorModule.settings.scales.ScatterTicks.base(this, 'constructor', model, opt_name, opt_domHelper);
};
goog.inherits(anychart.chartEditorModule.settings.scales.ScatterTicks, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.scales.ScatterTicks.CSS_CLASS = goog.getCssName('anychart-settings-panel-scatter-ticks');


/** @override */
anychart.chartEditorModule.settings.scales.ScatterTicks.prototype.createDom = function() {
  anychart.chartEditorModule.settings.scales.ScatterTicks.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.scales.ScatterTicks.CSS_CLASS);

  //var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  // var mode = new anychart.chartEditorModule.controls.select.DataField({label: 'Mode'});
  // mode.getSelect().setOptions([
  //   {value: 'linear', caption: 'Linear'},
  //   {value: 'logarithmic', caption: 'Logarithmic'}
  // ]);
  // mode.init(model, this.genKey('mode()'));
  // this.addChildControl(mode);
};
