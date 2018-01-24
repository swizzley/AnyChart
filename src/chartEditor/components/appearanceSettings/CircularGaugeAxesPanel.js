goog.provide('anychart.chartEditorModule.CircularGaugeAxesPanel');

goog.require('anychart.chartEditorModule.MultiplePanelsBase');
goog.require('anychart.chartEditorModule.settings.CircularGaugeAxis');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.MultiplePanelsBase}
 */
anychart.chartEditorModule.CircularGaugeAxesPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.CircularGaugeAxesPanel.base(this, 'constructor', model, 'Axes', opt_domHelper);

  this.stringId = 'circularGaugeAxes';

  this.addClassName(goog.getCssName('anychart-settings-panel-gauge-axes'));

  this.setButtonLabel('+ Add axis');
};
goog.inherits(anychart.chartEditorModule.CircularGaugeAxesPanel, anychart.chartEditorModule.MultiplePanelsBase);


/** @override */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.onAddPanel = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var axisIndex = model.addAxis();
  this.addPanel(axisIndex);
};


/** @override */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.onRemovePanel = function(evt) {
  var panelIndex = anychart.chartEditorModule.CircularGaugeAxesPanel.base(this, 'onRemovePanel', evt);
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  model.dropAxis(panelIndex);
  return panelIndex;
};


/** @override */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.addPanel = function(panelIndex) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var axis = new anychart.chartEditorModule.settings.CircularGaugeAxis(model, panelIndex);
  axis.allowEnabled(true);
  this.addPanelInstance(axis, true, 1);
};


/** @override */
anychart.chartEditorModule.CircularGaugeAxesPanel.prototype.createPanels = function() {
  if (!this.isExcluded()) {
    // Always create 0 axis panel
    this.addPanel(0);

    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    var settings = model.getModel()['chart']['settings'];

    var pattern = '^' + 'axis\\((\\d+)\\)\\.enabled\\(\\)$';
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
