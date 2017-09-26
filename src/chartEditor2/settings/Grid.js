goog.provide('anychart.chartEditor2Module.settings.Grid');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.checkbox.Base');
goog.require('anychart.chartEditor2Module.input.Palette');
goog.require('anychart.chartEditor2Module.settings.Stroke');


/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {string} name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.Grid = function(model, name, opt_domHelper) {
  anychart.chartEditor2Module.settings.Grid.base(this, 'constructor', model, opt_domHelper);
  this.name = name;
};
goog.inherits(anychart.chartEditor2Module.settings.Grid, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.Grid.CSS_CLASS = goog.getCssName('settings-data-markers');


/** @override */
anychart.chartEditor2Module.settings.Grid.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.Grid.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.Grid.CSS_CLASS);

  var content = this.getContentElement();
  //var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  this.firstLine_ = new anychart.chartEditor2Module.checkbox.Base();
  this.firstLine_.setCaption('Draw first line');
  this.addChild(this.firstLine_, true);

  this.lastLine_ = new anychart.chartEditor2Module.checkbox.Base();
  this.lastLine_.setCaption('Draw last line');
  this.addChild(this.lastLine_, true);

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));

  var paletteLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Palette');
  goog.dom.appendChild(content, paletteLabel);

  var paletteInput = new anychart.chartEditor2Module.input.Palette('Comma separated colors');
  this.addChild(paletteInput, true);
  goog.dom.classlist.add(paletteInput.getElement(), 'input-palette');
  goog.dom.classlist.add(paletteInput.getElement(), 'anychart-chart-editor-settings-control-right');
  this.palette_ = paletteInput;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var stroke = new anychart.chartEditor2Module.settings.Stroke(model, 'Stroke');
  this.addChild(stroke, true);
  this.stroke_ = stroke;
};


/**
 * Update model keys.
 */
anychart.chartEditor2Module.settings.Grid.prototype.updateKeys = function() {
  anychart.chartEditor2Module.settings.Grid.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  if (this.firstLine_) this.firstLine_.init(model, this.genKey('drawFirstLine()'));
  if (this.lastLine_) this.lastLine_.init(model, this.genKey('drawLastLine()'));
  if (this.palette_) this.palette_.init(model, this.genKey('palette()'));
  if (this.stroke_) this.stroke_.setKey(this.genKey('stroke()'));
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.Grid.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.Grid.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  this.firstLine_.setValueByTarget(target);
  this.lastLine_.setValueByTarget(target);
  this.palette_.setValueByTarget(target, true);
};


/** @override */
anychart.chartEditor2Module.settings.Grid.prototype.disposeInternal = function() {
  this.firstLine_ = null;
  this.lastLine_ = null;
  this.palette_ = null;

  this.stroke_.dispose();
  this.stroke_ = null;

  anychart.chartEditor2Module.settings.Grid.base(this, 'disposeInternal');
};
