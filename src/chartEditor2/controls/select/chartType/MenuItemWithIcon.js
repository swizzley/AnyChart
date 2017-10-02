goog.provide('anychart.chartEditor2.controls.select.MenuItemWithIcon');
goog.provide('anychart.chartEditor2.controls.select.MenuItemWithIconRenderer');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuItemRenderer');


/**
 * @param {Object=} opt_model
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {goog.ui.MenuItemRenderer=} opt_renderer
 * @constructor
 * @extends {goog.ui.MenuItem}
 */
anychart.chartEditor2.controls.select.MenuItemWithIcon = function(opt_model, opt_domHelper, opt_renderer) {
  goog.ui.MenuItem.call(
      this,
      opt_model ? opt_model.caption : '',
      opt_model,
      opt_domHelper,
      opt_renderer || anychart.chartEditor2.controls.select.MenuItemWithIconRenderer.getInstance()
  );
  this.addClassName(anychart.chartEditor2.controls.select.MenuItemWithIcon.CSS_CLASS);
};
goog.inherits(anychart.chartEditor2.controls.select.MenuItemWithIcon, goog.ui.MenuItem);


/**
 * CSS class name.
 * @type {string}
 */
anychart.chartEditor2.controls.select.MenuItemWithIcon.CSS_CLASS = goog.getCssName('anychart-menu-item-with-icon');


/**
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */
anychart.chartEditor2.controls.select.MenuItemWithIconRenderer = function() {
  goog.ui.MenuItemRenderer.call(this);
};
goog.inherits(anychart.chartEditor2.controls.select.MenuItemWithIconRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(anychart.chartEditor2.controls.select.MenuItemWithIconRenderer);


/**
 * Overrides {@link goog.ui.ControlRenderer#createDom} by adding extra markup
 * and stying to the menu item's element if it is selectable or checkable.
 * @param {goog.ui.Control} item Menu item to render.
 * @return {Element} Root element for the item.
 * @override
 */
anychart.chartEditor2.controls.select.MenuItemWithIconRenderer.prototype.createDom = function(item) {
  var element = anychart.chartEditor2.controls.select.MenuItemWithIconRenderer.base(this, 'createDom', item);
  var iconUrl = item.getModel().icon;

  var content = this.getContentElement(element);
  var icon = goog.dom.createDom('img', {'src': iconUrl});
  goog.dom.insertChildAt(content, icon, 0);
  return element;
};


/** @inheritDoc */
anychart.chartEditor2.controls.select.MenuItemWithIconRenderer.prototype.getCssClass = function() {
  return 'anychart-ui-menu-item-with-icon';
};