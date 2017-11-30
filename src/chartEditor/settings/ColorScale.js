goog.provide('anychart.chartEditorModule.settings.ColorScale');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.ColorScaleType');
goog.require('anychart.chartEditorModule.input.Palette');
goog.require('anychart.chartEditorModule.settings.ColorScaleRanges');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.ColorScale = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.ColorScale.base(this, 'constructor', model, 'Color Scale', opt_domHelper);

  this.scaleType_ = '';

  /**
   * Scale instance.
   * @type {?(anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear)}
   * @private
   */
  this.scale_ = null;

  this.allowEnabled(false);
};
goog.inherits(anychart.chartEditorModule.settings.ColorScale, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.ColorScale.CSS_CLASS = goog.getCssName('anychart-chart-editor-settings-color-scale');


/** @override */
anychart.chartEditorModule.settings.ColorScale.prototype.createDom = function() {
  anychart.chartEditorModule.settings.ColorScale.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.ColorScale.CSS_CLASS);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var scaleTypeField = new anychart.chartEditorModule.controls.select.ColorScaleType({
    caption: 'Choose type',
    label: 'Color scale type'
  });
  scaleTypeField.getSelect().setOptions([
    {value: 'linear-color', caption: 'Linear'},
    {value: 'ordinal-color', caption: 'Ordinal'}
  ]);
  scaleTypeField.init(model, this.genKey('type', true));
  this.addChild(scaleTypeField, true);
  this.scaleTypeField_ = scaleTypeField;

  this.specificContent_ = new anychart.chartEditorModule.SettingsPanel(model, null);
  this.specificContent_.addClassName('anychart-settings-panel-wrapper');
  this.addChild(this.specificContent_, true);

  var colorsInput = new anychart.chartEditorModule.input.Palette('Comma separated colors');
  this.colors_ = new anychart.chartEditorModule.controls.LabeledControl(colorsInput, 'Palette');
  this.specificContent_.addChild(this.colors_, true);
  this.colors_.init(model, this.genKey('colors', true));

  // Ordinal color scale components
  this.ranges_ = new anychart.chartEditorModule.settings.ColorScaleRanges(model);
  this.specificContent_.addChild(this.ranges_, true);
  this.ranges_.setKey(this.genKey('ranges', true));

  this.colors_.hide();
  this.ranges_.hide();
  goog.style.setElementShown(this.ranges_.getElement(), false);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.ColorScale.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.ColorScale.base(this, 'onChartDraw', evt);

  if (this.isExcluded()) return;

  var target = evt.chart;
  var stringKey = anychart.chartEditorModule.EditorModel.getStringKey(this.key);
  this.scale_ = /** @type {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear} */(anychart.bindingModule.exec(target, stringKey));

  if (this.scale_) {
    this.colors_.show();
    this.ranges_.show();

    if (this.scaleTypeField_) {
      var type = this.scale_.getType();
      this.scaleTypeField_.setValue(type, true);
      this.updateSpecific();
    }

    if (this.colors_ && !this.colors_.isExcluded()) {
      var colors = this.scale_.colors();
      this.colors_.getControl().setValueByColors(colors);
    }

  } else {
    this.ranges_.exclude(true);
    this.colors_.exclude(true);
  }
};


/**
 * Creates dom for specific section.
 */
anychart.chartEditorModule.settings.ColorScale.prototype.updateSpecific = function() {
  var newScaleType = this.scaleTypeField_.getValue().value;

  if (newScaleType && newScaleType != this.scaleType_) {
    this.scaleType_ = newScaleType;
    if (this.scaleType_ == 'linear-color') {
      // ordinal-color
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
anychart.chartEditorModule.settings.ColorScale.prototype.disposeInternal = function() {
  goog.disposeAll([
    this.scaleTypeField_,
    this.colors_,
    this.ranges_
  ]);
  this.scaleTypeField_ = null;
  this.colors_ = null;
  this.ranges_ = null;

  anychart.chartEditorModule.settings.ColorScale.base(this, 'disposeInternal');
};
