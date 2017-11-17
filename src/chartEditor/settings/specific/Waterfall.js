goog.provide('anychart.chartEditorModule.settings.specific.Waterfall');

goog.require('anychart.chartEditorModule.SettingsPanel');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Waterfall = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'constructor', model, opt_domHelper);
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

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  // todo: your code here...
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    // todo: your code here...
  }
};



/** @override */
anychart.chartEditorModule.settings.specific.Waterfall.prototype.disposeInternal = function() {
  // todo: your code here...

  anychart.chartEditorModule.settings.specific.Waterfall.base(this, 'disposeInternal');
};
