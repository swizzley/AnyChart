goog.provide('anychart.chartEditorModule.settings.specific.Mekko');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.controls.ControlWrapper');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Mekko = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Mekko Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Mekko, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Mekko.CSS_CLASS = goog.getCssName('anychart-settings-panel-mosaic');


/** @override */
anychart.chartEditorModule.settings.specific.Mekko.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.specific.Mekko.CSS_CLASS);

  var pointsPadding = new anychart.chartEditorModule.comboBox.Base();
  pointsPadding.setOptions([0, 1, 3, 5, 10, 15]);
  pointsPadding.setFormatterFunction(function(value) {
    return String(goog.math.clamp(Number(value), 0, 20));
  });

  this.pointsPadding_ = new anychart.chartEditorModule.controls.ControlWrapper(pointsPadding, 'Points Padding');
  this.addChild(this.pointsPadding_, true);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Mekko.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.pointsPadding_) this.pointsPadding_.init(model, this.genKey('pointsPadding()'));
  }
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Mekko.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.pointsPadding_) this.pointsPadding_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Mekko.prototype.disposeInternal = function() {
  goog.dispose(this.pointsPadding_);
  this.pointsPadding_ = null;

  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'disposeInternal');
};
