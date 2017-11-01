goog.provide('anychart.chartEditor2Module.settings.ColorScaleRanges');
goog.provide('anychart.chartEditor2Module.settings.ColorScaleSingleRange');

goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.colorPicker.Base');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.chartEditor2Module.input.Base');
goog.require('goog.ui.Button');



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
anychart.chartEditor2Module.settings.ColorScaleRanges.CSS_CLASS = goog.getCssName('anychart-settings-color-scale-ranges');


/** @override */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.ColorScaleRanges.CSS_CLASS);

  this.rangesWrapper_ = new anychart.chartEditor2Module.Component();
  this.addChild(this.rangesWrapper_, true);

  // this.addRangeBtn_ = new goog.ui.Button('Add range');
  // this.addChild(this.addRangeBtn_, true);

  var addRangeBtnRenderer = /** @type {goog.ui.ButtonRenderer} */(goog.ui.ControlRenderer.getCustomRenderer(
      goog.ui.ButtonRenderer,
      'anychart-settings-panel-add-range-btn'));
  this.addRangeBtn_ = new goog.ui.Button('+ Add range', addRangeBtnRenderer);
  this.addChild(this.addRangeBtn_, true);

  // var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
};


/** @override */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.enterDocument = function() {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'enterDocument');

  if (this.addRangeBtn_)
    this.getHandler().listen(this.addRangeBtn_, goog.ui.Component.EventType.ACTION, this.onAddRange_);
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.ColorScaleRanges.base(this, 'onChartDraw', evt);
  if (this.isExcluded()) return;

  if (!this.ranges_.length) {
    var target = evt.chart;
    var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
    var rangesValue = /** @type {?Array} */(anychart.bindingModule.exec(target, stringKey));
    if (rangesValue && rangesValue.length) {
      for (var i = 0; i < rangesValue.length; i++) {
        this.addRange(i);
        this.ranges_[i].setValue(rangesValue[i]);
      }
    }
  }
};


/**
 * Add range button handler.
 * @private
 */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.onAddRange_ = function() {
  this.addRange(this.ranges_.length);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.onRemoveRange_ = function(evt) {
  var index = /** @type {anychart.chartEditor2Module.settings.ColorScaleSingleRange} */(evt.target).index();

  var removedRange = goog.array.splice(this.ranges_, index, 1);
  this.rangesWrapper_.removeChild(removedRange[0], true);

  for (var i = 0; i < this.ranges_.length; i++) {
    /** @type {anychart.chartEditor2Module.settings.ColorScaleSingleRange} */(this.ranges_[i]).index(i);
  }

  this.onChangeRange_();
};


/**
 * Change range event handler.
 * @private
 */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.onChangeRange_ = function() {
  var rangesValue = [];
  for (var i = 0; i < this.ranges_.length; i++) {
    if (this.ranges_[i]) {
      var rangeValue = /** @type {anychart.chartEditor2Module.settings.ColorScaleSingleRange} */(this.ranges_[i]).getValue();
      rangesValue.push(rangeValue);
    }
  }

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  model.setValue(this.key, rangesValue, false);
};


/**
 * @param {number} index
 */
anychart.chartEditor2Module.settings.ColorScaleRanges.prototype.addRange = function(index) {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var range = new anychart.chartEditor2Module.settings.ColorScaleSingleRange(model, index);
  range.allowRemove(true);
  this.getHandler().listen(range, anychart.chartEditor2Module.events.EventType.PANEL_CLOSE, this.onRemoveRange_);
  this.getHandler().listen(range, goog.ui.Component.EventType.CHANGE, this.onChangeRange_);

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


/**
 * Removes ranges components.
 */
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
anychart.chartEditor2Module.settings.ColorScaleSingleRange.CSS_CLASS = goog.getCssName('anychart-settings-color-scale-range-single');


/** @override */
anychart.chartEditor2Module.settings.ColorScaleSingleRange.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.ColorScaleSingleRange.base(this, 'createDom');
  goog.dom.classlist.add(this.getElement(), anychart.chartEditor2Module.settings.ColorScaleSingleRange.CSS_CLASS);

  var color = new anychart.chartEditor2Module.colorPicker.Base();
  color.addClassName(goog.getCssName('range-color'));
  this.addChild(color, true);
  this.color_ = color;

  var from = new anychart.chartEditor2Module.input.Base('From');
  this.addChild(from, true);
  this.from_ = from;

  var to = new anychart.chartEditor2Module.input.Base('To');
  this.addChild(to, true);
  this.to_ = to;

  var less = new anychart.chartEditor2Module.input.Base('Less');
  this.addChild(less, true);
  this.less_ = less;

  var greater = new anychart.chartEditor2Module.input.Base('Greater');
  this.addChild(greater, true);
  this.greater_ = greater;

  this.getHandler().listen(this.color_, goog.ui.Component.EventType.ACTION, this.onChange);
  this.getHandler().listen(this.from_.getElement(), goog.ui.Component.EventType.CHANGE, this.onChange);
  this.getHandler().listen(this.to_.getElement(), goog.ui.Component.EventType.CHANGE, this.onChange);
  this.getHandler().listen(this.less_.getElement(), goog.ui.Component.EventType.CHANGE, this.onChange);
  this.getHandler().listen(this.greater_.getElement(), goog.ui.Component.EventType.CHANGE, this.onChange);
};


/** @param {goog.events.Event} evt */
anychart.chartEditor2Module.settings.ColorScaleSingleRange.prototype.onChange = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  this.dispatchEvent({
    type: goog.ui.Component.EventType.CHANGE,
    value: this.getValue()
  });
};


/**
 * @return {Object}
 */
anychart.chartEditor2Module.settings.ColorScaleSingleRange.prototype.getValue = function() {
  var value = {};

  var colorValue = this.color_.getSelectedColor();
  if (colorValue)
    value['color'] = colorValue;

  var fromValue = this.from_.getValue();
  if (fromValue)
    value['from'] = fromValue;

  var toValue = this.to_.getValue();
  if (toValue)
    value['to'] = toValue;

  var lessValue = this.less_.getValue();
  if (lessValue)
    value['less'] = lessValue;

  var greaterValue = this.greater_.getValue();
  if (greaterValue)
    value['greater'] = greaterValue;

  return value;
};


/**
 * @param {Object} value
 */
anychart.chartEditor2Module.settings.ColorScaleSingleRange.prototype.setValue = function(value) {
  if (goog.isObject(value)) {
    for (var i in value) {
      switch (i) {
        case 'color':
          this.color_.setSelectedColor(value[i]);
          break;
        case 'from':
          this.from_.setValue(value[i]);
          break;
        case 'to':
          this.to_.setValue(value[i]);
          break;
        case 'less':
          this.less_.setValue(value[i]);
          break;
        case 'greater':
          this.greater_.setValue(value[i]);
          break;
      }
    }
  }
};


/**
 * @param {number=} opt_value
 * @return {number}
 */
anychart.chartEditor2Module.settings.ColorScaleSingleRange.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.index_ = opt_value;
  }
  return this.index_;
};
