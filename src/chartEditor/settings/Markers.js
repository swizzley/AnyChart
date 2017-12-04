goog.provide('anychart.chartEditorModule.settings.Markers');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.controls.select.DataFieldSelect');
goog.require('anychart.chartEditorModule.input.Base');
goog.require('anychart.chartEditorModule.settings.Stroke');
goog.require('anychart.chartEditorModule.settings.Title');
goog.require('anychart.enums');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.Markers = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.Markers.base(this, 'constructor', model, 'Markers', opt_domHelper);
};
goog.inherits(anychart.chartEditorModule.settings.Markers, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.Markers.CSS_CLASS = goog.getCssName('anychart-chart-editor-settings-markers');


/** @override */
anychart.chartEditorModule.settings.Markers.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Markers.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.Markers.CSS_CLASS);

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var typeSelect = new anychart.chartEditorModule.controls.select.DataFieldSelect('Type');
  typeSelect.setOptions(goog.object.getValues(anychart.enums.MarkerType));
  this.addChild(typeSelect, true);
  goog.dom.classlist.add(typeSelect.getElement(), goog.getCssName('markers-type'));
  this.typeSelect_ = typeSelect;

  var sizeSelect = new anychart.chartEditorModule.comboBox.Base();
  sizeSelect.setOptions([6, 10, 12, 15]);
  this.addChild(sizeSelect, true);
  goog.dom.classlist.add(sizeSelect.getElement(), goog.getCssName('markers-size'));
  this.sizeSelect_ = sizeSelect;

  var fillSelect = new anychart.chartEditorModule.colorPicker.Base();
  fillSelect.addClassName(goog.getCssName('marker-fill'));
  this.addChild(fillSelect, true);
  goog.dom.classlist.add(fillSelect.getElement(), goog.getCssName('markers-fill'));
  this.fillSelect_ = fillSelect;

  goog.dom.appendChild(content, goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-clearboth')));

  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var stroke = new anychart.chartEditorModule.settings.Stroke(model);
  stroke.setKey(this.genKey('stroke()'));
  this.addChildControl(stroke);
};


/**
 * Update model keys.
 */
anychart.chartEditorModule.settings.Markers.prototype.updateKeys = function() {
  anychart.chartEditorModule.settings.Markers.base(this, 'updateKeys');

  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  if (this.typeSelect_) this.typeSelect_.init(model, this.genKey('type()'));
  if (this.fillSelect_) this.fillSelect_.init(model, this.genKey('fill()'));
  if (this.sizeSelect_) this.sizeSelect_.init(model, this.genKey('size()'));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Markers.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.Markers.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  this.typeSelect_.setValueByTarget(target);
  this.fillSelect_.setValueByTarget(target);
  this.sizeSelect_.setValueByTarget(target);
};


/** @override */
anychart.chartEditorModule.settings.Markers.prototype.disposeInternal = function() {
  goog.disposeAll([this.typeSelect_, this.fillSelect_, this.sizeSelect_]);
  this.typeSelect_ = null;
  this.fillSelect_ = null;
  this.sizeSelect_ = null;

  anychart.chartEditorModule.settings.Markers.base(this, 'disposeInternal');
};
