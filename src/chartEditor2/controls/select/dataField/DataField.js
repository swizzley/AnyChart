goog.provide('anychart.chartEditor2Module.controls.select.DataField');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.ui.Component');


/**
 * @param {Object=} opt_model
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


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.DataField.prototype.createDom = function() {
  anychart.chartEditor2Module.controls.select.DataField.base(this, 'createDom');

  var model = /** @type {Object} */(this.getModel());
  var element = this.getElement();

  this.label_ = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-select-data-field-label', model.label);
  goog.dom.appendChild(element, this.label_);

  this.addChild(this.select_, true);

  var clear = new anychart.ui.Component();
  clear.addClassName('anychart-clear');
  this.addChild(clear, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.controls.select.DataField.prototype.enterDocument = function() {
  anychart.chartEditor2Module.controls.select.DataField.base(this, 'enterDocument');
  this.updateExclusion();
};


/** @return {!anychart.chartEditor2Module.controls.select.DataFieldSelect} */
anychart.chartEditor2Module.controls.select.DataField.prototype.getSelect = function() {
  return /** @type {!anychart.chartEditor2Module.controls.select.DataFieldSelect} */(this.select_);
};


/** @param {anychart.chartEditor2Module.controls.select.DataFieldSelect} select */
anychart.chartEditor2Module.controls.select.DataField.prototype.setSelect = function(select) {
  this.select_ = select;
};


/**
 * Connects control with EditorMode.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model Editor model instance to connect with.
 * @param {anychart.chartEditor2Module.EditorModel.Key} key Key of control's field in model's structure.
 * @param {string=} opt_callback Callback function that will be called on control's value change instead of simple change value in model.
 *  This function should be model's public method.
 * @param {boolean=} opt_noRebuild Should or not rebuild target (chart) on change value of this control.
 * @public
 */
anychart.chartEditor2Module.controls.select.DataField.prototype.init = function(model, key, opt_callback, opt_noRebuild) {
  this.select_.init(model, key, opt_callback, opt_noRebuild);
  this.updateExclusion();
};


/**
 * Hide or show control by assigning 'hidden' class
 * @param {boolean} value True if excluded.
 * @param {boolean=} opt_skipSelect
 */
anychart.chartEditor2Module.controls.select.DataField.prototype.exclude = function(value, opt_skipSelect) {
  if (this.isInDocument()) goog.style.setElementShown(this.getElement(), !value);
  if (!opt_skipSelect)
    this.select_.exclude(value);
};


/**
 * @param {string} value
 * @param {boolean=} opt_noDispatch
 */
anychart.chartEditor2Module.controls.select.DataField.prototype.setValue = function(value, opt_noDispatch) {
  this.select_.suspendDispatch(!!opt_noDispatch);
  this.select_.setValue(value);
  this.select_.suspendDispatch(false);
};


/**
 * @return {*}
 */
anychart.chartEditor2Module.controls.select.DataField.prototype.getValue = function() {
  return this.select_.getValue();
};


/**
 * @public
 */
anychart.chartEditor2Module.controls.select.DataField.prototype.updateExclusion = function() {
  this.exclude(!!this.select_.updateExclusion(), true);
};


/**
 * @param {boolean} enabled
 */
anychart.chartEditor2Module.controls.select.DataField.prototype.setEnabled = function(enabled) {
  if (this.label_)
    goog.dom.classlist.enable(this.label_, goog.getCssName('anychart-control-disabled'), !enabled);

  if (this.select_)
    this.select_.setEnabled(enabled);
};