goog.provide('anychart.chartEditor2Module.controls.select.FontFamily');

goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem');



/**
 * @constructor
 * @extends {anychart.chartEditor2Module.controls.select.DataFieldSelect}
 */
anychart.chartEditor2Module.controls.select.FontFamily = function() {
  anychart.chartEditor2Module.controls.select.FontFamily.base(this, 'constructor');

  var fonts = {
    'Arial': 'Arial, Helvetica, sans-serif',
    'Arial Black': 'Arial Black, Gadget, sans-serif',
    'Comic Sans MS': 'Comic Sans MS, cursive, sans-serif',
    'Impact': 'Impact, Charcoal, sans-serif',
    'Lucida Sans Unicode': 'Lucida Sans Unicode, Lucida Grande, sans-serif',
    'Tahoma': 'Tahoma, Geneva, sans-serif',
    'Trebuchet MS': 'Trebuchet MS, Helvetica, sans-serif',
    'Verdana': 'Verdana, Helvetica, Arial, sans-serif',
    'Lucida Console': '"Lucida Console", Monaco, monospace',
    'Source Sans Pro': '"Source Sans Pro", sans-serif'
  };

  for (var key in fonts) {
    this.addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
      caption: key,
      value: fonts[key]
    }));
  }

};
goog.inherits(anychart.chartEditor2Module.controls.select.FontFamily, anychart.chartEditor2Module.controls.select.DataFieldSelect);
