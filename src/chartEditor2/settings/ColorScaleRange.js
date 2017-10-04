goog.provide('anychart.chartEditor2Module.settings.ColorScaleRange');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.controls.select.Base');


/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.ColorScaleRange = function(model, index, opt_domHelper) {
  anychart.chartEditor2Module.settings.ColorScaleRange.base(this, 'constructor', model, opt_domHelper);
  this.name = 'Range ' + index;
};
goog.inherits(anychart.chartEditor2Module.settings.ColorScaleRange, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.ColorScaleRange.CSS_CLASS = goog.getCssName('settings-color-scale-range');


/** @override */
anychart.chartEditor2Module.settings.ColorScaleRange.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.ColorScaleRange.base(this, 'createDom');

  var element = this.getElement();
  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.ColorScaleRange.CSS_CLASS);

  var content = this.getContentElement();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  //
  // var typeLabel = goog.dom.createDom(
  //     goog.dom.TagName.LABEL,
  //     [
  //       goog.ui.INLINE_BLOCK_CLASSNAME,
  //       goog.getCssName('settings-label')
  //     ],
  //     'Scale type');
  // goog.dom.appendChild(content, typeLabel);
  // this.labels.push(typeLabel);
  //
  // var typeSelect = new anychart.chartEditor2Module.controls.select.Base();
  // typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-medium'));
  // typeSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  // typeSelect.setOptions(['linear-color', 'ordinal-color']);
  // typeSelect.setCaptions(['Linear', 'Ordinal']);
  // typeSelect.init(model, this.genKey('type', true));
  // this.addChild(typeSelect, true);
  // this.typeSelect_ = typeSelect;
  //
  // goog.dom.appendChild(content, goog.dom.createDom(
  //     goog.dom.TagName.DIV,
  //     goog.getCssName('anychart-chart-editor-settings-item-gap')));
  //
  // this.specificEl_ = goog.dom.createDom(goog.dom.TagName.DIV);
  // goog.dom.appendChild(content, this.specificEl_);
};


// /**
//  * Update model keys.
//  */
// anychart.chartEditor2Module.settings.ColorScaleRange.prototype.updateKeys = function() {
//   anychart.chartEditor2Module.settings.ColorScaleRange.base(this, 'updateKeys');
//   if (this.isExcluded()) return;
//
//   var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
//   // if (this.typeSelect_) this.typeSelect_.init(model, [['chart'], ['settings'], 'colorScale()']);
// };
//
//
// /** @inheritDoc */
// anychart.chartEditor2Module.settings.ColorScaleRange.prototype.onChartDraw = function(evt) {
//   anychart.chartEditor2Module.settings.ColorScaleRange.base(this, 'onChartDraw', evt);
//
//   var target = evt.chart;
//   var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
//   this.scale_ = /** @type {anychart.ColorScaleRangesModule.Ordinal|anychart.ColorScaleRangesModule.Linear} */(anychart.bindingModule.exec(target, stringKey));
//
//   if (this.scale_) {
//     if(this.colors_) {
//       debugger;
//       var colors = this.scale_.colors();
//       this.colors_.setValueByTarget(this.scale_, true);
//     }
//
//     if (this.typeSelect_) {
//
//       var type = this.scale_.getType();
//       this.typeSelect_.suspendDispatch(true);
//       this.typeSelect_.setValue(type);
//       this.typeSelect_.suspendDispatch(false);
//       this.updateSpecific();
//     }
//   }
// };
//
//
// anychart.chartEditor2Module.settings.ColorScaleRange.prototype.updateSpecific = function() {
//   var newScaleType = this.typeSelect_.getValue();
//   if (newScaleType && newScaleType != this.scaleType_) {
//     this.scaleType_ = newScaleType;
//     var dom = this.getDomHelper();
//     var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
//
//     if (this.scaleType_ == 'linear-color') {
//       dom.removeChildren(this.specificEl_);
//
//       var colorsLabel = goog.dom.createDom(
//           goog.dom.TagName.LABEL,
//           [
//             goog.ui.INLINE_BLOCK_CLASSNAME,
//             goog.getCssName('settings-label')
//           ],
//           'Colors');
//       goog.dom.appendChild(this.specificEl_, colorsLabel);
//
//       var colors = new anychart.chartEditor2Module.input.Palette('Comma separated colors');
//       this.addChild(colors, true);
//       goog.dom.appendChild(this.specificEl_, colors.getElement());
//       goog.dom.classlist.add(colors.getElement(), 'input-palette');
//       goog.dom.classlist.add(colors.getElement(), 'anychart-chart-editor-settings-control-right');
//       debugger;
//       colors.init(model, this.genKey('colors', true));
//       this.colors_ = colors;
//
//       goog.dom.appendChild(this.specificEl_, goog.dom.createDom(
//           goog.dom.TagName.DIV,
//           goog.getCssName('anychart-chart-editor-settings-item-gap-mini')));
//
//     } else {
//       // ordinal-color
//       if (this.colors_) {
//         this.removeChild(this.colors_, true);
//         this.colors_ = null;
//         model.removeByKey(this.key, true);
//       }
//       dom.removeChildren(this.specificEl_);
//
//       goog.dom.appendChild(this.specificEl_, goog.dom.createDom(
//           goog.dom.TagName.DIV,
//           goog.getCssName('anychart-chart-editor-settings-item-gap'), 'ORDINAL'));
//     }
//   }
// };
//
//
// /** @override */
// anychart.chartEditor2Module.settings.ColorScaleRange.prototype.disposeInternal = function() {
//   this.typeSelect_ = null;
//   this.colors_ = null;
//
//   anychart.chartEditor2Module.settings.ColorScaleRange.base(this, 'disposeInternal');
// };
