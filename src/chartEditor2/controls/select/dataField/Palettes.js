goog.provide('anychart.chartEditor2Module.controls.select.Palettes');
goog.provide('anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect');

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
anychart.chartEditor2Module.controls.select.Palettes = function(opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditor2Module.controls.select.Palettes.base(this, 'constructor',opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass);

  this.setSelect(new anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect(
      opt_model,
      opt_menu,
      opt_renderer,
      opt_domHelper,
      opt_menuRenderer,
      opt_menuAdditionalClass
  ));
};
goog.inherits(anychart.chartEditor2Module.controls.select.Palettes, anychart.chartEditor2Module.controls.select.DataField);


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
anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect = function (opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect.base(this, 'constructor',
      opt_model,
      opt_menu,
      opt_renderer,
      opt_domHelper,
      opt_menuRenderer,
      opt_menuAdditionalClass);
};
goog.inherits(anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect, anychart.chartEditor2Module.controls.select.DataFieldSelect);


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect.prototype.handleSelectionChange = function(evt) {
  if (this.excluded) return;

  if (!this.noDispatch && this.editorModel)
    this.editorModel.dropChartSettings(/getSeries\('\w+'\)\.color\(\)/);

  anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect.base(this, 'handleSelectionChange', evt);
};


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.PalettesDataFieldSelect.prototype.setValueByTarget = function(target) {
  if (this.excluded) return;

  this.target = target;
  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.getKey());
  var value = anychart.bindingModule.exec(this.target, stringKey);

  if (value) {
    var realPalettes = goog.dom.getWindow()['anychart']['palettes'];
    var stringValue = '';
    for (var paletteName in realPalettes) {
      if (realPalettes.hasOwnProperty(paletteName) &&
          goog.isArray(realPalettes[paletteName]) &&
          goog.array.equals(value['items'](), realPalettes[paletteName])) {
        stringValue = paletteName;
        break;
      }
    }

    this.noDispatch = true;
    this.setValue(stringValue);
    this.noDispatch = false;
  }
};
