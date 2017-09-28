goog.provide('anychart.chartEditor2Module.GeneralSettings');

goog.require('anychart.chartEditor2Module.EditorModel');
goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.checkbox.Base');
goog.require('anychart.chartEditor2Module.input.Base');
goog.require('anychart.chartEditor2Module.select.Base');
goog.require('anychart.chartEditor2Module.select.Palettes');



/**
 * Basic setting widget.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.GeneralSettings = function(model, opt_domHelper) {
  anychart.chartEditor2Module.GeneralSettings.base(this, 'constructor', model, opt_domHelper);

  this.name = 'General Appearance';
};
goog.inherits(anychart.chartEditor2Module.GeneralSettings, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.GeneralSettings.prototype.createDom = function() {
  anychart.chartEditor2Module.GeneralSettings.base(this, 'createDom');

  var dom = this.getDomHelper();
  var element = this.getElement();
  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  goog.dom.classlist.add(element, 'general-settings');

  // Theme & pallette
  var themeLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label-block')
      ],
      'Theme & pallette');
  goog.dom.appendChild(content, themeLabel);

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

  var paletteSelect = new anychart.chartEditor2Module.select.Palettes("-- Choose palette --");
  paletteSelect.setOptions(paletteNames);
  paletteSelect.updateOptions('defaultPalette');
  paletteSelect.init(model, [['chart'], ['settings'], 'palette()']);
  this.addChild(paletteSelect, true);
  this.paletteSelect = paletteSelect;

  content.appendChild(dom.createDom(goog.dom.TagName.DIV, 'fields-row', this.themeSelect.getElement(), this.paletteSelect.getElement()));

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));

  // Chart title
  var titleLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label-block')
      ],
      'Chart title');
  goog.dom.appendChild(content, titleLabel);

  this.titleEnabled = new anychart.chartEditor2Module.checkbox.Base();
  this.titleEnabled.init(model, [['chart'], ['settings'], 'title().enabled()']);
  this.addChild(this.titleEnabled, true);

  this.titleText = new anychart.chartEditor2Module.input.Base();
  this.titleText.init(model, [['chart'], ['settings'], 'title().text()']);
  this.addChild(this.titleText, true);

  content.appendChild(dom.createDom(goog.dom.TagName.DIV, 'fields-row', [this.titleEnabled.getElement(), this.titleText.getElement()]));

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));

  // Legend and animation
  this.legendEnabled = new anychart.chartEditor2Module.checkbox.Base();
  this.legendEnabled.init(model, [['chart'], ['settings'], 'legend().enabled()']);
  this.legendEnabled.setCaption('Legend');
  this.addChild(this.legendEnabled, true);

  this.animationEnabled = new anychart.chartEditor2Module.checkbox.Base();
  this.animationEnabled.init(model, [['chart'], ['settings'], 'animation().enabled()']);
  this.animationEnabled.setCaption('Animation');
  this.addChild(this.animationEnabled, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.GeneralSettings.prototype.update = function() {
  if (this.paletteSelect) this.paletteSelect.updateExclusion();
  if (this.legendEnabled) this.legendEnabled.updateExclusion();
  if (this.animationEnabled) this.animationEnabled.updateExclusion();

  anychart.chartEditor2Module.GeneralSettings.base(this, 'update');
};


/** @inheritDoc */
anychart.chartEditor2Module.GeneralSettings.prototype.updateKeys = function() {
  anychart.chartEditor2Module.GeneralSettings.base(this, 'updateKeys');

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  if (this.animationEnabled) {
    this.animationEnabled.init(model, [['chart'], ['settings'], 'animation().enabled()']);
    goog.dom.classlist.enable(this.animationEnabled.getElement(), goog.getCssName('hidden'), this.animationEnabled.isExcluded());
  }

  if (this.legendEnabled) {
    this.legendEnabled.init(model, [['chart'], ['settings'], 'legend().enabled()']);
    goog.dom.classlist.enable(this.legendEnabled.getElement(), goog.getCssName('hidden'), this.legendEnabled.isExcluded());
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.GeneralSettings.prototype.onChartDraw = function(evt) {
  if (evt.rebuild) {
    if (this.titleEnabled) this.titleEnabled.setValueByTarget(evt.chart);
    if (this.titleText) this.titleText.setValueByTarget(evt.chart);

    if (this.themeSelect) this.themeSelect.setValueByTarget(goog.dom.getWindow()['anychart']);
    if (this.paletteSelect) this.paletteSelect.setValueByTarget(evt.chart);

    if (this.animationEnabled) this.animationEnabled.setValueByTarget(evt.chart);
    if (this.legendEnabled) this.legendEnabled.setValueByTarget(evt.chart);
  }
};
