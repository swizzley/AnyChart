goog.provide('anychart.chartEditor2Module.steps.SetupChart');

goog.require('anychart.chartEditor2Module.Chart');
goog.require('anychart.chartEditor2Module.ChartTypeSelector');
goog.require('anychart.chartEditor2Module.DataSetPanelList');
goog.require('anychart.chartEditor2Module.events');
goog.require('anychart.chartEditor2Module.steps.Base');
goog.require('goog.dom.classlist');
goog.require('goog.format.JsonPrettyPrinter');

goog.forwardDeclare('anychart.data.Mapping');


/**
 * Chart Editor Step Class.
 * @constructor
 * @param {number} index Step index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.chartEditor2Module.steps.Base}
 */
anychart.chartEditor2Module.steps.SetupChart = function (index, opt_domHelper) {
    anychart.chartEditor2Module.steps.SetupChart.base(this, 'constructor', index, opt_domHelper);

    this.name('Setup Chart');
    this.title('Setup Chart');
    this.addClassName('anychart-setup-chart-step');
};
goog.inherits(anychart.chartEditor2Module.steps.SetupChart, anychart.chartEditor2Module.steps.Base);


/** @inheritDoc */
anychart.chartEditor2Module.steps.SetupChart.prototype.createDom = function () {
    anychart.chartEditor2Module.steps.SetupChart.base(this, 'createDom');
    var editor = /** @type {anychart.chartEditor2Module.Editor} */(this.getParent());
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(editor.getModel());

    // connected data sets section
    var connectedDataSets = new anychart.chartEditor2Module.DataSetPanelList(model);
    this.addChild(connectedDataSets, true);

    // user data and predefined data sets sections wrapper
    var wrapper = new anychart.ui.Component();
    wrapper.addClassName('anychart-prepare-data-step-wrapper');
    this.addChild(wrapper, true);

    var chartDataSettings = new anychart.chartEditor2Module.ChartTypeSelector(model);
    wrapper.addChild(chartDataSettings, true);

    var chartPreview = new anychart.ui.Component();
    chartPreview.addClassName('anychart-border-box');
    chartPreview.addClassName('anychart-chart-preview');
    wrapper.addChild(chartPreview, true);

    this.chartWrapperEl_ = chartPreview.getElement();

    var caption = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-chart-preview-caption', 'Chart Preview');
    goog.dom.appendChild(this.chartWrapperEl_, caption);
};


/** @inheritDoc */
anychart.chartEditor2Module.steps.SetupChart.prototype.enterDocument = function () {
    anychart.chartEditor2Module.steps.SetupChart.base(this, 'enterDocument');

    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(/** @type {anychart.chartEditor2Module.Editor} */(this.getParent()).getModel());
    this.chart_ = new anychart.chartEditor2Module.Chart(model);
    this.addChild(this.chart_, true);
    this.getDomHelper().appendChild(this.chartWrapperEl_, this.chart_.getElement());
};


/** @inheritDoc */
anychart.chartEditor2Module.steps.SetupChart.prototype.exitDocument = function () {
    anychart.chartEditor2Module.steps.SetupChart.base(this, 'exitDocument');

    if (this.chart_) {
        this.removeChild(this.chart_, true);
        this.chart_.dispose();
        this.chart_ = null;
    }
};
