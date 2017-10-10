goog.provide('anychart.chartEditor2Module.controls.select.ColorScaleType');
goog.provide('anychart.chartEditor2Module.controls.select.ColorScaleTypeDataFieldSelect');

goog.require('anychart.chartEditor2Module.controls.select.DataField');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');



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
 * @extends {anychart.chartEditor2Module.controls.select.DataField}
 */
anychart.chartEditor2Module.controls.select.ColorScaleType = function(opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditor2Module.controls.select.ColorScaleType.base(this, 'constructor',opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass);

  this.setSelect(new anychart.chartEditor2Module.controls.select.ColorScaleTypeDataFieldSelect(
      opt_model,
      opt_menu,
      opt_renderer,
      opt_domHelper,
      opt_menuRenderer,
      opt_menuAdditionalClass
  ));
};
goog.inherits(anychart.chartEditor2Module.controls.select.ColorScaleType, anychart.chartEditor2Module.controls.select.DataField);


/**
 * @param {Object=} opt_model
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @param {string=} opt_menuAdditionalClass
 * @constructor
 * @extends {anychart.chartEditor2Module.controls.select.DataFieldSelect}
 */
anychart.chartEditor2Module.controls.select.ColorScaleTypeDataFieldSelect = function (opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditor2Module.controls.select.ColorScaleTypeDataFieldSelect.base(this, 'constructor',
      opt_model,
      opt_menu,
      opt_renderer,
      opt_domHelper,
      opt_menuRenderer,
      opt_menuAdditionalClass);
};
goog.inherits(anychart.chartEditor2Module.controls.select.ColorScaleTypeDataFieldSelect, anychart.chartEditor2Module.controls.select.DataFieldSelect);


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.ColorScaleTypeDataFieldSelect.prototype.handleSelectionChange = function(evt) {
  if (this.isExcluded()) return;

  if (!this.noDispatch && this.editorModel)
    this.editorModel.dropChartSettings('colorScale()');

  anychart.chartEditor2Module.controls.select.ColorScaleTypeDataFieldSelect.base(this, 'handleSelectionChange', evt);
};
