goog.provide('anychart.chartEditorModule.ColorRangePanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.comboBox.Percentage');
goog.require('anychart.chartEditorModule.controls.LabeledControl');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Labels');
goog.require('anychart.chartEditorModule.settings.Markers');
goog.require('anychart.chartEditorModule.settings.Stroke');
goog.require('anychart.chartEditorModule.settings.Title');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.ColorRangePanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.ColorRangePanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Color Range';

  this.stringId = 'colorRange';

  this.key = [['chart'], ['settings'], 'colorRange()'];
};
goog.inherits(anychart.chartEditorModule.ColorRangePanel, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.ColorRangePanel.CSS_CLASS = goog.getCssName('anychart-settings-panel-color-range');


/** @inheritDoc */
anychart.chartEditorModule.ColorRangePanel.prototype.createDom = function() {
  anychart.chartEditorModule.ColorRangePanel.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.ColorRangePanel.CSS_CLASS);
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  // Orientation
  var orientation = new anychart.chartEditorModule.controls.select.DataField({label: 'Orientation'});
  orientation.getSelect().setOptions([
    {value: 'left', icon: 'ac ac-position-left'},
    {value: 'right', icon: 'ac ac-position-right'},
    {value: 'top', icon: 'ac ac-position-top'},
    {value: 'bottom', icon: 'ac ac-position-bottom'}
  ]);
  orientation.init(model, this.genKey('orientation()'));
  this.addLabeledControl(orientation);

  // Align
  var align = new anychart.chartEditorModule.controls.select.DataField({label: 'Align'});
  align.getSelect().setOptions([
    {value: 'left', icon: 'ac ac-position-left'},
    {value: 'center', icon: 'ac ac-position-center'},
    {value: 'right', icon: 'ac ac-position-right'}
  ]);
  align.init(model, this.genKey('align()'));
  this.addLabeledControl(align);

  // Color Line Size
  var colorLineSize = new anychart.chartEditorModule.comboBox.Base();
  colorLineSize.setOptions([5, 10, 15, 20, 30]);
  colorLineSize.setRange(0, 100);
  var colorLineSizeLC = new anychart.chartEditorModule.controls.LabeledControl(colorLineSize, 'Color Line Size');
  colorLineSizeLC.init(model, this.genKey('colorLineSize()'));
  this.addLabeledControl(colorLineSizeLC);

  // Length
  var length = new anychart.chartEditorModule.comboBox.Percentage();
  length.setOptions([20, 50, 80, 100]);
  var lengthLC = new anychart.chartEditorModule.controls.LabeledControl(length, 'Length');
  lengthLC.init(model, this.genKey('length()'));
  this.addLabeledControl(lengthLC);

  // Stroke
  var stroke = new anychart.chartEditorModule.settings.Stroke(model, 'Stroke');
  stroke.setKey(this.genKey('stroke()'));
  this.addLabeledControl(stroke);

  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  // Marker
  var marker = new anychart.chartEditorModule.settings.Markers(model);
  marker.setName('Marker');
  marker.allowEnabled(true);
  marker.setKey(this.genKey('marker()'));
  this.addLabeledControl(marker);

  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  // Labels
  var labels = new anychart.chartEditorModule.settings.Labels(model);
  labels.allowEnabled(true);
  labels.allowEditPosition(false);
  labels.allowEditAnchor(false);
  labels.setKey(this.genKey('labels()'));
  this.addLabeledControl(labels);

  var drawFirstLabel = new anychart.chartEditorModule.checkbox.Base();
  drawFirstLabel.setCaption('Draw First Label');
  drawFirstLabel.init(model, this.genKey('drawFirstLabel()'));
  labels.addLabeledControl(drawFirstLabel);

  var drawLastLabel = new anychart.chartEditorModule.checkbox.Base();
  drawLastLabel.setCaption('Draw Last Label');
  drawLastLabel.init(model, this.genKey('drawLastLabel()'));
  labels.addLabeledControl(drawLastLabel);

  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator-gaps')));

  // Title
  var title = new anychart.chartEditorModule.settings.Title(model, 'Title');
  title.allowEnabled(true);
  title.allowEditPosition(false);
  title.allowEditAlign(false);
  title.setKey(this.genKey('title()'));
  this.addLabeledControl(title);
};
