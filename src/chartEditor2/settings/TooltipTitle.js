goog.provide('anychart.chartEditor2Module.settings.TooltipTitle');

goog.require('anychart.chartEditor2Module.button.Bold');
goog.require('anychart.chartEditor2Module.button.Italic');
goog.require('anychart.chartEditor2Module.button.Underline');
goog.require('anychart.chartEditor2Module.checkbox.Base');
goog.require('anychart.chartEditor2Module.colorPicker.Base');
goog.require('anychart.chartEditor2Module.comboBox.Base');
goog.require('anychart.chartEditor2Module.input.Base');
goog.require('anychart.chartEditor2Module.controls.select.Align');
goog.require('anychart.chartEditor2Module.controls.select.Base');
goog.require('anychart.chartEditor2Module.controls.select.FontFamily');
goog.require('anychart.chartEditor2Module.settings.Title');
goog.require('goog.ui.ButtonSide');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.settings.Title}
 */
anychart.chartEditor2Module.settings.TooltipTitle = function(model, opt_name, opt_domHelper) {
  anychart.chartEditor2Module.settings.TooltipTitle.base(this, 'constructor', model, opt_name, opt_domHelper);

  this.allowEnabled(true);
  this.allowEditPosition(false);
  this.allowEditAlign(false);

  /**
   * @type {anychart.chartEditor2Module.EditorModel.Key}
   * @private
   */
  this.titleFormatKey_ = [];
};
goog.inherits(anychart.chartEditor2Module.settings.TooltipTitle, anychart.chartEditor2Module.settings.Title);


/**
 * @param {anychart.chartEditor2Module.EditorModel.Key} value
 */
anychart.chartEditor2Module.settings.TooltipTitle.prototype.setTitleFormatKey = function(value) {
  this.titleFormatKey_ = value;
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.TooltipTitle.prototype.updateKeys = function() {
  anychart.chartEditor2Module.settings.TooltipTitle.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  if (this.textInput_) this.textInput_.init(model, this.titleFormatKey_);
};
