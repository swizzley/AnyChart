goog.provide('anychart.chartEditor2Module.PlotPanel');

goog.require('anychart.chartEditor2Module.ComponentWithKey');
goog.require('anychart.chartEditor2Module.SeriesPanel');
goog.require('anychart.chartEditor2Module.select.SelectWithLabel');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');



/**
 * Plot panel on Setup chart step.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.ComponentWithKey}
 */
anychart.chartEditor2Module.PlotPanel = function(model, index, opt_domHelper) {
  anychart.chartEditor2Module.PlotPanel.base(this, 'constructor', model, opt_domHelper);

  /**
   * @type {number}
   * @private
   */
  this.index_ = index;

  /**
   * @type {Array.<anychart.chartEditor2Module.SeriesPanel>}
   * @private
   */
  this.series_ = [];
};
goog.inherits(anychart.chartEditor2Module.PlotPanel, anychart.chartEditor2Module.ComponentWithKey);


/** @inheritDoc */
anychart.chartEditor2Module.PlotPanel.prototype.createDom = function() {
  anychart.chartEditor2Module.PlotPanel.base(this, 'createDom');

  var dom = this.getDomHelper();
  this.chartType_ = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).getValue([['chart'], 'type']);

  goog.dom.classlist.add(this.getElement(), 'plot-panel');
  goog.dom.classlist.add(this.getElement(), 'plot-panel-' + this.chartType_);
  goog.dom.classlist.add(this.getElement(), 'closable');

  if (this.chartType_ == 'stock' && this.index_ > 0) {
    this.close_ = dom.createDom(goog.dom.TagName.DIV, 'close', 'X');
    this.getElement().appendChild(this.close_);
  }

  this.title_ = dom.createDom(goog.dom.TagName.H2, 'title', 'Plot ' + (this.index_ + 1));
  this.getElement().appendChild(this.title_);
};


/** @inheritDoc */
anychart.chartEditor2Module.PlotPanel.prototype.update = function(evt) {
  if (evt && !evt.rebuildMapping) return;

  // Series
  this.removeAllSeries_();

  var plotModel = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).getValue([['dataSettings'], ['mappings', this.index_]]);
  for (var i = 0; i < plotModel.length; i++) {
    var series = new anychart.chartEditor2Module.SeriesPanel(/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()), i);
    this.series_.push(series);
    this.addChild(series, true);
  }

  if (this.addSeriesBtn_) {
    // Убрать старую кнопку
    this.getHandler().unlisten(this.addSeriesBtn_, goog.ui.Component.EventType.ACTION, this.onAddSeries_);
    this.removeChild(this.addSeriesBtn_, true);
    this.addSeriesBtn_.dispose();
    this.addSeriesBtn_ = null;
  }

  var chartType = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).getValue([['chart'], 'type']);
  var singleSeries = !!anychart.chartEditor2Module.EditorModel.chartTypes[chartType]['singleSeries'];
  if (!singleSeries) {
    this.addSeriesBtn_ = new goog.ui.Button('Add series');
    this.addChildAt(this.addSeriesBtn_, this.getChildCount(), true);
    this.getHandler().listen(this.addSeriesBtn_, goog.ui.Component.EventType.ACTION, this.onAddSeries_);
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.PlotPanel.prototype.enterDocument = function() {
  if (this.close_)
    this.getHandler().listen(this.close_, goog.events.EventType.CLICK, function() {
      /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).dropPlot(this.index_);
    });

  anychart.chartEditor2Module.PlotPanel.base(this, 'enterDocument');
};


/** @inheritDoc */
anychart.chartEditor2Module.PlotPanel.prototype.exitDocument = function() {
  this.removeAllSeries_();
  anychart.chartEditor2Module.PlotPanel.base(this, 'exitDocument');
};


/**
 * Asks model to add series.
 * @private
 */
anychart.chartEditor2Module.PlotPanel.prototype.onAddSeries_ = function() {
  /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).addSeries(this.index_);
};


/**
 * Removes all series panels elements from panel.
 * @private
 */
anychart.chartEditor2Module.PlotPanel.prototype.removeAllSeries_ = function() {
  for (var i = 0; i < this.series_.length; i++) {
    this.removeChild(this.series_[i], true);
    this.series_[i].dispose();
  }
  this.series_.length = 0;
};


/**
 * Getter/setter for index.
 *
 * @param {number=} opt_value
 * @return {number|anychart.chartEditor2Module.PlotPanel}
 */
anychart.chartEditor2Module.PlotPanel.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNumber(opt_value)) {
      this.index_ = opt_value;
      this.title_.innerHTML = 'Plot ' + (this.index_ + 1);
    }
    return this;
  }
  return this.index_;
};


/** @inheritDoc */
anychart.chartEditor2Module.PlotPanel.prototype.dispose = function() {
  this.removeAllSeries_();
  anychart.chartEditor2Module.PlotPanel.base(this, 'dispose');
};


/** @inheritDoc */
anychart.chartEditor2Module.PlotPanel.prototype.getKey = function(opt_completion) {
  if (!this.key)
    this.key = [['plot', this.index()]];
  return anychart.chartEditor2Module.PlotPanel.base(this, 'getKey', opt_completion);
};
