goog.provide('anychart.chartEditorModule.settings.specific.Waterfall');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.controls.select.DataField');



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

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.specific.Waterfall.CSS_CLASS);

  var dataModeField = new anychart.chartEditorModule.controls.select.DataField({label: 'Data Mode'});
  dataModeField.getSelect().setOptions([
    {value: 'diff', caption: 'Difference'},
    {value: 'absolute', caption: 'Absolute'}
  ]);
  this.addChild(dataModeField, true);
  this.dataModeField_ = dataModeField;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.dataModeField_) this.dataModeField_.init(model, this.genKey('dataMode()'));
  }

  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.dataModeField_) this.dataModeField_.getSelect().setValueByTarget(target);
  }
};



/** @override */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.disposeInternal = function() {
  // todo: your code here...

  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'disposeInternal');
};
