goog.provide('anychart.chartEditor2Module.select.Palettes');

goog.require('anychart.chartEditor2Module.select.Base');



/**
 * Select input for palettes property.
 *
 * @param {goog.ui.ControlContent=} opt_caption Default caption or existing DOM
 *     structure to display as the button's caption when nothing is selected.
 *     Defaults to no caption.
 * @param {goog.ui.Menu=} opt_menu Menu containing selection options.
 * @param {goog.ui.ButtonRenderer=} opt_renderer Renderer used to render or
 *     decorate the control; defaults to {@link goog.ui.MenuButtonRenderer}.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper, used for
 *     document interaction.
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer Renderer used to render or
 *     decorate the menu; defaults to {@link goog.ui.MenuRenderer}.
 *
 * @constructor
 * @extends {anychart.chartEditor2Module.select.Base}
 */
anychart.chartEditor2Module.select.Palettes = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  anychart.chartEditor2Module.select.Palettes.base(this, 'constructor', opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer);
};
goog.inherits(anychart.chartEditor2Module.select.Palettes, anychart.chartEditor2Module.select.Base);


/** @inheritDoc */
anychart.chartEditor2Module.select.Palettes.prototype.onChange = function(evt) {
  if (!this.noDispatch)
    this.editorModel.dropChartSettings(/getSeries\('\w+'\)\.color\(\)/);

  anychart.chartEditor2Module.select.Palettes.base(this, 'onChange', evt);
};


/** @inheritDoc */
anychart.chartEditor2Module.select.Palettes.prototype.setValueByTarget = function(target) {
  this.target = target;

  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
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
