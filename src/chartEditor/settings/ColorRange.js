goog.provide('anychart.chartEditorModule.settings.ColorRange');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.Title');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.ColorRange = function(model,  opt_domHelper) {
  anychart.chartEditorModule.settings.ColorRange.base(this, 'constructor', model, opt_domHelper);
  this.name = 'Color Range';
  this.key = [['chart'], ['settings'], 'colorRange()'];
};
goog.inherits(anychart.chartEditorModule.settings.ColorRange, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.ColorRange.CSS_CLASS = goog.getCssName('anychart-settings-panel-color-range');


/** @override */
anychart.chartEditorModule.settings.ColorRange.prototype.createDom = function() {
  anychart.chartEditorModule.settings.ColorRange.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.ColorRange.CSS_CLASS);

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

};


/** @override */
anychart.chartEditorModule.settings.ColorRange.prototype.disposeInternal = function() {
  // this.appearance_.dispose();
  // this.appearance_ = null;

  anychart.chartEditorModule.settings.ColorRange.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.ColorRange.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    //if (this.title_) this.title_.setKey(this.genKey('title()'));
  }

  // Update key of enabled checkbox
  anychart.chartEditorModule.settings.ColorRange.base(this, 'updateKeys');
};