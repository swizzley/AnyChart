goog.provide('anychart.chartEditorModule.SpecificPanel');

goog.require('anychart.chartEditorModule.SettingsPanel');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.SpecificPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.SpecificPanel.base(this, 'constructor', model, opt_domHelper);

  this.actualize();
};
goog.inherits(anychart.chartEditorModule.SpecificPanel, anychart.chartEditorModule.SettingsPanel);


anychart.chartEditorModule.SpecificPanel.prototype.actualize = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var currentChartType = model.getModel()['chart']['type'];
  if (currentChartType != this.chartType_) {
    this.chartType_ = currentChartType;

    // Check for exclusion
    switch (this.chartType_) {
      case 'waterfall':
      case 'bar':
        this.exclude(false);
        break;
      default:
        this.exclude(true);
    }

    if (!this.isExcluded()) {
      // Update name
      var chartName = anychart.chartEditorModule.EditorModel.ChartTypes[this.chartType_]['name'];
      this.name = chartName + ' Settings';

      if (this.topEl) {
        // Update title
        var titleEl = this.getDomHelper().getElementByClass('title', this.topEl);
        this.getDomHelper().setTextContent(titleEl, this.name);
      }
    }
  }
};


/** @inheritDoc */
anychart.chartEditorModule.SpecificPanel.prototype.createDom = function() {
  anychart.chartEditorModule.SpecificPanel.base(this, 'createDom');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
};


/** @inheritDoc */
anychart.chartEditorModule.SpecificPanel.prototype.enterDocument = function() {
  this.actualize();

  anychart.chartEditorModule.SpecificPanel.base(this, 'enterDocument');
};


/** @inheritDoc */
anychart.chartEditorModule.SpecificPanel.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.SpecificPanel.base(this, 'onChartDraw', evt);
  // if (evt.rebuild) {
  //   if (this.themeSelect) this.themeSelect.getSelect().setValueByTarget(goog.dom.getWindow()['anychart']);
  //   if (this.paletteSelect) this.paletteSelect.getSelect().setValueByTarget(evt.chart);
  // }
};


/** @override */
anychart.chartEditorModule.SpecificPanel.prototype.disposeInternal = function() {
  anychart.chartEditorModule.SpecificPanel.base(this, 'disposeInternal');
};
