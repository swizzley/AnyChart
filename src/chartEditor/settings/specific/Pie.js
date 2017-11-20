goog.provide('anychart.chartEditorModule.settings.specific.Pie');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Stroke');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Pie = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Pie.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Pie Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Pie, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Pie.CSS_CLASS = goog.getCssName('anychart-settings-panel-pie');


/** @override */
anychart.chartEditorModule.settings.specific.Pie.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Pie.base(this, 'createDom');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.specific.Pie.CSS_CLASS);

  // var itemsSourceMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Legend Items Source Mode'});
  // itemsSourceMode.getSelect().setOptions([
  //   {value: 'default', caption: 'Default'},
  //   {value: 'categories', caption: 'Categories'}
  // ]);
  // this.addChild(itemsSourceMode, true);
  // this.itemsSourceMode_ = itemsSourceMode;
  //
  // var dataMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Data Mode'});
  // dataMode.getSelect().setOptions([
  //   {value: 'diff', caption: 'Difference'},
  //   {value: 'absolute', caption: 'Absolute'}
  // ]);
  // this.addChild(dataMode, true);
  // this.dataMode_ = dataMode;

  var innerRadiusLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-settings-label')
      ],
      'Inner radius');
  goog.dom.appendChild(this.getContentElement(), innerRadiusLabel);
  this.registerLabel(innerRadiusLabel);

  var innerRadius = new anychart.chartEditorModule.comboBox.Percentage();
  innerRadius.setOptions([5, 10, 20, 30, 40]);
  // innerRadius.setFormatterFunction(function(value) {
  //   return String(goog.math.clamp(Number(value), 0, 80)) + "%";
  // });
  this.addChild(innerRadius, true);
  goog.dom.classlist.add(innerRadius.getElement(), 'anychart-chart-editor-settings-control-right');
  this.innerRadius_ = innerRadius;

  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var stroke = new anychart.chartEditorModule.settings.Stroke(model, 'Connector Stroke');
  this.addChild(stroke, true);
  this.connectorStroke_ = stroke;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Pie.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

    if (this.innerRadius_) this.innerRadius_.init(model, this.genKey('innerRadius()'));
    if (this.connectorStroke_) this.connectorStroke_.setKey(this.genKey('connectorStroke()'));
  }

  anychart.chartEditorModule.settings.specific.Pie.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Pie.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Pie.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    // if (this.itemsSourceMode_) this.itemsSourceMode_.getSelect().setValueByTarget(target);
    // if (this.dataMode_) this.dataMode_.getSelect().setValueByTarget(target);
    if (this.innerRadius_) this.innerRadius_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Pie.prototype.disposeInternal = function() {
  // goog.dispose(this.itemsSourceMode_);
  // this.itemsSourceMode_ = null;
  //
  goog.dispose(this.innerRadius_);
  this.innerRadius_ = null;

  goog.dispose(this.connectorStroke_);
  this.connectorStroke_ = null;

  anychart.chartEditorModule.settings.specific.Pie.base(this, 'disposeInternal');
};
