goog.provide('anychart.chartEditorModule.settings.specific.Waterfall');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Stroke');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Waterfall = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Waterfall Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Waterfall, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Waterfall.CSS_CLASS = goog.getCssName('anychart-settings-panel-waterfall');


/** @override */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'createDom');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.specific.Waterfall.CSS_CLASS);

  var itemsSourceMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Legend Items Source Mode'});
  itemsSourceMode.getSelect().setOptions([
    {value: 'default', caption: 'Default'},
    {value: 'categories', caption: 'Categories'}
  ]);
  this.addChild(itemsSourceMode, true);
  this.itemsSourceMode_ = itemsSourceMode;
  
  var dataMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Data Mode'});
  dataMode.getSelect().setOptions([
    {value: 'diff', caption: 'Difference'},
    {value: 'absolute', caption: 'Absolute'}
  ]);
  this.addChild(dataMode, true);
  this.dataMode_ = dataMode;

  var stroke = new anychart.chartEditorModule.settings.Stroke(model, 'Connector Stroke');
  this.addChild(stroke, true);
  this.connectorStroke_ = stroke;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.itemsSourceMode_) this.itemsSourceMode_.init(model, this.genKey('legend().itemsSourceMode()'));
    if (this.dataMode_) this.dataMode_.init(model, this.genKey('dataMode()'));

    if (this.connectorStroke_) this.connectorStroke_.setKey(this.genKey('connectorStroke()'));
  }

  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.itemsSourceMode_) this.itemsSourceMode_.getSelect().setValueByTarget(target);
    if (this.dataMode_) this.dataMode_.getSelect().setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.disposeInternal = function() {
  goog.dispose(this.itemsSourceMode_);
  this.itemsSourceMode_ = null;

  goog.dispose(this.dataMode_);
  this.dataMode_ = null;

  goog.dispose(this.connectorStroke_);
  this.connectorStroke_ = null;

  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'disposeInternal');
};
