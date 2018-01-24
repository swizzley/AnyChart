goog.provide('anychart.chartEditorModule.PointersPanel');

goog.require('anychart.chartEditorModule.MultiplePanelsBase');
goog.require('anychart.chartEditorModule.settings.pointers.Bar');
goog.require('anychart.chartEditorModule.settings.pointers.Base');
goog.require('anychart.chartEditorModule.settings.pointers.Knob');
goog.require('anychart.chartEditorModule.settings.pointers.Marker');
goog.require('anychart.chartEditorModule.settings.pointers.Needle');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.MultiplePanelsBase}
 */
anychart.chartEditorModule.PointersPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.PointersPanel.base(this, 'constructor', model, 'Pointers', opt_domHelper);

  this.stringId = 'pointers';

  this.allowAddPanels(false);
};
goog.inherits(anychart.chartEditorModule.PointersPanel, anychart.chartEditorModule.MultiplePanelsBase);


/** @override */
anychart.chartEditorModule.PointersPanel.prototype.createPanels = function() {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var mappings = model.getValue([['dataSettings'], 'mappings']);
  var id;
  var type;
  var pointer;

  for (var j = 0; j < mappings[0].length; j++) {
    id = mappings[0][j]['id'] ? mappings[0][j]['id'] : j;
    type = mappings[0][j]['ctor'];
    switch (type) {
      case 'gauges.bar':
        pointer = new anychart.chartEditorModule.settings.pointers.Bar(model, type, id, j);
        break;
      case 'gauges.marker':
        pointer = new anychart.chartEditorModule.settings.pointers.Marker(model, type, id, j);
        break;
      case 'needle':
        pointer = new anychart.chartEditorModule.settings.pointers.Needle(model, type, id, j);
        break;
      case 'knob':
        pointer = new anychart.chartEditorModule.settings.pointers.Knob(model, type, id, j);
        break;
      default:
        pointer = new anychart.chartEditorModule.settings.pointers.Base(model, type, id, j);
        break;
    }

    this.addPanelInstance(pointer);
  }
};
