goog.provide('anychart.chartEditor2Module.AxesPanelBase');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.Axis');
goog.require('goog.ui.Button');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.AxesPanelBase = function(model, opt_domHelper) {
  anychart.chartEditor2Module.AxesPanelBase.base(this, 'constructor', model, opt_domHelper);

  this.name = 'AxesPanelBase';

  this.stringId = 'axes';

  this.axes_ = [];

  /**
   * Axis prefix. Should be overriden.
   * @type {string}
   * @protected
   */
  this.xOrY = '';
};
goog.inherits(anychart.chartEditor2Module.AxesPanelBase, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.AxesPanelBase.prototype.createDom = function() {
  anychart.chartEditor2Module.AxesPanelBase.base(this, 'createDom');
  var element = /** @type {Element} */(this.getElement());
  var content = /** @type {Element} */(this.getContentElement());
  var dom = this.getDomHelper();
  goog.dom.classlist.add(element, 'settings-panel-axes');

  this.axisContainer_ = dom.createDom(goog.dom.TagName.DIV, null);
  content.appendChild(this.axisContainer_);

  this.addAxisBtn_ = new goog.ui.Button('Add axis');
  this.addChild(this.addAxisBtn_, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.AxesPanelBase.prototype.enterDocument = function() {
  anychart.chartEditor2Module.AxesPanelBase.base(this, 'enterDocument');
  this.getHandler().listen(this.addAxisBtn_, goog.ui.Component.EventType.ACTION, this.onAddAxis_);
  this.createAxes();
};


/** @private */
anychart.chartEditor2Module.AxesPanelBase.prototype.onAddAxis_ = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var axisIndex = model.addAxis(this.xOrY);
  this.addAxis(axisIndex);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.AxesPanelBase.prototype.onRemoveAxis_ = function(evt) {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var axisIndex = (/** @type {anychart.chartEditor2Module.settings.Axis} */(evt.currentTarget)).getIndex();
  goog.dispose(this.axes_[axisIndex]);
  this.axes_[axisIndex] = null;
  model.dropAxis(this.xOrY, axisIndex);
};


/**
 * Create Axes settings panels.
 */
anychart.chartEditor2Module.AxesPanelBase.prototype.createAxes = function() {
  if (this.isExcluded()) return;

  // Always create 0 axis panel
  this.addAxis(0);

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var settings = model.getModel()['chart']['settings'];

  var pattern = '^' + this.xOrY + 'Axis\\((\\d+)\\)\\.enabled\\(\\)$';
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
anychart.chartEditor2Module.AxesPanelBase.prototype.addAxis = function(axisIndex) {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var axis = new anychart.chartEditor2Module.settings.Axis(model, this.xOrY, axisIndex);
  axis.allowEnabled(true);
  if (axisIndex > 0) {
    axis.allowRemove(true);
    this.getHandler().listen(axis, anychart.chartEditor2Module.events.EventType.PANEL_CLOSE, this.onRemoveAxis_);
  }
  this.axes_.push(axis);
  this.addChild(axis, true);
  this.axisContainer_.appendChild(axis.getElement());
};


/**
 * Removes all Axes panels elements from panel.
 * @private
 */
anychart.chartEditor2Module.AxesPanelBase.prototype.removeAllAxes = function() {
  for (var i = 0; i < this.axes_.length; i++) {
    if (this.axes_[i]) {
      this.removeChild(this.axes_[i], true);
      goog.dispose(this.axes_[i]);
    }
  }
  this.axes_.length = 0;
};


/** @inheritDoc */
anychart.chartEditor2Module.AxesPanelBase.prototype.exitDocument = function() {
  this.removeAllAxes();
  anychart.chartEditor2Module.AxesPanelBase.base(this, 'exitDocument');
};


/** @override */
anychart.chartEditor2Module.AxesPanelBase.prototype.disposeInternal = function() {
  this.removeAllAxes();
  anychart.chartEditor2Module.AxesPanelBase.base(this, 'disposeInternal');
};
