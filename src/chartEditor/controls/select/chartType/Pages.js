goog.provide('anychart.chartEditorModule.controls.chartType.Pager');
goog.provide('anychart.chartEditorModule.controls.chartType.Pages');

goog.require('anychart.chartEditorModule.Component');


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.chartEditorModule.Component}
 */
anychart.chartEditorModule.controls.chartType.Pages = function(opt_domHelper) {
  anychart.chartEditorModule.controls.chartType.Pages.base(this, 'constructor', opt_domHelper);

};
goog.inherits(anychart.chartEditorModule.controls.chartType.Pages, anychart.chartEditorModule.Component);


/** @type {string} */
anychart.chartEditorModule.controls.chartType.Pages.CSS_CLASS = goog.getCssName('anychart-chart-editor-chart-type-pages');


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.Pages.prototype.createDom = function() {
  anychart.chartEditorModule.controls.chartType.Pages.base(this, 'createDom');

  this.addClassName(anychart.chartEditorModule.controls.chartType.Pages.CSS_CLASS);

  this.pager_ = new anychart.chartEditorModule.controls.chartType.Pager();
  // this.pager_.numPages(4);
  // this.pager_.currentPage(1);
  this.addChild(this.pager_, true);
};


// /** @inheritDoc */
// anychart.chartEditorModule.controls.chartType.Pages.prototype.enterDocument = function () {
//   anychart.chartEditorModule.controls.chartType.Pages.base(this, 'enterDocument');
// };


/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {anychart.chartEditorModule.Component}
 */
anychart.chartEditorModule.controls.chartType.Pager = function(opt_domHelper) {
  anychart.chartEditorModule.controls.chartType.Pager.base(this, 'constructor', opt_domHelper);

  this.numPages_ = 4;
  this.currentPage_ = 1;
};
goog.inherits(anychart.chartEditorModule.controls.chartType.Pager, anychart.chartEditorModule.Component);


/** @type {string} */
anychart.chartEditorModule.controls.chartType.Pager.CSS_CLASS = goog.getCssName('anychart-chart-editor-pager');


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.Pager.prototype.createDom = function() {
  anychart.chartEditorModule.controls.chartType.Pager.base(this, 'createDom');

  this.addClassName(anychart.chartEditorModule.controls.chartType.Pager.CSS_CLASS);

};


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.Pager.prototype.enterDocument = function() {
  anychart.chartEditorModule.controls.chartType.Pager.base(this, 'enterDocument');
  this.draw();
};


/**
 * Redraws pager dots.
 */
anychart.chartEditorModule.controls.chartType.Pager.prototype.draw = function() {
  var element = this.getElement();
  var dom = this.getDomHelper();

  dom.removeChildren(element);
  for (var i = 0; i < this.numPages_; i++) {
    dom.appendChild(element, dom.createDom(goog.dom.TagName.DIV, i == this.currentPage_ ? 'current' : ''));
  }
};
