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
 */
anychart.core.Label = function() {
  anychart.core.Label.base(this, 'constructor');
  delete this.themeSettings['enabled'];

  /**
   * Label index.
   * @type {number}
   * @private
   */
  this.index_;

  /**
   * Label layer
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_;

  /**
   * @type {acgraph.vector.Text}
   * @protected
   */
  this.textElement;

  /**
   * @type {anychart.core.ui.Background}
   * @private
   */
  this.backgroundElement_;

  /**
   * @type {Object}
   * @protected
   */
  this.mergedSettings;

  /**
   * States.
   * @type {Array.<anychart.core.Label|Object>}
   * @private
   */
  this.settings_ = [];

  this.resetSettings();

  this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
      anychart.Signal.NEEDS_REDRAW);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['format', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS | anychart.ConsistencyState.LABELS_FACTORY_CACHE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['positionFormatter', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorStroke', anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR, anychart.Signal.NEEDS_REDRAW],
    ['rotation', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['width', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['clip', anychart.ConsistencyState.LABELS_FACTORY_CLIP, anychart.Signal.NEEDS_REDRAW],
    ['enabled', anychart.ConsistencyState.ENABLED, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW]
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
anychart.core.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS_FACTORY_POSITION |
    anychart.ConsistencyState.LABELS_FACTORY_CLIP |
    anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR |
    anychart.ConsistencyState.LABELS_FACTORY_CACHE;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.core.Label.settingsFieldsForMerge_ = [
  'background',
  'padding',
  'height',
  'width',
  'offsetY',
  'offsetX',
  'position',
  'anchor',
  'rotation',
  'format',
  'positionFormatter',
  'minFontSize',
  'maxFontSize',
  'clip',
  'connectorStroke',
  'adjustFontSize',
  'useHtml',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'fontColor',
  'textDirection',
  'wordWrap',
  'wordBreak',
  'fontOpacity',
  'fontDecoration',
  'fontStyle',
  'fontVariant',
  'letterSpacing',
  'lineHeight',
  'textIndent',
  'vAlign',
  'hAlign',
  'textOverflow',
  'selectable',
  'disablePointerEvents'
];


//endregion
//region --- Dom elements
/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.Label.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Returns connector graphics element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.Label.prototype.getConnectorElement = function() {
  return this.connector;
};


//endregion
//region --- States
/**
 * Root factory.
 * @param {anychart.core.utils.Factory} value .
 */
anychart.core.Label.prototype.setFactory = function(value) {
  this.factory_ = value;
};


/**
 * Label settings.
 * @param {Array.<anychart.core.Label|Object>=} opt_value Set of settings.
 * @return {Array.<anychart.core.Label|Object>} .
 */
anychart.core.Label.prototype.settings = function(opt_value) {
  if (goog.isDef(opt_value)) {
      this.settings_ = opt_value ? goog.array.slice(opt_value, 0) : opt_value;

      this.invalidate(
          anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
          anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  }

  return this.settings_;
};


/**
 * Invalidation state checker.
 * @param {number} state .
 * @return {boolean} .
 */
anychart.core.Label.prototype.checkInvalidationState = function(state) {
  return /** @type {boolean} */(this.iterateSettings_(function(stateOrStateName, settings) {
    if (anychart.utils.instanceOf(settings, anychart.core.Label)) {
      if (settings.hasInvalidationState(state))
        return true;
    }
  }, true) || this.hasInvalidationState(state));
};


//endregion
//region --- Settings
/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Label.prototype.TEXT_DESCRIPTORS = anychart.core.settings.createTextPropertiesDescriptors();
anychart.core.settings.populate(anychart.core.Label, anychart.core.Label.prototype.TEXT_DESCRIPTORS);


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
  var anchorNoAutoNormalizer = function (value) {
    var res = anychart.enums.normalizeAnchor(value, anychart.enums.Anchor.AUTO);
    if (res == anychart.enums.Anchor.AUTO)
      res = undefined;
    return res;
  };

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionFormatter', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anchorNoAutoNormalizer],
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


//----------------------------------------------------------------------------------------------------------------------
//
//  Internal settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns label index.
 * @return {number}
 */
anychart.core.Label.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets labels index.
 * @param {number} index Index to set.
 * @return {anychart.core.Label}
 */
anychart.core.Label.prototype.setIndex = function(index) {
  this.index_ = +index;
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background and Padding.
//
//----------------------------------------------------------------------------------------------------------------------
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
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
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
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Auto settings.
//
//----------------------------------------------------------------------------------------------------------------------
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
      if (!goog.isDef(this.ownSettings['rotation']) || isNaN(this.ownSettings['rotation']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return isNaN(this.autoSettings['rotation']) ? undefined : this.autoSettings['rotation'];
  }
};


/**
 * Getter for label anchor settings.
 * @param {(anychart.enums.Anchor|string)=} opt_value .
 * @return {!anychart.core.Label|anychart.enums.Anchor} .
 */
anychart.core.Label.prototype.autoAnchor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer(opt_value);
    if (this.autoSettings['anchor'] !== value) {
      this.autoSettings['anchor'] = value;
      if (!goog.isDef(this.ownSettings['anchor']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['anchor'];
  }
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
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['vertical'];
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Providers.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets/Sets format provider.
 * @param {*=} opt_value Format provider.
 * @return {*} Format provider or self for chaining.
 */
anychart.core.Label.prototype.formatProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.formatProvider_ != opt_value) {
      this.formatProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.formatProvider_;
  }
};


/**
 * Gets/Sets position provider.
 * @param {*=} opt_value Position provider.
 * @return {*} Position provider or self for chaining.
 */
anychart.core.Label.prototype.positionProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.positionProvider_ != opt_value) {
      this.positionProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_POSITION, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.positionProvider_;
  }
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
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.Label.prototype.getOption = function(name) {
  this.updateComplexSettings();
  return this.ownSettings[name];
};


/**
 * Returns own and auto option value.
 * @param {string} name
 * @return {*}
 */
anychart.core.Label.prototype.getOwnAndAutoOption = function(name) {
  this.updateComplexSettings();
  return this.ownSettings[name];
};


//endregion
//region --- Settings manipulations
/**
 * Measures plain text on label's settings. NOTE: avoid using string tokens.
 * @param {string} text - Text to measure.
 * @return {anychart.math.Rect}
 */
anychart.core.Label.prototype.measureWithText = function(text) {
  var factory;
  if (this.factory_) {
    factory = this.factory_;
  } else {
    if (!anychart.core.ui.LabelsFactory.measureTextFactory) {
      anychart.core.ui.LabelsFactory.measureTextFactory = new anychart.core.ui.LabelsFactory();
      anychart.core.ui.LabelsFactory.measureTextFactory.setOption('positionFormatter', function() {
        return this['value'];
      });
    }
    factory = anychart.core.ui.LabelsFactory.measureTextFactory;
  }

  var sett = this.getMergedSettings();
  sett['format'] = String(text);
  return factory.measure({}, this.positionProvider(), sett);
};


/**
 * Reset settings.
 */
anychart.core.Label.prototype.resetSettings = function() {
  goog.disposeAll(this.background_, this.padding_);

  this.background_ = null;
  this.padding_ = null;

  this.ownSettings = {};
  this.autoSettings = {};
  this.settings_ = null;

  this.dropMergedSettings();
};


/**
 * Returns final value of settings with passed name.
 * @param {string} value Name of settings.
 * @return {*} settings value.
 */
anychart.core.Label.prototype.getFinalSettings = function(value) {
  if (value == 'adjustFontSize') {
    var adjustByWidth = this.resolveSetting_(value, function(value) {
      return value.width;
    });
    var adjustByHeight = this.resolveSetting_(value, function(value) {
      return value.height;
    });
    return {width: adjustByWidth, height: adjustByHeight};
  } else {
    var finalSetting = this.resolveSetting_(value);
    var result;
    if (value == 'padding') {
      result = new anychart.core.utils.Padding();
      result.setup(finalSetting);
    } else if (value == 'background') {
      result = new anychart.core.ui.Background();
      result.setup(finalSetting);
    } else {
      result = finalSetting;
    }
    return result;
  }
};


/**
 * Drawing plans iterator.
 * @param {Function} processor .
 * @param {boolean=} opt_invert .
 * @param {string=} opt_field .
 * @param {Function=} opt_handler .
 * @return {*}
 * @private
 */
anychart.core.Label.prototype.iterateSettings_ = function(processor, opt_invert, opt_field, opt_handler) {
  var iterator = opt_invert ? goog.array.forEachRight : goog.array.forEach;

  var result = void 0;
  var settings = this.settings();

  iterator(settings, function(state, i) {
    var stateSettings = goog.isString(state) ? state == 'auto' ? this.autoSettings : this.states_[state] : state;

    if (!stateSettings)
      return;

    var processedSetting = processor.call(this, state, stateSettings, i, opt_field, opt_handler);
    if (goog.isDef(processedSetting)) {
      if (goog.typeOf(processedSetting) == 'object') {
        if (goog.isDefAndNotNull(result)) {
          opt_invert ? goog.object.extend(result, processedSetting) : goog.object.extend(processedSetting, result);
        } else {
          result = goog.object.clone(processedSetting);
        }
      } else {
        result = processedSetting;
      }
    }
  }, this);

  return result;
};


/**
 * AdjustFontSize normalizer.
 * @param {Object=} opt_value
 * @return {{width:boolean,height:boolean}} .
 */
anychart.core.Label.normalizeAdjustFontSize = function(opt_value) {
  var adjustByWidth, adjustByHeight;
  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value)) {
      adjustByWidth = opt_value[0];
      adjustByHeight = opt_value[1];
    } else if (goog.isObject(opt_value)) {
      adjustByWidth = opt_value['width'];
      adjustByHeight = opt_value['height'];
    } else {
      adjustByWidth = !!opt_value;
      adjustByHeight = !!opt_value;
    }
  } else {
    adjustByWidth = void 0;
    adjustByHeight = void 0;
  }

  return {width: adjustByWidth, height: adjustByHeight};
};


/**
 * Default function for processing settings.
 * @param {*} state
 * @param {anychart.core.ui.LabelsFactory|anychart.core.Label|Object} settings
 * @param {number} index
 * @param {string} field
 * @param {Function=} opt_handler
 * @return {*}
 * @private
 */
anychart.core.Label.defaultSettingsProcessor_ = function(state, settings, index, field, opt_handler) {
  var setting;

  if (anychart.utils.instanceOf(settings, anychart.core.Label)) {
    if (field == 'enabled') {
      var result = settings[field]();
      setting = !goog.isNull(result) ? result : undefined;
    } else {
      setting = settings.getOwnAndAutoOption(field);
    }
  } else if (goog.typeOf(settings) == 'object') {
    if (field == 'adjustFontSize') {
      setting = anychart.core.Label.normalizeAdjustFontSize(settings[field]);
    } else {
      setting = settings[field];
      if (field == 'enabled' && goog.isNull(setting))
        setting = undefined;
    }
  }
  if (setting) {
    if (goog.isFunction(setting.serialize)) {
      setting = setting.serialize();
    }
  }
  if (opt_handler && goog.isDef(setting))
    setting = opt_handler(setting);
  return setting;
};


/**
 * Settings resolver.
 * @param {string} field
 * @param {Function=} opt_handler
 * @return {*}
 * @private
 */
anychart.core.Label.prototype.resolveSetting_ = function(field, opt_handler) {
  return this.iterateSettings_(anychart.core.Label.defaultSettingsProcessor_, true, field, opt_handler);
};


/**
 * Drops merged settings.
 */
anychart.core.Label.prototype.dropMergedSettings = function() {
  this.mergedSettings = null;
};


/**
 * Returns merged settings.
 * @return {!Object}
 */
anychart.core.Label.prototype.getMergedSettings = function() {
  var settings = this.settings();
  if (settings.length == 1) {
    this.mergedSettings = settings[0];
  }

  if (this.mergedSettings)
    return goog.object.clone(this.mergedSettings);

  var fields = anychart.core.Label.settingsFieldsForMerge_;
  var mergedSettings = {};
  for (var i = 0, len = fields.length; i < len; i++) {
    var field = fields[i];
    var finalSettings = this.getFinalSettings(field);

    if (field == 'adjustFontSize') {
      mergedSettings['adjustByWidth'] = finalSettings.width;
      mergedSettings['adjustByHeight'] = finalSettings.height;
    } else {
      mergedSettings[field] = finalSettings;
    }
  }

  this.mergedSettings = mergedSettings;
  return goog.object.clone(this.mergedSettings);
};


//endregion
//region --- Measuring and calculations
/**
 * Adjust font size by width/height.
 * @param {number} originWidth
 * @param {number} originHeight
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @param {boolean} adjustByWidth
 * @param {boolean} adjustByHeight
 * @return {number}
 */
anychart.core.Label.prototype.calculateFontSize = function(originWidth, originHeight, minFontSize, maxFontSize, adjustByWidth, adjustByHeight) {
  /** @type {acgraph.vector.Text} */
  var text = this.createSizeMeasureElement_();

  var evaluator = function(fontSize) {
    text.fontSize(fontSize);
    var bounds = text.getBounds();
    var width = bounds.width;
    var height = bounds.height;
    var res;
    if (adjustByWidth && (width > originWidth) || adjustByHeight && (height > originHeight)) {
      res = -1;
    } else if (adjustByWidth && (width == originWidth) || adjustByHeight && (height == originHeight)) {
      res = 0;
    } else {
      res = 1;
    }
    return res;
  };

  var fonts = goog.array.range(minFontSize, maxFontSize + 1);
  var res = goog.array.binarySelect(fonts, evaluator);
  if (res < 0) {
    res = ~res - 1;
  }
  return fonts[goog.math.clamp(res, 0, fonts.length)];
};


/**
 * Creates and returns size measure element.
 * @return {!acgraph.vector.Text}
 * @private
 */
anychart.core.Label.prototype.createSizeMeasureElement_ = function() {
  var mergedSettings = this.getMergedSettings();

  var isHtml = mergedSettings['useHtml'];
  var formatProvider = this.formatProvider();
  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CACHE)) {
    this.factory_.dropCallsCache(this.getIndex());
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);
  }
  var text = this.factory_.callFormat(mergedSettings['format'], formatProvider, this.getIndex());

  if (!this.fontSizeMeasureElement_) {
    this.fontSizeMeasureElement_ = acgraph.text();
    this.fontSizeMeasureElement_.attr('aria-hidden', 'true');
  }

  if (isHtml) this.fontSizeMeasureElement_.htmlText(goog.isDef(text) ? String(text) : '');
  else this.fontSizeMeasureElement_.text(goog.isDef(text) ? String(text) : '');

  this.iterateSettings_(function(state, settings, index) {
    var isInit = index == 0;
    if (anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory) || anychart.utils.instanceOf(settings, anychart.core.Label)) {
      this.applyTextSettings.call(settings, this.fontSizeMeasureElement_, isInit);
    } else {
      this.applyTextSettings(this.fontSizeMeasureElement_, isInit, settings);
    }
  }, true);

  return this.fontSizeMeasureElement_;
};


//endregion
//region --- Drawing
/**
 * Resets label to the initial state, but leaves DOM elements intact, but without the parent.
 */
anychart.core.Label.prototype.clear = function() {
  this.resetSettings();
  if (this.layer_) {
    this.layer_.parent(null);
    this.layer_.removeAllListeners();
  }
  this.invalidate(anychart.ConsistencyState.CONTAINER);
};


/**
 * Label drawing.
 * @param {anychart.math.Rect} bounds Outter label bounds.
 * @param {anychart.math.Rect} parentBounds Parent bounds.
 */
anychart.core.Label.prototype.drawLabel = function(bounds, parentBounds) {
  var positionFormatter = this.mergedSettings['positionFormatter'];
  var isTextByPath = !!this.textElement.path();
  var anchor = isTextByPath ?
      anychart.enums.Anchor.CENTER :
      anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer(this.mergedSettings['anchor']) || anychart.enums.Anchor.LEFT_TOP;

  var isVertical = this.autoVertical();

  var offsetX = this.mergedSettings['offsetX'];
  var offsetY = this.mergedSettings['offsetY'];

  var parentWidth = 0, parentHeight = 0;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var positionProvider = this.positionProvider();
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
  var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);

  var connectorPoint = positionProvider && positionProvider['connectorPoint'];
  if (this.connector) {
    this.connector.clear();
    this.connector.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }
  if (connectorPoint) {
    if (!this.connector) {
      this.connector = this.layer_.path();
      this.connector.disableStrokeScaling(true);
    }
    this.connector.stroke(this.mergedSettings['connectorStroke']);
    var formattedConnectorPosition = goog.object.clone(positionFormatter.call(connectorPoint, connectorPoint));
    this.connector.moveTo(position.x, position.y).lineTo(formattedConnectorPosition['x'], formattedConnectorPosition['y']);
  }

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, bounds.width, bounds.height), anchor);

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  var offsetXNormalized = goog.isDef(offsetX) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetX), parentWidth) : 0;
  var offsetYNormalized = goog.isDef(offsetY) ? anychart.utils.normalizeSize(/** @type {number|string} */(offsetY), parentHeight) : 0;

  if (isVertical)
    anychart.utils.applyOffsetByAnchor(position, anchor, offsetYNormalized, offsetXNormalized);
  else
    anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNormalized, offsetYNormalized);

  bounds.left = position.x;
  bounds.top = position.y;

  this.textElement.x(/** @type {number} */(this.textX + position.x)).y(/** @type {number} */(this.textY + position.y));
};


/**
 * Connector drawing.
 */
anychart.core.Label.prototype.drawConnector = function() {
  var positionProvider = this.positionProvider();
  var positionFormatter = this.mergedSettings['positionFormatter'];
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
  var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);

  var connectorPoint = positionProvider && positionProvider['connectorPoint'];
  if (this.connector) {
    this.connector.clear();
    this.connector.setTransformationMatrix(1, 0, 0, 1, 0, 0);
  }
  if (connectorPoint) {
    if (!this.connector) {
      this.connector = this.layer_.path();
      this.connector.disableStrokeScaling(true);
    }
    this.connector.stroke(this.mergedSettings['connectorStroke']);
    var formattedConnectorPosition = goog.object.clone(positionFormatter.call(connectorPoint, connectorPoint));
    this.connector.moveTo(position.x, position.y).lineTo(formattedConnectorPosition['x'], formattedConnectorPosition['y']);
  }
};


/**
 * Applies text settings to text element.
 * @param {!acgraph.vector.Text} textElement Text element to apply settings to.
 * @param {boolean} isInitial - Whether is initial operation.
 * @param {Object=} opt_settings .
 * @this {anychart.core.Label|anychart.core.ui.LabelsFactory}
 */
anychart.core.Label.prototype.applyTextSettings = function(textElement, isInitial, opt_settings) {
  var textVal, useHtml, text;
  var target = goog.isDef(opt_settings) ?
      function(value) { return opt_settings[value]; } :
      anychart.utils.instanceOf(this, anychart.core.Label) ?
          this.getOwnOption :
          anychart.core.ui.LabelsFactory.prototype.getOwnAndAutoOption;

  textVal = target.call(this, 'text');
  useHtml = target.call(this, 'useHtml');

  if (isInitial || goog.isDef(textVal) || goog.isDef(useHtml)) {
    text = /** @type {string} */(textVal);
    if (useHtml) {
      textElement.htmlText(text);
    } else {
      textElement.text(text);
    }
  }

  textElement.fontSize(/** @type {number|string} */ (target.call(this, 'fontSize')));
  textElement.fontFamily(/** @type {string} */ (target.call(this, 'fontFamily')));
  textElement.color(/** @type {string} */ (target.call(this, 'fontColor')));
  textElement.direction(/** @type {string} */ (target.call(this, 'textDirection')));
  textElement.wordWrap(/** @type {string} */ (target.call(this, 'wordWrap')));
  textElement.wordBreak(/** @type {string} */ (target.call(this, 'wordBreak')));
  textElement.opacity(/** @type {number} */ (target.call(this, 'fontOpacity')));
  textElement.decoration(/** @type {string} */ (target.call(this, 'fontDecoration')));
  textElement.fontStyle(/** @type {string} */ (target.call(this, 'fontStyle')));
  textElement.fontVariant(/** @type {string} */ (target.call(this, 'fontVariant')));
  textElement.fontWeight(/** @type {number|string} */ (target.call(this, 'fontWeight')));
  textElement.letterSpacing(/** @type {number|string} */ (target.call(this, 'letterSpacing')));
  textElement.lineHeight(/** @type {number|string} */ (target.call(this, 'lineHeight')));
  textElement.textIndent(/** @type {number} */ (target.call(this, 'textIndent')));
  textElement.vAlign(/** @type {string} */ (target.call(this, 'vAlign')));
  textElement.hAlign(/** @type {string} */ (target.call(this, 'hAlign')));
  textElement.textOverflow(/** @type {string} */ (target.call(this, 'textOverflow')));
  textElement.selectable(/** @type {boolean} */ (target.call(this, 'selectable')));
  textElement.disablePointerEvents(/** @type {boolean} */ (target.call(this, 'disablePointerEvents')));
};


/**
 * Label drawing.
 * @return {anychart.core.Label} Returns self for chaining.
 */
anychart.core.Label.prototype.draw = function() {
  var factory = this.factory_;
  var mergedSettings;

  if (!this.layer_)
    this.layer_ = acgraph.layer();
  this.layer_.tag = this.index_;

  var enabled = this.getFinalSettings('enabled');

  if (this.checkInvalidationState(anychart.ConsistencyState.ENABLED)) {
    if (!enabled) {
      if (this.layer_) this.layer_.parent(null);
      this.markConsistent(anychart.ConsistencyState.ALL);
      return this;
    } else {
      if (this.container() && !this.layer_.parent())
        this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
  }

  if (!enabled)
    return this;

  if (this.checkInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (this.container())
      this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CACHE)) {
    factory.dropCallsCache(this.getIndex());
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);
  }

  if (this.checkInvalidationState(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS)) {
    this.updateComplexSettings();
    this.dropMergedSettings();
    mergedSettings = this.getMergedSettings();

    var formatProvider = this.formatProvider();
    var text = factory.callFormat(mergedSettings['format'], formatProvider, this.getIndex());

    this.layer_.setTransformationMatrix(1, 0, 0, 1, 0, 0);

    var backgroundJson, isBackgroundEnabled;
    var bgSettings = mergedSettings['background'];
    if (anychart.utils.instanceOf(bgSettings, anychart.core.ui.Background)) {
      if (bgSettings.enabled() || (this.backgroundElement_ && this.backgroundElement_.enabled()))
        backgroundJson = bgSettings.serialize();
    } else {
      backgroundJson = bgSettings;
    }
    if (goog.isObject(backgroundJson) && backgroundJson && !('enabled' in backgroundJson))
      backgroundJson['enabled'] = false;

    isBackgroundEnabled = goog.isString(backgroundJson) ||
        goog.isBoolean(backgroundJson) ||
        (backgroundJson && backgroundJson['enabled']);

    if (isBackgroundEnabled || this.backgroundElement_) {
      if (!this.backgroundElement_) {
        this.backgroundElement_ = new anychart.core.ui.Background();
        this.backgroundElement_.zIndex(0);
        this.backgroundElement_.container(this.layer_);
      }
      if (this.initBgSettings)
        this.backgroundElement_.setup(anychart.utils.instanceOf(this.initBgSettings, anychart.core.ui.Background) ? this.initBgSettings.serialize() : this.initBgSettings);
      this.backgroundElement_.setup(backgroundJson);
      this.backgroundElement_.draw();
    } else if (bgSettings) {
      this.initBgSettings = bgSettings;
    }

    this.getTextElement();

    //define parent bounds
    var parentWidth, parentHeight;
    this.finalParentBounds = /** @type {anychart.math.Rect} */(this.iterateSettings_(function(state, settings) {
      if (anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory)) {
        var parentBounds = settings.parentBounds();
        if (parentBounds)
          return parentBounds;
      }
    }, true));

    if (!this.finalParentBounds) {
      if (factory.container()) {
        this.finalParentBounds = factory.container().getBounds();
      } else {
        this.finalParentBounds = anychart.math.rect(0, 0, 0, 0);
      }
    }
    if (this.finalParentBounds) {
      parentWidth = this.finalParentBounds.width;
      parentHeight = this.finalParentBounds.height;
    }

    var isHtml = this.mergedSettings['useHtml'];

    this.textElement.width(null);
    this.textElement.height(null);

    if (isHtml) this.textElement.htmlText(goog.isDef(text) ? String(text) : '');
    else this.textElement.text(goog.isDef(text) ? String(text) : '');

    this.applyTextSettings(this.textElement, true, mergedSettings);

    //define is width and height set from settings
    var isWidthSet = !goog.isNull(mergedSettings['width']);
    var isHeightSet = !goog.isNull(mergedSettings['height']);

    /** @type  {anychart.math.Rect} */
    var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
    //calculate text width and outer width

    var padding;
    if (anychart.utils.instanceOf(mergedSettings['padding'], anychart.core.utils.Padding)) {
      padding = mergedSettings['padding'];
    } else if (goog.isObject(mergedSettings['padding']) || goog.isNumber(mergedSettings['padding']) || goog.isString(mergedSettings['padding'])) {
      padding = new anychart.core.utils.Padding();
      padding.setup(mergedSettings['padding']);
    }

    var autoWidth;
    var autoHeight;
    var textElementBounds;

    var width, textWidth;
    if (isWidthSet) {
      width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['width']), parentWidth));
      if (padding) {
        textWidth = padding.tightenWidth(width);
        this.textX = anychart.utils.normalizeSize(padding.getOption('left'), width);
      } else {
        this.textX = 0;
        textWidth = width;
      }
      outerBounds.width = width;
      autoWidth = false;
    } else {
      //we should ask text element about bounds only after text format and text settings are applied
      textElementBounds = this.textElement.getBounds();
      width = textElementBounds.width;
      if (padding) {
        outerBounds.width = padding.widenWidth(width);
        this.textX = anychart.utils.normalizeSize(padding.getOption('left'), outerBounds.width);
      } else {
        this.textX = 0;
        outerBounds.width = width;
      }
      autoWidth = true;
    }

    if (goog.isDef(textWidth)) this.textElement.width(textWidth);

    //calculate text height and outer height
    var height, textHeight;
    if (isHeightSet) {
      height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['height']), parentHeight));
      if (padding) {
        textHeight = padding.tightenHeight(height);
        this.textY = anychart.utils.normalizeSize(padding.getOption('top'), height);
      } else {
        this.textY = 0;
        textHeight = height;
      }
      outerBounds.height = height;
      autoHeight = false;
    } else {
      //we should ask text element about bounds only after text format and text settings are applied
      textElementBounds = this.textElement.getBounds();
      height = textElementBounds.height;
      if (padding) {
        outerBounds.height = padding.widenHeight(height);
        this.textY = anychart.utils.normalizeSize(padding.getOption('top'), outerBounds.height);
      } else {
        this.textY = 0;
        outerBounds.height = height;
      }
      autoHeight = true;
    }

    if (goog.isDef(textHeight)) this.textElement.height(textHeight);

    var canAdjustByWidth = !autoWidth;
    var canAdjustByHeight = !autoHeight;
    var needAdjust = ((canAdjustByWidth && mergedSettings['adjustByHeight']) || (canAdjustByHeight && mergedSettings['adjustByHeight']));

    if (needAdjust) {
      var calculatedFontSize;
      if (factory.adjustFontSizeMode() == anychart.enums.AdjustFontSizeMode.DIFFERENT) {
        calculatedFontSize = this.calculateFontSize(
            textWidth,
            textHeight,
            mergedSettings['minFontSize'],
            mergedSettings['maxFontSize'],
            mergedSettings['adjustByWidth'],
            mergedSettings['adjustByHeight']);
      } else {
        calculatedFontSize = this.iterateSettings_(function(state, settings) {
          if (anychart.utils.instanceOf(settings, anychart.core.ui.LabelsFactory)) {
            if (goog.isDef(settings.autoSettings['fontSize']))
              return settings.autoSettings['fontSize'];
          }
        }, true);
      }

      this.suspendSignalsDispatching();

      this.textElement.fontSize(/** @type {number|string} */(calculatedFontSize));

      //need fix outer bounds after applying adjust font size
      if (isWidthSet) {
        width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['width']), parentWidth));
        outerBounds.width = width;
      } else {
        //we should ask text element about bounds only after text format and text settings are applied
        textElementBounds = this.textElement.getBounds();
        width = textElementBounds.width;
        if (padding) {
          outerBounds.width = padding.widenWidth(width);
        } else {
          outerBounds.width = width;
        }
      }

      if (isHeightSet) {
        height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(mergedSettings['height']), parentHeight));
        outerBounds.height = height;
      } else {
        //we should ask text element about bounds only after text format and text settings are applied
        textElementBounds = this.textElement.getBounds();
        height = textElementBounds.height;
        if (padding) {
          outerBounds.height = padding.widenHeight(height);
        } else {
          outerBounds.height = height;
        }
      }

      this.resumeSignalsDispatching(false);
    }
    this.bounds_ = outerBounds;

    this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_POSITION);
    this.markConsistent(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS);
  }

  if (this.checkInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_POSITION)) {
    this.drawLabel(this.bounds_, this.finalParentBounds);

    if (isBackgroundEnabled) {
      this.backgroundElement_.parentBounds(this.bounds_);
      this.backgroundElement_.draw();
    }

    var coordinateByAnchor = anychart.utils.getCoordinateByAnchor(this.bounds_, this.mergedSettings['anchor']);
    this.layer_.setRotation(/** @type {number} */(this.mergedSettings['rotation']), coordinateByAnchor.x, coordinateByAnchor.y);

    this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR);
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_POSITION);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR)) {
    this.drawConnector();
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR);
  }

  if (this.checkInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CLIP)) {
    if (this.layer_)
      this.layer_.clip(this.mergedSettings['clip']);
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CLIP);
  }
  return this;
};


/**
 * Returns the textElement.
 * @return {!acgraph.vector.Text}
 */
anychart.core.Label.prototype.getTextElement = function() {
  if (!this.textElement) {
    this.textElement = acgraph.text();
    this.textElement.attr('aria-hidden', 'true');
    this.textElement.zIndex(1);
    if (!this.layer_) this.layer_ = acgraph.layer();
    this.textElement.parent(this.layer_);
    this.textElement.disablePointerEvents(true);
  }
  return this.textElement;
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

  anychart.core.settings.deserialize(this, this.TEXT_DESCRIPTORS, config);
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);

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
      this.padding_,
      this.backgroundElement_,
      this.textElement,
      this.layer_);

  this.backgroundElement_ = null;
  this.textElement = null;
  this.background_ = null;
  this.padding_ = null;

  anychart.core.Label.base(this, 'disposeInternal');
};



//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.Label.prototype;
  proto['getIndex'] = proto.getIndex;
  proto['padding'] = proto.padding;
  proto['background'] = proto.background;
  proto['clear'] = proto.clear;
  proto['measureWithText'] = proto.measureWithText;
  proto['draw'] = proto.draw;
  // proto['autoAnchor'] = proto.autoAnchor;//don't public
  // proto['autoRotation'] = proto.autoRotation;//don't public
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