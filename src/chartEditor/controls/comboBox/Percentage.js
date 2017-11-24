goog.provide('anychart.chartEditorModule.comboBox.Percentage');

goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('goog.ui.ComboBox');


/**
 * A ComboBox control.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {goog.ui.Menu=} opt_menu Optional menu component.
 *     This menu is disposed of by this control.
 * @param {goog.ui.LabelInput=} opt_labelInput Optional label input.
 *     This label input is disposed of by this control.
 * @constructor
 * @extends {anychart.chartEditorModule.comboBox.Base}
 * @suppress {visibility}
 */
anychart.chartEditorModule.comboBox.Percentage = function(opt_domHelper, opt_menu, opt_labelInput) {
  anychart.chartEditorModule.comboBox.Percentage.base(this, 'constructor', opt_domHelper, opt_menu, opt_labelInput);

  this.setValidateFunction(function(value) {
    return /^\d{1,3}%?$/.test(value);
  });

  this.setFormatterFunction(function(value) {
    var match = String(value).match(/^(\d{1,3})%?$/);
    return String(goog.math.clamp(Number(match[1]), 0, 100)) + "%";
  });
};
goog.inherits(anychart.chartEditorModule.comboBox.Percentage, anychart.chartEditorModule.comboBox.Base);


/** @inheritDoc */
anychart.chartEditorModule.comboBox.Percentage.prototype.getToken = function() {
  return goog.base(this, 'getToken') + '%';
};