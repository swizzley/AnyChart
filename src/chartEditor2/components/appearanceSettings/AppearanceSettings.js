goog.provide('anychart.chartEditor2Module.AppearanceSettings');

goog.require('anychart.chartEditor2Module.ChartTitlePanel');
goog.require('anychart.chartEditor2Module.ColorScalePanel');
goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.ContextMenuPanel');
goog.require('anychart.chartEditor2Module.CreditsPanel');
goog.require('anychart.chartEditor2Module.DataLabelsPanel');
goog.require('anychart.chartEditor2Module.EditorModel');
goog.require('anychart.chartEditor2Module.GeneralTheming');
goog.require('anychart.chartEditor2Module.GridsPanel');
goog.require('anychart.chartEditor2Module.LegendPanel');
goog.require('anychart.chartEditor2Module.SeriesSettingsPanel');
goog.require('anychart.chartEditor2Module.TooltipPanel');
goog.require('anychart.chartEditor2Module.XAxesPanel');
goog.require('anychart.chartEditor2Module.YAxesPanel');



/**
 * Appearance settings widget.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {anychart.ui.Component} tabs
 * @param {anychart.ui.Component} tabContent
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.AppearanceSettings = function(model, tabs, tabContent, opt_domHelper) {
  anychart.chartEditor2Module.AppearanceSettings.base(this, 'constructor', opt_domHelper);

  this.setModel(model);

  this.panels_ = [
    {classFunc: anychart.chartEditor2Module.ChartTitlePanel, instance: null},
    {classFunc: anychart.chartEditor2Module.LegendPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.DataLabelsPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.SeriesSettingsPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.XAxesPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.YAxesPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.TooltipPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.GridsPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.ColorScalePanel, instance: null},
    {classFunc: anychart.chartEditor2Module.ContextMenuPanel, instance: null},
    {classFunc: anychart.chartEditor2Module.CreditsPanel, instance: null}
  ];

  this.currentPanel_ = 0;

  this.buttons_ = [];

    /**
     * @type {anychart.ui.Component}
     * @private
     */
  this.tabs_ = tabs;

    /**
     * @type {anychart.ui.Component}
     * @private
     */
  this.tabContent_ = tabContent;

  this.addClassName('anychart-appearance-settings')
};
goog.inherits(anychart.chartEditor2Module.AppearanceSettings, anychart.chartEditor2Module.Component);


/** @inheritDoc */
anychart.chartEditor2Module.AppearanceSettings.prototype.enterDocument = function() {
  this.update();
  anychart.chartEditor2Module.AppearanceSettings.base(this, 'enterDocument');
};


/** @inheritDoc */
anychart.chartEditor2Module.AppearanceSettings.prototype.update = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var dom = this.getDomHelper();
  var handler = this.getHandler();
  var panel;
  var button;
  var settings = model.getModel();
  var panelsExcludes = anychart.chartEditor2Module.EditorModel.chartTypes[settings['chart']['type']]['panelsExcludes'];
  var excluded;

  for (var i = 0; i < this.panels_.length; i++) {
    panel = this.panels_[i].instance;
    if (!panel) {
      var classFunc = this.panels_[i].classFunc;
      panel = this.panels_[i].instance = new classFunc(model);
      excluded = panelsExcludes && goog.array.indexOf(panelsExcludes, panel.getStringId()) !== -1;
      panel.exclude(excluded);
      this.tabContent_.addChild(panel, true);

      button = dom.createDom(goog.dom.TagName.DIV, 'button', panel.getName());
      button.setAttribute('data-index', i);
      this.buttons_.push(button);
      this.tabs_.getElement().appendChild(button);
    } else {
      excluded = panelsExcludes && goog.array.indexOf(panelsExcludes, panel.getStringId()) !== -1;
      if (excluded && this.currentPanel_ === i)
        this.currentPanel_ = 0;
      panel.exclude(excluded);
    }
  }

  for (var j = 0; j < this.buttons_.length; j++) {
    panel = this.panels_[j].instance;
    button = this.buttons_[j];
    goog.dom.classlist.enable(button, 'active', this.currentPanel_ == j);
    goog.dom.classlist.enable(button, 'hidden', panel.isExcluded());
    goog.dom.classlist.enable(panel.getElement(), 'hidden', this.currentPanel_ !== j || panel.isExcluded());

    if (!goog.events.hasListener(button, goog.events.EventType.CLICK))
      handler.listen(button, goog.events.EventType.CLICK, this.onClickCategoryButton_);
  }
};


/**
 *
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.AppearanceSettings.prototype.onClickCategoryButton_ = function(evt) {
  var index = Number(evt.currentTarget.getAttribute('data-index'));
  if (this.currentPanel_ != index) {
    this.currentPanel_ = index;

    for (var i = 0; i < this.panels_.length; i++) {
      var panel = this.panels_[i].instance;
      goog.dom.classlist.enable(panel.getElement(), 'hidden', this.currentPanel_ != i);
      goog.dom.classlist.enable(this.buttons_[i], 'active', this.currentPanel_ == i);
    }
  }
};
