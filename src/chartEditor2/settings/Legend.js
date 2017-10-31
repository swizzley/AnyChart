goog.provide('anychart.chartEditor2Module.settings.Legend');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.LegendAppearance');
goog.require('anychart.chartEditor2Module.settings.Title');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {number=} opt_plotIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.Legend = function(model, opt_plotIndex, opt_domHelper) {
  anychart.chartEditor2Module.settings.Legend.base(this, 'constructor', model, opt_domHelper);
  this.plotIndex_ = opt_plotIndex;
  this.name = goog.isDef(this.plotIndex_) ? 'Legend (plot ' + this.plotIndex_ + ')': 'Legend';
  this.key = [['chart'], ['settings'], 'legend()'];
};
goog.inherits(anychart.chartEditor2Module.settings.Legend, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.Legend.CSS_CLASS = goog.getCssName('anychart-settings-panel-legend-single');


/** @override */
anychart.chartEditor2Module.settings.Legend.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.Legend.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.Legend.CSS_CLASS);

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  var appearance = new anychart.chartEditor2Module.settings.LegendAppearance(model);
  appearance.setKey(this.key);
  appearance.allowEnabled(false);
  this.addChild(appearance, true);

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-separator')));

  var title = new anychart.chartEditor2Module.settings.Title(model, 'Title');
  title.setPositionKey('orientation()');
  title.setKey(this.genKey('title()'));
  this.addChild(title, true);

  this.appearance_ = appearance;
  this.title_ = title;
};


/** @override */
anychart.chartEditor2Module.settings.Legend.prototype.disposeInternal = function() {
  this.appearance_.dispose();
  this.appearance_ = null;
  this.title_ = null;
  anychart.chartEditor2Module.settings.Legend.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.Legend.prototype.updateKeys = function() {
  if (!this.isExcluded()) {
    var stringKey = 'legend()';
    if (goog.isDef(this.plotIndex_))
      stringKey = 'plot(' + this.plotIndex_ + ').' + stringKey;

    this.key = [['chart'], ['settings'], stringKey];

    // Update keys of children
    if (this.appearance_) this.appearance_.setKey(this.key);
    if (this.title_) this.title_.setKey(this.genKey('title()'));
  }

  // Update key of enabled checkbox
  anychart.chartEditor2Module.settings.Legend.base(this, 'updateKeys');
};