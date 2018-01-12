goog.provide('anychart.chartEditorModule.CircularGaugeAxesPanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.CircularGaugeAxis');
goog.require('goog.ui.Button');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.CircularGaugeAxesPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.CircularGaugeAxesPanel.base(this, 'constructor', model, 'Axes', opt_domHelper);

  this.stringId = 'circularGaugeAxes';

  this.axes_ = [];
};
goog.inherits(anychart.chartEditorModule.CircularGaugeAxesPanel, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.CircularGaugeAxesPanel.CSS_CLASS = goog.getCssName('anychart-settings-panel-axes');


/** @inheritDoc */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.createDom = function() {
  anychart.chartEditorModule.CircularGaugeAxesPanel.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.CircularGaugeAxesPanel.CSS_CLASS);

  var content = /** @type {Element} */(this.getContentElement());
  var dom = this.getDomHelper();

  this.axisContainer_ = dom.createDom(goog.dom.TagName.DIV, null);
  content.appendChild(this.axisContainer_);

  var addAxisBtnRenderer = /** @type {goog.ui.ButtonRenderer} */(goog.ui.ControlRenderer.getCustomRenderer(
      goog.ui.ButtonRenderer,
      'anychart-axes-panel-add-axis-btn'));
  this.addAxisBtn_ = new goog.ui.Button('+ Add axis', addAxisBtnRenderer);
  this.addChild(this.addAxisBtn_, true);
};


/** @inheritDoc */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.enterDocument = function() {
  anychart.chartEditorModule.CircularGaugeAxesPanel.base(this, 'enterDocument');

  goog.style.setElementShown(this.addAxisBtn_.getElement(), true);
  this.getHandler().listen(this.addAxisBtn_, goog.ui.Component.EventType.ACTION, this.onAddAxis_);

  this.createAxes();
};


/** @private */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.onAddAxis_ = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var axisIndex = model.addAxis();
  this.addAxis(axisIndex);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.onRemoveAxis_ = function(evt) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var axisIndex = (/** @type {anychart.chartEditorModule.settings.CircularGaugeAxis} */(evt.currentTarget)).getIndex();
  goog.dispose(this.axes_[axisIndex]);
  this.axes_[axisIndex] = null;

  model.dropAxis(axisIndex);
};


/**
 * Create Axes settings panels.
 */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.createAxes = function() {
  if (this.isExcluded()) return;

  // Always create 0 axis panel
  this.addAxis(0);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var settings = model.getModel()['chart']['settings'];

  var pattern = '^' + 'axis\\((\\d+)\\)\\.enabled\\(\\)$';
  var regExp = new RegExp(pattern);

  for (var key in settings) {
    var match = key.match(regExp);
    if (match) {
      var axisIndex = Number(match[1]);
      if (axisIndex > 0)
        this.addAxis(axisIndex);
    }
  }
};


/**
 * @param {number} axisIndex
 */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.addAxis = function(axisIndex) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var axis = new anychart.chartEditorModule.settings.CircularGaugeAxis(model, axisIndex);
  axis.allowEnabled(true);
  if (axisIndex > 0) {
    axis.allowRemove(true);
    this.getHandler().listen(axis, anychart.chartEditorModule.events.EventType.PANEL_CLOSE, this.onRemoveAxis_);
  }
  if (this.axes_.length > axisIndex)
    this.axes_[axisIndex] = axis;
  else
    this.axes_.push(axis);

  this.addChild(axis, true);
  this.axisContainer_.appendChild(axis.getElement());
};


/**
 * Removes all Axes panels elements from panel.
 * @private
 */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.removeAllAxes = function() {
  for (var i = 0; i < this.axes_.length; i++) {
    if (this.axes_[i]) {
      this.removeChild(this.axes_[i], true);
      goog.dispose(this.axes_[i]);
    }
  }
  this.axes_.length = 0;
};


/** @inheritDoc */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.exitDocument = function() {
  this.removeAllAxes();
  anychart.chartEditorModule.CircularGaugeAxesPanel.base(this, 'exitDocument');
};


/** @override */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.disposeInternal = function() {
  this.removeAllAxes();
  anychart.chartEditorModule.CircularGaugeAxesPanel.base(this, 'disposeInternal');
};
