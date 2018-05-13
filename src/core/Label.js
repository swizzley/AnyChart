//region --- Requiring and Providing
goog.provide('anychart.core.Label');
goog.require('acgraph.math');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Factory');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.TokenParser');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');
goog.require('goog.math.Coordinate');
//endregion



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IFactoryElement}
 * @implements {anychart.core.settings.IObjectWithSettings}
 */
anychart.core.Label = function() {
  anychart.core.Label.base(this, 'constructor');
  delete this.themeSettings['enabled'];

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      0,
      0,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
      anychart.Signal.NEEDS_REDRAW);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['format', 0 | anychart.ConsistencyState.LABELS_FACTORY_CACHE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['positionFormatter', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorStroke', 0, anychart.Signal.NEEDS_REDRAW],
    ['rotation', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['width', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height', 0, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['clip', 0, anychart.Signal.NEEDS_REDRAW],
    ['enabled', 0, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.core.Label, anychart.core.VisualBase);


//region --- Class const
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.Label.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Label.prototype.SUPPORTED_CONSISTENCY_STATES = 0;


//endregion
//region --- Settings
/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Label.prototype.TEXT_DESCRIPTORS = anychart.core.settings.createTextPropertiesDescriptors();
anychart.core.settings.populate(anychart.core.Label, anychart.core.Label.prototype.TEXT_DESCRIPTORS);


/**
 * Special anchor normalizer that doesn't accept 'auto' and returns undefined in that case.
 * @param {*} value
 * @return {anychart.enums.Anchor|undefined}
 */
anychart.core.Label.anchorNoAutoNormalizer = function (value) {
  var res = anychart.enums.normalizeAnchor(value, anychart.enums.Anchor.AUTO);
  if (res == anychart.enums.Anchor.AUTO)
    res = undefined;
  return res;
};


/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Label.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  /**
   * Special anchor normalizer that doesn't accept 'auto' and returns undefined in that case.
   * @param {*} value
   * @return {anychart.enums.Anchor|undefined}
   */
  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionFormatter', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.core.Label.anchorNoAutoNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'connectorStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotation', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'clip', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.Label, anychart.core.Label.prototype.SIMPLE_PROPS_DESCRIPTORS);


/**
 * Gets or sets the Label background settings.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.Label|anychart.core.ui.Background)} Returns background or itself for chaining.
 */
anychart.core.Label.prototype.background = function(opt_value) {
  var makeDefault = goog.isNull(opt_value);
  if (!makeDefault && !this.background_) {
    this.background_ = new anychart.core.ui.Background();
    this.background_.setup(anychart.getFullTheme('standalones.labelsFactory.background'));
    this.background_.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (makeDefault) {
      goog.dispose(this.background_);
      delete this.ownSettings['background'];
    } else {
      this.background_.setup(opt_value);
      this.updateComplexSettings();
    }
    return this;
  }
  return this.background_;
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.Label.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.updateComplexSettings();
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Getter for current label padding.<br/>
 * @param {(null|anychart.core.utils.Padding|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {anychart.core.Label|anychart.core.utils.Padding} .
 */
anychart.core.Label.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  var makeDefault = goog.isNull(opt_spaceOrTopOrTopAndBottom);
  if (!makeDefault && !this.padding_) {
    this.padding_ = new anychart.core.utils.Padding();
    this.padding_.listenSignals(this.boundsInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    if (makeDefault) {
      goog.dispose(this.padding_);
      delete this.ownSettings['padding'];
    } else if (anychart.utils.instanceOf(opt_spaceOrTopOrTopAndBottom, anychart.core.utils.Padding)) {
      for (var name in anychart.core.utils.Space.SIMPLE_PROPS_DESCRIPTORS) {
        var val = opt_spaceOrTopOrTopAndBottom.getOption(name);
        this.padding_.setOption(name, val);
      }
      this.updateComplexSettings();
    } else {
      this.padding_.setup.apply(this.padding_, arguments);
      this.updateComplexSettings();
    }
    return this;
  }
  return this.padding_;
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.Label.prototype.boundsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.updateComplexSettings();
    this.dispatchSignal(anychart.Signal.BOUNDS_CHANGED);
  }
};


/**
 * Sets labels color that parent series have set for it.
 * @param {number=} opt_value Auto rotation angle.
 * @return {number|anychart.core.Label}
 */
anychart.core.Label.prototype.autoRotation = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.autoSettings['rotation'] !== opt_value) {
      this.autoSettings['rotation'] = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return isNaN(this.autoSettings['rotation']) ? undefined : this.autoSettings['rotation'];
};


/**
 * Getter for label anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value .
 * @return {!anychart.core.Label|anychart.enums.Anchor} .
 */
anychart.core.Label.prototype.autoAnchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.core.Label.anchorNoAutoNormalizer(opt_value);
    if (this.autoSettings['anchor'] !== value) {
      this.autoSettings['anchor'] = value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.autoSettings['anchor'];
};


/**
 * Defines whether label is vertical.
 * @param {(boolean)=} opt_value .
 * @return {!anychart.core.Label|boolean} .
 */
anychart.core.Label.prototype.autoVertical = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = !!opt_value;
    if (this.autoSettings['vertical'] !== value) {
      this.autoSettings['vertical'] = value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.autoSettings['vertical'];
};


/**
 * Auto clip element settings.
 * @param {(acgraph.vector.Clip|acgraph.vector.Element|anychart.math.Rect|boolean)=} opt_value .
 * @return {!anychart.core.Label|acgraph.vector.Clip|acgraph.vector.Element} .
 */
anychart.core.Label.prototype.autoClip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoSettings['clip'] !== opt_value) {
      this.autoSettings['clip'] = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.autoSettings['clip'];
};


/**
 * Auto clip element settings.
 * @param {(acgraph.vector.Clip|acgraph.vector.Element|anychart.math.Rect)=} opt_value .
 * @return {!anychart.core.Label|acgraph.vector.Clip|acgraph.vector.Element} .
 */
anychart.core.Label.prototype.autoClipElement = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoSettings['clipElement'] !== opt_value) {
      this.autoSettings['clipElement'] = opt_value;
      this.dispatchSignal(anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.autoSettings['clipElement'];
};


/**
 * Sets current ajust font size calculated for current bounds.
 * @param {(null|string|number)=} opt_value Adjusted font size.
 * @return {anychart.core.Label|string|number} Itself for chaining call.
 */
anychart.core.Label.prototype.autoFontSize = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) {
      delete this.autoSettings['fontSize'];
    } else {
      this.autoSettings['fontSize'] = opt_value;
    }
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.autoSettings['fontSize'];
};


/**
 * Sets labels color that parent series have set for it.
 * @param {string=} opt_value Auto color distributed by the series.
 * @return {anychart.core.Label|string} Itself for chaining call.
 */
anychart.core.Label.prototype.autoFontColor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNull(opt_value)) {
      delete this.autoSettings['fontColor'];
    } else {
      this.autoSettings['fontColor'] = opt_value;
    }
    this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.autoSettings['fontColor'];
};


//endregion
//region --- IObjectWithSettings implementation
/**
 * Updating local settings for complex settings.
 */
anychart.core.Label.prototype.updateComplexSettings = function() {
  if (this.background_)
    this.ownSettings['background'] = this.background_.ownSettings;
  if (this.padding_)
    this.ownSettings['padding'] = this.padding_.ownSettings;
};


/** @inheritDoc */
anychart.core.Label.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * @return {Array.<Object>}
 */
anychart.core.Label.prototype.getResolutionChain = function() {
  return [this.ownSettings, this.autoSettings, this.themeSettings];
};


/**
 * Returns merged options.
 * @return {!Object}
 */
anychart.core.Label.prototype.getOptions = function() {
  this.updateComplexSettings();

  var result = {};
  var settingsNames = anychart.core.utils.LabelsFactory.Label.settingsFieldsForMerge;
  for (var i = 0, len = settingsNames.length; i < len; i++) {
    var name = settingsNames[i];

    var finalSettings = this.getOption(name);

    if (name == 'adjustFontSize') {
      result['adjustByWidth'] = finalSettings.width;
      result['adjustByHeight'] = finalSettings.height;
    } else {
      result[name] = finalSettings;
    }
  }
  return this.mergedSettings = result;
};


/**
 * @override
 * @param {string} value
 * @return {*}
 */
anychart.core.Label.prototype.getOption = function(value) {
  // if (this.mergedSettings) {
  //   return this.mergedSettings[value];
  // }

  if (value == 'adjustFontSize') {
    var adjustByWidth = this.resolveOption(value, function(value) {
      return value.width;
    });
    var adjustByHeight = this.resolveOption(value, function(value) {
      return value.height;
    });
    return {width: adjustByWidth, height: adjustByHeight};
  } else {
    // var finalSetting = this.resolveOption(value);
    // var result;
    // if (value == 'padding') {
    //   result = new anychart.core.utils.Padding();
    //   result.setup(finalSetting);
    // } else if (value == 'background') {
    //   result = new anychart.core.ui.Background();
    //   result.setup(finalSetting);
    // } else {
    //   result = finalSetting;
    // }
    return this.resolveOption(value);
  }
};


/**
 * Settings resolver.
 * @param {string} field .
 * @param {Function=} opt_handler .
 * @return {*}
 */
anychart.core.Label.prototype.resolveOption = function(field, opt_handler) {
  return anychart.core.utils.LabelsFactory.Label.iterateSettings(this.getResolutionChain(), field, opt_handler);
};


//endregion
//region --- Setup & Dispose
/** @inheritDoc */
anychart.core.Label.prototype.serialize = function() {
  var json = anychart.core.Label.base(this, 'serialize');
  var val;
  if (goog.isDef(this.getOwnOption('background'))) {
    val = this.background().serialize();
    if (!goog.object.isEmpty(val))
      json['background'] = val;
  }
  if (goog.isDef(this.getOwnOption('padding'))) {
    val = this.padding().serialize();
    if (!goog.object.isEmpty(val))
      json['padding'] = val;
  }

  anychart.core.settings.serialize(this, this.TEXT_DESCRIPTORS, json, 'Labels factory label text');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Labels factory label props');

  var adjustFontSize = json['adjustFontSize'];
  if (!(adjustFontSize && (goog.isDef(adjustFontSize['width']) || goog.isDef(adjustFontSize['height']))))
    delete json['adjustFontSize'];

  if (!this.hasOwnOption('enabled'))
    delete json['enabled'];

  return json;
};


/** @inheritDoc */
anychart.core.Label.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.getOption('enabled');

  anychart.core.settings.deserialize(this, this.TEXT_DESCRIPTORS, config, opt_default);
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  anychart.core.Label.base(this, 'setupByJSON', config, opt_default);

  if (!goog.isDef(config['enabled'])) delete this.ownSettings['enabled'];
  this.setOption('enabled', 'enabled' in config ? config['enabled'] : enabledState);

  var propName = 'background';
  if (propName in config) {
    var background = this.background();
    if (opt_default) {
      background.setupInternal(!!opt_default, config[propName]);
    } else {
      this.background(config[propName]);
    }
    this.themeSettings[propName] = background.themeSettings;
    this.ownSettings[propName] = background.ownSettings;
  }

  propName = 'padding';
  if (propName in config) {
    var padding = this.padding();
    if (opt_default) {
      padding.setupInternal(!!opt_default, config[propName]);
    } else {
      this.padding(config[propName]);
    }
    this.themeSettings[propName] = padding.themeSettings;
    this.ownSettings[propName] = padding.ownSettings;
  }
};


/** @inheritDoc */
anychart.core.Label.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.background_,
      this.padding_);

  this.background_ = null;
  this.padding_ = null;

  anychart.core.Label.base(this, 'disposeInternal');
};



//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.Label.prototype;
  proto['padding'] = proto.padding;
  proto['background'] = proto.background;
  // proto['rotation'] = proto.rotation;
  // proto['textFormatter'] = proto.textFormatter;
  // proto['positionFormatter'] = proto.positionFormatter;
  // proto['position'] = proto.position;
  // proto['anchor'] = proto.anchor;
  // proto['offsetX'] = proto.offsetX;
  // proto['offsetY'] = proto.offsetY;
  // proto['connectorStroke'] = proto.connectorStroke;
  // proto['width'] = proto.width;
  // proto['height'] = proto.height;
  // proto['enabled'] = proto.enabled;
  // proto['adjustFontSize'] = proto.adjustFontSize;
  // proto['minFontSize'] = proto.minFontSize;
  // proto['maxFontSize'] = proto.maxFontSize;
})();
//endregion
