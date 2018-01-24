goog.provide('anychart.chartEditorModule.CircularRangesPanel');

goog.require('anychart.chartEditorModule.MultiplePanelsBase');
goog.require('anychart.chartEditorModule.settings.CircularRange');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.MultiplePanelsBase}
 */
anychart.chartEditorModule.CircularRangesPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.CircularRangesPanel.base(this, 'constructor', model, 'Ranges', opt_domHelper);

  this.stringId = 'CircularRanges';

  this.addClassName(goog.getCssName('anychart-settings-panel-gauge-ranges'));

  this.setButtonLabel('+ Add range');
};
goog.inherits(anychart.chartEditorModule.CircularRangesPanel, anychart.chartEditorModule.MultiplePanelsBase);


/** @override */
anychart.chartEditorModule.CircularRangesPanel.prototype.onAddPanel = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var rangeIndex = model.addCircularRange();
  this.addPanel(rangeIndex);
};


/** @override */
anychart.chartEditorModule.CircularRangesPanel.prototype.onRemovePanel = function(evt) {
  var panelIndex = anychart.chartEditorModule.CircularRangesPanel.base(this, 'onRemovePanel', evt);
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  model.dropCircularRange(panelIndex);
  return panelIndex;
};


/** @override */
anychart.chartEditorModule.CircularRangesPanel.prototype.addPanel = function(panelIndex) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var range = new anychart.chartEditorModule.settings.CircularRange(model, panelIndex);
  range.allowEnabled(true);
  this.addPanelInstance(range, true);
};


/** @override */
anychart.chartEditorModule.CircularRangesPanel.prototype.createPanels = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    var settings = model.getModel()['chart']['settings'];

    var pattern = '^' + 'range\\((\\d+)\\)\\.enabled\\(\\)$';
    var regExp = new RegExp(pattern);

    for (var key in settings) {
      var match = key.match(regExp);
      if (match) {
        var rangeIndex = Number(match[1]);
        if (rangeIndex > 0)
          this.addPanel(rangeIndex);
      }
    }
  }
};
