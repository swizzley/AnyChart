goog.provide('anychart.chartEditor2Module.settings.Stroke');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.colorPicker.Base');
goog.require('anychart.chartEditor2Module.comboBox.Base');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelect');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.settings.Stroke = function(model, opt_name, opt_domHelper) {
  anychart.chartEditor2Module.settings.Stroke.base(this, 'constructor', model, opt_domHelper);

  this.name = goog.isDef(opt_name) ? opt_name : 'Stroke';

  this.allowEnabled(false);
};
goog.inherits(anychart.chartEditor2Module.settings.Stroke, anychart.chartEditor2Module.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditor2Module.settings.Stroke.CSS_CLASS = goog.getCssName('settings-stroke');


/** @override */
anychart.chartEditor2Module.settings.Stroke.prototype.createDom = function() {
  anychart.chartEditor2Module.settings.Stroke.base(this, 'createDom');

  var element = this.getElement();
  var content = this.getContentElement();

  goog.dom.classlist.add(element, anychart.chartEditor2Module.settings.Stroke.CSS_CLASS);

  var dash = new anychart.chartEditor2Module.controls.select.DataFieldSelect('solid');
  dash.setOptions([
    {value: '0', icon: 'ac ac-position-bottom'},
    {value: '5 5', icon: 'ac ac-position-top'},
    {value: '5 10', icon: 'ac ac-position-bottom'},
    {value: '10 5', icon: 'ac ac-position-top'},
    {value: '15 10 5 10', icon: 'ac ac-position-bottom'},
    {value: '5 5 1 5', icon: 'ac ac-position-top'}
  ]);

  this.addChild(dash, true);
  goog.dom.classlist.add(dash.getElement(), goog.getCssName('stroke-dash'));
  this.dash_ = dash;

  var thickness = new anychart.chartEditor2Module.comboBox.Base();
  thickness.setOptions([1, 2, 3, 4, 5]);
  thickness.setFormatterFunction(function(value) {
    return String(goog.math.clamp(Number(value), 0, 10));
  });
  this.addChild(thickness, true);
  goog.dom.classlist.add(thickness.getElement(), goog.getCssName('stroke-thickness'));
  this.thickness_ = thickness;

  var color = new anychart.chartEditor2Module.colorPicker.Base();
  color.addClassName(goog.getCssName('stroke-color'));
  this.addChild(color, true);
  this.color_ = color;

  goog.dom.appendChild(content, goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('cb')));
};


/** @override */
anychart.chartEditor2Module.settings.Stroke.prototype.enterDocument = function() {
  anychart.chartEditor2Module.settings.Stroke.base(this, 'enterDocument');

  var handler = this.getHandler();
  handler.listen(this.color_, goog.ui.Component.EventType.ACTION, this.onChange);
  handler.listen(this.thickness_, goog.ui.Component.EventType.CHANGE, this.onChange);
  handler.listen(this.dash_, goog.ui.Component.EventType.CHANGE, this.onChange);
};


/**
 * Common handler function for every control in component. Sets value for stroke() key as Object.
 */
anychart.chartEditor2Module.settings.Stroke.prototype.onChange = function() {
  if (this.noDispatch) return;

  var value = {};

  var colorValue = this.color_.getSelectedColor();
  if (colorValue)
    value['color'] = colorValue;

  var thicknessValue = this.thickness_.getToken();
  if (thicknessValue)
    value['thickness'] = thicknessValue;

  var dashValue = this.dash_.getValue();
  if (dashValue)
    value['dash'] = dashValue.value;

  if (colorValue || thicknessValue || dashValue) {
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
    model.setValue(this.key, value);
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.settings.Stroke.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.settings.Stroke.base(this, 'onChartDraw', evt);
  var target = evt.chart;
  this.setValueByTarget(target);
};



/**
 * Sets values of child controls.
 * @param {?Object} target Object, who's property corresponds to control's key. Used to get value of this control.
 */
anychart.chartEditor2Module.settings.Stroke.prototype.setValueByTarget = function(target) {
  this.target = target;

  var stringKey = anychart.chartEditor2Module.EditorModel.getStringKey(this.key);
  var value = /** @type {string} */(anychart.bindingModule.exec(this.target, stringKey));

  if (goog.isObject(value)) {
    this.colorValue_ = value['color'];
    this.thicknessValue_ = value['thickness'];
    this.dashValue_ = value['dash'];
  } else
    this.colorValue_ = value;

  this.noDispatch = true;

  if (this.colorValue_)
    this.color_.setSelectedColor(this.colorValue_);

  if (this.thicknessValue_)
    this.thickness_.setValue(this.thicknessValue_);

  if (this.dashValue_)
    this.dash_.setValue(this.dashValue_);

  this.noDispatch = false;
};


/** @override */
anychart.chartEditor2Module.settings.Stroke.prototype.disposeInternal = function() {
  this.color_ = null;
  this.thickness_ = null;
  this.dash_ = null;

  anychart.chartEditor2Module.settings.Stroke.base(this, 'disposeInternal');
};
