goog.provide('anychart.chartEditorModule.settings.Axis');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.SettingsPanelIndexed');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Labels');
goog.require('anychart.chartEditorModule.settings.Stagger');
goog.require('anychart.chartEditorModule.settings.Ticks');
goog.require('anychart.chartEditorModule.settings.Title');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {string} xOrY
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanelIndexed}
 */
anychart.chartEditorModule.settings.Axis = function(model, xOrY, index, opt_domHelper) {
  anychart.chartEditorModule.settings.Axis.base(this, 'constructor', model, index, null, opt_domHelper);

  var chartType = model.getModel()['chart']['type'];
  this.chartType = chartType;
  this.isRadarPolarAxis = chartType === 'radar' || chartType === 'polar';
  this.isSingleAxis = this.isRadarPolarAxis;
  this.axisExists = this.isSingleAxis;

  this.xOrY = xOrY;
  this.name = this.xOrY + 'Axis(' + (this.isSingleAxis ? '' : this.index_) + ')';
  this.key = [['chart'], ['settings'], this.xOrY + 'Axis(' + (this.isSingleAxis ? '' : this.index_) + ')'];

  this.addClassName(goog.getCssName('anychart-settings-panel-axis-single'));
};
goog.inherits(anychart.chartEditorModule.settings.Axis, anychart.chartEditorModule.SettingsPanelIndexed);


/** @override */
anychart.chartEditorModule.settings.Axis.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Axis.base(this, 'createDom');

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  var wrapper = new anychart.chartEditorModule.SettingsPanel(model);
  wrapper.setName(null);
  wrapper.addClassName('anychart-settings-panel');
  wrapper.addClassName('anychart-settings-panel-wrapper');
  this.addChild(wrapper, true);

  var invertedCheckbox = new anychart.chartEditorModule.checkbox.Base();
  invertedCheckbox.setCaption('Inverted');
  wrapper.addChild(invertedCheckbox, true);
  this.inverted_ = invertedCheckbox;

  if (!this.isRadarPolarAxis) {
    var orientation = new anychart.chartEditorModule.controls.select.DataField({label: 'Orientation'});
    orientation.getSelect().setOptions([
      {value: 'left', icon: 'ac ac-position-left'},
      {value: 'right', icon: 'ac ac-position-right'},
      {value: 'top', icon: 'ac ac-position-top'},
      {value: 'bottom', icon: 'ac ac-position-bottom'}
    ]);
    wrapper.addChild(orientation, true);
    this.orientation_ = orientation;

    goog.dom.appendChild(content, goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-separator')));

    // Stagger settings
    var staggerSettings = new anychart.chartEditorModule.settings.Stagger(model);
    staggerSettings.setKey(this.getKey());
    wrapper.addChildControl(staggerSettings);

    goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-separator')));

    // Overlap mode
    var overlapMode = new anychart.chartEditorModule.controls.select.DataField({label: 'Labels Overlap'});
    overlapMode.getControl().setOptions([
      {value: 'allow-overlap', caption: 'Overlap'},
      {value: 'no-overlap', caption: 'No overlap'}
    ]);
    overlapMode.init(model, this.genKey('overlapMode()'));
    wrapper.addChildControl(overlapMode);

    var title = new anychart.chartEditorModule.settings.Title(model, 'Title');
    title.allowEditPosition(false, this.xOrY === 'x' ? 'bottom' : 'left');
    title.setKey(this.genKey('title()')); // This is for enabled working sake!
    this.addChild(title, true);
    this.title_ = title;

    goog.dom.appendChild(content, goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-separator')));
  }

  //region Labels
  var labels = new anychart.chartEditorModule.settings.Labels(model);
  labels.allowEnabled(true);
  labels.allowEditPosition(false);
  labels.allowEditAnchor(false);
  labels.setKey(this.genKey('labels()'));
  this.addChildControl(labels);
  this.labels_ = labels;

  goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  // Ticks
  var ticks = new anychart.chartEditorModule.settings.Ticks(model);
  ticks.allowEnabled(true);
  ticks.allowEditPosition(!this.isRadarPolarAxis);
  ticks.setKey(this.genKey('ticks()'));
  this.addChildControl(ticks);
  this.ticks_ = ticks;
  //endregion

  if (!(this.chartType === 'radar' && this.xOrY == 'x')) {
    goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-separator')));

    //region Minor Labels
    var minorlabels = new anychart.chartEditorModule.settings.Labels(model);
    minorlabels.setName('Minor Labels');
    minorlabels.allowEnabled(true);
    minorlabels.allowEditPosition(false);
    minorlabels.allowEditAnchor(false);
    minorlabels.setKey(this.genKey('minorLabels()'));
    this.addChildControl(minorlabels);
    this.minorLabels_ = minorlabels;

    goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-separator')));

    // Minor Ticks
    var minorTicks = new anychart.chartEditorModule.settings.Ticks(model);
    minorTicks.setName('Minor Ticks');
    minorTicks.allowEnabled(true);
    minorTicks.allowEditPosition(!this.isRadarPolarAxis);
    minorTicks.setKey(this.genKey('minorTicks()'));
    this.addChildControl(minorTicks);
    this.minorTicks_ = minorTicks;
    //endregion
  }
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Axis.prototype.updateKeys = function() {
  anychart.chartEditorModule.settings.Axis.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  if (this.orientation_) this.orientation_.init(model, this.genKey('orientation()'));
  if (this.inverted_) this.inverted_.init(model, [['chart'], ['settings'], this.xOrY + 'Scale().inverted()']);
  if (this.title_) this.title_.setKey(this.genKey('title()'));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Axis.prototype.onChartDraw = function(evt) {
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  this.getHandler().listenOnce(model, anychart.chartEditorModule.events.EventType.CHART_DRAW, this.onChartDraw);
  if (this.isExcluded()) return;

  var chart = evt.chart;
  if (!this.isSingleAxis && !this.axisExists) {
    this.axisExists = (this.xOrY === 'x' ? chart.getXAxesCount() : chart.getYAxesCount()) > this.index_;
    this.title_.exclude(!this.axisExists);

    this.labels_.exclude(!this.axisExists);
    this.ticks_.exclude(!this.axisExists);

    if (this.minorLabels_)
      this.minorLabels_.exclude(!this.axisExists);

    if (this.minorTicks_)
      this.minorTicks_.exclude(!this.axisExists);
  }

  if (evt.rebuild && this.axisExists) {
    this.enableContentCheckbox.setValueByTarget(chart);
    this.setContentEnabled(this.enableContentCheckbox.isChecked());

    if (this.orientation_) this.orientation_.getSelect().setValueByTarget(chart);
    if (this.inverted_) this.inverted_.setValueByTarget(chart);
  } else {
    this.setContentEnabled(false);
  }
};


/** @override */
anychart.chartEditorModule.settings.Axis.prototype.disposeInternal = function() {
  goog.disposeAll([this.inverted_, this.orientation_, this.title_]);
  this.orientation_ = null;
  this.inverted_ = null;
  this.title_ = null;

  anychart.chartEditorModule.settings.Axis.base(this, 'disposeInternal');
};
