goog.provide('anychart.chartEditor2Module.GeneralTheming');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.controls.select.DataField');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem');
goog.require('anychart.chartEditor2Module.controls.select.Palettes');
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
  this.themeSelect = new anychart.chartEditor2Module.controls.select.DataField({caption: 'Select theme', label: 'Theme'});
  var themeNames = goog.object.getKeys(themes);

  for (var i = 0; i < themeNames.length; i++) {
    this.themeSelect.getSelect().addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
      caption: themeNames[i],
      value: themeNames[i]
    }));
  }
  this.themeSelect.getSelect().init(model, [['anychart'], 'theme()'], 'setTheme');
  this.addChild(this.themeSelect, true);

  var realPalettes = goog.dom.getWindow()['anychart']['palettes'];
  this.paletteSelect = new anychart.chartEditor2Module.controls.select.Palettes({caption: 'Select palette', label: 'Palette'});
  for (var paletteName in realPalettes) {
    if (realPalettes.hasOwnProperty(paletteName) && goog.isArray(realPalettes[paletteName])) {
      this.paletteSelect.getSelect().addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
        caption: paletteName,
        value: paletteName
      }));
    }
  }
  this.paletteSelect.getSelect().init(model, [['chart'], ['settings'], 'palette()']);
  this.addChild(this.paletteSelect, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.GeneralTheming.prototype.update = function() {
  if (this.paletteSelect) this.paletteSelect.getSelect().updateExclusion();
  anychart.chartEditor2Module.GeneralTheming.base(this, 'update');
};


/** @inheritDoc */
anychart.chartEditor2Module.GeneralTheming.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.GeneralTheming.base(this, 'onChartDraw', evt);
  if (evt.rebuild) {
    if (this.themeSelect) this.themeSelect.getSelect().setValueByTarget(goog.dom.getWindow()['anychart']);
    if (this.paletteSelect) this.paletteSelect.getSelect().setValueByTarget(evt.chart);
  }
};


/** @override */
anychart.chartEditor2Module.GeneralTheming.prototype.disposeInternal = function() {
  this.themeSelect.dispose();
  this.themeSelect = null;

  this.paletteSelect.dispose();
  this.paletteSelect = null;

  anychart.chartEditor2Module.GeneralTheming.base(this, 'disposeInternal');
};
