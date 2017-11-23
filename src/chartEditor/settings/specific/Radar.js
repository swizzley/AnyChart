goog.provide('anychart.chartEditorModule.settings.specific.Radar');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.comboBox.Base');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.specific.Radar = function(model, opt_domHelper) {
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Radar Chart Settings';

  this.key = [['chart'], ['settings']];
};
goog.inherits(anychart.chartEditorModule.settings.specific.Radar, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.specific.Radar.CSS_CLASS = goog.getCssName('anychart-settings-panel-radar');


/** @override */
anychart.chartEditorModule.settings.specific.Radar.prototype.createDom = function() {
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'createDom');

  // var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.specific.Radar.CSS_CLASS);

  var startAngleLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('anychart-settings-label')
      ],
      'Start Angle');
  goog.dom.appendChild(this.getContentElement(), startAngleLabel);
  this.registerLabel(startAngleLabel);

  var startAngle = new anychart.chartEditorModule.comboBox.Base();
  startAngle.setOptions([0, 90, 180, 270]);
  startAngle.setFormatterFunction(function(value) {
    return String(goog.math.clamp(Number(value), 0, 360));
  });
  this.addChild(startAngle, true);
  goog.dom.classlist.add(startAngle.getElement(), 'anychart-chart-editor-settings-control-right');
  this.startAngle_ = startAngle;

  // goog.dom.appendChild(this.getContentElement(), goog.dom.createDom(
  //     goog.dom.TagName.DIV,
  //     goog.getCssName('anychart-chart-editor-settings-item-gap')));
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Radar.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    if (this.startAngle_) this.startAngle_.init(model, this.genKey('startAngle()'));
  }
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'updateKeys');
};


/** @inheritDoc */
anychart.chartEditorModule.settings.specific.Radar.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.specific.Radar.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;
    if (this.startAngle_) this.startAngle_.setValueByTarget(target);
  }
};


/** @override */
anychart.chartEditorModule.settings.specific.Radar.prototype.disposeInternal = function() {
  goog.dispose(this.startAngle_);
  this.startAngle_ = null;

  anychart.chartEditorModule.settings.specific.Radar.base(this, 'disposeInternal');
};
