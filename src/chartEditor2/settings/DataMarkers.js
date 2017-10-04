goog.provide('anychart.chartEditor2Module.settings.DataMarkers');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.colorPicker.Base');
goog.require('anychart.chartEditor2Module.comboBox.Base');
goog.require('anychart.chartEditor2Module.input.Base');
goog.require('anychart.chartEditor2Module.controls.select.Base');
goog.require('anychart.chartEditor2Module.settings.Stroke');
goog.require('anychart.chartEditor2Module.settings.Title');
goog.require('anychart.enums');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {string|number} seriesId
 * @param {number=} opt_plotIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.DataMarkers = function(model, seriesId, opt_plotIndex, opt_domHelper) {
  anychart.chartEditor2Module.settings.DataMarkers.base(this, 'constructor', model, opt_domHelper);
  this.name = 'Data markers';
  this.seriesId_ = String(seriesId);

  var stringKey = 'getSeries(\'' + this.seriesId_ + '\')';
  if (goog.isDef(opt_plotIndex)) {
    this.plotIndex_ = opt_plotIndex;
    stringKey = 'plot(' + this.plotIndex_ + ').' + stringKey;
  }

  this.key = [['chart'], ['settings'], stringKey];
};
goog.inherits(anychart.chartEditor2Module.settings.DataMarkers, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.DataMarkers.CSS_CLASS = goog.getCssName('settings-data-markers');


/** @override */
anychart.chartEditor2Module.settings.DataMarkers.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.DataMarkers.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.DataMarkers.CSS_CLASS);

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  // var typeLabel = goog.dom.createDom(
  //     goog.dom.TagName.LABEL,
  //     [
  //       goog.ui.INLINE_BLOCK_CLASSNAME,
  //       goog.getCssName('settings-label')
  //     ],
  //     'Type');
  // goog.dom.appendChild(content, typeLabel);
  // this.typeLabel_ = typeLabel;

  var typeSelect = new anychart.chartEditor2Module.controls.select.Base('Type');
  typeSelect.setOptions(goog.object.getValues(anychart.enums.MarkerType));
  typeSelect.updateOptions();
  this.addChild(typeSelect, true);
  goog.dom.classlist.add(typeSelect.getElement(), goog.getCssName('markers-type'));
  this.typeSelect_ = typeSelect;

  var sizeSelect = new anychart.chartEditor2Module.comboBox.Base();
  sizeSelect.setOptions([6, 10, 12, 15]);
  this.addChild(sizeSelect, true);
  goog.dom.classlist.add(sizeSelect.getElement(), goog.getCssName('markers-size'));
  this.sizeSelect_ = sizeSelect;

  var fillSelect = new anychart.chartEditor2Module.colorPicker.Base();
  fillSelect.addClassName(goog.getCssName('marker-fill'));
  this.addChild(fillSelect, true);
  goog.dom.classlist.add(fillSelect.getElement(), goog.getCssName('markers-fill'));
  this.fillSelect_ = fillSelect;

  goog.dom.appendChild(content, goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('cb')));

  var stroke = new anychart.chartEditor2Module.settings.Stroke(model, 'Markers stroke');
  this.addChild(stroke, true);
  this.stroke_ = stroke;
};


/**
 * Update model keys.
 */
anychart.chartEditor2Module.settings.DataMarkers.prototype.updateKeys = function() {
  anychart.chartEditor2Module.settings.DataMarkers.base(this, 'updateKeys');

  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  if (this.typeSelect_) this.typeSelect_.init(model, this.genKey('type()'));
  if (this.fillSelect_) this.fillSelect_.init(model, this.genKey('fill()'));
  if (this.sizeSelect_) this.sizeSelect_.init(model, this.genKey('size()'));

  if (this.stroke_) this.stroke_.setKey(this.genKey('stroke()'));
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.DataMarkers.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.DataMarkers.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  this.typeSelect_.setValueByTarget(target);
  this.fillSelect_.setValueByTarget(target);
  this.sizeSelect_.setValueByTarget(target);
};


/** @override */
anychart.chartEditor2Module.settings.DataMarkers.prototype.disposeInternal = function() {
  this.typeSelect_ = null;
  this.fillSelect_ = null;
  this.sizeSelect_ = null;

  this.stroke_.dispose();
  this.stroke_ = null;

  anychart.chartEditor2Module.settings.DataMarkers.base(this, 'disposeInternal');
};
