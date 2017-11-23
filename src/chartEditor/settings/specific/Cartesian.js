goog.provide('anychart.chartEditorModule.settings.specific.Cartesian');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Percentage');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Cartesian = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Cartesian Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Cartesian, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Cartesian.CSS_CLASS = goog.getCssName('anychart-settings-panel-radar');


/** @override */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'createDom');

  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.specific.Cartesian.CSS_CLASS);

  var pointWidthLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-settings-label')
      ],
      'Point Width');
  goog.dom.appendChild(this.getContentElement(), pointWidthLabel);
  this.registerLabel(pointWidthLabel);

  var pointWidth = new anychart.chartEditorModule.comboBox.Percentage();
  pointWidth.setOptions([10, 20, 30, 40, 50]);

  this.addChild(pointWidth, true);
  goog.dom.classlist.add(pointWidth.getElement(), 'anychart-chart-editor-settings-control-right');
  this.pointWidth_ = pointWidth;

  // goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
  //     goog.dom.TagName.DIV,
  //     goog.getCssName('anychart-chart-editor-settings-item-gap')));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.pointWidth_) this.pointWidth_.init(model, this.genKey('pointWidth()'));
  }
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.pointWidth_) this.pointWidth_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Cartesian.prototype.disposeInternal = function() {
  goog.dispose(this.pointWidth_);
  this.pointWidth_ = null;

  anychart.chartEditorModule.settings.specific.Cartesian.base(this, 'disposeInternal');
};
