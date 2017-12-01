goog.provide('anychart.chartEditorModule.settings.specific.Pie');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Stroke');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Pie = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Pie.base(this, 'constructor', model, 'Pie Chart Settings', opt_domHelper);

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Pie, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Pie.CSS_CLASS = goog.getCssName('anychart-settings-panel-pie');


/** @override */
anychart.chartEditorModule.settings.specific.Pie.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Pie.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.specific.Pie.CSS_CLASS);

  var innerRadius = new anychart.chartEditorModule.comboBox.Percentage();
  innerRadius.setOptions([5, 10, 20, 30, 40]);
  this.innerRadius_ = new anychart.chartEditorModule.controls.LabeledControl(innerRadius, 'Inner Radius');
  this.addChild(this.innerRadius_, true);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  this.connectorStroke_ = new anychart.chartEditorModule.settings.Stroke(model, 'Connector Stroke');
  this.addChild(this.connectorStroke_, true);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Pie.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

    if (this.innerRadius_) this.innerRadius_.init(model, this.genKey('innerRadius()'));
    if (this.connectorStroke_) this.connectorStroke_.setKey(this.genKey('connectorStroke()'));
  }

  anychart.chartEditorModule.settings.specific.Pie.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Pie.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Pie.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.innerRadius_) this.innerRadius_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Pie.prototype.disposeInternal = function() {
  goog.dispose(this.innerRadius_);
  this.innerRadius_ = null;

  goog.dispose(this.connectorStroke_);
  this.connectorStroke_ = null;

  anychart.chartEditorModule.settings.specific.Pie.base(this, 'disposeInternal');
};
