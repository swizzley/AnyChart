goog.provide('anychart.chartEditorModule.settings.CircularGaugeAxis');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.SettingsPanelIndexed');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.comboBox.Percent');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Labels');
goog.require('anychart.chartEditorModule.settings.Ticks');
goog.require('anychart.chartEditorModule.settings.scales.Base');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanelIndexed}
 */
anychart.chartEditorModule.settings.CircularGaugeAxis = function(model, index, opt_domHelper) {
  anychart.chartEditorModule.settings.CircularGaugeAxis.base(this, 'constructor', model, index, null, opt_domHelper);

  this.axisExists = false;
  this.name = 'Axis(' + this.index_ + ')';
  this.key = [['chart'], ['settings'], 'axis(' + this.index_ + ')'];
};
goog.inherits(anychart.chartEditorModule.settings.CircularGaugeAxis, anychart.chartEditorModule.SettingsPanelIndexed);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.CircularGaugeAxis.CSS_CLASS = goog.getCssName('anychart-settings-panel-axis-single');


/** @override */
anychart.chartEditorModule.settings.CircularGaugeAxis.prototype.createDom = function() {
  anychart.chartEditorModule.settings.CircularGaugeAxis.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.CircularGaugeAxis.CSS_CLASS);

  //var content = this.getContentElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var wrapper = new anychart.chartEditorModule.SettingsPanel(model);
  wrapper.setName(null);
  wrapper.addClassName('anychart-settings-panel');
  wrapper.addClassName('anychart-settings-panel-wrapper');
  this.addChild(wrapper, true);

  var startAngle = new anychart.chartEditorModule.comboBox.Base();
  startAngle.setOptions([-90, 0, 90, 180, 270]);
  startAngle.setRange(-360, 360);
  var startAngleLC = new anychart.chartEditorModule.controls.LabeledControl(startAngle, 'Start Angle');
  startAngleLC.init(model, this.genKey('startAngle()'));
  wrapper.addChildControl(startAngleLC);

  var sweepAngle = new anychart.chartEditorModule.comboBox.Base();
  sweepAngle.setOptions([-180, -90, 0, 90, 180, 270]);
  sweepAngle.setRange(-360, 360);
  var sweepAngleLC = new anychart.chartEditorModule.controls.LabeledControl(sweepAngle, 'Sweep Angle');
  sweepAngleLC.init(model, this.genKey('sweepAngle()'));
  wrapper.addChildControl(sweepAngleLC);

  var radius = new anychart.chartEditorModule.comboBox.Percent();
  radius.setOptions([10, 30, 50, 70, 90]);
  var radiusLC = new anychart.chartEditorModule.controls.LabeledControl(radius, 'Radius');
  radiusLC.init(model, this.genKey('radius()'));
  wrapper.addChildControl(radiusLC);

  var width = new anychart.chartEditorModule.comboBox.Percent();
  width.setOptions([0, 1, 3, 5, 10]);
  var widthLC = new anychart.chartEditorModule.controls.LabeledControl(width, 'Width');
  widthLC.init(model, this.genKey('width()'));
  wrapper.addChildControl(widthLC);

  var cornersRounding = new anychart.chartEditorModule.comboBox.Percent();
  cornersRounding.setOptions([0, 20, 50, 70, 100]);
  var cornersRoundingLC = new anychart.chartEditorModule.controls.LabeledControl(cornersRounding, 'Corners Rounding');
  cornersRoundingLC.init(model, this.genKey('cornersRounding()'));
  wrapper.addChildControl(cornersRoundingLC);

  var fill = new anychart.chartEditorModule.colorPicker.Base();
  var fillLC = new anychart.chartEditorModule.controls.LabeledControl(fill, 'Axis Fill');
  fillLC.init(model, this.genKey('fill()'));
  wrapper.addChildControl(fillLC);

  // Overlap mode
  var overlapMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Labels Overlap'});
  overlapMode.getControl().setOptions([
    {value: 'allow-overlap', caption: 'Overlap'},
    {value: 'no-overlap', caption: 'No overlap'}
  ]);
  overlapMode.init(model, this.genKey('overlapMode()'));
  wrapper.addChildControl(overlapMode);

  goog.dom.appendChild(wrapper.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  //region Labels
  var labels = new anychart.chartEditorModule.settings.Labels(model);
  labels.allowEnabled(true);
  labels.allowEditPosition(false);
  labels.allowEditAnchor(false);
  labels.setKey(this.genKey('labels()'));
  wrapper.addChildControl(labels);

  var drawFirstLabel = new anychart.chartEditorModule.checkbox.Base();
  drawFirstLabel.setCaption('Draw First Label');
  drawFirstLabel.init(model, this.genKey('drawFirstLabel()'));
  labels.addChildControl(drawFirstLabel);

  var drawLastLabel = new anychart.chartEditorModule.checkbox.Base();
  drawLastLabel.setCaption('Draw Last Label');
  drawLastLabel.init(model, this.genKey('drawLastLabel()'));
  labels.addChildControl(drawLastLabel);

  goog.dom.appendChild(wrapper.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  // Ticks
  var ticks = new anychart.chartEditorModule.settings.Ticks(model);
  ticks.allowEnabled(true);
  ticks.allowEditFill(true);
  ticks.setKey(this.genKey('ticks()'));
  wrapper.addChildControl(ticks);
  //endregion

  goog.dom.appendChild(wrapper.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  //region Minor Labels
  var minorlabels = new anychart.chartEditorModule.settings.Labels(model);
  minorlabels.setName('Minor Labels');
  minorlabels.allowEnabled(true);
  minorlabels.allowEditPosition(false);
  minorlabels.allowEditAnchor(false);
  minorlabels.setKey(this.genKey('minorLabels()'));
  wrapper.addChildControl(minorlabels);

  goog.dom.appendChild(wrapper.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  // Minor Ticks
  var minorTicks = new anychart.chartEditorModule.settings.Ticks(model);
  minorTicks.setName('Minor Ticks');
  minorTicks.allowEnabled(true);
  minorTicks.allowEditFill(true);
  minorTicks.setKey(this.genKey('minorTicks()'));
  wrapper.addChildControl(minorTicks);
  //endregion

  goog.dom.appendChild(wrapper.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  var scale = new anychart.chartEditorModule.settings.scales.Base(model, ['linear', 'log']);
  scale.setKey(this.genKey('scale()'));
  scale.setName('Scale');
  scale.skipSettings(['stackMode()', 'stackDirection()']);
  wrapper.addChild(scale, true);
  //this.scale_ = scale;
};


/** @inheritDoc */
anychart.chartEditorModule.settings.CircularGaugeAxis.prototype.onChartDraw = function(evt) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  this.getHandler().listenOnce(model, anychart.chartEditorModule.events.EventType.CHART_DRAW, this.onChartDraw);
  if (this.isExcluded()) return;

  var chart = evt.chart;
  this.axisExists = chart.getAxesCount() > this.index_;

  // this.title_.exclude(!this.axisExists);
  //
  // this.labels_.exclude(!this.axisExists);
  // this.ticks_.exclude(!this.axisExists);
  //
  // if (this.minorLabels_)
  //   this.minorLabels_.exclude(!this.axisExists);
  //
  // if (this.minorTicks_)
  //   this.minorTicks_.exclude(!this.axisExists);

  if (this.axisExists)
    anychart.chartEditorModule.settings.CircularGaugeAxis.base(this, 'onChartDraw', evt);
  else
    this.setContentEnabled(false);
};


/** @override */
anychart.chartEditorModule.settings.CircularGaugeAxis.prototype.disposeInternal = function() {
  // goog.disposeAll([this.inverted_, this.orientation_, this.title_]);
  // this.orientation_ = null;
  // this.inverted_ = null;
  // this.title_ = null;

  anychart.chartEditorModule.settings.CircularGaugeAxis.base(this, 'disposeInternal');
};
