goog.provide('anychart.chartEditor2Module.select.ColorScaleType');

goog.require('anychart.chartEditor2Module.select.Base');



/**
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
 * @constructor
 * @extends {anychart.chartEditor2Module.select.Base}
 */
anychart.chartEditor2Module.select.ColorScaleType = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  anychart.chartEditor2Module.select.ColorScaleType.base(this, 'constructor', opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer);


  /**
   * Scale instance.
   * @type {?(anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear)}
   * @private
   */
  this.scale_ = null;
};
goog.inherits(anychart.chartEditor2Module.select.ColorScaleType, anychart.chartEditor2Module.select.Base);


/**
 * @param {goog.events.Event} evt
 * @protected
 */
anychart.chartEditor2Module.select.ColorScaleType.prototype.onChange = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  if (!this.suspendDispatch && this.editorModel && goog.isDefAndNotNull(this.getValue())) {
    if (this.callback)
      this.editorModel.callbackByString(this.callback, this);
    else
      this.editorModel.setValue(this.key, this.getValue(), false, this.noRebuild);
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.select.ColorScaleType.prototype.setValueByTarget = function(target) {
  if (!this.key || !this.key.length) {
    console.warn("Control with no key!");
    return;
  }

  this.target = target;
  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  this.scale_ = /** @type {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear} */(anychart.bindingModule.exec(this.target, stringKey));
  if (this.scale_) {
    var value = this.scale_.getType();
    this.suspendDispatch = true;
    this.setValue(value);
    this.suspendDispatch = false;
  }
};
