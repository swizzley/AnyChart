goog.provide('anychart.chartEditorModule.settings.specific.Cartesian');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.ControlWrapper');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Cartesian = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Cartesian Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Cartesian, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Cartesian.CSS_CLASS = goog.getCssName('anychart-settings-panel-radar');


/** @override */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'createDom');

  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.specific.Cartesian.CSS_CLASS);

  var pointWidth = new anychart.chartEditorModule.comboBox.Percentage();
  pointWidth.setOptions([10, 30, 50, 70, 90]);
  this.pointWidth_ = new anychart.chartEditorModule.controls.ControlWrapper(pointWidth, 'Point Width');
  this.addChild(this.pointWidth_, true);

  var maxPointWidth = new anychart.chartEditorModule.comboBox.Percentage();
  maxPointWidth.setOptions([10, 30, 50, 70, 90, 100]);
  this.maxPointWidth_ = new anychart.chartEditorModule.controls.ControlWrapper(maxPointWidth, 'Max Point Width');
  this.addChild(this.maxPointWidth_, true);

  var minPointLength = new anychart.chartEditorModule.comboBox.Percentage();
  minPointLength.setOptions([0, 2, 5, 10]);
  this.minPointLength_ = new anychart.chartEditorModule.controls.ControlWrapper(minPointLength, 'Min Point Length');
  this.addChild(this.minPointLength_, true);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.pointWidth_) this.pointWidth_.init(model, this.genKey('pointWidth()'));
    if (this.maxPointWidth_) this.maxPointWidth_.init(model, this.genKey('maxPointWidth()'));
    if (this.minPointLength_) this.minPointLength_.init(model, this.genKey('minPointLength()'));
  }
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.pointWidth_) this.pointWidth_.setValueByTarget(target);
    if (this.maxPointWidth_) this.maxPointWidth_.setValueByTarget(target);
    if (this.minPointLength_) this.minPointLength_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.disposeInternal = function() {
  goog.dispose(this.pointWidth_);
  this.pointWidth_ = null;

  goog.dispose(this.maxPointWidth_);
  this.maxPointWidth_ = null;

  goog.dispose(this.minPointLength_);
  this.minPointLength_ = null;

  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'disposeInternal');
};
