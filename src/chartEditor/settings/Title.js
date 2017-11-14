goog.provide('anychart.chartEditorModule.settings.Title');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.button.Bold');
goog.require('anychart.chartEditorModule.button.Italic');
goog.require('anychart.chartEditorModule.button.Underline');
goog.require('anychart.chartEditorModule.checkbox.Base');
goog.require('anychart.chartEditorModule.colorPicker.Base');
goog.require('anychart.chartEditorModule.comboBox.Base');
goog.require('anychart.chartEditorModule.controls.select.Align');
goog.require('anychart.chartEditorModule.controls.select.DataFieldSelect');
goog.require('anychart.chartEditorModule.controls.select.FontFamily');
goog.require('anychart.chartEditorModule.input.Base');
goog.require('goog.ui.ButtonSide');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {?string=} opt_name
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.settings.Title = function(model, opt_name, opt_domHelper) {
  anychart.chartEditorModule.settings.Title.base(this, 'constructor', model, opt_domHelper);

  this.name = opt_name;
};
goog.inherits(anychart.chartEditorModule.settings.Title, anychart.chartEditorModule.SettingsPanel);


/**
 * Default CSS class.
 * @type {string}
 */
anychart.chartEditorModule.settings.Title.CSS_CLASS = goog.getCssName('anychart-settings-title');


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.settings.Title.prototype.allowEditTitle_ = true;


/** @param {boolean} value */
anychart.chartEditorModule.settings.Title.prototype.allowEditTitle = function(value) {
  this.allowEditTitle_ = value;
};


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.Title.prototype.titleKey_ = 'text()';


/** @param {string} value */
anychart.chartEditorModule.settings.Title.prototype.setTitleKey = function(value) {
  this.titleKey_ = value;
};


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.settings.Title.prototype.allowEditPosition_ = true;


/**
 * @param {boolean} value
 * @param {string=} opt_positionValue
 */
anychart.chartEditorModule.settings.Title.prototype.allowEditPosition = function(value, opt_positionValue) {
  this.allowEditPosition_ = value;
  this.positionValue_ = opt_positionValue;
};


/**
 * @type {string}
 * @private
 */
anychart.chartEditorModule.settings.Title.prototype.positionKey_ = 'position()';


/** @param {string} value */
anychart.chartEditorModule.settings.Title.prototype.setPositionKey = function(value) {
  this.positionKey_ = value;
};


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.settings.Title.prototype.allowEditAlign_ = true;


/** @param {boolean} value */
anychart.chartEditorModule.settings.Title.prototype.allowEditAlign = function(value) {
  this.allowEditAlign_ = value;
};


/**
 * @type {boolean}
 * @private
 */
anychart.chartEditorModule.settings.Title.prototype.allowEditColor_ = true;


/** @param {boolean} value */
anychart.chartEditorModule.settings.Title.prototype.allowEditColor = function(value) {
  this.allowEditColor_ = value;
};


/**
 * @type {?string}
 * @private
 */
anychart.chartEditorModule.settings.Title.prototype.orientationKey_ = null;


/** @param {string|Array.<string>} value */
anychart.chartEditorModule.settings.Title.prototype.setOrientationKey = function(value) {
  this.orientationKey_ = goog.isArray(value) ? value[0] : value;
  this.updateKeys();
};


/** @override */
anychart.chartEditorModule.settings.Title.prototype.createDom = function() {
  anychart.chartEditorModule.settings.Title.base(this, 'createDom');

  var element = this.getElement();
  var content = this.getContentElement();
  goog.dom.classlist.add(element, anychart.chartEditorModule.settings.Title.CSS_CLASS);

  var textInput = null;
  if (this.allowEditTitle_) {
    textInput = new anychart.chartEditorModule.input.Base(/*'Chart title'*/);
    this.addChild(textInput, true);
    goog.dom.classlist.add(textInput.getElement(), 'title-text');
  }

  var colorLabel = null;
  var colorPicker = null;
  if (this.allowEditColor_) {
    if (!this.allowEditTitle_) {
      colorLabel = goog.dom.createDom(
          goog.dom.TagName.LABEL,
          [
            goog.ui.INLINE_BLOCK_CLASSNAME,
            goog.getCssName('anychart-settings-label')
          ],
          'Font color');
      goog.dom.appendChild(content, colorLabel);
    }

    colorPicker = new anychart.chartEditorModule.colorPicker.Base();
    colorPicker.addClassName(goog.getCssName('title-color'));
    this.addChild(colorPicker, true);

    goog.dom.appendChild(content, goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-gap')));
  }

  var fontFamily = new anychart.chartEditorModule.controls.select.FontFamily();
  fontFamily.addClassName(goog.getCssName('title-font-family'));
  this.addChild(fontFamily, true);

  var fontSizeSelect = new anychart.chartEditorModule.comboBox.Base();
  fontSizeSelect.setOptions([10, 12, 14, 16, 18, 20, 22]);
  this.addChild(fontSizeSelect, true);
  goog.dom.classlist.add(fontSizeSelect.getElement(), goog.getCssName('title-font-size'));

  var buttonsWrapper = goog.dom.createDom(
      goog.dom.TagName.DIV,
      goog.getCssName('title-font-style-buttons'));
  goog.dom.appendChild(content, buttonsWrapper);

  var boldBtn = new anychart.chartEditorModule.button.Bold();
  boldBtn.addClassName(goog.getCssName('anychart-chart-editor-settings-bold'));
  this.addChild(boldBtn, true);
  goog.dom.appendChild(buttonsWrapper, boldBtn.getElement());

  var italicBtn = new anychart.chartEditorModule.button.Italic();
  this.addChild(italicBtn, true);
  goog.dom.appendChild(buttonsWrapper, italicBtn.getElement());

  var underlineBtn = new anychart.chartEditorModule.button.Underline();
  this.addChild(underlineBtn, true);
  goog.dom.appendChild(buttonsWrapper, underlineBtn.getElement());

  // The setCollapsed method needs to be called after the toolbar is rendered
  // for it to pick up the directionality of the toolbar.
  boldBtn.setCollapsed(goog.ui.ButtonSide.END);
  italicBtn.setCollapsed(goog.ui.ButtonSide.END | goog.ui.ButtonSide.START);
  underlineBtn.setCollapsed(goog.ui.ButtonSide.START);

  var positionLabel = null;
  var positionSelect = null;
  if (this.allowEditPosition_) {
    goog.dom.appendChild(content, goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-gap')));

    positionLabel = goog.dom.createDom(
        goog.dom.TagName.LABEL,
        [
          goog.ui.INLINE_BLOCK_CLASSNAME,
          goog.getCssName('anychart-settings-label')
        ],
        'Orientation');
    goog.dom.appendChild(content, positionLabel);

    positionSelect = new anychart.chartEditorModule.controls.select.DataFieldSelect();
    positionSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
    var positionSelectMenu = positionSelect.getMenu();
    positionSelectMenu.setOrientation(goog.ui.Container.Orientation.HORIZONTAL);

    positionSelect.setOptions([
      {value: 'left', icon: 'ac ac-position-left'},
      {value: 'right', icon: 'ac ac-position-right'},
      {value: 'top', icon: 'ac ac-position-top'},
      {value: 'bottom', icon: 'ac ac-position-bottom'}
    ]);

    this.addChild(positionSelect, true);
  }

  var alignLabel = null;
  var alignSelect = null;
  if (this.allowEditAlign_) {
    goog.dom.appendChild(content, goog.dom.createDom(
        goog.dom.TagName.DIV,
        goog.getCssName('anychart-chart-editor-settings-item-gap')));

    alignLabel = goog.dom.createDom(
        goog.dom.TagName.LABEL,
        [
          goog.ui.INLINE_BLOCK_CLASSNAME,
          goog.getCssName('anychart-settings-label')
        ],
        'Align');
    goog.dom.appendChild(content, alignLabel);

    alignSelect = new anychart.chartEditorModule.controls.select.Align();
    alignSelect.addClassName(goog.getCssName('anychart-chart-editor-settings-control-right'));
    this.addChild(alignSelect, true);
  }

  goog.dom.appendChild(content, goog.dom.createDom(goog.dom.TagName.DIV, goog.getCssName('anychart-clearboth')));

  this.textInput_ = textInput;
  this.positionSelect_ = positionSelect;
  this.alignSelect_ = alignSelect;

  this.fontFamilySelect_ = fontFamily;
  this.fontSizeSelect_ = fontSizeSelect;
  this.boldBtn_ = boldBtn;
  this.italicBtn_ = italicBtn;
  this.underlineBtn_ = underlineBtn;
  this.colorPicker_ = colorPicker;

  this.registerLabel(colorLabel);
  this.registerLabel(positionLabel);
  this.registerLabel(alignLabel);
};


/** @inheritDoc */
anychart.chartEditorModule.settings.Title.prototype.onChartDraw = function(evt) {
  if (this.isExcluded()) return;
  anychart.chartEditorModule.settings.Title.base(this, 'onChartDraw', evt);

  var target = evt.chart;
  if (this.textInput_) this.textInput_.setValueByTarget(target, true);
  if (this.positionSelect_) this.positionSelect_.setValueByTarget(target);
  if (this.alignSelect_) {
    this.alignSelect_.updateIcons(this.positionValue_ ? this.positionValue_ : this.positionSelect_.getValue());
    this.alignSelect_.setValueByTarget(target);
  }
  if (this.fontFamilySelect_) this.fontFamilySelect_.setValueByTarget(target);
  if (this.fontSizeSelect_) this.fontSizeSelect_.setValueByTarget(target);
  if (this.boldBtn_) this.boldBtn_.setValueByTarget(target);
  if (this.italicBtn_) this.italicBtn_.setValueByTarget(target);
  if (this.underlineBtn_) this.underlineBtn_.setValueByTarget(target);
  if (this.colorPicker_) this.colorPicker_.setValueByTarget(target);
};


/**
 * Update model keys.
 */
anychart.chartEditorModule.settings.Title.prototype.updateKeys = function() {
  anychart.chartEditorModule.settings.Title.base(this, 'updateKeys');
  if (this.isExcluded()) return;

  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  if (this.enabledBtn_) this.enabledBtn_.init(model, this.genKey('enabled()'));
  if (this.textInput_) this.textInput_.init(model, this.genKey(this.titleKey_));
  if (this.positionSelect_) this.positionSelect_.init(model, this.genKey(this.positionKey_));
  if (this.alignSelect_) {
    this.alignSelect_.setOrientationKey(this.orientationKey_ ? this.orientationKey_ : this.genKey('orientation()'));
    this.alignSelect_.init(model, this.genKey('align()'));
  }
  if (this.fontFamilySelect_) this.fontFamilySelect_.init(model, this.genKey('fontFamily()'));
  if (this.fontSizeSelect_) this.fontSizeSelect_.init(model, this.genKey('fontSize()'));
  if (this.boldBtn_) this.boldBtn_.init(model, this.genKey('fontWeight()'));
  if (this.italicBtn_) this.italicBtn_.init(model, this.genKey('fontStyle()'));
  if (this.underlineBtn_) this.underlineBtn_.init(model, this.genKey('fontDecoration()'));
  if (this.colorPicker_) this.colorPicker_.init(model, this.genKey('fontColor()'));
};


/** @override */
anychart.chartEditorModule.settings.Title.prototype.disposeInternal = function() {
  this.textInput_ = null;
  this.positionSelect_ = null;
  this.alignSelect_ = null;
  this.fontFamilySelect_ = null;
  this.fontSizeSelect_ = null;
  this.boldBtn_ = null;
  this.italicBtn_ = null;
  this.underlineBtn_ = null;
  this.colorPicker_ = null;

  anychart.chartEditorModule.settings.Title.base(this, 'disposeInternal');
};
