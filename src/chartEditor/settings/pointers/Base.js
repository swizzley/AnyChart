goog.provide('anychart.chartEditorModule.settings.pointers.Base');

goog.require('anychart.chartEditorModule.Component');
goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.settings.Stroke');
goog.require('goog.ui.AnimatedZippy');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {string} type
 * @param {string|number} pointerId
 * @param {number} pointerIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.pointers.Base = function(model, type, pointerId, pointerIndex, opt_domHelper) {
  anychart.chartEditorModule.settings.pointers.Base.base(this, 'constructor', model, null, opt_domHelper);

  this.index_ = pointerIndex;
  this.pointerd_ = String(pointerId);

  // todo: debug
  var tmp = type.split('.');
  var ctor = tmp[tmp.length - 1];
  var stringKey = ctor + '(' + pointerIndex + ')';
  //var stringKey = 'getPointer(\'' + this.pointerId_ + '\')';

  this.pointerType_ = type;
  this.key = [['chart'], ['settings'], stringKey];

  this.allowEnabled(false);
};
goog.inherits(anychart.chartEditorModule.settings.pointers.Base, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.pointers.Base.CSS_CLASS = goog.getCssName('anychart-settings-panel-pointer-single');


/** @override */
anychart.chartEditorModule.settings.pointers.Base.prototype.createDom = function() {
  anychart.chartEditorModule.settings.pointers.Base.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.pointers.Base.CSS_CLASS);
  goog.dom.classlist.add(element, this.index_ % 2 ? 'even' : 'odd');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  // region == Header element ==
  var zippyHeader = new anychart.chartEditorModule.Component();
  zippyHeader.addClassName('zippy-title');
  this.addChild(zippyHeader, true);

  var nameEl = goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-chart-editor-pointer-name'), this.key[2]);
  zippyHeader.getElement().appendChild(nameEl);

  var plusMinus = goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-plus-minus'));
  zippyHeader.getElement().appendChild(plusMinus);

  var fill = new anychart.chartEditorModule.colorPicker.Base();
  fill.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  fill.init(model, this.genKey('fill()'));
  zippyHeader.addChild(fill, true);
  this.fill_ = fill;
  // endregion

  // region == zippyContent element ==
  var zippyContent = new anychart.chartEditorModule.Component();
  zippyContent.addClassName('series-content');
  this.addChild(zippyContent, true);

  var innerContent = new anychart.chartEditorModule.Component();
  zippyContent.addClassName('inner-content');
  zippyContent.addChild(innerContent, true);

  var stroke = new anychart.chartEditorModule.settings.Stroke(model);
  stroke.setKey(this.genKey('stroke()'));
  innerContent.addChild(stroke, true);

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-clearboth')));

  this.zippy_ = new goog.ui.AnimatedZippy(zippyHeader.getElement(), zippyContent.getElement());
  this.zippy_.setHandleKeyboardEvents(false);
  this.zippy_.setHandleMouseEvents(false);
  this.getHandler().listen(plusMinus, goog.events.EventType.CLICK, function() {
    this.zippy_.toggle();
  });
};


/**
 * Expands panel.
 */
anychart.chartEditorModule.settings.pointers.Base.prototype.expand = function() {
  if (this.zippy_) this.zippy_.expand();
};


/** @inheritDoc */
anychart.chartEditorModule.settings.pointers.Base.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.pointers.Base.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    this.fill_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.pointers.Base.prototype.disposeInternal = function() {
  goog.disposeAll([
    this.fill_
  ]);

  this.fill_ = null;

  anychart.chartEditorModule.settings.pointers.Base.base(this, 'disposeInternal');
};
