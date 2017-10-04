goog.provide('anychart.chartEditor2Module.TooltipPanel');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.chartEditor2Module.settings.Title');
goog.require('anychart.chartEditor2Module.settings.TooltipTitle');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.TooltipPanel = function(model, opt_domHelper) {
  anychart.chartEditor2Module.TooltipPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Tooltip';

  this.key = [['chart'], ['settings'], 'tooltip()'];
};
goog.inherits(anychart.chartEditor2Module.TooltipPanel, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.TooltipPanel.prototype.createDom = function() {
  anychart.chartEditor2Module.TooltipPanel.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  var content = /** @type {Element} */(this.getContentElement());
  goog.dom.classlist.add(element, 'settings-panel-tooltip');

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  // Display mode
  var displayModeLabels = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Display mode');
  goog.dom.appendChild(content, displayModeLabels);
  this.registerLabel(displayModeLabels);

  var displayMode = new anychart.chartEditor2Module.controls.select.DataFieldSelect();
  displayMode.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  displayMode.setOptions(['separated', 'single', 'union']);
  this.addChild(displayMode, true);
  this.displayMode_ = displayMode;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  // Position mode
  var positionModeLabels = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Position mode');
  goog.dom.appendChild(content, positionModeLabels);
  this.registerLabel(positionModeLabels);

  var positionMode = new anychart.chartEditor2Module.controls.select.DataFieldSelect();
  positionMode.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  positionMode.setOptions(['chart', 'float', 'point']);
  this.addChild(positionMode, true);
  this.positionMode_ = positionMode;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  // Title
  var title = new anychart.chartEditor2Module.settings.TooltipTitle(model, 'Title');
  title.setTitleFormatKey([['chart'], ['settings'], 'tooltip().titleFormat()']);
  title.setKey(this.genKey('title()')); // This is for enabled working sake!
  this.addChild(title, true);
  this.title_ = title;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  // Content
  var contentComponent = new anychart.chartEditor2Module.settings.Title(model, 'Content');
  contentComponent.allowEnabled(false);
  contentComponent.allowEditPosition(false);
  contentComponent.allowEditAlign(false);
  contentComponent.setTitleKey('format()');
  contentComponent.setKey(this.getKey()); // This is for enabled working sake!
  this.addChild(contentComponent, true);
  this.content_ = contentComponent;
};


/** @inheritDoc */
anychart.chartEditor2Module.TooltipPanel.prototype.updateKeys = function() {
  anychart.chartEditor2Module.TooltipPanel.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  // var settings = model.getModel()['chart']['settings'];
  // console.log(settings);
  // if (settings) {
  //
  // }

  if (this.displayMode_) this.displayMode_.init(model, this.genKey('displayMode()'));
  if (this.positionMode_) this.positionMode_.init(model, this.genKey('positionMode()'));
  if (this.title_) this.title_.setKey(this.genKey('title()'));
};


/** @inheritDoc */
anychart.chartEditor2Module.TooltipPanel.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.TooltipPanel.base(this, 'onChartDraw', evt);
  var target = evt.chart;
  if (this.displayMode_) this.displayMode_.setValueByTarget(target);
  if (this.positionMode_) this.positionMode_.setValueByTarget(target);
};


/** @override */
anychart.chartEditor2Module.TooltipPanel.prototype.disposeInternal = function() {
  this.title_ = null;
  this.content_ = null;
  anychart.chartEditor2Module.TooltipPanel.base(this, 'disposeInternal');
};
