goog.provide('anychart.chartEditor2Module.steps.VisualAppearance');

goog.require('anychart.chartEditor2Module.AppearanceSettings');
goog.require('anychart.chartEditor2Module.Chart');
goog.require('anychart.chartEditor2Module.events');
goog.require('anychart.chartEditor2Module.steps.Base');
goog.require('anychart.ui.Component');
goog.require('goog.dom.classlist');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {number} index Step index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.chartEditor2Module.steps.Base}
 */
anychart.chartEditor2Module.steps.VisualAppearance = function(index, opt_domHelper) {
  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'constructor', index, opt_domHelper);

  this.name('Visual Appearance');
  this.title('Visual Appearance');
  this.addClassName('anychart-visual-appearance-step');

  this.panelsSettings_ = {};
};
goog.inherits(anychart.chartEditor2Module.steps.VisualAppearance, anychart.chartEditor2Module.steps.Base);


/** @inheritDoc */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.createDom = function() {
  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'createDom');

  var editor = /** @type {anychart.chartEditor2Module.Editor} */(this.getParent());
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(editor.getModel());

  var tabs = new anychart.ui.Component();
  tabs.addClassName('anychart-border-box');
  tabs.addClassName('anychart-visual-appearance-step-tabs');
  this.addChild(tabs, true);

  var wrapper = new anychart.ui.Component();
  wrapper.addClassName('anychart-visual-appearance-right-wrapper');
  this.addChild(wrapper, true);

  var tabContent = new anychart.ui.Component();
  tabContent.addClassName('anychart-border-box');
  tabContent.addClassName('anychart-visual-appearance-settings-tab-content');
  wrapper.addChild(tabContent, true);

  var chartWrapper = new anychart.ui.Component();
  chartWrapper.addClassName('anychart-border-box');
  chartWrapper.addClassName('anychart-visual-appearance-settings-chart-wrapper');
  wrapper.addChild(chartWrapper, true);

  this.chartWrapper_ = chartWrapper;
  var caption = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-chart-preview-caption', 'Chart Preview');
  goog.dom.appendChild(this.chartWrapper_.getElement(), caption);

  //todo: rework as separate components with fixed structure
  this.appearanceSettings_ = new anychart.chartEditor2Module.AppearanceSettings(model, tabs, tabContent);
  this.appearanceSettings_.updateDescriptors(this.panelsSettings_);
  this.addChild(this.appearanceSettings_, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.enterDocument = function() {
  // Shound be called before enterDocument()!
  this.appearanceSettings_.updatePanels();

  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'enterDocument');

  var editor = /** @type {anychart.chartEditor2Module.Editor} */(this.getParent());
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(editor.getModel());

  this.chart_ = new anychart.chartEditor2Module.Chart(model);
  this.chartWrapper_.addChild(this.chart_, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.exitDocument = function() {
  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'exitDocument');
  goog.dispose(this.chart_);
  this.chart_ = null;
};


/** @inheritDoc */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.disposeInternal = function() {
  goog.dispose(this.chart_);
  this.chart_ = null;
  goog.dispose(this.appearanceSettings_);
  this.appearanceSettings_ = null;

  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'disposeInternal');
};


/**
 * Enable/disable context menu panel.
 * @param {boolean} enabled
 */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.contextMenu = function(enabled) {
  if (this.appearanceSettings_)
    this.appearanceSettings_.enablePanelByName('ContextMenu', enabled);
  else {
    this.panelsSettings_['ContextMenu'] = this.panelsSettings_['ContextMenu'] ? this.panelsSettings_['ContextMenu'] : {};
    this.panelsSettings_['ContextMenu'].enabled = enabled;
  }
};


(function() {
  var proto = anychart.chartEditor2Module.steps.VisualAppearance.prototype;
  proto['contextMenu'] = proto.contextMenu;
})();
