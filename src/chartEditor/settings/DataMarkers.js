goog.provide('anychart.chartEditorModule.settings.DataMarkers');

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
 * @param {string|number} seriesId
 * @param {number=} opt_plotIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.DataMarkers = function(model, seriesId, opt_plotIndex, opt_domHelper) {
  anychart.chartEditorModule.settings.DataMarkers.base(this, 'constructor', model, opt_domHelper);
  this.name = 'Data markers';
  this.seriesId_ = String(seriesId);

  var stringKey = 'getSeries(\'' + this.seriesId_ + '\')';
  if (goog.isDef(opt_plotIndex)) {
    this.plotIndex_ = opt_plotIndex;
    stringKey = 'plot(' + this.plotIndex_ + ').' + stringKey;
  }

  this.key = [['chart'], ['settings'], stringKey];
};
goog.inherits(anychart.chartEditorModule.settings.DataMarkers, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.DataMarkers.CSS_CLASS = goog.getCssName('anychart-settings-data-markers');


/** @override */
anychart.chartEditorModule.settings.DataMarkers.prototype.createDom = function() {
  anychart.chartEditorModule.settings.DataMarkers.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.DataMarkers.CSS_CLASS);

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

  var stroke = new anychart.chartEditorModule.settings.Stroke(model, 'Stroke');
  this.addChild(stroke, true);
  this.stroke_ = stroke;
};


/**
 * Update model keys.
 */
anychart.chartEditorModule.settings.DataMarkers.prototype.updateKeys = function() {
  anychart.chartEditorModule.settings.DataMarkers.base(this, 'updateKeys');

  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  if (this.typeSelect_) this.typeSelect_.init(model, this.genKey('type()'));
  if (this.fillSelect_) this.fillSelect_.init(model, this.genKey('fill()'));
  if (this.sizeSelect_) this.sizeSelect_.init(model, this.genKey('size()'));

  if (this.stroke_) this.stroke_.setKey(this.genKey('stroke()'));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.DataMarkers.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.DataMarkers.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  this.typeSelect_.setValueByTarget(target);
  this.fillSelect_.setValueByTarget(target);
  this.sizeSelect_.setValueByTarget(target);
};


/** @override */
anychart.chartEditorModule.settings.DataMarkers.prototype.disposeInternal = function() {
  this.typeSelect_ = null;
  this.fillSelect_ = null;
  this.sizeSelect_ = null;

  this.stroke_.dispose();
  this.stroke_ = null;

  anychart.chartEditorModule.settings.DataMarkers.base(this, 'disposeInternal');
};
