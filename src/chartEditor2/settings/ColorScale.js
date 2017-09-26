goog.provide('anychart.chartEditor2Module.settings.ColorScale');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.select.ColorScaleType');


/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {?string} name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.ColorScale = function(model, name, opt_domHelper) {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'constructor', model, opt_domHelper);
  this.name = name;
};
goog.inherits(anychart.chartEditor2Module.settings.ColorScale, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.ColorScale.CSS_CLASS = goog.getCssName('settings-color-scale');


/** @override */
anychart.chartEditor2Module.settings.ColorScale.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.ColorScale.CSS_CLASS);

  var content = this.getContentElement();
  //var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  var typeLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Scale type');
  goog.dom.appendChild(content, typeLabel);
  this.labels.push(typeLabel);

  var typeSelect = new anychart.chartEditor2Module.select.ColorScaleType();
  typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  typeSelect.setOptions(['linear-color', 'ordinal-color']);
  typeSelect.setCaptions(['Linear', 'Ordinal']);

  this.addChild(typeSelect, true);
  this.typeSelect_ = typeSelect;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

};


/**
 * Update model keys.
 */
anychart.chartEditor2Module.settings.ColorScale.prototype.updateKeys = function() {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  if (this.typeSelect_) this.typeSelect_.init(model, this.getKey());
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScale.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  if (this.typeSelect_) this.typeSelect_.setValueByTarget(target);
};


/** @override */
anychart.chartEditor2Module.settings.ColorScale.prototype.disposeInternal = function() {
  // this.firstLine_ = null;

  anychart.chartEditor2Module.settings.ColorScale.base(this, 'disposeInternal');
};
