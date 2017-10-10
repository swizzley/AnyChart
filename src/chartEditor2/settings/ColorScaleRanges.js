goog.provide('anychart.chartEditor2Module.settings.ColorScaleRange');
goog.provide('anychart.chartEditor2Module.settings.ColorScaleRanges');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');


/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.ColorScaleRanges = function(model, opt_domHelper) {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Ranges';

  /**
   * @type {Array.<anychart.chartEditor2Module.settings.ColorScaleSingleRange>}
   * @private
   */
  this.ranges_ = [];
};
goog.inherits(anychart.chartEditor2Module.settings.ColorScaleRanges, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.ColorScaleRanges.CSS_CLASS = goog.getCssName('settings-color-scale-ranges');


/** @override */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.ColorScaleRanges.CSS_CLASS);

  this.rangesWrapper_ = new anychart.chartEditor2Module.Component();
  this.addChild(this.rangesWrapper_, true);

  this.addRangeBtn_ = new goog.ui.Button('Add range');
  this.addChild(this.addRangeBtn_, true);

  // var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
};


/** @override */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.enterDocument = function() {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'enterDocument');

  if (this.addRangeBtn_)
    this.getHandler().listen(this.addRangeBtn_, goog.ui.Component.EventType.ACTION, this.onAddRange_);
};


/**
 * Update model keys.
 */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.updateKeys = function() {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  // if (this.typeSelect_) this.typeSelect_.init(model, [['chart'], ['settings'], 'colorScale()']);
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'onChartDraw', evt);
  if (this.isExcluded()) return;

  var target = evt.chart;
  var stringKey = 'colorScale().ranges()';//anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  var rangesValue = /** @type {?Array} */(anychart.bindingModule.exec(target, stringKey));
  if (rangesValue && rangesValue.length) {
    for (var i = 0; i < rangesValue.length; i++) {
      this.addRange(i);
    }
  }
};


anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.onAddRange_ = function() {
  this.addRange(this.ranges_.length);
};


anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.onRemoveRange_ = function(evt) {
  var index = /** @type {anychart.chartEditor2Module.settings.ColorScaleSingleRange} */(evt.target).index();

  var removedRange = goog.array.splice(this.ranges_, index, 1);
  this.rangesWrapper_.removeChild(removedRange[0], true);

  for (var i = 0; i < this.ranges_.length; i++) {
    /** @type {anychart.chartEditor2Module.settings.ColorScaleSingleRange} */(this.ranges_[i]).index(i);
  }
};


anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.addRange = function(index) {
  var range = new anychart.chartEditor2Module.settings.ColorScaleSingleRange(this.getModel(), index);
  range.allowRemove(true);
  this.getHandler().listen(range, anychart.chartEditor2Module.events.EventType.PANEL_CLOSE, this.onRemoveRange_);
  this.rangesWrapper_.addChild(range, true);
  this.ranges_.push(range);
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.exclude = function(value) {
  if (value) this.removeAllRanges();
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'exclude', value);
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.exitDocument = function() {
  this.removeAllRanges();
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'exitDocument');
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.disposeInternal = function() {
  this.removeAllRanges();
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'disposeInternal');
};


anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.removeAllRanges = function() {
  for (var i = 0; i < this.ranges_.length; i++) {
    this.rangesWrapper_.removeChild(this.ranges_[i], true);
  }
  goog.disposeAll(this.ranges_);
  this.ranges_.length = 0;
};


/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.ColorScaleSingleRange = function(model, index, opt_domHelper) {
  anychart.chartEditor2Module.settings.ColorScaleSingleRange.base(this, 'constructor', model, opt_domHelper);

  this.index_ = index;

  this.name = 'Range ' + this.index_;
};
goog.inherits(anychart.chartEditor2Module.settings.ColorScaleSingleRange, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.ColorScaleSingleRange.CSS_CLASS = goog.getCssName('settings-color-scale-range');


/** @override */
anychart.chartEditor2Module.settings.ColorScaleSingleRange.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.ColorScaleSingleRange.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.ColorScaleSingleRange.CSS_CLASS);

  // var tmp = this.getDomHelper().createDom('div', null, 'Range ' + this.index_);
  // this.getDomHelper().appendChild(element, tmp);
};


anychart.chartEditor2Module.settings.ColorScaleSingleRange.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.index_ = opt_value;
    return this;
  }
  return this.index_;
};
