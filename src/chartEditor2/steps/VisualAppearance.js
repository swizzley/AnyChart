goog.provide('anychart.chartEditor2Module.steps.VisualAppearance');

goog.require('anychart.chartEditor2Module.AppearanceSettings');
goog.require('anychart.chartEditor2Module.Chart');
goog.require('anychart.chartEditor2Module.GeneralSettings');
goog.require('anychart.chartEditor2Module.events');
goog.require('anychart.chartEditor2Module.steps.Base');
goog.require('goog.dom.classlist');



/**
 * Chart Editor Step Class.
 * @constructor
 * @param {number} index Step index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.chartEditor2Module.steps.Base}
 */
anychart.chartEditor2Module.steps.VisualAppearance = function(index, opt_domHelper) {
  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'constructor', index, opt_domHelper);

  this.name('Visual Appearance');
  this.title('Visual Appearance');
};
goog.inherits(anychart.chartEditor2Module.steps.VisualAppearance, anychart.chartEditor2Module.steps.Base);


/** @inheritDoc */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.createDom = function() {
  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'createDom');

  var element = /** @type {Element} */(this.getElement());
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(/** @type {anychart.chartEditor2Module.Editor} */(this.getParent()).getModel());

  goog.dom.classlist.add(element, 'step-visual-appearance');
  
  this.appearanceSettings_ = new anychart.chartEditor2Module.AppearanceSettings(model);
  this.addChild(this.appearanceSettings_, true);

  // this.generalSettings_ = new anychart.chartEditor2Module.GeneralSettings(model);
  // this.addChild(this.generalSettings_, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.enterDocument = function() {
  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'enterDocument');

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(/** @type {anychart.chartEditor2Module.Editor} */(this.getParent()).getModel());
  this.chart_ = new anychart.chartEditor2Module.Chart(model);
  this.addChildAt(this.chart_, 0, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.steps.VisualAppearance.prototype.exitDocument = function() {
  anychart.chartEditor2Module.steps.VisualAppearance.base(this, 'exitDocument');

  if (this.chart_) {
    this.removeChild(this.chart_, true);
    this.chart_.dispose();
    this.chart_ = null;
  }
};
