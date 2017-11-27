goog.provide('anychart.chartEditorModule.ColorRangePanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.Legend');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.ColorRangePanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.ColorRangePanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Color Range';

  this.stringId = 'colorRange';

  this.key = [['chart'], ['settings'], 'colorRange()'];
};
goog.inherits(anychart.chartEditorModule.ColorRangePanel, anychart.chartEditorModule.SettingsPanel);


/** @inheritDoc */
anychart.chartEditorModule.ColorRangePanel.prototype.createDom = function() {
  anychart.chartEditorModule.ColorRangePanel.base(this, 'createDom');

  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  // var title = new anychart.chartEditorModule.settings.Title(model);
  // title.allowEnabled(false);
  // title.setPositionKey('orientation()');
  // title.setKey([['chart'], ['settings'], 'title()']);
  // this.addChild(title, true);
  //
  // this.title_ = title;
};