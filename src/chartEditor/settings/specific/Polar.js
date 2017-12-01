goog.provide('anychart.chartEditorModule.settings.specific.Polar');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Polar = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Polar.base(this, 'constructor', model, 'Polar Chart Settings', opt_domHelper);

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Polar, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Polar.CSS_CLASS = goog.getCssName('anychart-settings-panel-polar');


/** @override */
anychart.chartEditorModule.settings.specific.Polar.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Polar.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.specific.Polar.CSS_CLASS);

  var sortPointsByX = new anychart.chartEditorModule.checkbox.Base();
  sortPointsByX.setCaption('Sort Points By X');
  this.sortPointsByX_ = sortPointsByX;
  this.addChild(this.sortPointsByX_, true);

  var startAngle = new anychart.chartEditorModule.comboBox.Base();
  startAngle.setOptions([0, 90, 180, 270]);
  startAngle.setRange(0, 360);
  this.startAngle_ = new anychart.chartEditorModule.controls.LabeledControl(startAngle, 'Start Angle');
  this.addChild(this.startAngle_, true);

  var pointWidth = new anychart.chartEditorModule.comboBox.Base();
  pointWidth.setOptions([1, 5, 10, 20, 40]);
  pointWidth.setRange(1, 200);
  this.pointWidth_ = new anychart.chartEditorModule.controls.LabeledControl(pointWidth, 'Point Width');
  this.addChild(this.pointWidth_, true);

  var maxPointWidth = new anychart.chartEditorModule.comboBox.Base();
  maxPointWidth.setOptions([1, 5, 10, 20, 40]);
  maxPointWidth.setRange(1, 200);
  this.maxPointWidth_ = new anychart.chartEditorModule.controls.LabeledControl(maxPointWidth, 'Max Point Width');
  this.addChild(this.maxPointWidth_, true);

  var innerRadius = new anychart.chartEditorModule.comboBox.Percentage();
  innerRadius.setOptions([5, 10, 20, 30, 40]);
  this.innerRadius_ = new anychart.chartEditorModule.controls.LabeledControl(innerRadius, 'Inner Radius');
  this.addChild(this.innerRadius_, true);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Polar.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.sortPointsByX_) this.sortPointsByX_.init(model, [['chart'], ['settings'], 'sortPointsByX()']);
    if (this.startAngle_) this.startAngle_.init(model, this.genKey('startAngle()'));
    if (this.pointWidth_) this.pointWidth_.init(model, this.genKey('pointWidth()'));
    if (this.maxPointWidth_) this.maxPointWidth_.init(model, this.genKey('maxPointWidth()'));
    if (this.innerRadius_) this.innerRadius_.init(model, this.genKey('innerRadius()'));
  }
  anychart.chartEditorModule.settings.specific.Polar.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Polar.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Polar.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.sortPointsByX_) this.sortPointsByX_.setValueByTarget(target);
    if (this.startAngle_) this.startAngle_.setValueByTarget(target);
    if (this.pointWidth_) this.pointWidth_.setValueByTarget(target);
    if (this.maxPointWidth_) this.maxPointWidth_.setValueByTarget(target);
    if (this.innerRadius_) this.innerRadius_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Polar.prototype.disposeInternal = function() {
  goog.dispose(this.sortPointsByX_);
  this.sortPointsByX_ = null;

  goog.dispose(this.startAngle_);
  this.startAngle_ = null;

  goog.dispose(this.pointWidth_);
  this.pointWidth_ = null;

  goog.dispose(this.maxPointWidth_);
  this.maxPointWidth_ = null;

  goog.dispose(this.innerRadius_);
  this.innerRadius_ = null;

  anychart.chartEditorModule.settings.specific.Polar.base(this, 'disposeInternal');
};
