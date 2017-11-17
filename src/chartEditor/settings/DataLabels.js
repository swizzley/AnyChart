goog.provide('anychart.chartEditorModule.settings.DataLabels');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.Title');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.DataLabels = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.DataLabels.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Data labels';
};
goog.inherits(anychart.chartEditorModule.settings.DataLabels, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.DataLabels.CSS_CLASS = goog.getCssName('anychart-settings-data-labels');


/** @inheritDoc */
anychart.chartEditorModule.settings.DataLabels.prototype.createDom = function() {
  anychart.chartEditorModule.settings.DataLabels.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.DataLabels.CSS_CLASS);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var settings = new anychart.chartEditorModule.settings.Title(model);
  settings.allowEnabled(false);

  settings.setPositionLabel('Position');

  settings.setAlignLabel('Anchor');
  settings.setAlignKey('anchor()');

  settings.setTitleKey('format()');
  settings.setKey(this.getKey()); // This is for enabled working sake!
  this.addChild(settings, true);

  this.settings_ = settings;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.DataLabels.prototype.enterDocument = function() {
  anychart.chartEditorModule.settings.DataLabels.base(this, 'enterDocument');

  var positionValuesEnum;
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var chartType = model.getModel()['chart']['type'];
  var addValueOption = false;
  switch (chartType) {
    case 'pie':
      positionValuesEnum = anychart.enums.SidePosition;
      break;
    case 'funnel':
      positionValuesEnum = anychart.enums.PyramidLabelsPosition;
      break;
    default:
      positionValuesEnum = anychart.enums.Position;
      addValueOption = true;
  }

  var positionValues = goog.object.getValues(positionValuesEnum);
  positionValues = goog.array.filter(positionValues, function(i) {
    return goog.typeOf(i) == 'string';
  });
  if (addValueOption) positionValues.push('value');

  var positionField = /** @type {anychart.chartEditorModule.controls.select.DataField} */(this.settings_.getPositionField());
  positionField.getSelect().setOptions(positionValues);

  var alignValues = goog.object.getValues(anychart.enums.Anchor);
  alignValues = goog.array.filter(alignValues, function(i) {
    return goog.typeOf(i) == 'string';
  });

  var alignField = /** @type {anychart.chartEditorModule.controls.select.DataField} */(this.settings_.getAlignField());
  alignField.getSelect().setOptions(alignValues);
};


/**
 * @return {anychart.chartEditorModule.settings.Title|null}
 */
anychart.chartEditorModule.settings.DataLabels.prototype.getSettingsComponent = function() {
  return this.settings_;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.DataLabels.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    if (this.settings_) this.settings_.setKey(this.getKey());
  }

  anychart.chartEditorModule.settings.DataLabels.base(this, 'updateKeys');
};


/** @override */
anychart.chartEditorModule.settings.DataLabels.prototype.disposeInternal = function() {
  this.settings_.dispose();
  this.settings_ = null;

  anychart.chartEditorModule.settings.DataLabels.base(this, 'disposeInternal');
};
