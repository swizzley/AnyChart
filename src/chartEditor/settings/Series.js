goog.provide('anychart.chartEditorModule.settings.Series');

goog.require('anychart.chartEditorModule.Component');
goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.input.Base');
goog.require('anychart.chartEditorModule.settings.Labels');
goog.require('anychart.chartEditorModule.settings.Markers');
goog.require('anychart.chartEditorModule.settings.Stroke');
goog.require('anychart.chartEditorModule.settings.Title');
goog.require('anychart.chartEditorModule.settings.scales.Base');
goog.require('goog.ui.AnimatedZippy');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {string|number} seriesId
 * @param {number} seriesIndex
 * @param {number=} opt_plotIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.Series = function(model, seriesId, seriesIndex, opt_plotIndex, opt_domHelper) {
  anychart.chartEditorModule.settings.Series.base(this, 'constructor', model, null, opt_domHelper);

  this.index_ = seriesIndex;
  this.seriesId_ = String(seriesId);

  var stringKey = 'getSeries(\'' + this.seriesId_ + '\')';
  if (goog.isDef(opt_plotIndex)) {
    this.plotIndex_ = opt_plotIndex;
    stringKey = 'plot(' + this.plotIndex_ + ').' + stringKey;
  }

  var plotIndex = goog.isDef(opt_plotIndex) ? opt_plotIndex : 0;

  this.seriesType_ = model.getValue([['dataSettings'], ['mappings', plotIndex], [this.index_, 'ctor']]);
  this.key = [['chart'], ['settings'], stringKey];
};
goog.inherits(anychart.chartEditorModule.settings.Series, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.Series.CSS_CLASS = goog.getCssName('anychart-settings-panel-series-single');


/** @override */
anychart.chartEditorModule.settings.Series.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Series.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.Series.CSS_CLASS);
  goog.dom.classlist.add(element, this.index_ % 2 ? 'even' : 'odd');

  // var content = this.getContentElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  // region == Header element ==
  var zippyHeader = new anychart.chartEditorModule.Component();
  zippyHeader.addClassName('series-title');
  this.addChild(zippyHeader, true);

  var nameInput = new anychart.chartEditorModule.input.Base('Series name');
  zippyHeader.addChild(nameInput, true);
  goog.dom.classlist.add(nameInput.getElement(), goog.getCssName('anychart-chart-editor-series-name-input'));

  var plusMinus = goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-plus-minus'));
  zippyHeader.getElement().appendChild(plusMinus);

  var colorPicker = new anychart.chartEditorModule.colorPicker.Base();
  colorPicker.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  zippyHeader.addChild(colorPicker, true);
  // endregion

  // region == zippyContent element ==
  var zippyContent = new anychart.chartEditorModule.Component();
  zippyContent.addClassName('series-content');
  this.addChild(zippyContent, true);

  var innerContent = new anychart.chartEditorModule.Component();
  zippyContent.addClassName('inner-content');
  zippyContent.addChild(innerContent, true);

  var stroke = new anychart.chartEditorModule.settings.Stroke(model);
  // stroke.setKey(this.genKey('stroke()'));
  innerContent.addChild(stroke, true);

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Tooltip
  var tooltip = new anychart.chartEditorModule.settings.Title(model, 'Tooltip');
  tooltip.allowEnabled(true);
  tooltip.allowEditPosition(false);
  tooltip.allowEditAlign(false);
  tooltip.setTitleKey('format()');
  tooltip.setKey(this.genKey('tooltip()')); // This is for enabled working sake!
  innerContent.addChild(tooltip, true);

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Data labels
  var dataLabels = new anychart.chartEditorModule.settings.Labels(model);
  dataLabels.setName('Data Labels');
  dataLabels.allowEnabled(true);
  dataLabels.setKey(this.genKey('labels()'));
  innerContent.addChild(dataLabels, true);

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Data markers
  var dataMarkers = new anychart.chartEditorModule.settings.Markers(model);
  dataMarkers.setName('Data Markers');
  dataMarkers.allowEnabled(true);
  dataMarkers.setKey(this.genKey('markers()'));
  innerContent.addChild(dataMarkers, true);

  // Color Scale
  if (this.seriesType_ === 'choropleth') {
    var colorScale = new anychart.chartEditorModule.settings.scales.Base(model, ['linear-color', 'ordinal-color']);
    colorScale.setKey(this.genKey('colorScale()'));
    innerContent.addChild(colorScale, true);
    this.colorScale_ = colorScale;
  }
  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-clearboth')));

  this.nameInput_ = nameInput;
  this.colorPicker_ = colorPicker;
  this.stroke_ = stroke;
  this.tooltip_ = tooltip;
  this.dataLabels_ = dataLabels;
  this.dataMarkers_ = dataMarkers;

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
anychart.chartEditorModule.settings.Series.prototype.expand = function() {
  if (this.zippy_) this.zippy_.expand();
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Series.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var stringKey = 'getSeries(\'' + this.seriesId_ + '\')';
    if (goog.isDef(this.plotIndex_)) {
      stringKey = 'plot(' + this.plotIndex_ + ').' + stringKey;
    }
    this.key = [['chart'], ['settings'], stringKey];

    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.nameInput_) this.nameInput_.init(model, this.genKey('name()'));
    if (this.colorPicker_) this.colorPicker_.init(model, this.genKey('color()'));

    if (this.stroke_) this.stroke_.setKey(this.genKey('stroke()'));
    if (this.tooltip_) this.tooltip_.setKey(this.genKey('tooltip()'));
    if (this.dataLabels_) this.dataLabels_.setKey(this.genKey('labels()'));
    if (this.dataMarkers_) this.dataMarkers_.setKey(this.genKey('markers()'));

    if (this.colorScale_) this.colorScale_.setKey(this.genKey('colorScale()'));
  }

  anychart.chartEditorModule.settings.Series.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Series.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.Series.base(this, 'onChartDraw', evt);
  if (this.isExcluded()) return;

  var target = evt.chart;
  this.nameInput_.setValueByTarget(target, true);
  this.colorPicker_.setValueByTarget(target);
};


/** @override */
anychart.chartEditorModule.settings.Series.prototype.disposeInternal = function() {
  goog.disposeAll([
    this.nameInput_,
    this.colorPicker_,
    this.stroke_,
    this.tooltip_,
    this.dataLabels_,
    this.dataMarkers_,
    this.colorScale_
  ]);

  this.nameInput_ = null;
  this.colorPicker_ = null;
  this.stroke_ = null;
  this.tooltip_ = null;
  this.dataLabels_ = null;
  this.dataMarkers_ = null;
  this.colorScale_ = null;

  anychart.chartEditorModule.settings.Series.base(this, 'disposeInternal');
};
