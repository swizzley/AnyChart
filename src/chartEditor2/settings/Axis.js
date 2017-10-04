goog.provide('anychart.chartEditor2Module.settings.Axis');

goog.require('anychart.chartEditor2Module.IconButtonRenderer');
goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.checkbox.Base');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');
goog.require('anychart.chartEditor2Module.settings.Title');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {string} xOrY
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.Axis = function(model, xOrY, index, opt_domHelper) {
  anychart.chartEditor2Module.settings.Axis.base(this, 'constructor', model, opt_domHelper);
  this.xOrY = xOrY;
  this.index_ = index;
  this.name = this.xOrY + 'Axis(' + this.index_ + ')';
  this.key = [['chart'], ['settings'], this.xOrY + 'Axis(' + this.index_ + ')'];
};
goog.inherits(anychart.chartEditor2Module.settings.Axis, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.Axis.CSS_CLASS = goog.getCssName('settings-axis');


/** @return {number} */
anychart.chartEditor2Module.settings.Axis.prototype.getIndex = function() {
 return this.index_;
};


/** @override */
anychart.chartEditor2Module.settings.Axis.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.Axis.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.Axis.CSS_CLASS);
  goog.dom.classlist.add(element, this.index_ % 2 ? 'even' : 'odd');

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  var invertedCheckbox = new anychart.chartEditor2Module.checkbox.Base();
  invertedCheckbox.setCaption('Inverted');
  this.addChild(invertedCheckbox, true);
  this.inverted_ = invertedCheckbox;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));

  //region Orientation
  var orientationLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-chart-editor-settings-label')
      ],
      'Orientation');
  goog.dom.appendChild(content, orientationLabel);
  this.registerLabel(orientationLabel);

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

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));
  //endregion

  this.orientation_ = orientationSelect;

  var title = new anychart.chartEditor2Module.settings.Title(model, 'Title');
  title.allowEditPosition(false, this.xOrY == 'x' ? 'bottom' : 'left');
  title.setKey(this.genKey('title()')); // This is for enabled working sake!
  this.addChild(title, true);

  goog.dom.appendChild(element, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  this.title_ = title;

  //region Labels
  var labels = new anychart.chartEditor2Module.settings.Title(model, 'Labels');
  labels.allowEditPosition(false, '');
  labels.allowEditAlign(false);
  labels.setTitleKey('format()');
  labels.setKey(this.genKey('labels()'));
  this.addChild(labels, true);

  this.labels_ = labels;
  //endregion
};



/** @inheritDoc */
anychart.chartEditor2Module.settings.Axis.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
    if (this.orientation_) this.orientation_.init(model, this.genKey('orientation()'));
    if (this.inverted_) this.inverted_.init(model, [['chart'], ['settings'], this.xOrY + 'Scale().inverted()']);
    if (this.title_) this.title_.setKey(this.genKey('title()'));
    if (this.labels_) this.labels_.setKey(this.genKey('labels()'));
  }

  anychart.chartEditor2Module.settings.Axis.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.Axis.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.Axis.base(this, 'onChartDraw', evt);
  if (this.isExcluded()) return;

  var target = evt.chart;
  this.orientation_.setValueByTarget(target);
  this.inverted_.setValueByTarget(target);
};


/** @override */
anychart.chartEditor2Module.settings.Axis.prototype.disposeInternal = function() {
  this.orientation_ = null;
  this.inverted_ = null;
  this.title_ = null;
  this.labels_ = null;

  anychart.chartEditor2Module.settings.Axis.base(this, 'disposeInternal');
};
