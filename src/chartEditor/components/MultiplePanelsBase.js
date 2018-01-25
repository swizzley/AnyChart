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

  this.addClassName(goog.getCssName('anychart-chart-editor-settings-panel-multiple'));
};
goog.inherits(anychart.chartEditorModule.MultiplePanelsBase, anychart.chartEditorModule.SettingsPanel);


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.allowAddPanels_ = true;


/** @param {boolean} value */
anychart.chartEditorModule.MultiplePanelsBase.prototype.allowAddPanels = function(value) {
  this.allowAddPanels_ = value;

  if (this.addPanelBtn_)
    goog.style.setElementShown(this.addPanelBtn_.getElement(), this.allowAddPanels_);
};


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

  if (this.allowAddPanels_) {
    var addPanelBtnRenderer = /** @type {goog.ui.ButtonRenderer} */(goog.ui.ControlRenderer.getCustomRenderer(
        goog.ui.ButtonRenderer,
        'anychart-axes-panel-add-axis-btn'));

    this.addPanelBtn_ = new goog.ui.Button(this.buttonLabel_, addPanelBtnRenderer);
    this.addChild(this.addPanelBtn_, true);
  }
};


/** @inheritDoc */
anychart.chartEditorModule.MultiplePanelsBase.prototype.enterDocument = function() {
  anychart.chartEditorModule.MultiplePanelsBase.base(this, 'enterDocument');

  if (this.allowAddPanels_ && this.addPanelBtn_) {
    goog.style.setElementShown(this.addPanelBtn_.getElement(), true);
    this.getHandler().listen(this.addPanelBtn_, goog.ui.Component.EventType.ACTION, this.onAddPanel);
  }

  this.createPanels();
  if (this.panels_.length === 1 && this.panels_[0].length === 1 && goog.isFunction(this.panels_[0][0].expand))
    this.panels_[0][0].expand();
};


/**
 * @param {number} panelIndex
 * @protected
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.addPanel = function(panelIndex) {
  // Should be overridden

  // Create panel and configure instance
  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  // var axis = new anychart.chartEditorModule.settings.CircularGaugeAxis(model, panelIndex);
  // axis.allowEnabled(true);

  // Add instance to panels list
  // this.addPanelInstance(axis, true, 1);
};


/**
 * @param {anychart.chartEditorModule.SettingsPanelIndexed} panelInstance
 * @param {boolean=} opt_allowRemove Should be panels removable or not
 * @param {number=} opt_removeFromIndex
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.addPanelInstance = function(panelInstance, opt_allowRemove, opt_removeFromIndex) {
  var panelIndex = panelInstance.getIndex();
  var panelPlotIndex = panelInstance.getPlotIndex();

  if (opt_allowRemove && (!goog.isDef(opt_removeFromIndex) || panelIndex >= opt_removeFromIndex)) {
    panelInstance.allowRemove(true);
    this.getHandler().listen(panelInstance, anychart.chartEditorModule.events.EventType.PANEL_CLOSE, this.onRemovePanel);
  }

  if (this.panels_.length <= panelPlotIndex)
    this.panels_.push([]);

  if (this.panels_[panelPlotIndex].length > panelIndex)
    this.panels_[panelPlotIndex][panelIndex] = panelInstance;
  else
    this.panels_[panelPlotIndex].push(panelInstance);

  panelInstance.addClassName(goog.getCssName('anychart-chart-editor-settings-panel-single'));
  this.panelsContainer_.addChild(panelInstance, true);
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
  var panelInstance = /** @type {anychart.chartEditorModule.SettingsPanelIndexed} */(evt.currentTarget);
  var panelIndex = panelInstance.getIndex();
  var panelPlotIndex = panelInstance.getPlotIndex();

  goog.dispose(this.panels_[panelPlotIndex][panelIndex]);
  this.panels_[panelPlotIndex][panelIndex] = null;

  // Should do something like this
  //
  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  // model.dropAxis(axisIndex);

  // For now we are not thinking about plots. Forget it, bro...
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
 * Removes all panels elements from panel.
 * @private
 */
anychart.chartEditorModule.MultiplePanelsBase.prototype.removeAllPanels = function() {
  for (var i = 0; i < this.panels_.length; i++) {
    for (var j = 0; j < this.panels_[i].length; j++) {
      if (this.panels_[i][j]) {
        this.panelsContainer_.removeChild(this.panels_[i][j], true);
        goog.dispose(this.panels_[i][j]);
      }
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
