goog.provide('anychart.chartEditor2Module.settings.ColorScale');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.chartEditor2Module.input.Palette');
goog.require('anychart.chartEditor2Module.settings.ColorScaleRanges');
goog.require('anychart.chartEditor2Module.controls.select.ColorScaleType');



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

  this.scaleType_ = '';

  /**
   * Scale instance.
   * @type {?(anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear)}
   * @private
   */
  this.scale_ = null;
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
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  var scaleTypeField = new anychart.chartEditor2Module.controls.select.ColorScaleType({caption: 'Choose type', label: 'Color scale type'});
  // typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  // typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  scaleTypeField.getSelect().setOptions([
    {value: 'linear-color', caption: 'Linear'},
    {value: 'ordinal-color', caption: 'Ordinal'}
  ]);
  scaleTypeField.init(model, this.genKey('type', true));
  this.addChild(scaleTypeField, true);
  this.scaleTypeField_ = scaleTypeField;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  this.specificContent_ = new anychart.chartEditor2Module.SettingsPanel(model);
  this.specificContent_.setName(null);
  this.addChild(this.specificContent_, true);

  // Linear color scale components
  this.colors_ = new anychart.chartEditor2Module.input.Palette('Comma separated colors');
  this.specificContent_.addChild(this.colors_, true);
  goog.dom.classlist.add(this.colors_.getElement(), 'input-palette');
  goog.dom.classlist.add(this.colors_.getElement(), 'anychart-chart-editor-settings-control-right');
  this.colors_.init(model, this.genKey('colors', true));

  // Ordinal color scale components
  this.ranges_ = new anychart.chartEditor2Module.settings.ColorScaleRanges(model);
  this.ranges_.setName(null);
  this.specificContent_.addChild(this.ranges_, true);
  this.ranges_.setKey(this.genKey('ranges', true));
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScale.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'onChartDraw', evt);
  if (this.isExcluded()) return;

  var target = evt.chart;
  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  this.scale_ = /** @type {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear} */(anychart.bindingModule.exec(target, stringKey));

  if (this.scale_) {
    if (this.scaleTypeField_) {
      var type = this.scale_.getType();
      this.scaleTypeField_.setValue(type, true);
      this.updateSpecific();
    }

    if(this.colors_ && !this.colors_.isExcluded()) {
      var colors = this.scale_.colors();
      this.colors_.setValueByColors(colors);
    }
  }
};


/**
 * Creates dom for specific section.
 */
anychart.chartEditor2Module.settings.ColorScale.prototype.updateSpecific = function() {
  var newScaleType = this.scaleTypeField_.getValue().value;

  if (newScaleType && newScaleType != this.scaleType_) {
    this.scaleType_ = newScaleType;
    var dom = this.getDomHelper();
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

    if (this.scaleType_ == 'linear-color') {
      this.ranges_.exclude(true);
      this.colors_.exclude(false);

    } else {
      // ordinal-color
      this.colors_.exclude(true/*, true*/ /* This redraws chart*/);

      this.ranges_.exclude(false);
    }
  }
};


/** @override */
anychart.chartEditor2Module.settings.ColorScale.prototype.disposeInternal = function() {
  this.scaleTypeField_ = null;
  this.colors_ = null;

  anychart.chartEditor2Module.settings.ColorScale.base(this, 'disposeInternal');
};
