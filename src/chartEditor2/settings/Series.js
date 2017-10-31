goog.provide('anychart.chartEditor2Module.settings.Series');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.colorPicker.Base');
goog.require('anychart.chartEditor2Module.input.Base');
goog.require('anychart.chartEditor2Module.settings.DataMarkers');
goog.require('anychart.chartEditor2Module.settings.Stroke');
goog.require('anychart.chartEditor2Module.settings.Title');
goog.require('anychart.ui.Component');
goog.require('goog.ui.AnimatedZippy');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {string|number} seriesId
 * @param {number} seriesIndex
 * @param {number=} opt_plotIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.Series = function(model, seriesId, seriesIndex, opt_plotIndex, opt_domHelper) {
  anychart.chartEditor2Module.settings.Series.base(this, 'constructor', model, opt_domHelper);
  this.name = null;
  this.index_ = seriesIndex;
  this.seriesId_ = String(seriesId);

  var stringKey = 'getSeries(\'' + this.seriesId_ + '\')';
  if (goog.isDef(opt_plotIndex)) {
    this.plotIndex_ = opt_plotIndex;
    stringKey = 'plot(' + this.plotIndex_ + ').' + stringKey;
  }

  var plotIndex = goog.isDef(opt_plotIndex) ? opt_plotIndex : 0;

  this.seriesType_ = model.getValue([['dataSettings'], ['mappings', plotIndex], [0, 'ctor']]);
  this.key = [['chart'], ['settings'], stringKey];
};
goog.inherits(anychart.chartEditor2Module.settings.Series, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.Series.CSS_CLASS = goog.getCssName('anychart-settings-panel-series-single');


/** @override */
anychart.chartEditor2Module.settings.Series.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.Series.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.Series.CSS_CLASS);
  goog.dom.classlist.add(element, this.index_ % 2 ? 'even' : 'odd');

  // var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  // region == Header element ==
  var zippyHeader = new anychart.ui.Component();
  zippyHeader.addClassName('series-title');
  this.addChild(zippyHeader, true);

  var nameInput = new anychart.chartEditor2Module.input.Base('Series name');
  zippyHeader.addChild(nameInput, true);
  goog.dom.classlist.add(nameInput.getElement(), goog.getCssName('anychart-chart-editor-series-name-input'));

  var plusMinus = goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-plus-minus'));
  zippyHeader.getElement().appendChild(plusMinus);

  var colorPicker = new anychart.chartEditor2Module.colorPicker.Base();
  colorPicker.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  zippyHeader.addChild(colorPicker, true);
  // endregion


  // region == zippyContent element ==
  var zippyContent = new anychart.ui.Component();
  zippyContent.addClassName('series-content');
  this.addChild(zippyContent, true);

  var innerContent = new anychart.ui.Component();
  zippyContent.addClassName('inner-content');
  zippyContent.addChild(innerContent, true);

  var stroke = new anychart.chartEditor2Module.settings.Stroke(model);
  // stroke.setKey(this.genKey('stroke()'));
  innerContent.addChild(stroke, true);

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Tooltip
  var tooltip = new anychart.chartEditor2Module.settings.Title(model, 'Tooltip');
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
  var dataLabels = new anychart.chartEditor2Module.settings.Title(model, 'Data labels');
  dataLabels.allowEnabled(true);
  dataLabels.allowEditPosition(false);
  dataLabels.allowEditAlign(false);
  dataLabels.setTitleKey('format()');
  dataLabels.setKey(this.genKey('labels()')); // This is for enabled working sake!
  innerContent.addChild(dataLabels, true);

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Data markers
  var dataMarkers = new anychart.chartEditor2Module.settings.DataMarkers(model, 'Data markers');
  dataMarkers.allowEnabled(true);
  innerContent.addChild(dataMarkers, true);

  goog.dom.appendChild(innerContent.getElement(), goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-clearboth')));
  // endregion

  // if (this.seriesType_ == 'choropleth') {
  //   var colorScale = new anychart.chartEditor2Module.settings.ColorScale(model, null);
  //   colorScale.allowEnabled(false);
  //   colorScale.setKey(this.genKey('colorScale()'));
  //   this.addChild(colorScale, true);
  //   this.colorScale_ = colorScale;
  // } else if (this.colorScale_) {
  //   goog.dispose(this.colorScale_);
  //   this.colorScale_ = null;
  // }


  this.nameInput_ = nameInput;
  this.colorPicker_ = colorPicker;
  this.stroke_ = stroke;
  this.tooltip_ = tooltip;
  this.dataLabels_ = dataLabels;
  this.dataMarkers_ = dataMarkers;

  this.zippy_ = new goog.ui.AnimatedZippy(zippyHeader.getElement(), zippyContent.getElement());
  this.zippy_.setHandleKeyboardEvents(false);
  this.zippy_.setHandleMouseEvents(false);
  this.getHandler().listen(plusMinus, goog.events.EventType.CLICK, function(){
    this.zippy_.toggle();
  });
};


/**
 * Expands panel.
 */
anychart.chartEditor2Module.settings.Series.prototype.expand = function() {
  if (this.zippy_) this.zippy_.expand();
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.Series.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var stringKey = 'getSeries(\'' + this.seriesId_ + '\')';
    if (goog.isDef(this.plotIndex_)) {
      stringKey = 'plot(' + this.plotIndex_ + ').' + stringKey;
    }
    this.key = [['chart'], ['settings'], stringKey];

    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
    if (this.nameInput_) this.nameInput_.init(model, this.genKey('name()'));
    if (this.colorPicker_) this.colorPicker_.init(model, this.genKey('color()'));

    if (this.stroke_) this.stroke_.setKey(this.genKey('stroke()'));
    if (this.tooltip_) this.tooltip_.setKey(this.genKey('tooltip()'));
    if (this.dataLabels_) this.dataLabels_.setKey(this.genKey('labels()'));
    if (this.dataMarkers_) this.dataMarkers_.setKey(this.genKey('markers()'));
  }

  anychart.chartEditor2Module.settings.Series.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.Series.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.Series.base(this, 'onChartDraw', evt);
  if (this.isExcluded()) return;

  var target = evt.chart;
  this.nameInput_.setValueByTarget(target, true);
  this.colorPicker_.setValueByTarget(target);
};


/** @override */
anychart.chartEditor2Module.settings.Series.prototype.disposeInternal = function() {
  this.nameInput_ = null;
  this.colorPicker_ = null;

  this.stroke_.dispose();
  this.stroke_ = null;

  this.tooltip_.dispose();
  this.tooltip_ = null;

  this.dataLabels_.dispose();
  this.dataLabels_ = null;

  this.dataMarkers_.dispose();
  this.dataMarkers_ = null;

  // goog.dispose(this.colorScale_);
  // this.colorScale_ = null;

  anychart.chartEditor2Module.settings.Series.base(this, 'disposeInternal');
};