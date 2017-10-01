goog.provide('anychart.chartEditor2.controls.select.SelectWithIcon');
goog.provide('anychart.chartEditor2.controls.select.SelectWithIconRenderer');

goog.require('anychart.chartEditor2Module.select.Base');
goog.require('goog.ui.ButtonRenderer');


/**
 * @param {goog.ui.ControlContent=} opt_caption
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @constructor
 * @extends {anychart.chartEditor2Module.select.Base}
 */
anychart.chartEditor2.controls.select.SelectWithIcon = function(opt_caption, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer) {
  anychart.chartEditor2Module.select.Base.call(
      this,
      opt_caption,
      opt_menu,
      opt_renderer || anychart.chartEditor2.controls.select.SelectWithIconRenderer.getInstance(),
      opt_domHelper,
      opt_menuRenderer
  );
};
goog.inherits(anychart.chartEditor2.controls.select.SelectWithIcon, anychart.chartEditor2Module.select.Base);

/** @type {string} */
anychart.chartEditor2.controls.select.SelectWithIcon.CSS_CLASS = goog.getCssName('anychart-ui-select-with-icon');


/** @inheritDoc */
anychart.chartEditor2.controls.select.SelectWithIcon.prototype.handleSelectionChange = function(e) {
  anychart.chartEditor2.controls.select.SelectWithIcon.base(this, 'handleSelectionChange', e);
  var renderer = /** @type {anychart.chartEditor2.controls.select.SelectWithIconRenderer} */(this.getRenderer());
  renderer.updateIcon(this);
};


// region ---- SelectWithIconRenderer
/**
 * @constructor
 * @extends {goog.ui.ButtonRenderer}
 */
anychart.chartEditor2.controls.select.SelectWithIconRenderer = function() {
  goog.ui.ButtonRenderer.call(this);
};
goog.inherits(anychart.chartEditor2.controls.select.SelectWithIconRenderer, goog.ui.ButtonRenderer);
goog.addSingletonGetter(anychart.chartEditor2.controls.select.SelectWithIconRenderer);


/** @inheritDoc */
anychart.chartEditor2.controls.select.SelectWithIconRenderer.prototype.createDom = function(control) {
  var selectedItem = control.getSelectedItem();
  var icon = control.getDomHelper().createDom(goog.dom.TagName.IMG);
  var element = control.getDomHelper().createDom(goog.dom.TagName.DIV, this.getClassNames(control).join(' '), [
    icon,
    control.getDomHelper().createDom(goog.dom.TagName.SPAN, '', control.getContent())
  ]);

  if (selectedItem) {
    var model = selectedItem.getModel();
    goog.dom.setProperties(icon, {'src': model.icon});
  } else {
    goog.style.setElementShown(icon, false);
  }

  return element;
};


/** @inheritDoc */
anychart.chartEditor2.controls.select.SelectWithIconRenderer.prototype.getContentElement = function(element) {
  if (element) {
    return goog.dom.getElementsByTagName(goog.dom.TagName.SPAN, element)[0];
  }
  return null;
};


/** @param {goog.ui.Control} control */
anychart.chartEditor2.controls.select.SelectWithIconRenderer.prototype.updateIcon = function(control) {
  var element = control.getElement();
  if (element) {
    var iconElement = goog.dom.getElementsByTagName(goog.dom.TagName.IMG, element)[0];
    var selectedItem = control.getSelectedItem();
    if (selectedItem) {
      var model = selectedItem.getModel();
      goog.dom.setProperties(iconElement, {'src': model.icon});
      if (iconElement) goog.style.setElementShown(iconElement, true);
    } else {
      if (iconElement) goog.style.setElementShown(iconElement, false);
    }
  }
};


/** @inheritDoc */
anychart.chartEditor2.controls.select.SelectWithIconRenderer.prototype.getCssClass = function() {
  return 'anychart-ui-select-with-icon';
};
// endregion