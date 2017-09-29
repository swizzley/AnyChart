goog.provide('anychart.chartEditor2Module.GeneralTheming');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.select.Base');
goog.require('anychart.chartEditor2Module.select.Palettes');
goog.require('anychart.chartEditor2Module.settings.Title');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.GeneralTheming = function(model, opt_domHelper) {
  anychart.chartEditor2Module.GeneralTheming.base(this, 'constructor', model, opt_domHelper);

  this.name = 'General Theming';
};
goog.inherits(anychart.chartEditor2Module.GeneralTheming, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.GeneralTheming.prototype.createDom = function() {
  anychart.chartEditor2Module.GeneralTheming.base(this, 'createDom');

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var themes = goog.object.filter(goog.dom.getWindow()['anychart']['themes'], function(item) {
    return item['palette'];
  });
  this.themeSelect = new anychart.chartEditor2Module.select.Base("-- Choose theme --");
  this.themeSelect.setOptions(goog.object.getKeys(themes));
  this.themeSelect.updateOptions();
  this.themeSelect.init(model, [['anychart'], 'theme()'], 'setTheme');
  this.addChild(this.themeSelect, true);

  var realPalettes = goog.dom.getWindow()['anychart']['palettes'];
  var paletteNames = [];
  for (var paletteName in realPalettes) {
    if (realPalettes.hasOwnProperty(paletteName) && goog.isArray(realPalettes[paletteName])) {
      paletteNames.push(paletteName);
    }
  }
  this.paletteSelect = new anychart.chartEditor2Module.select.Palettes("-- Choose palette --");
  this.paletteSelect.setOptions(paletteNames);
  this.paletteSelect.updateOptions('defaultPalette');
  this.paletteSelect.init(model, [['chart'], ['settings'], 'palette()']);
  this.addChild(this.paletteSelect, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.GeneralTheming.prototype.update = function() {
  if (this.paletteSelect) this.paletteSelect.updateExclusion();
  anychart.chartEditor2Module.GeneralTheming.base(this, 'update');
};


/** @inheritDoc */
anychart.chartEditor2Module.GeneralTheming.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.GeneralTheming.base(this, 'onChartDraw', evt);
  if (evt.rebuild) {
    if (this.themeSelect) this.themeSelect.setValueByTarget(goog.dom.getWindow()['anychart']);
    if (this.paletteSelect) this.paletteSelect.setValueByTarget(evt.chart);
  }
};


/** @override */
anychart.chartEditor2Module.GeneralTheming.prototype.disposeInternal = function() {
  this.themeSelect = null;
  this.paletteSelect = null;

  anychart.chartEditor2Module.GeneralTheming.base(this, 'disposeInternal');
};
