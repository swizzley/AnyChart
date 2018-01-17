goog.provide('anychart.chartEditorModule.settings.scales.LinearSpecific');

goog.require('anychart.chartEditorModule.settings.scales.SpecificBase');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.controls.LabeledControlTwins');
goog.require('anychart.chartEditorModule.input.Base');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.settings.scales.SpecificBase}
 */
anychart.chartEditorModule.settings.scales.LinearSpecific = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.scales.LinearSpecific.base(this, 'constructor', model, null, opt_domHelper);
};
goog.inherits(anychart.chartEditorModule.settings.scales.LinearSpecific, anychart.chartEditorModule.settings.scales.SpecificBase);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.scales.LinearSpecific.CSS_CLASS = goog.getCssName('anychart-settings-panel-scale-linear');


/** @override */
anychart.chartEditorModule.settings.scales.LinearSpecific.prototype.createDom = function() {
  anychart.chartEditorModule.settings.scales.LinearSpecific.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.scales.LinearSpecific.CSS_CLASS);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var inverted = new anychart.chartEditorModule.checkbox.Base();
  inverted.setCaption('Inverted');
  inverted.init(model, this.genKey('inverted()'));
  this.addChildControl(inverted);

  var minimum = new anychart.chartEditorModule.input.Base();
  var minimumLC = new anychart.chartEditorModule.controls.LabeledControlTwins(minimum, 'Minimum');
  minimumLC.init(model, this.genKey('minimum()'));
  minimumLC.setKey2(this.genKey('softMinimum()'));
  this.addChildControl(minimumLC);

  var maximum = new anychart.chartEditorModule.input.Base();
  var maximumLC = new anychart.chartEditorModule.controls.LabeledControlTwins(maximum, 'Maximum');
  maximumLC.init(model, this.genKey('maximum()'));
  maximumLC.setKey2(this.genKey('softMaximum()'));
  this.addChildControl(maximumLC);
};
