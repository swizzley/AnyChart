goog.provide('anychart.chartEditorModule.settings.pointers.Base');

goog.require('anychart.chartEditorModule.SettingsPanelZippy');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.controls.select.DataField');
goog.require('anychart.chartEditorModule.settings.Stroke');


/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {string} type
 * @param {string|number} pointerId
 * @param {number} pointerIndex
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanelZippy}
 */
anychart.chartEditorModule.settings.pointers.Base = function(model, type, pointerId, pointerIndex, opt_domHelper) {
  anychart.chartEditorModule.settings.pointers.Base.base(this, 'constructor', model, pointerIndex, null, opt_domHelper);

  this.pointerId_ = String(pointerId);
  this.pointerType_ = type;

  // todo: debug
  var tmp = type.split('.');
  var ctor = tmp[tmp.length - 1];
  var stringKey = ctor + '(' + pointerIndex + ')';
  //var stringKey = 'getPointer(\'' + this.pointerId_ + '\')';

  this.key = [['chart'], ['settings'], stringKey];

  this.allowEnabled(false);
  this.addClassName(goog.getCssName('anychart-settings-panel-pointer-single'));
};
goog.inherits(anychart.chartEditorModule.settings.pointers.Base, anychart.chartEditorModule.SettingsPanelZippy);


/** @override */
anychart.chartEditorModule.settings.pointers.Base.prototype.createDom = function() {
  anychart.chartEditorModule.settings.pointers.Base.base(this, 'createDom');

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  // region ==== Header
  var nameEl = goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-chart-editor-pointer-name'), this.key[2]);
  this.zippyHeader.getElement().appendChild(nameEl);

  var fill = new anychart.chartEditorModule.colorPicker.Base();
  fill.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
  fill.init(model, this.genKey('fill()'));
  this.addHeaderChildControl(fill);
  // endregion

  var stroke = new anychart.chartEditorModule.settings.Stroke(model);
  stroke.setKey(this.genKey('stroke()'));
  this.addChildControl(stroke);

  var chartType = model.getModel()['chart']['type'];
  if (chartType.indexOf('linear') === -1) {
    this.addContentSeparator();

    var axisIndex = new anychart.chartEditorModule.controls.select.DataField({label: 'Axis Index'});
    axisIndex.getSelect().setOptions([{value: '0'}]);
    axisIndex.init(model, this.genKey('axisIndex()'));
    this.zippyContent.addChild(axisIndex, true);
    this.axisIndex_ = axisIndex;
  }
};


/** @inheritDoc */
anychart.chartEditorModule.settings.pointers.Base.prototype.onChartDraw = function(evt) {
  anychart.chartEditorModule.settings.pointers.Base.base(this, 'onChartDraw', evt);
  if (!this.isExcluded()) {
    var target = evt.chart;

    if (this.axisIndex_) {
      var count = target.getAxesCount();
      if (count === 1) {
        this.axisIndex_.hide();

      } else {
        this.axisIndex_.show();
        var options = [];
        for (var i = 0; i < count; i++) {
          options.push({'value': String(i)});
        }
        this.axisIndex_.getSelect().setOptions(options);
        this.axisIndex_.setValueByTarget(target);
      }
    }
  }
};


/** @override */
anychart.chartEditorModule.settings.pointers.Base.prototype.disposeInternal = function() {
  goog.dispose(this.axisIndex_);
  this.axisIndex_ = null;

  anychart.chartEditorModule.settings.pointers.Base.base(this, 'disposeInternal');
};
