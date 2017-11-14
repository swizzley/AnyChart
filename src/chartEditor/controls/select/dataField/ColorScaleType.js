goog.provide('anychart.chartEditorModule.controls.select.ColorScaleType');
goog.provide('anychart.chartEditorModule.controls.select.ColorScaleTypeDataFieldSelect');

goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.controls.select.DataFieldSelect');



/**
 * DataField component for palettes property.
 *
 * @param {Object=} opt_model
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @param {string=} opt_menuAdditionalClass
 *
 * @constructor
 * @extends {anychart.chartEditorModule.controls.select.DataField}
 */
anychart.chartEditorModule.controls.select.ColorScaleType = function(opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditorModule.controls.select.ColorScaleType.base(this, 'constructor',opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass);

  this.setSelect(new anychart.chartEditorModule.controls.select.ColorScaleTypeDataFieldSelect(
      opt_model,
      opt_menu,
      opt_renderer,
      opt_domHelper,
      opt_menuRenderer,
      opt_menuAdditionalClass
  ));
};
goog.inherits(anychart.chartEditorModule.controls.select.ColorScaleType, anychart.chartEditorModule.controls.select.DataField);


/**
 * @param {Object=} opt_model
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @param {string=} opt_menuAdditionalClass
 * @constructor
 * @extends {anychart.chartEditorModule.controls.select.DataFieldSelect}
 */
anychart.chartEditorModule.controls.select.ColorScaleTypeDataFieldSelect = function (opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditorModule.controls.select.ColorScaleTypeDataFieldSelect.base(this, 'constructor',
      opt_model,
      opt_menu,
      opt_renderer,
      opt_domHelper,
      opt_menuRenderer,
      opt_menuAdditionalClass);
};
goog.inherits(anychart.chartEditorModule.controls.select.ColorScaleTypeDataFieldSelect, anychart.chartEditorModule.controls.select.DataFieldSelect);


/** @inheritDoc */
anychart.chartEditorModule.controls.select.ColorScaleTypeDataFieldSelect.prototype.handleSelectionChange = function(evt) {
  if (this.isExcluded()) return;

  if (!this.noDispatch && this.editorModel)
    this.editorModel.dropChartSettings('colorScale()');

  anychart.chartEditorModule.controls.select.ColorScaleTypeDataFieldSelect.base(this, 'handleSelectionChange', evt);
};
