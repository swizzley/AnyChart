goog.provide('anychart.chartEditor2Module.settings.LegendAppearance');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.button.Bold');
goog.require('anychart.chartEditor2Module.button.Italic');
goog.require('anychart.chartEditor2Module.button.Underline');
goog.require('anychart.chartEditor2Module.checkbox.Base');
goog.require('anychart.chartEditor2Module.colorPicker.Base');
goog.require('anychart.chartEditor2Module.comboBox.Base');
goog.require('anychart.chartEditor2Module.input.Base');
goog.require('anychart.chartEditor2Module.controls.select.Align');
goog.require('anychart.chartEditor2Module.controls.select.Base');
goog.require('anychart.chartEditor2Module.controls.select.FontFamily');
goog.require('anychart.chartEditor2Module.settings.Title');
goog.require('goog.ui.ButtonSide');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.LegendAppearance = function(model, opt_name, opt_domHelper) {
  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'constructor', model, opt_domHelper);

  this.name = opt_name;
};
goog.inherits(anychart.chartEditor2Module.settings.LegendAppearance, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.LegendAppearance.CSS_CLASS = goog.getCssName('settings-legend-appearance');


/** @override */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'createDom');

  var element = this.getElement();
  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.LegendAppearance.CSS_CLASS);

  //region Layout
  var layoutLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Layout');
  goog.dom.appendChild(content, layoutLabel);

  var layoutSelect = new anychart.chartEditor2Module.controls.select.Base();
  layoutSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  layoutSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  layoutSelect.setOptions(['horizontal', 'vertical']);
  layoutSelect.setCaptions(['Horizontal', 'Vertical']);
  layoutSelect.init(model, this.genKey('itemsLayout()'));
  this.addChild(layoutSelect, true);
  //endregion

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  //region Orientation
  var orientationLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Orientation');
  goog.dom.appendChild(content, orientationLabel);

  var orientationSelect = new anychart.chartEditor2Module.controls.select.Base();
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-select-image'));
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  orientationSelect.setOptions(['left', 'right', 'top', 'bottom']);
  orientationSelect.setCaptions([null, null, null, null]);
  orientationSelect.setIcons(['ac ac-position-left', 'ac ac-position-right', 'ac ac-position-top', 'ac ac-position-bottom']);
  orientationSelect.init(model, this.genKey('position()'));

  var orientationSelectMenu = orientationSelect.getMenu();
  orientationSelectMenu.setOrientation(goog.ui.Container.Orientation.HORIZONTAL);

  this.addChild(orientationSelect, true);
  //endregion

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  //region Align
  var alignLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Align');
  goog.dom.appendChild(content, alignLabel);

  var alignSelect = new anychart.chartEditor2Module.controls.select.Align(true);
  alignSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-select-image'));
  alignSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));

  alignSelect.init(model, this.genKey('align()'));

  this.addChild(alignSelect, true);
  //endregion

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  var items = new anychart.chartEditor2Module.settings.Title(model);
  items.allowEnabled(false);
  items.allowEditTitle(false);
  items.allowEditPosition(false);
  items.allowEditAlign(false);
  items.allowEditColor(false);
  items.setKey(this.key);
  this.addChild(items, true);

  this.layoutSelect_ = layoutSelect;
  this.orientationSelect_ = orientationSelect;
  this.alignSelect_ = alignSelect;

  this.layoutLabel_ = layoutLabel;
  this.orientationLabel_ = orientationLabel;
  this.alignLabel_ = alignLabel;

  this.items_ = items;
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    if (this.layoutSelect_) this.layoutSelect_.setKey(this.genKey('itemsLayout()'));
    if (this.orientationSelect_) this.orientationSelect_.setKey(this.genKey('position()'));
    if (this.alignSelect_) this.alignSelect_.setKey(this.genKey('align()'));
    if (this.items_) this.items_.setKey(this.key);
  }

  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  this.layoutSelect_.setValueByTarget(target);
  this.orientationSelect_.setValueByTarget(target);

  this.alignSelect_.updateIcons(this.orientationSelect_.getValue());
  this.alignSelect_.setValueByTarget(target);
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.setContentEnabled = function(enabled) {
  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'setContentEnabled', enabled);

  if (this.layoutLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.layoutLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.orientationLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.orientationLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }

  if (this.alignLabel_) {
    goog.dom.classlist.enable(
        goog.asserts.assert(this.alignLabel_),
        goog.getCssName('anychart-control-disabled'), !enabled);
  }
};

/** @override */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.disposeInternal = function() {
  this.layoutSelect_ = null;
  this.orientationSelect_ = null;
  this.alignSelect_ = null;
  this.items_ = null;

  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'disposeInternal');
};
