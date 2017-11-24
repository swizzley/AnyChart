goog.provide('anychart.chartEditorModule.controls.ControlWrapper');

goog.require('anychart.chartEditorModule.Component');


/**
 * @param {(anychart.chartEditorModule.comboBox.Base|anychart.chartEditorModule.controls.select.Base)} control
 * @param {string=} opt_label
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.chartEditorModule.Component}
 */
anychart.chartEditorModule.controls.ControlWrapper = function(control, opt_label, opt_domHelper) {
  anychart.chartEditorModule.controls.ControlWrapper.base(this, 'constructor', opt_domHelper);

  this.control_ = control;
  this.labelString_ = opt_label ? opt_label : '';

  this.addClassName('anychart-chart-editor-control-wrapper');
};
goog.inherits(anychart.chartEditorModule.controls.ControlWrapper, anychart.chartEditorModule.Component);


/** @inheritDoc */
anychart.chartEditorModule.controls.ControlWrapper.prototype.createDom = function() {
  anychart.chartEditorModule.controls.ControlWrapper.base(this, 'createDom');

  var element = this.getElement();

  this.label_ = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-chart-editor-control-wrapper-label', this.labelString_);
  goog.dom.appendChild(element, this.label_);

  this.addChild(this.control_, true);

  var clear = new anychart.chartEditorModule.Component();
  clear.addClassName('anychart-clear');
  this.addChild(clear, true);
};


/**
 * @return {(anychart.chartEditorModule.comboBox.Base|anychart.chartEditorModule.controls.select.Base)}
 */
anychart.chartEditorModule.controls.ControlWrapper.prototype.getControl = function() {
  return this.control_;
};


/**
 * @param {(anychart.chartEditorModule.comboBox.Base|anychart.chartEditorModule.controls.select.Base)} control
 */
anychart.chartEditorModule.controls.ControlWrapper.prototype.setControl = function(control) {
  this.control_ = control;
};


/**
 * Connects control with EditorMode.
 *
 * @param {anychart.chartEditorModule.EditorModel} model Editor model instance to connect with.
 * @param {anychart.chartEditorModule.EditorModel.Key} key Key of control's field in model's structure.
 * @param {string=} opt_callback Callback function that will be called on control's value change instead of simple change value in model.
 *  This function should be model's public method.
 * @param {boolean=} opt_noRebuild Should or not rebuild target (chart) on change value of this control.
 * @public
 */
anychart.chartEditorModule.controls.ControlWrapper.prototype.init = function(model, key, opt_callback, opt_noRebuild) {
  this.control_.init(model, key, opt_callback, opt_noRebuild);
};


/**
 * Wrapper for control's method.
 * @param {?Object} target
 */
anychart.chartEditorModule.controls.ControlWrapper.prototype.setValueByTarget = function(target) {
  this.control_.setValueByTarget(target);
};


/**
 * @param {string} value
 * @param {boolean=} opt_noDispatch
 */
anychart.chartEditorModule.controls.ControlWrapper.prototype.setValue = function(value, opt_noDispatch) {
  this.control_.suspendDispatch(!!opt_noDispatch);
  this.control_.setValue(value);
  this.control_.suspendDispatch(false);
};


/**
 * @return {*}
 */
anychart.chartEditorModule.controls.ControlWrapper.prototype.getValue = function() {
  return this.control_ ? this.control_.getValue() : null;
};


/** @override */
anychart.chartEditorModule.controls.ControlWrapper.prototype.disposeInternal = function() {
  goog.dispose(this.control_);
  this.control_ = null;

  this.label_ = null;

  anychart.chartEditorModule.controls.ControlWrapper.base(this, 'disposeInternal');
};