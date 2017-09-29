goog.provide('anychart.chartEditor2Module.select.ChartType');

goog.require('anychart.chartEditor2.controls.select.MenuItemWithIcon');
goog.require('anychart.chartEditor2.controls.select.SelectWithIcon');



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
 *
 * @constructor
 * @extends {anychart.chartEditor2.controls.select.SelectWithIcon}
 */
anychart.chartEditor2Module.select.ChartType = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  anychart.chartEditor2Module.select.ChartType.base(this, 'constructor', opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer);

  /**
   * @type {Array}
   * @private
   */
  this.extendedOptions_ = [];
};
goog.inherits(anychart.chartEditor2Module.select.ChartType, anychart.chartEditor2.controls.select.SelectWithIcon);


/** @inheritDoc */
anychart.chartEditor2Module.select.ChartType.prototype.createDom = function() {
  anychart.chartEditor2Module.select.ChartType.base(this, 'createDom');

  var options = [];
  for(var i = 0; i < this.extendedOptions_.length; i++) {
    options.push([this.extendedOptions_[i]['name'], this.extendedOptions_[i]['value']]);
    var item = new anychart.chartEditor2.controls.select.MenuItemWithIcon({
      caption: this.extendedOptions_[i]['name'],
      value:this.extendedOptions_[i]['value'],
      stackMode: this.extendedOptions_[i]['stackMode'],
      icon: 'http://www.anychart.com/_design/img/upload/charts/types/' + this.extendedOptions_[i]['icon']
    });
    this.addItem(item);
  }
  this.setOptions(options);

  this.addClassName('type-select');
};


/**
 * Init select by array of options as Objects as they stored in anychart.chartEditor2Module.EditorModel.chartTypes.
 * @param {Array.<Object>} options
 */
anychart.chartEditor2Module.select.ChartType.prototype.initOptions = function(options) {
  this.extendedOptions_ = options;
};
