goog.provide('anychart.chartEditorModule.controls.select.ChartTypeMenuRenderer');
goog.provide('anychart.chartEditorModule.select.ChartType');

goog.require('anychart.chartEditorModule.controls.Menu');
goog.require('anychart.chartEditorModule.controls.MenuRenderer');
goog.require('anychart.chartEditorModule.controls.select.MenuItemWithIcon');
goog.require('anychart.chartEditorModule.controls.select.SelectWithIcon');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuRenderer');



/**
 * Select for chart type.
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
 * @param {string=} opt_menuAdditionalClass
 * @constructor
 * @extends {anychart.chartEditorModule.controls.select.SelectWithIcon}
 */
anychart.chartEditorModule.select.ChartType = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditorModule.select.ChartType.base(this, 'constructor', opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer);

  /**
   * @type {Array}
   * @private
   */
  this.extendedOptions_ = [];

  /**
   * @type {goog.ui.MenuRenderer}
   * @private
   */
  this.cMenuRenderer_ = opt_menuRenderer || anychart.chartEditorModule.controls.select.ChartTypeMenuRenderer.getInstance();

  /**
   * @type {(goog.ui.Menu|undefined)}
   * @private
   */
  this.cMenu_ = opt_menu;

  /**
   * @type {string}
   */
  this.menuAdditionalClass = opt_menuAdditionalClass || '';
};
goog.inherits(anychart.chartEditorModule.select.ChartType, anychart.chartEditorModule.controls.select.SelectWithIcon);


/** @inheritDoc */
anychart.chartEditorModule.select.ChartType.prototype.createDom = function() {
  anychart.chartEditorModule.select.ChartType.base(this, 'createDom');

  for (var i = 0; i < this.extendedOptions_.length; i++) {
    var item = new anychart.chartEditorModule.controls.select.MenuItemWithIcon({
      caption: this.extendedOptions_[i]['name'],
      value: this.extendedOptions_[i]['value'],
      stackMode: this.extendedOptions_[i]['stackMode'],
      icon: 'http://www.anychart.com/_design/img/upload/charts/types/' + this.extendedOptions_[i]['icon']
    });
    this.addItem(item);
  }

  this.addClassName('anychart-select-chart-type');
};


/**
 * Init select by array of options as Objects as they stored in anychart.chartEditorModule.EditorModel.ChartTypes.
 * @param {Array.<Object>} options
 */
anychart.chartEditorModule.select.ChartType.prototype.initOptions = function(options) {
  this.extendedOptions_ = options;
};


/** @inheritDoc */
anychart.chartEditorModule.select.ChartType.prototype.getMenu = function() {
  if (!this.cMenu_) {
    this.cMenu_ = new anychart.chartEditorModule.controls.Menu(
        this.menuAdditionalClass,
        this.getDomHelper(),
        this.cMenuRenderer_
    );
    this.setMenu(this.cMenu_);
  }
  return this.cMenu_ || null;
};


// region ---- ChartTypeMenuRenderer
/**
 * @constructor
 * @extends {anychart.chartEditorModule.controls.MenuRenderer}
 */
anychart.chartEditorModule.controls.select.ChartTypeMenuRenderer = function() {
  anychart.chartEditorModule.controls.select.ChartTypeMenuRenderer.base(this, 'constructor');
};
goog.inherits(anychart.chartEditorModule.controls.select.ChartTypeMenuRenderer, anychart.chartEditorModule.controls.MenuRenderer);
goog.addSingletonGetter(anychart.chartEditorModule.controls.select.ChartTypeMenuRenderer);


/** @inheritDoc */
anychart.chartEditorModule.controls.select.ChartTypeMenuRenderer.prototype.getCssClass = function() {
  return 'anychart-select-chart-type-menu';
};
// endregion
