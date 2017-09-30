goog.provide('anychart.chartEditor2Module.ChartTypeSelector');

goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.GeoDataInputs');
goog.require('anychart.chartEditor2Module.PlotPanel');
goog.require('anychart.chartEditor2Module.select.ChartType');
goog.require('anychart.chartEditor2Module.select.SelectWithLabel');
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

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  this.chartTypeSelect_ = new anychart.chartEditor2Module.select.ChartType();
  this.chartTypeSelect_.init(model, [['chart'], 'type'], 'setChartType');
  this.chartTypeSelect_.initOptions(goog.object.getValues(anychart.chartEditor2Module.EditorModel.chartTypes));
  this.addChild(this.chartTypeSelect_, true);

  this.geoDataInputs_ = new anychart.chartEditor2Module.GeoDataInputs(/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()));
  this.addChild(this.geoDataInputs_, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.ChartTypeSelector.prototype.update = function(evt) {
  if (evt && !evt.rebuildMapping) return;

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var stackMode = model.getValue([['chart'], ['settings'], 'yScale().stackMode()']);
  this.chartTypeSelect_.setValueByModel({stackMode: stackMode});

  if (this.activeAndFieldSelect_) {
    this.removeChild(this.activeAndFieldSelect_, true);
    this.activeAndFieldSelect_.dispose();
    this.activeAndFieldSelect_ = null;
  }

  if (chartType === 'map') {
    this.geoDataInputs_.show();
    this.geoDataInputs_.update();

    // Dataset select
    this.activeAndFieldSelect_ = new anychart.chartEditor2Module.select.SelectWithLabel('x', 'Data set');
    this.activeAndFieldSelect_.init(model, [['dataSettings'], 'field'], 'setActiveAndField');
    this.addChild(this.activeAndFieldSelect_, true);

    this.createDataSetsOptions_();
    this.activeAndFieldSelect_.setValueByModel({active: model.getActive()});

  } else {
    this.geoDataInputs_.hide();

    // X Values select
    this.activeAndFieldSelect_ = new anychart.chartEditor2Module.select.SelectWithLabel('x', 'X Values');
    this.activeAndFieldSelect_.init(model, [['dataSettings'], 'field'], 'setActiveAndField');
    this.addChild(this.activeAndFieldSelect_, true);

    this.createActiveAndFieldOptions_();
    this.activeAndFieldSelect_.setValueByModel({active: model.getActive()});
  }
  goog.dom.classlist.add(this.activeAndFieldSelect_.getElement(), 'x-value-select');

  // Plots
  this.removeAllPlots_();

  var dsSettings = model.getValue(['dataSettings']);
  for (var i = 0; i < dsSettings['mappings'].length; i++) {
    var plot = new anychart.chartEditor2Module.PlotPanel(/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()), i);
    this.plots_.push(plot);
    this.addChild(plot, true);
  }

  if (this.addPlotBtn_) {
    // Убрать старую кнопку
    this.getHandler().unlisten(this.addPlotBtn_, goog.ui.Component.EventType.ACTION, this.onAddPlot_);
    this.removeChild(this.addPlotBtn_, true);
    this.addPlotBtn_.dispose();
    this.addPlotBtn_ = null;
  }

  if (chartType == 'stock') {
    this.addPlotBtn_ = new goog.ui.Button('Add plot');
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
  for (var a = this.activeAndFieldSelect_.getItemCount(); a--;) {
    this.activeAndFieldSelect_.removeItemAt(a);
  }

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var data = model.getPreparedData();
  // dummy field value - will not be used
  var field = model.getValue([['dataSettings'], 'field']);

  for (var i = 0; i < data.length; i++) {
    if (data[i].type == anychart.chartEditor2Module.EditorModel.dataType.GEO)
      continue;

    var caption = data[i].title;
    var item = new goog.ui.MenuItem(caption, {value: field, active: data[i].setFullId});
    this.activeAndFieldSelect_.addItem(item);
  }

  this.activeAndFieldSelect_.updateOptions();
};


/**
 * Creates options for select active data set and it's field.
 * @private
 */
anychart.chartEditor2Module.ChartTypeSelector.prototype.createActiveAndFieldOptions_ = function() {
  for (var a = this.activeAndFieldSelect_.getItemCount(); a--;) {
    this.activeAndFieldSelect_.removeItemAt(a);
  }

  var data = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).getPreparedData();
  for (var i = 0; i < data.length; i++) {
    if (data[i].type == anychart.chartEditor2Module.EditorModel.dataType.GEO)
      continue;

    var fields = data[i].fields;
    for (var j = 0; j < fields.length; j++) {
      var caption = data.length == 1 ? fields[j].name : data[i].title + ' - ' + fields[j].name;
      var setFullId = data[i].setFullId;
      var item = new goog.ui.MenuItem(caption, {value: fields[j].key, active: setFullId});
      this.activeAndFieldSelect_.addItem(item);
    }
  }

  this.activeAndFieldSelect_.updateOptions();
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
  for (var i = 0; i < this.plots_.length; i++) {
    this.removeChild(this.plots_[i], true);
    this.plots_[i].dispose();
  }
  this.plots_.length = 0;
};
