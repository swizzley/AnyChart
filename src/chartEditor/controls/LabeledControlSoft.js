goog.provide('anychart.chartEditorModule.controls.LabeledControlSoft');

goog.require('anychart.chartEditorModule.controls.LabeledControl');


/**
 * @param {(anychart.chartEditorModule.comboBox.Base|anychart.chartEditorModule.controls.select.Base|anychart.chartEditorModule.input.Base|anychart.chartEditorModule.colorPicker.Base)} control
 * @param {string=} opt_label
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.chartEditorModule.controls.LabeledControl}
 */
anychart.chartEditorModule.controls.LabeledControlSoft = function(control, opt_label, opt_domHelper) {
  anychart.chartEditorModule.controls.LabeledControlSoft.base(this, 'constructor', control, opt_label, opt_domHelper);
};
goog.inherits(anychart.chartEditorModule.controls.LabeledControlSoft, anychart.chartEditorModule.controls.LabeledControl);


/** @inheritDoc */
anychart.chartEditorModule.controls.LabeledControlSoft.prototype.createDom = function() {
  anychart.chartEditorModule.controls.LabeledControlSoft.base(this, 'createDom');

  var soft = new anychart.chartEditorModule.checkbox.Base();
  soft.setCaption('Soft');
  this.addChild(soft, true);
  this.soft_ = soft;

  goog.events.listen(this.soft_, goog.ui.Component.EventType.CHANGE, this.onChangeSoft, false, this);
};


anychart.chartEditorModule.controls.LabeledControlSoft.prototype.enterDocument = function() {
  anychart.chartEditorModule.controls.LabeledControlSoft.base(this, 'enterDocument');

  if (!this.key_)
    this.key_ = this.control_.getKey();
  
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var isSoft = goog.isDef(model.getValue(this.key2_));
  this.soft_.setChecked(isSoft);
};


/** @inheritDoc */
anychart.chartEditorModule.controls.LabeledControlSoft.prototype.init = function(model, key, opt_callback, opt_noRebuild) {
  anychart.chartEditorModule.controls.LabeledControlSoft.base(this, 'init', model, key, opt_callback, opt_noRebuild);
  this.setModel(model);
};


/** @param {anychart.chartEditorModule.EditorModel.Key} value */
anychart.chartEditorModule.controls.LabeledControlSoft.prototype.setKey2 = function(value) {
  this.key2_ = value;
};


anychart.chartEditorModule.controls.LabeledControlSoft.prototype.onChangeSoft = function(evt) {
  var isSoft = evt.target.getChecked();

  var value = this.control_.getValue();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  if (isSoft) {
    this.control_.setKey(this.key2_);
    model.removeByKey(this.key_);

  } else {
    this.control_.setKey(this.key_);
    model.removeByKey(this.key2_);
  }

  if (goog.isDef(value))
    model.setValue(this.control_.getKey(), value);
};


/** @override */
anychart.chartEditorModule.controls.LabeledControlSoft.prototype.disposeInternal = function() {
  goog.dispose(this.soft_);
  this.soft_ = null;

  anychart.chartEditorModule.controls.LabeledControlSoft.base(this, 'disposeInternal');
};
