goog.provide('anychart.chartEditorModule.settings.specific.TreeMap');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Stroke');
goog.require('anychart.chartEditorModule.settings.TreemapHeaders');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.TreeMap = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.TreeMap.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Tree Map Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.TreeMap, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.TreeMap.CSS_CLASS = goog.getCssName('anychart-settings-panel-pie');


/** @override */
anychart.chartEditorModule.settings.specific.TreeMap.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.TreeMap.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditorModule.settings.specific.TreeMap.CSS_CLASS);

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  this.sort_ = new anychart.chartEditorModule.controls.select.DataField({label: 'Sort'});
  this.sort_.getSelect().setOptions([
    {value: 'asc', caption: 'Ascending'},
    {value: 'desc', caption: 'Descending'},
    {value: 'none', caption: 'No sorting'}
  ]);
  this.addChild(this.sort_, true);

  var maxDepth = new anychart.chartEditorModule.comboBox.Base();
  maxDepth.setOptions([1, 2, 3, 4, 5]);
  maxDepth.setRange(1, 10);
  this.maxDepth_ = new anychart.chartEditorModule.controls.LabeledControl(maxDepth, 'Max Depth');
  this.addChild(this.maxDepth_, true);

  var hintDepth = new anychart.chartEditorModule.comboBox.Base();
  hintDepth.setOptions([0, 1, 2, 3, 4]);
  hintDepth.setRange(0, 10);
  this.hintDepth_ = new anychart.chartEditorModule.controls.LabeledControl(hintDepth, 'Hint Depth');
  this.addChild(this.hintDepth_, true);

  var hintOpacity = new anychart.chartEditorModule.comboBox.Base();
  hintOpacity.setOptions([0, 0.2, 0.5, 0.7, 1]);
  hintOpacity.setRange(0, 1);
  this.hintOpacity_ = new anychart.chartEditorModule.controls.LabeledControl(hintOpacity, 'Hint Opacity');
  this.addChild(this.hintOpacity_, true);

  var adjustFontSize = new anychart.chartEditorModule.checkbox.Base();
  adjustFontSize.setCaption('Adjust Labels Font Size');
  this.adjustFontSize_ = adjustFontSize;
  this.addChild(this.adjustFontSize_, true);

  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var headers = new anychart.chartEditorModule.settings.TreemapHeaders(model);
  headers.allowEnabled(true);
  this.addChild(headers, true);

  this.headers_ = headers;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.TreeMap.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.sort_) this.sort_.init(model, this.genKey('sort()'));
    if (this.maxDepth_) this.maxDepth_.init(model, this.genKey('maxDepth()'));
    if (this.hintDepth_) this.hintDepth_.init(model, this.genKey('hintDepth()'));
    if (this.hintOpacity_) this.hintOpacity_.init(model, this.genKey('hintOpacity()'));
    if (this.adjustFontSize_) this.adjustFontSize_.init(model, this.genKey('labels().adjustFontSize()'));
  }

  anychart.chartEditorModule.settings.specific.TreeMap.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.TreeMap.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.TreeMap.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.sort_) this.sort_.setValueByTarget(target);
    if (this.maxDepth_) this.maxDepth_.setValueByTarget(target);
    if (this.hintDepth_) this.hintDepth_.setValueByTarget(target);
    if (this.hintOpacity_) this.hintOpacity_.setValueByTarget(target);
    if (this.adjustFontSize_) this.adjustFontSize_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.TreeMap.prototype.disposeInternal = function() {
  goog.dispose(this.sort_);
  this.sort_ = null;

  goog.dispose(this.maxDepth_);
  this.maxDepth_ = null;

  goog.dispose(this.hintDepth_);
  this.hintDepth_ = null;

  goog.dispose(this.hintOpacity_);
  this.hintOpacity_ = null;

  goog.dispose(this.adjustFontSize_);
  this.adjustFontSize_ = null;

  goog.dispose(this.headers_);
  this.headers_ = null;

  anychart.chartEditorModule.settings.specific.TreeMap.base(this, 'disposeInternal');
};
