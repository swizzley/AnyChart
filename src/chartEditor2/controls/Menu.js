goog.provide('anychart.chartEditor2Module.controls.Menu');
goog.provide('anychart.chartEditor2Module.controls.MenuRenderer');

goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuRenderer');



// region ---- DataFieldMenu
/**
 * @param {string=} opt_additionalClassName
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {goog.ui.MenuRenderer=} opt_renderer
 * @constructor
 * @extends {goog.ui.Menu}
 */
anychart.chartEditor2Module.controls.Menu = function (opt_additionalClassName, opt_domHelper, opt_renderer) {
  anychart.chartEditor2Module.controls.Menu.base(this, 'constructor',
      opt_domHelper,
      opt_renderer || anychart.chartEditor2Module.controls.MenuRenderer.getInstance());

  /**
   * @type {string}
   */
  this.additionalClassName = opt_additionalClassName || '';
};
goog.inherits(anychart.chartEditor2Module.controls.Menu, goog.ui.Menu);


/** @inheritDoc */
anychart.chartEditor2Module.controls.Menu.prototype.setVisible = function(show, opt_force, opt_e) {
  if (show) {
    var chartSelect = this.getParent();
    var size = goog.style.getSize(chartSelect.getElement());
    goog.style.setWidth(this.getElement(), size.width);
  }
  return anychart.chartEditor2Module.controls.Menu.base(this, 'setVisible', show, opt_force, opt_e);
};
// endregion


// region ---- DataFieldMenuRenderer
/**
 * @param {string=} opt_ariaRole Optional ARIA role used for the element.
 * @constructor
 * @extends {goog.ui.MenuRenderer}
 */
anychart.chartEditor2Module.controls.MenuRenderer = function (opt_ariaRole) {
  anychart.chartEditor2Module.controls.MenuRenderer.base(this, 'constructor', opt_ariaRole);
};
goog.inherits(anychart.chartEditor2Module.controls.MenuRenderer, goog.ui.MenuRenderer);
goog.addSingletonGetter(anychart.chartEditor2Module.controls.MenuRenderer);


/** @inheritDoc */
anychart.chartEditor2Module.controls.MenuRenderer.prototype.createDom = function(container) {
  container = /** @type {anychart.chartEditor2Module.controls.Menu} */(container);
  var element = anychart.chartEditor2Module.controls.MenuRenderer.base(this, 'createDom', container);
  if (container.additionalClassName) goog.dom.classlist.add(element, container.additionalClassName);
  return element;
};


/** @inheritDoc */
anychart.chartEditor2Module.controls.MenuRenderer.prototype.getCssClass = function () {
  return 'anychart-control-menu';
};
// endregion
