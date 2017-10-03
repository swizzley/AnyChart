goog.provide('anychart.chartEditor2Module.DataSetPanelList');

goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.DataSetPanel');
goog.require('anychart.chartEditor2Module.EditorModel');
goog.require('anychart.chartEditor2Module.dataSetPanelList.Intro');
goog.require('anychart.ui.Component');


/**
 * List of data set panels on SetupChart step.
 *
 * @param {anychart.chartEditor2Module.EditorModel} dataModel
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.DataSetPanelList = function(dataModel, opt_domHelper) {
  anychart.chartEditor2Module.DataSetPanelList.base(this, 'constructor', opt_domHelper);

  this.panels_ = [];
  this.setModel(dataModel);
  this.addClassName('anychart-border-box');
  this.addClassName('anychart-connected-data-sets');

};
goog.inherits(anychart.chartEditor2Module.DataSetPanelList, anychart.chartEditor2Module.Component);


/** @inheritDoc */
anychart.chartEditor2Module.DataSetPanelList.prototype.enterDocument = function() {
  anychart.chartEditor2Module.DataSetPanelList.base(this, 'enterDocument');
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  this.update();
  this.getHandler().listen(model, anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE, this.update);
};


/** @param {Object=} opt_evt */
anychart.chartEditor2Module.DataSetPanelList.prototype.update = function(opt_evt) {
  var active = this.getModel().getActive();
  var activeGeo = this.getModel().getActiveGeo();
  var data = this.getModel().getPreparedData();

  // clear all content
  this.removeChildren(true);
  goog.disposeAll(this.panels_);
  this.panels_ = [];

  // add caption
  var caption = new anychart.ui.Component();
  caption.addClassName('anychart-connected-data-sets-caption');
  this.addChild(caption, true);

  // todo: rework this hack!!
  caption.getElement().innerHTML = 'Connected Data Sets';

  // add data sets or intro
  var step = /** @type {anychart.chartEditor2Module.steps.Base} */(this.getParent());
  if (data.length) {
    for (var i = 0; i < data.length; i++) {
      if (step.getIndex() === 1 || data[i].type !== anychart.chartEditor2Module.EditorModel.DataType.GEO) {
        var panel = new anychart.chartEditor2Module.DataSetPanel(data[i]);
        this.panels_.push(panel);
        this.addChild(panel, true);

        panel.setDisabled(step.getIndex() === 0 || this.panels_[i].getSetFullId() !== active);

        if (data[i].type === anychart.chartEditor2Module.EditorModel.DataType.GEO)
          this.panels_[i].setActiveGeo(this.panels_[i].getSetFullId() === activeGeo);
      }
    }
  } else {
    var intro = new anychart.chartEditor2Module.dataSetPanelList.Intro();
    this.addChild(intro, true);
  }
};
