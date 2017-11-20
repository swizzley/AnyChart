goog.provide('anychart.chartEditorModule.settings.specific.Mekko');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Base');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Mekko = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Mosaic Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Mekko, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Mekko.CSS_CLASS = goog.getCssName('anychart-settings-panel-mosaic');


/** @override */
anychart.chartEditorModule.settings.specific.Mekko.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'createDom');

  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.specific.Mekko.CSS_CLASS);

  var pointsPaddingLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-settings-label')
      ],
      'Points Padding');
  goog.dom.appendChild(this.getContentElement(), pointsPaddingLabel);
  this.registerLabel(pointsPaddingLabel);

  var pointsPadding = new anychart.chartEditorModule.comboBox.Base();
  pointsPadding.setOptions([0, 1, 3, 5, 10, 15]);
  pointsPadding.setFormatterFunction(function(value) {
    return String(goog.math.clamp(Number(value), 0, 20));
  });
  this.addChild(pointsPadding, true);
  goog.dom.classlist.add(pointsPadding.getElement(), 'anychart-chart-editor-settings-control-right');
  this.pointsPadding_ = pointsPadding;

  // goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
  //     goog.dom.TagName.DIV,
  //     goog.getCssName('anychart-chart-editor-settings-item-gap')));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Mekko.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.pointsPadding_) this.pointsPadding_.init(model, this.genKey('pointsPadding()'));
  }
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Mekko.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.pointsPadding_) this.pointsPadding_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Mekko.prototype.disposeInternal = function() {
  goog.dispose(this.pointsPadding_);
  this.pointsPadding_ = null;

  anychart.chartEditorModule.settings.specific.Mekko.base(this, 'disposeInternal');
};
