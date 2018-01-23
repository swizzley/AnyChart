goog.provide('anychart.chartEditorModule.MultiplePanelsBase');

goog.require('anychart.chartEditorModule.Component');
goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('goog.ui.Button');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.MultiplePanelsBase = function(model, opt_name, opt_domHelper) {
  anychart.chartEditorModule.MultiplePanelsBase.base(this, 'constructor', model, opt_name, opt_domHelper);

  // Should be set in children
  this.stringId = '';

  this.panels_ = [];
  
  this.addClassName(goog.getCssName('anychart-settings-panel-axes'));
};
goog.inherits(anychart.chartEditorModule.MultiplePanelsBase, anychart.chartEditorModule.SettingsPanel);


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.buttonLabel_ = '+ Add panel';


/** @param {string} value */
anychart.chartEditorModule.MultiplePanelsBase.prototype.setButtonLabel = function(value) {
  this.buttonLabel_ = value;
};


/** @inheritDoc */
anychart.chartEditorModule.MultiplePanelsBase.prototype.createDom = function() {
  anychart.chartEditorModule.MultiplePanelsBase.base(this, 'createDom');

  this.panelsContainer_ = new anychart.chartEditorModule.Component();
  this.addChild(this.panelsContainer_, true);

  var addPanelBtnRenderer = /** @type {goog.ui.ButtonRenderer} */(goog.ui.ControlRenderer.getCustomRenderer(
      goog.ui.ButtonRenderer,
      'anychart-axes-panel-add-axis-btn'));
  this.addPanelBtn_ = new goog.ui.Button(this.buttonLabel_, addPanelBtnRenderer);
  this.addChild(this.addPanelBtn_, true);
};


/** @inheritDoc */
anychart.chartEditorModule.MultiplePanelsBase.prototype.enterDocument = function() {
  anychart.chartEditorModule.MultiplePanelsBase.base(this, 'enterDocument');

  goog.style.setElementShown(this.addPanelBtn_.getElement(), true);
  this.getHandler().listen(this.addPanelBtn_, goog.ui.Component.EventType.ACTION, this.onAddPanel);

  this.createPanels();
};


/** @protected */
anychart.chartEditorModule.MultiplePanelsBase.prototype.onAddPanel = function() {
  // Should be overridden
  //
  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  // var axisIndex = model.addAxis();
  // this.addPanel(axisIndex);
};


/**
 * @param {Object} evt
 * @return {number}
 * @protected
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.onRemovePanel = function(evt) {
  var panelIndex = (/** @type {anychart.chartEditorModule.SettingsPanelIndexed} */(evt.currentTarget)).getIndex();
  goog.dispose(this.panels_[panelIndex]);
  this.panels_[panelIndex] = null;

  // Should do something like this
  //
  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  // model.dropAxis(axisIndex);

  return panelIndex;
};


/**
 * Create Axes settings panels.
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.createPanels = function() {
  // Should be overridden
  //
  // if (!this.isExcluded()) {
  //   // Always create 0 axis panel
  //   this.addPanel(0);
  //
  //   var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  //   var settings = model.getModel()['chart']['settings'];
  //
  //   var pattern = '^' + 'axis\\((\\d+)\\)\\.enabled\\(\\)$';
  //   var regExp = new RegExp(pattern);
  //
  //   for (var key in settings) {
  //     var match = key.match(regExp);
  //     if (match) {
  //       var panelIndex = Number(match[1]);
  //       if (panelIndex > 0)
  //         this.addPanel(panelIndex);
  //     }
  //   }
  // }
};


/**
 * @param {number} panelIndex
 * @protected
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.addPanel = function(panelIndex) {
  // Should be overridden
  //
  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  // var axis = new anychart.chartEditorModule.settings.CircularGaugeAxis(model, panelIndex);
  // axis.allowEnabled(true);
  // this.addPanelInstance(axis, 1);
};


/**
 * @param {anychart.chartEditorModule.SettingsPanelIndexed} panelInstance
 * @param {number=} opt_removeFromIndex
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.addPanelInstance = function(panelInstance, opt_removeFromIndex) {
  var panelIndex = panelInstance.getIndex();
  if (!goog.isDef(opt_removeFromIndex) || panelIndex >= opt_removeFromIndex) {
    panelInstance.allowRemove(true);
    this.getHandler().listen(panelInstance, anychart.chartEditorModule.events.EventType.PANEL_CLOSE, this.onRemovePanel);
  }
  if (this.panels_.length > panelIndex)
    this.panels_[panelIndex] = panelInstance;
  else
    this.panels_.push(panelInstance);

  this.panelsContainer_.addChild(panelInstance, true);
};


/**
 * Removes all panels elements from panel.
 * @private
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.removeAllPanels = function() {
  for (var i = 0; i < this.panels_.length; i++) {
    if (this.panels_[i]) {
      this.panelsContainer_.removeChild(this.panels_[i], true);
      goog.dispose(this.panels_[i]);
    }
  }
  this.panels_.length = 0;
};


/** @inheritDoc */
anychart.chartEditorModule.MultiplePanelsBase.prototype.exitDocument = function() {
  this.removeAllPanels();
  anychart.chartEditorModule.MultiplePanelsBase.base(this, 'exitDocument');
};


/** @override */
anychart.chartEditorModule.MultiplePanelsBase.prototype.disposeInternal = function() {
  this.removeAllPanels();
  anychart.chartEditorModule.MultiplePanelsBase.base(this, 'disposeInternal');
};
