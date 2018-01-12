goog.provide('anychart.chartEditorModule.settings.CircularGaugeAxis');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Labels');
goog.require('anychart.chartEditorModule.settings.Stagger');
goog.require('anychart.chartEditorModule.settings.Ticks');
goog.require('anychart.chartEditorModule.settings.Title');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.CircularGaugeAxis = function(model, index, opt_domHelper) {
  anychart.chartEditorModule.settings.CircularGaugeAxis.base(this, 'constructor', model, null, opt_domHelper);

  this.axisExists = false;

  this.index_ = index;
  this.name = 'Axis(' + this.index_ + ')';
  this.key = [['chart'], ['settings'], 'axis(' + this.index_ + ')'];
};
goog.inherits(anychart.chartEditorModule.settings.CircularGaugeAxis, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.CircularGaugeAxis.CSS_CLASS = goog.getCssName('anychart-settings-panel-axis-single');


/** @return {number} */
anychart.chartEditorModule.settings.CircularGaugeAxis.prototype.getIndex = function() {
  return this.index_;
};


/** @override */
anychart.chartEditorModule.settings.CircularGaugeAxis.prototype.createDom = function() {
  anychart.chartEditorModule.settings.CircularGaugeAxis.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.CircularGaugeAxis.CSS_CLASS);
  goog.dom.classlist.add(element, this.index_ % 2 ? 'even' : 'odd');

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

  var radius = new anychart.chartEditorModule.comboBox.Percentage();
  radius.setOptions([10, 30, 50, 70, 90]);
  var radiusLC = new anychart.chartEditorModule.controls.LabeledControl(radius, 'Radius');
  radiusLC.init(model, this.genKey('radius()'));
  wrapper.addChildControl(radiusLC);

  var width = new anychart.chartEditorModule.comboBox.Percentage();
  width.setOptions([0, 1, 3, 5, 10]);
  var widthLC = new anychart.chartEditorModule.controls.LabeledControl(width, 'Width');
  widthLC.init(model, this.genKey('width()'));
  wrapper.addChildControl(widthLC);

  var cornersRounding = new anychart.chartEditorModule.comboBox.Percentage();
  cornersRounding.setOptions([0, 20, 50, 70, 100]);
  var cornersRoundingLC = new anychart.chartEditorModule.controls.LabeledControl(cornersRounding, 'Corners Rounding');
  cornersRoundingLC.init(model, this.genKey('cornersRounding()'));
  wrapper.addChildControl(cornersRoundingLC);

  var fill = new anychart.chartEditorModule.colorPicker.Base();
  var fillLC = new anychart.chartEditorModule.controls.LabeledControl(fill, 'Axis Fill');
  fillLC.init(model, this.genKey('fill()'));
  wrapper.addChildControl(fillLC);

  // if (!this.isRadarPolarAxis) {
  //   // Overlap mode
  //   var overlapMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Labels Overlap'});
  //   overlapMode.getControl().setOptions([
  //     {value: 'allow-overlap', caption: 'Overlap'},
  //     {value: 'no-overlap', caption: 'No overlap'}
  //   ]);
  //   overlapMode.init(model, this.genKey('overlapMode()'));
  //   wrapper.addChildControl(overlapMode);
  // }

  // //region Labels
  // var labels = new anychart.chartEditorModule.settings.Labels(model);
  // labels.allowEnabled(true);
  // labels.allowEditPosition(false);
  // labels.allowEditAnchor(false);
  // labels.setKey(this.genKey('labels()'));
  // this.addChildControl(labels);
  // this.labels_ = labels;
  //
  // goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
  //     goog.dom.TagName.DIV,
  //     goog.getCssName('anychart-chart-editor-settings-item-separator')));
  //
  // // Ticks
  // var ticks = new anychart.chartEditorModule.settings.Ticks(model);
  // ticks.allowEnabled(true);
  // ticks.allowEditPosition(!this.isRadarPolarAxis);
  // ticks.setKey(this.genKey('ticks()'));
  // this.addChildControl(ticks);
  // this.ticks_ = ticks;
  // //endregion
  //
  // if (!(this.chartType === 'radar' && this.xOrY == 'x')) {
  //   goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
  //       goog.dom.TagName.DIV,
  //       goog.getCssName('anychart-chart-editor-settings-item-separator')));
  //
  //   //region Minor Labels
  //   var minorlabels = new anychart.chartEditorModule.settings.Labels(model);
  //   minorlabels.setName('Minor Labels');
  //   minorlabels.allowEnabled(true);
  //   minorlabels.allowEditPosition(false);
  //   minorlabels.allowEditAnchor(false);
  //   minorlabels.setKey(this.genKey('minorLabels()'));
  //   this.addChildControl(minorlabels);
  //   this.minorLabels_ = minorlabels;
  //
  //   goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
  //       goog.dom.TagName.DIV,
  //       goog.getCssName('anychart-chart-editor-settings-item-separator')));
  //
  //   // Minor Ticks
  //   var minorTicks = new anychart.chartEditorModule.settings.Ticks(model);
  //   minorTicks.setName('Minor Ticks');
  //   minorTicks.allowEnabled(true);
  //   minorTicks.allowEditPosition(!this.isRadarPolarAxis);
  //   minorTicks.setKey(this.genKey('minorTicks()'));
  //   this.addChildControl(minorTicks);
  //   this.minorTicks_ = minorTicks;
  //   //endregion
  // }
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
