goog.provide('anychart.chartEditorModule.settings.Ticks');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Stroke');
goog.require('anychart.chartEditorModule.settings.Title');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.Ticks = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.Ticks.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Ticks';
};
goog.inherits(anychart.chartEditorModule.settings.Ticks, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.Ticks.CSS_CLASS = goog.getCssName('anychart-chart-editor-settings-ticks');


/** @inheritDoc */
anychart.chartEditorModule.settings.Ticks.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Ticks.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.Ticks.CSS_CLASS);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var position = new anychart.chartEditorModule.controls.select.DataField({label: 'Position'});
  var positionValues = goog.object.getValues(anychart.enums.SidePosition);
  positionValues = goog.array.filter(positionValues, function(i) {
    return goog.typeOf(i) == 'string';
  });
  position.getControl().setOptions(positionValues);
  position.init(model, this.genKey('position()'));
  this.addLabeledControl(position);

  // Length
  var length = new anychart.chartEditorModule.comboBox.Base();
  length.setOptions([1, 5, 10, 15]);
  length.setRange(0, 100);
  var lengthLC = new anychart.chartEditorModule.controls.LabeledControl(length, 'Length');
  lengthLC.init(model, this.genKey('length()'));
  this.addLabeledControl(lengthLC);

  // Stroke
  var stroke = new anychart.chartEditorModule.settings.Stroke(model);
  stroke.setKey(this.genKey('stroke()'));
  this.addLabeledControl(stroke);
};
