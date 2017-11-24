goog.provide('anychart.chartEditorModule.settings.specific.Radar');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.controls.ControlWrapper');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Radar = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Radar Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Radar, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Radar.CSS_CLASS = goog.getCssName('anychart-settings-panel-radar');


/** @override */
anychart.chartEditorModule.settings.specific.Radar.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.specific.Radar.CSS_CLASS);

  var startAngle = new anychart.chartEditorModule.comboBox.Base();
  startAngle.setOptions([0, 90, 180, 270]);
  startAngle.setRange(0, 360);
  this.startAngle_ = new anychart.chartEditorModule.controls.ControlWrapper(startAngle, 'Start Angle');
  this.addChild(this.startAngle_, true);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Radar.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.startAngle_) this.startAngle_.init(model, this.genKey('startAngle()'));
  }
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Radar.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.startAngle_) this.startAngle_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Radar.prototype.disposeInternal = function() {
  goog.dispose(this.startAngle_);
  this.startAngle_ = null;

  anychart.chartEditorModule.settings.specific.Radar.base(this, 'disposeInternal');
};
