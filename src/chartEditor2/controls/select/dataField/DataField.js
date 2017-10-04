goog.provide('anychart.chartEditor2Module.controls.select.DataField');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.ui.Component');


/**
 * @param {anychart.chartEditor2Module.controls.select.DataFieldModel=} opt_model
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @param {string=} opt_menuAdditionalClass
 * @constructor
 * @extends {anychart.ui.Component}
 */
anychart.chartEditor2Module.controls.select.DataField = function(opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
  anychart.chartEditor2Module.controls.select.DataField.base(this, 'constructor');

  /**
   * @type {anychart.chartEditor2Module.controls.select.DataFieldSelect}
   * @private
   */
  this.select_ = new anychart.chartEditor2Module.controls.select.DataFieldSelect(
      opt_model,
      opt_menu,
      opt_renderer,
      opt_domHelper,
      opt_menuRenderer,
      opt_menuAdditionalClass
  );
  this.addClassName('anychart-select-data-field');
  this.setModel(opt_model);
};
goog.inherits(anychart.chartEditor2Module.controls.select.DataField, anychart.ui.Component);


/**
 * @typedef {{
 *  caption: string,
 *  label: string
 * }}
 */
anychart.chartEditor2Module.controls.select.DataFieldModel;


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.DataField.prototype.createDom = function() {
  anychart.chartEditor2Module.controls.select.DataField.base(this, 'createDom');

  var model = /** @type {anychart.chartEditor2Module.controls.select.DataFieldModel} */(this.getModel());
  var element = this.getElement();

  var label = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-select-data-field-label', model.label);
  goog.dom.appendChild(element, label);

  this.addChild(this.select_, true);

  var clear = new anychart.ui.Component();
  clear.addClassName('anychart-clear');
  this.addChild(clear, true);
};


/** @return {!anychart.chartEditor2Module.controls.select.DataFieldSelect} */
anychart.chartEditor2Module.controls.select.DataField.prototype.getSelect = function() {
  return /** @type {!anychart.chartEditor2Module.controls.select.DataFieldSelect} */(this.select_);
};


/** @param {anychart.chartEditor2Module.controls.select.DataFieldSelect} select */
anychart.chartEditor2Module.controls.select.DataField.prototype.setSelect = function(select) {
  this.select_ = select;
};
