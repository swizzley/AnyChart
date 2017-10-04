goog.provide('anychart.chartEditor2Module.settings.ColorScale');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.input.Palette');
goog.require('anychart.chartEditor2Module.controls.select.Base');


/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {?string} name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.ColorScale = function(model, name, opt_domHelper) {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'constructor', model, opt_domHelper);
  this.name = name;

  this.scaleType_ = '';

  /**
   * Scale instance.
   * @type {?(anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear)}
   * @private
   */
  this.scale_ = null;
};
goog.inherits(anychart.chartEditor2Module.settings.ColorScale, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.ColorScale.CSS_CLASS = goog.getCssName('settings-color-scale');


/** @override */
anychart.chartEditor2Module.settings.ColorScale.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.ColorScale.CSS_CLASS);

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  var typeLabel = goog.dom.createDom(
      goog.dom.TagName.LABEL,
      [
        goog.ui.INLINE_BLOCK_CLASSNAME,
        goog.getCssName('settings-label')
      ],
      'Scale type');
  goog.dom.appendChild(content, typeLabel);
  this.labels.push(typeLabel);

  var typeSelect = new anychart.chartEditor2Module.controls.select.Base();
  typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  typeSelect.setOptions(['linear-color', 'ordinal-color']);
  typeSelect.setCaptions(['Linear', 'Ordinal']);
  typeSelect.init(model, this.genKey('type', true));
  this.addChild(typeSelect, true);
  this.typeSelect_ = typeSelect;

  goog.dom.appendChild(content, goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('anychart-chart-editor-settings-item-gap')));

  this.specificEl_ = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.appendChild(content, this.specificEl_);
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.ColorScale.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.ColorScale.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  this.scale_ = /** @type {anychart.colorScalesModule.Ordinal|anychart.colorScalesModule.Linear} */(anychart.bindingModule.exec(target, stringKey));

  if (this.scale_) {
    if (this.typeSelect_) {
      var type = this.scale_.getType();
      this.typeSelect_.suspendDispatch(true);
      this.typeSelect_.setValue(type);
      this.typeSelect_.suspendDispatch(false);
      this.updateSpecific();
    }

    if(this.colors_) {
      var colors = this.scale_.colors();
      this.colors_.setValueByColors(colors);
    }
  }
};


/**
 * Creates dom for specific section.
 */
anychart.chartEditor2Module.settings.ColorScale.prototype.updateSpecific = function() {
  var newScaleType = this.typeSelect_.getValue();
  if (newScaleType && newScaleType != this.scaleType_) {
    this.scaleType_ = newScaleType;
    var dom = this.getDomHelper();
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

    if (this.scaleType_ == 'linear-color') {
      dom.removeChildren(this.specificEl_);

      var colorsLabel = goog.dom.createDom(
          goog.dom.TagName.LABEL,
          [
            goog.ui.INLINE_BLOCK_CLASSNAME,
            goog.getCssName('settings-label')
          ],
          'Colors');
      goog.dom.appendChild(this.specificEl_, colorsLabel);

      var colors = new anychart.chartEditor2Module.input.Palette('Comma separated colors');
      this.addChild(colors, true);
      goog.dom.appendChild(this.specificEl_, colors.getElement());
      goog.dom.classlist.add(colors.getElement(), 'input-palette');
      goog.dom.classlist.add(colors.getElement(), 'anychart-chart-editor-settings-control-right');
      colors.init(model, this.genKey('colors', true));
      this.colors_ = colors;

      goog.dom.appendChild(this.specificEl_, goog.dom.createDom(
          goog.dom.TagName.DIV,
          goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));

    } else {
      // ordinal-color
      if (this.colors_) {
        // This draws chart again!
        model.removeByKey(this.colors_.getKey());
        this.removeChild(this.colors_);
        this.colors_ = null;
      }
      dom.removeChildren(this.specificEl_);

      goog.dom.appendChild(this.specificEl_, goog.dom.createDom(
          goog.dom.TagName.DIV,
          goog.getCssName('anychart-chart-editor-settings-item-gap'), 'ORDINAL'));
    }
  }
};


/** @override */
anychart.chartEditor2Module.settings.ColorScale.prototype.disposeInternal = function() {
  this.typeSelect_ = null;
  this.colors_ = null;

  anychart.chartEditor2Module.settings.ColorScale.base(this, 'disposeInternal');
};
