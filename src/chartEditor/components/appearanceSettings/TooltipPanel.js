goog.provide('anychart.chartEditorModule.TooltipPanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Title');
goog.require('anychart.chartEditorModule.settings.TooltipTitle');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.TooltipPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.TooltipPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Tooltip';

  this.key = [['chart'], ['settings'], 'tooltip()'];
};
goog.inherits(anychart.chartEditorModule.TooltipPanel, anychart.chartEditorModule.SettingsPanel);


/** @inheritDoc */
anychart.chartEditorModule.TooltipPanel.prototype.createDom = function() {
  anychart.chartEditorModule.TooltipPanel.base(this, 'createDom');
  var content = /** @type {Element} */(this.getContentElement());
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var wrapper = new anychart.chartEditorModule.SettingsPanel(model);
  wrapper.setName(null);
  wrapper.addClassName('anychart-settings-panel');
  wrapper.addClassName('anychart-settings-panel-wrapper');
  this.addChild(wrapper, true);

  // Display mode
  var displayMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Display mode'});
  displayMode.getSelect().setOptions(['separated', 'single', 'union']);
  wrapper.addChild(displayMode, true);
  this.displayMode_ = displayMode;

  // Position mode
  var positionMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Position mode'});
  positionMode.getSelect().setOptions(['chart', 'float', 'point']);
  wrapper.addChild(positionMode, true);
  this.positionMode_ = positionMode;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Title
  var title = new anychart.chartEditorModule.settings.TooltipTitle(model, 'Title');
  title.setTitleFormatKey([['chart'], ['settings'], 'tooltip().titleFormat()']);
  title.setKey(this.genKey('title()')); // This is for enabled working sake!
  this.addChild(title, true);
  this.title_ = title;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Content
  var contentComponent = new anychart.chartEditorModule.settings.Title(model, 'Content');
  contentComponent.allowEnabled(false);
  contentComponent.allowEditPosition(false);
  contentComponent.allowEditAlign(false);
  contentComponent.setTitleKey('format()');
  contentComponent.setKey(this.getKey()); // This is for enabled working sake!
  this.addChild(contentComponent, true);
  this.content_ = contentComponent;
};


/** @inheritDoc */
anychart.chartEditorModule.TooltipPanel.prototype.updateKeys = function() {
  anychart.chartEditorModule.TooltipPanel.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  if (this.displayMode_) this.displayMode_.init(model, this.genKey('displayMode()'));
  if (this.positionMode_) this.positionMode_.init(model, this.genKey('positionMode()'));
  if (this.title_) this.title_.setKey(this.genKey('title()'));
};


/** @inheritDoc */
anychart.chartEditorModule.TooltipPanel.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.TooltipPanel.base(this, 'onChartDraw', evt);
  var target = evt.chart;
  if (this.displayMode_) this.displayMode_.getSelect().setValueByTarget(target);
  if (this.positionMode_) this.positionMode_.getSelect().setValueByTarget(target);
};


/** @override */
anychart.chartEditorModule.TooltipPanel.prototype.disposeInternal = function() {
  this.title_ = null;
  this.content_ = null;
  anychart.chartEditorModule.TooltipPanel.base(this, 'disposeInternal');
};
