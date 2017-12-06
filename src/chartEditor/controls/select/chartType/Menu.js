goog.provide('anychart.chartEditorModule.controls.chartType.Menu');
goog.provide('anychart.chartEditorModule.controls.chartType.MenuRenderer');

goog.require('anychart.chartEditorModule.controls.chartType.Filters');
goog.require('anychart.chartEditorModule.controls.chartType.Pages');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuRenderer');



/**
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {goog.ui.MenuRenderer=} opt_renderer
 * @constructor
 * @extends {goog.ui.Menu}
 */
anychart.chartEditorModule.controls.chartType.Menu = function (opt_domHelper, opt_renderer) {
  anychart.chartEditorModule.controls.chartType.Menu.base(this, 'constructor',
      opt_domHelper,
      opt_renderer || anychart.chartEditorModule.controls.chartType.MenuRenderer.getInstance());


};
goog.inherits(anychart.chartEditorModule.controls.chartType.Menu, goog.ui.Menu);


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.Menu.prototype.setVisible = function(show, opt_force, opt_e) {
  if (show) {
    var select = this.getParent();
    var bounds = goog.style.getBounds(select.getElement());
    goog.style.setPosition(this.getElement(), bounds.left);

    // todo: calculate width
    goog.style.setWidth(this.getElement(), /*bounds.width*/ 800);
  }
  return anychart.chartEditorModule.controls.chartType.Menu.base(this, 'setVisible', show, opt_force, opt_e);
};


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.Menu.prototype.enterDocument = function() {
  anychart.chartEditorModule.controls.chartType.Menu.base(this, 'enterDocument');

  this.onFiltersChange();

  this.getHandler().listen(this.getRenderer().getFilters(), goog.ui.Component.EventType.CHANGE, this.onFiltersChange, true);

  this.getHandler().listen(this.getElement(), goog.events.EventType.WHEEL, this.onWheel);
};


/**
 *
 * @param {goog.events.BrowserEvent} evt
 */
anychart.chartEditorModule.controls.chartType.Menu.prototype.onWheel = function(evt) {
  evt.preventDefault();
  evt.stopPropagation();

  var pages = this.getRenderer().getPages();
  pages.switchPage(evt.getBrowserEvent().deltaY > 0);
};


/**
 * Filters checkbox change handler.
 */
anychart.chartEditorModule.controls.chartType.Menu.prototype.onFiltersChange = function() {
  var filters = this.getRenderer().getFilters();
  var filterValues = filters.getValue();

  var pages = this.getRenderer().getPages();
  pages.resetPages();

  var showEverything = !filterValues.length || filters.getChildCount() == filterValues.length;

  for (var i = 0; i < this.getChildCount(); i++) {
    var item = this.getChildAt(i);
    var itemVisible = false;
    if (showEverything)
      itemVisible = true;
    else {
      var itemFilters = item.getModel().filters;
      var joined = goog.array.join(itemFilters, filterValues);
      goog.array.removeDuplicates(joined);
      itemVisible = joined.length < (itemFilters.length + filterValues.length);
    }

    item.setVisible(itemVisible);

    if (itemVisible)
      pages.registerItem(item.getElement());
  }

  pages.updatePages();
};


// region ---- MenuRenderer
/**
 * @param {string=} opt_ariaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.MenuRenderer}
 */
anychart.chartEditorModule.controls.chartType.MenuRenderer = function (opt_ariaRole) {
  anychart.chartEditorModule.controls.chartType.MenuRenderer.base(this, 'constructor', opt_ariaRole);
};
goog.inherits(anychart.chartEditorModule.controls.chartType.MenuRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(anychart.chartEditorModule.controls.chartType.MenuRenderer);


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.MenuRenderer.prototype.createDom = function (container) {
  var element = anychart.chartEditorModule.controls.chartType.MenuRenderer.base(this, 'createDom', container);

  this.filters_ = new anychart.chartEditorModule.controls.chartType.Filters();
  this.filters_.render();
  element.appendChild(this.filters_.getElement());

  this.pages_ = new anychart.chartEditorModule.controls.chartType.Pages();
  this.pages_.render();
  element.appendChild(this.pages_.getElement());

  return element;
};


/**
 * @return {anychart.chartEditorModule.controls.chartType.Filters|null}
 */
anychart.chartEditorModule.controls.chartType.MenuRenderer.prototype.getFilters = function() {
  return this.filters_;
};


/**
 * @return {anychart.chartEditorModule.controls.chartType.Pages|null}
 */
anychart.chartEditorModule.controls.chartType.MenuRenderer.prototype.getPages = function() {
  return this.pages_;
};


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.MenuRenderer.prototype.getContentElement = function(element) {
  return this.pages_ && this.pages_.getElement();
};


/** @inheritDoc */
anychart.chartEditorModule.controls.chartType.MenuRenderer.prototype.getCssClass = function () {
  return 'anychart-chart-editor-select-chart-type-menu';
};
// endregion
