goog.provide('anychart.chartEditorModule.settings.ColorScale');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.controls.select.ColorScaleType');
goog.require('anychart.chartEditorModule.controls.select.DataFieldSelect');
goog.require('anychart.chartEditorModule.input.Palette');
goog.require('anychart.chartEditorModule.settings.ColorScaleRanges');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {?string} name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.ColorScale = function(model, name, opt_domHelper) {
  anychart.chartEditorModule.settings.ColorScale.base(this, 'constructor', model, opt_domHelper);
  this.name = name;

  this.scaleType_ = '';

  /**
   * Scale instance.
   * @type {?(anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear)}
   * @private
   */
  this.scale_ = null;
};
goog.inherits(anychart.chartEditorModule.settings.ColorScale, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.ColorScale.CSS_CLASS = goog.getCssName('settings-color-scale');


/** @override */
anychart.chartEditorModule.settings.ColorScale.prototype.createDom = function() {
  anychart.chartEditorModule.settings.ColorScale.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.ColorScale.CSS_CLASS);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var scaleTypeField = new anychart.chartEditorModule.controls.select.ColorScaleType({caption: 'Choose type', label: 'Color scale type'});
  scaleTypeField.getSelect().setOptions([
    {value: 'linear-color', caption: 'Linear'},
    {value: 'ordinal-color', caption: 'Ordinal'}
  ]);
  scaleTypeField.init(model, this.genKey('type', true));
  this.addChild(scaleTypeField, true);
  this.scaleTypeField_ = scaleTypeField;

  this.specificContent_ = new anychart.chartEditorModule.SettingsPanel(model);
  this.specificContent_.setName(null);
  this.addChild(this.specificContent_, true);

  // Linear color scale components
  this.paletteLabel_ = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-settings-label')
      ],
      'Palette');
  goog.dom.appendChild(this.specificContent_.getContentElement(), this.paletteLabel_);
  this.registerLabel(this.paletteLabel_);

  this.colors_ = new anychart.chartEditorModule.input.Palette('Comma separated colors');
  this.specificContent_.addChild(this.colors_, true);
  goog.dom.classlist.add(this.colors_.getElement(), 'input-palette');
  goog.dom.classlist.add(this.colors_.getElement(), 'anychart-chart-editor-settings-control-right');
  this.colors_.init(model, this.genKey('colors', true));

  // Ordinal color scale components
  this.ranges_ = new anychart.chartEditorModule.settings.ColorScaleRanges(model);
  this.ranges_.setName(null);
  this.specificContent_.addChild(this.ranges_, true);
  this.ranges_.setKey(this.genKey('ranges', true));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.ColorScale.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.ColorScale.base(this, 'onChartDraw', evt);
  if (this.isExcluded()) return;

  var target = evt.chart;
  var stringKey = anychart.chartEditorModule.EditorModel.getStringKey(this.key);
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
anychart.chartEditorModule.settings.ColorScale.prototype.updateSpecific = function() {
  var newScaleType = this.scaleTypeField_.getValue().value;

  if (newScaleType && newScaleType != this.scaleType_) {
    this.scaleType_ = newScaleType;
    // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.scaleType_ == 'linear-color') {
      this.ranges_.exclude(true);
      this.colors_.exclude(false);
      goog.style.setElementShown(this.paletteLabel_, true);

    } else {
      // ordinal-color
      this.colors_.exclude(true/*, true*/ /* This redraws chart*/);
      this.ranges_.exclude(false);
      goog.style.setElementShown(this.paletteLabel_, false);
    }
  }
};


/** @override */
anychart.chartEditorModule.settings.ColorScale.prototype.disposeInternal = function() {
  this.scaleTypeField_ = null;
  this.colors_ = null;

  anychart.chartEditorModule.settings.ColorScale.base(this, 'disposeInternal');
};
