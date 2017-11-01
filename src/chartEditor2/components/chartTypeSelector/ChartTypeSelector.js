goog.provide('anychart.chartEditor2Module.ChartTypeSelector');

goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.GeoDataInputs');
goog.require('anychart.chartEditor2Module.PlotPanel');
goog.require('anychart.chartEditor2Module.controls.select.DataField');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelectMenuCaption');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem');
goog.require('anychart.chartEditor2Module.select.ChartType');
goog.require('anychart.ui.Component');
goog.require('goog.ui.Button');
goog.require('goog.ui.MenuItem');



/**
 * Chart type selection widget.
 * Allows to choose chart type and contains PlotPanel widgets.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 *
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.ChartTypeSelector = function(model, opt_domHelper) {
  anychart.chartEditor2Module.ChartTypeSelector.base(this, 'constructor', opt_domHelper);

  this.setModel(model);

  /**
   * @type {Array.<anychart.chartEditor2Module.PlotPanel>}
   * @private
   */
  this.plots_ = [];
  this.geoDataInputs_ = null;

  this.addClassName('anychart-border-box');
  this.addClassName('anychart-chart-data-settings');
};
goog.inherits(anychart.chartEditor2Module.ChartTypeSelector, anychart.chartEditor2Module.Component);


/** @inheritDoc */
anychart.chartEditor2Module.ChartTypeSelector.prototype.createDom = function() {
  anychart.chartEditor2Module.ChartTypeSelector.base(this, 'createDom');

  var caption = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-chart-data-settings-caption', 'Chart Data Settings');
  goog.dom.appendChild(this.getElement(), caption);

  var coreFieldsContainer = new anychart.ui.Component();
  coreFieldsContainer.addClassName('anychart-chart-data-settings-core');
  this.addChild(coreFieldsContainer, true);

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  this.chartTypeSelect_ = new anychart.chartEditor2Module.select.ChartType();
  this.chartTypeSelect_.init(model, [['chart'], 'type'], 'setChartType');
  this.chartTypeSelect_.initOptions(goog.object.getValues(anychart.chartEditor2Module.EditorModel.ChartTypes));
  coreFieldsContainer.addChild(this.chartTypeSelect_, true);

  this.geoDataInputs_ = new anychart.chartEditor2Module.GeoDataInputs(model);
  coreFieldsContainer.addChild(this.geoDataInputs_, true);

  this.coreFieldsContainer_ = coreFieldsContainer;
};


/** @inheritDoc */
anychart.chartEditor2Module.ChartTypeSelector.prototype.update = function(evt) {
  if (evt && !evt.rebuildMapping) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);

  var stackMode = model.getValue([['chart'], ['settings'], 'yScale().stackMode()']);
  this.chartTypeSelect_.setValueByModel({stackMode: stackMode});

  if (this.activeAndFieldSelect_) {
    this.activeAndFieldSelect_.dispose();
    this.activeAndFieldSelect_ = null;
  }

  if (chartType === 'map') {
    this.geoDataInputs_.exclude(false);

    // Data Set select
    this.activeAndFieldSelect_ = new anychart.chartEditor2Module.controls.select.DataField({
      caption: 'Select data set',
      label: 'Data set'
    });
    this.activeAndFieldSelect_.getSelect().init(model, [['dataSettings'], 'field'], 'setActiveAndField');
    this.createDataSetsOptions_();

  } else {
    this.geoDataInputs_.exclude(true);

    // X Values select
    this.activeAndFieldSelect_ = new anychart.chartEditor2Module.controls.select.DataField({
      caption: 'Select field',
      label: 'X Values'
    });

    this.activeAndFieldSelect_.getSelect().init(model, [['dataSettings'], 'field'], 'setActiveAndField');
    this.createActiveAndFieldOptions_();
  }
  this.coreFieldsContainer_.addChild(this.activeAndFieldSelect_, true);
  this.activeAndFieldSelect_.addClassName('anychart-select-with-content');
  this.activeAndFieldSelect_.getSelect().setValueByModel({active: model.getActive()});

  // Plots
  this.removeAllPlots_();

  var dsSettings = model.getValue(['dataSettings']);
  for (var i = 0; i < dsSettings['mappings'].length; i++) {
    var plot = new anychart.chartEditor2Module.PlotPanel(model, i);
    if (i === 0) plot.addClassName('anychart-plot-panel-first');
    this.plots_.push(plot);
    this.addChild(plot, true);
  }

  // TODO: зачем нужно удалять и потом создавать кнопку?
  goog.dispose(this.addPlotBtn_);
  this.addPlotBtn_ = null;

  if (chartType === 'stock') {
    var plotButtonRenderer = /** @type {goog.ui.ButtonRenderer} */(goog.ui.ControlRenderer.getCustomRenderer(
        goog.ui.ButtonRenderer,
        'anychart-chart-data-settings-add-plot-btn'));
    this.addPlotBtn_ = new goog.ui.Button('+ Add Plot', plotButtonRenderer);
    this.addChildAt(this.addPlotBtn_, this.getChildCount(), true);
    this.getHandler().listen(this.addPlotBtn_, goog.ui.Component.EventType.ACTION, this.onAddPlot_);
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.ChartTypeSelector.prototype.enterDocument = function() {
  this.update();

  if (this.addPlotBtn_)
    this.getHandler().listen(this.addPlotBtn_, goog.ui.Component.EventType.ACTION, this.onAddPlot_);

  this.getHandler().listen(/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()),
      anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE, this.update);

  anychart.chartEditor2Module.ChartTypeSelector.base(this, 'enterDocument');
};


/** @inheritDoc */
anychart.chartEditor2Module.ChartTypeSelector.prototype.exitDocument = function() {
  this.removeAllPlots_();
  anychart.chartEditor2Module.ChartTypeSelector.base(this, 'exitDocument');
};


/**
 * Creates options for active and field select with data sets names.
 * Is using in case of map chart type.
 * @private
 */
anychart.chartEditor2Module.ChartTypeSelector.prototype.createDataSetsOptions_ = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var data = model.getPreparedData();
  // dummy field value - will not be used
  var field = model.getValue([['dataSettings'], 'field']);

  for (var i = 0; i < data.length; i++) {
    if (data[i].type == anychart.chartEditor2Module.EditorModel.DataType.GEO)
      continue;

    this.activeAndFieldSelect_.getSelect().addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
      caption:  data[i].title,
      value: field,
      active: data[i].setFullId
    }));
  }
};


/**
 * Creates options for select active data set and it's field.
 * @private
 */
anychart.chartEditor2Module.ChartTypeSelector.prototype.createActiveAndFieldOptions_ = function() {
  var data = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).getPreparedData();
  for (var i = 0; i < data.length; i++) {
    var dataItem = data[i];
    var title = dataItem.title;
    var fields = dataItem.fields;

    this.activeAndFieldSelect_.getSelect().addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuCaption({
      caption: title
    }));

    if (dataItem.type === anychart.chartEditor2Module.EditorModel.DataType.GEO) {
      continue;
    }

    for (var j = 0; j < fields.length; j++) {
      var field = fields[j];
      this.activeAndFieldSelect_.getSelect().addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
        caption: field.name,
        value: field.key,
        active: data[i].setFullId
      }));
    }
  }
};


/**
 * Asks model to add plot.
 * @private
 */
anychart.chartEditor2Module.ChartTypeSelector.prototype.onAddPlot_ = function() {
  /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).addPlot();
};


/** @private */
anychart.chartEditor2Module.ChartTypeSelector.prototype.removeAllPlots_ = function() {
  goog.disposeAll(this.plots_);
  this.plots_ = [];
};
