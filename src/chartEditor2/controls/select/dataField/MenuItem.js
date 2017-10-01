goog.provide('anychart.chartEditor2.controls.select.DataFieldSelectMenuItem');
goog.provide('anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.MenuItemRenderer');


/**
 * @param {Object=} opt_model
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {goog.ui.MenuItemRenderer=} opt_renderer
 * @constructor
 * @extends {goog.ui.MenuItem}
 */
anychart.chartEditor2.controls.select.DataFieldSelectMenuItem = function(opt_model, opt_domHelper, opt_renderer) {
    goog.ui.MenuItem.call(
        this,
        opt_model ? opt_model.caption : '',
        opt_model,
        opt_domHelper,
        opt_renderer || anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer.getInstance()
    );
};
goog.inherits(anychart.chartEditor2.controls.select.DataFieldSelectMenuItem, goog.ui.MenuItem);


/**
 * @constructor
 * @extends {goog.ui.MenuItemRenderer}
 */
anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer = function() {
    goog.ui.MenuItemRenderer.call(this);
};
goog.inherits(anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer, goog.ui.MenuItemRenderer);
goog.addSingletonGetter(anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer);


/**
 * Overrides {@link goog.ui.ControlRenderer#createDom} by adding extra markup
 * and stying to the menu item's element if it is selectable or checkable.
 * @param {goog.ui.Control} item Menu item to render.
 * @return {Element} Root element for the item.
 * @override
 */
anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer.prototype.createDom = function(item) {
    var element = anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer.base(this, 'createDom', item);

    return element;
};


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataFieldSelectMenuItemRenderer.prototype.getCssClass = function() {
    return 'anychart-select-data-field-menu-item';
};