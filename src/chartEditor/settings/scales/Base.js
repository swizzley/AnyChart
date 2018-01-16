goog.provide('anychart.chartEditorModule.settings.scales.Base');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.controls.select.ScaleType');
goog.require('anychart.chartEditorModule.settings.scales.LinearColorSpecific');
goog.require('anychart.chartEditorModule.settings.scales.LinearSpecific');
goog.require('anychart.chartEditorModule.settings.scales.LogarithmicSpecific');
goog.require('anychart.chartEditorModule.settings.scales.OrdinalColorSpecific');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {string|Array.<string>} types
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.scales.Base = function(model, types, opt_domHelper) {
  anychart.chartEditorModule.settings.scales.Base.base(this, 'constructor', model, null, opt_domHelper);

  this.descriptors_ = {
    'linear': {
      name: 'Linear',
      classFunc: anychart.chartEditorModule.settings.scales.LinearSpecific
    },
    'log': {
      name: 'Logarithmic',
      classFunc: anychart.chartEditorModule.settings.scales.LogarithmicSpecific
    },
    'linear-color': {
      name: 'Linear Color',
      classFunc: anychart.chartEditorModule.settings.scales.LinearColorSpecific
    },
    'ordinal-color': {
      name: 'Ordinal Color',
      classFunc: anychart.chartEditorModule.settings.scales.OrdinalColorSpecific
    }
  };

  this.typeOptions_ = [];

  types = goog.isString(types) ? [types] : types;

  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    this.typeOptions_.push({value: type, caption: this.descriptors_[type].name});
  }

  this.scaleType_ = '';

  /**
   * Scale instance.
   * @type {?(anychart.scales.Linear|anychart.scales.Logarithmic|anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear)}
   * @private
   */
  this.scale_ = null;

  this.allowEnabled(false);
};
goog.inherits(anychart.chartEditorModule.settings.scales.Base, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.scales.Base.CSS_CLASS = goog.getCssName('anychart-settings-panel-scale-single');


/** @override */
anychart.chartEditorModule.settings.scales.Base.prototype.createDom = function() {
  anychart.chartEditorModule.settings.scales.Base.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.scales.Base.CSS_CLASS);

  //var content = this.getContentElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var type = new anychart.chartEditorModule.controls.select.ScaleType({
    label: 'Scale Type',
    caption: 'Choose scale type'
  });
  type.getControl().setOptions(this.typeOptions_);
  type.init(model, this.genKey('type', true));
  this.addChild(type, true);
  this.scaleTypeField_ = type;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.scales.Base.prototype.enterDocument = function() {
  anychart.chartEditorModule.settings.scales.Base.base(this, 'enterDocument');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var scale = model.getValue(this.getKey());
  if (scale && scale.type)
    this.updateSpecific(true);

  else if (this.specificComponent_)
    this.specificComponent_.exclude(true);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.scales.Base.prototype.onModelChange = function(evt) {
  anychart.chartEditorModule.settings.scales.Base.base(this, 'onModelChange', evt);
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    var scale = model.getValue(this.getKey());
    var scaleType = scale ? scale.type : void 0;
    if (this.scaleTypeField_ && scaleType) {
      this.scaleTypeField_.setValue(scaleType, true);
    }
  }
};


/** @inheritDoc */
anychart.chartEditorModule.settings.scales.Base.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.scales.Base.base(this, 'onChartDraw', evt);

  if (!this.isExcluded()) {
    var target = evt.chart;
    var stringKey = anychart.chartEditorModule.EditorModel.getStringKey(this.key);
    this.scale_ = /** @type {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear} */(anychart.bindingModule.exec(target, stringKey));

    if (this.scale_ && this.scaleTypeField_) {
      var type = this.scale_.getType();
      this.scaleTypeField_.setValue(type, true);
      this.updateSpecific();
    }
  }
};


/**
 * Creates dom for specific section.
 * @param {boolean=} opt_force
 */
anychart.chartEditorModule.settings.scales.Base.prototype.updateSpecific = function(opt_force) {
  var newScaleType = this.scaleTypeField_.getValue().value;

  if (newScaleType && (opt_force || newScaleType != this.scaleType_)) {
    this.scaleType_ = newScaleType;
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

    if (this.specificComponent_) {
      this.removeChild(this.specificComponent_, true);
      goog.dispose(this.specificComponent_);
    }

    this.specificComponent_ = new this.descriptors_[this.scaleType_].classFunc(model);
    this.specificComponent_.setKey(this.getKey());
    this.specificComponent_.allowEnabled(false);

    this.addChild(this.specificComponent_, true);
  }
};


/** @override */
anychart.chartEditorModule.settings.scales.Base.prototype.disposeInternal = function() {
  goog.disposeAll([
    this.scaleTypeField_,
    this.specificComponent_
  ]);

  this.scaleTypeField_ = null;
  this.specificComponent_ = null;

  anychart.chartEditorModule.settings.scales.Base.base(this, 'disposeInternal');
};
