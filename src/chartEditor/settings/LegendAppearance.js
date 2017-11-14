goog.provide('anychart.chartEditorModule.settings.LegendAppearance');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Title');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.LegendAppearance = function(model, opt_name, opt_domHelper) {
  anychart.chartEditorModule.settings.LegendAppearance.base(this, 'constructor', model, opt_domHelper);

  this.name = opt_name;
};
goog.inherits(anychart.chartEditorModule.settings.LegendAppearance, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.LegendAppearance.CSS_CLASS = goog.getCssName('anychart-settings-legend-appearance');


/** @override */
anychart.chartEditorModule.settings.LegendAppearance.prototype.createDom = function() {
  anychart.chartEditorModule.settings.LegendAppearance.base(this, 'createDom');

  var element = this.getElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.LegendAppearance.CSS_CLASS);

  var layoutField = new anychart.chartEditorModule.controls.select.DataField({label: 'Layout'});
  layoutField.getSelect().setOptions([
    {value: 'horizontal', caption: 'Horizontal'},
    {value: 'vertical', caption: 'Vertical'}
  ]);
  this.addChild(layoutField, true);

  var orientationField = new anychart.chartEditorModule.controls.select.DataField({label: 'Orientation'});
  orientationField.getSelect().setOptions([
    {value: 'left', icon: 'ac ac-position-left'},
    {value: 'right', icon: 'ac ac-position-right'},
    {value: 'top', icon: 'ac ac-position-top'},
    {value: 'bottom', icon: 'ac ac-position-bottom'}
  ]);
  this.addChild(orientationField, true);

  var alignField = new anychart.chartEditorModule.controls.select.DataField({label: 'Align'});
  alignField.getSelect().setOptions([
    {value: 'left', icon: 'ac ac-position-left'},
    {value: 'center', icon: 'ac ac-position-center'},
    {value: 'right', icon: 'ac ac-position-right'}
  ]);
  this.addChild(alignField, true);

  var items = new anychart.chartEditorModule.settings.Title(model);
  items.allowEnabled(false);
  items.allowEditTitle(false);
  items.allowEditPosition(false);
  items.allowEditAlign(false);
  items.allowEditColor(false);
  items.setKey(this.key);
  this.addChild(items, true);

  this.layoutField_ = layoutField;
  this.orientationField_ = orientationField;
  this.alignField_ = alignField;
  this.items_ = items;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.LegendAppearance.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.layoutField_) this.layoutField_.init(model, this.genKey('itemsLayout()'));
    if (this.orientationField_) this.orientationField_.init(model, this.genKey('position()'));
    if (this.alignField_) this.alignField_.init(model, this.genKey('align()'));
    if (this.items_) this.items_.setKey(this.key);
  }

  anychart.chartEditorModule.settings.LegendAppearance.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.LegendAppearance.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.LegendAppearance.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  if (this.layoutField_) this.layoutField_.getSelect().setValueByTarget(target);
  if (this.orientationField_) this.orientationField_.getSelect().setValueByTarget(target);
  if (this.alignField_) this.alignField_.getSelect().setValueByTarget(target);
};


/** @override */
anychart.chartEditorModule.settings.LegendAppearance.prototype.disposeInternal = function() {
  goog.dispose(this.layoutField_);
  this.layoutField_ = null;

  goog.dispose(this.orientationField_);
  this.orientationField_ = null;

  goog.dispose(this.alignField_);
  this.alignField_ = null;

  goog.dispose(this.items_);
  this.items_ = null;

  anychart.chartEditorModule.settings.LegendAppearance.base(this, 'disposeInternal');
};
