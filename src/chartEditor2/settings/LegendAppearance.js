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
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
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

  var layoutSelect = new anychart.chartEditor2Module.controls.select.DataFieldSelect();
  layoutSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  layoutSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  layoutSelect.setOptions([
    {value: 'horizontal', caption: 'Horizontal'},
    {value: 'vertical', caption: 'Vertical'}
  ]);
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

  var orientationSelect = new anychart.chartEditor2Module.controls.select.DataFieldSelect();
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-select-image'));
  orientationSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  var orientationSelectMenu = orientationSelect.getMenu();
  orientationSelectMenu.setOrientation(goog.ui.Container.Orientation.HORIZONTAL);

  orientationSelect.setOptions([
    {value: 'left', icon: 'ac ac-position-left'},
    {value: 'right', icon: 'ac ac-position-right'},
    {value: 'top', icon: 'ac ac-position-top'},
    {value: 'bottom', icon: 'ac ac-position-bottom'}
  ]);

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

  this.registerLabel(layoutLabel);
  this.registerLabel(orientationLabel);
  this.registerLabel(alignLabel);

  this.items_ = items;
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
    if (this.layoutSelect_) this.layoutSelect_.init(model, this.genKey('itemsLayout()'));
    if (this.orientationSelect_) this.orientationSelect_.init(model, this.genKey('position()'));
    if (this.alignSelect_) this.alignSelect_.init(model, this.genKey('align()'));
    if (this.items_) this.items_.setKey(this.key);
  }

  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  if (this.layoutSelect_) this.layoutSelect_.setValueByTarget(target);
  if (this.orientationSelect_) this.orientationSelect_.setValueByTarget(target);

  this.alignSelect_.updateIcons(this.orientationSelect_.getValue());
  this.alignSelect_.setValueByTarget(target);
};


/** @override */
anychart.chartEditor2Module.settings.LegendAppearance.prototype.disposeInternal = function() {
  this.layoutSelect_ = null;
  this.orientationSelect_ = null;
  this.alignSelect_ = null;
  this.items_ = null;

  anychart.chartEditor2Module.settings.LegendAppearance.base(this, 'disposeInternal');
};
