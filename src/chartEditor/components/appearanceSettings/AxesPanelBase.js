goog.provide('anychart.chartEditorModule.AxesPanelBase');

goog.require('anychart.chartEditorModule.MultiplePanelsBase');
goog.require('anychart.chartEditorModule.settings.Axis');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.MultiplePanelsBase}
 */
anychart.chartEditorModule.AxesPanelBase = function(model, opt_domHelper) {
  anychart.chartEditorModule.AxesPanelBase.base(this, 'constructor', model, 'AxesPanelBase', opt_domHelper);

  this.stringId = 'axes';

  /**
   * Axis prefix. Should be overridden.
   * @type {string}
   * @protected
   */
  this.xOrY = '';

  this.setButtonLabel('+ Add axis');

  this.addClassName(goog.getCssName('anychart-settings-panel-axes'));
};
goog.inherits(anychart.chartEditorModule.AxesPanelBase, anychart.chartEditorModule.MultiplePanelsBase);


/** @inheritDoc */
anychart.chartEditorModule.AxesPanelBase.prototype.enterDocument = function() {
  anychart.chartEditorModule.AxesPanelBase.base(this, 'enterDocument');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var chartType = model.getModel()['chart']['type'];

  this.allowAddPanels(chartType !== 'radar' && chartType !== 'polar');
};


/** @override */
anychart.chartEditorModule.AxesPanelBase.prototype.onAddPanel = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var axisIndex = model.addAxis(this.xOrY);
  this.addPanel(axisIndex);
};


/** @override */
anychart.chartEditorModule.AxesPanelBase.prototype.onRemovePanel = function(evt) {
  var axisIndex = anychart.chartEditorModule.AxesPanelBase.base(this, 'onRemovePanel', evt);
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  model.dropAxis(axisIndex, this.xOrY);
  return axisIndex;
};


/** @override */
anychart.chartEditorModule.AxesPanelBase.prototype.createPanels = function() {
  if (this.isExcluded()) return;
  // Always create 0 axis panel
  this.addPanel(0);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var chartType = model.getModel()['chart']['type'];

  if (chartType !== 'radar' && chartType !== 'polar') {
    var settings = model.getModel()['chart']['settings'];

    var pattern = '^' + this.xOrY + 'Axis\\((\\d+)\\)\\.enabled\\(\\)$';
    var regExp = new RegExp(pattern);

    for (var key in settings) {
      var match = key.match(regExp);
      if (match) {
        var axisIndex = Number(match[1]);
        if (axisIndex > 0)
          this.addPanel(axisIndex);
      }
    }
  }
};


/**
 * @param {number} axisIndex
 */
anychart.chartEditorModule.AxesPanelBase.prototype.addPanel = function(axisIndex) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var axis = new anychart.chartEditorModule.settings.Axis(model, this.xOrY, axisIndex);
  axis.allowEnabled(true);
  this.addPanelInstance(axis, true, 1);
};
