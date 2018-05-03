//region --- Requiring and Providing
goog.provide('anychart.core.ui.LabelsFactory');
goog.provide('anychart.core.ui.LabelsFactory.Label');
goog.provide('anychart.standalones.LabelsFactory');
goog.provide('anychart.standalones.LabelsFactory.Label');
goog.require('acgraph.math');
goog.require('anychart.core.IStandaloneBackend');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
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
 * @implements {anychart.core.settings.IResolvable}
 * @implements {anychart.core.IStandaloneBackend}
 */
anychart.core.ui.LabelsFactory = function() {
  this.suspendSignalsDispatching();
  anychart.core.ui.LabelsFactory.base(this, 'constructor');
  delete this.themeSettings['enabled'];

  /**
   * Labels layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Labels Array.
   * @type {Array.<anychart.core.ui.LabelsFactory.Label>}
   * @private
   */
  this.labels_;

  /**
   * @type {Array.<string>}
   * @protected
   */
  this.settingsFieldsForMerge = [
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

  /**
   * Auto values of settings set by external controller.
   * @type {!Object}
   */
  this.autoSettings = {};

  this.adjustFontSizeMode('different');

  this.resumeSignalsDispatching(false);

  anychart.core.settings.createTextPropertiesDescriptorsMeta(this.descriptorsMeta,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS,
      anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED,
      anychart.Signal.NEEDS_REDRAW);
  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['format', anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['positionFormatter', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['connectorStroke', anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR, anychart.Signal.NEEDS_REDRAW],
    ['rotation', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['width', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['height', anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['clip', anychart.ConsistencyState.LABELS_FACTORY_CLIP, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.core.ui.LabelsFactory, anychart.core.VisualBase);


//region --- Class const
/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.LabelsFactory.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS_FACTORY_BACKGROUND |
    anychart.ConsistencyState.LABELS_FACTORY_HANDLERS |
    anychart.ConsistencyState.LABELS_FACTORY_CLIP |
    anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR;


/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_ = {
  /** Click. */
  'click': 0x01,

  /** Double click. */
  'dblclick': 0x02,

  /** Mouse down */
  'mousedown': 0x04,

  /** Mouse up */
  'mouseup': 0x08,

  /** Mouse over. */
  'mouseover': 0x10,

  /** Mouse out. */
  'mouseout': 0x20,

  /** Mouse move */
  'mousemove': 0x40,

  /** Touch start */
  'touchstart': 0x80,

  /** Touch move */
  'touchmove': 0x100,

  /** Touch end */
  'touchend': 0x200,

  /** Touch cancel.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  'touchcancel': 0x400

  //  /** Tap (fast touchstart-touchend) */
  //  'tap': 0x800
};


/**
 * MAGIC NUMBERS!!! MAGIC NUMBERS!!!111
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code! Tada!
 * @type {number}
 * @private
 */
anychart.core.ui.LabelsFactory.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


/**
 * Factory to measure plain text with styles.
 * NOTE: Do not export!
 * @type {?anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.LabelsFactory.measureTextFactory = null;


//endregion
//region --- Settings
/**
 * Special anchor normalizer that doesn't accept 'auto' and returns undefined in that case.
 * @param {*} value
 * @return {anychart.enums.Anchor|undefined}
 */
anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer = function(value) {
  var res = anychart.enums.normalizeAnchor(value, anychart.enums.Anchor.AUTO);
  if (res == anychart.enums.Anchor.AUTO)
    res = undefined;
  return res;
};


/**
 * Text descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelsFactory.prototype.TEXT_DESCRIPTORS = anychart.core.settings.createTextPropertiesDescriptors();
anychart.core.settings.populate(anychart.core.ui.LabelsFactory, anychart.core.ui.LabelsFactory.prototype.TEXT_DESCRIPTORS);


/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.ui.LabelsFactory.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'format', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionFormatter', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'connectorStroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotation', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'width', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'height', anychart.core.settings.numberOrPercentNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'clip', anychart.core.settings.asIsNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.ui.LabelsFactory, anychart.core.ui.LabelsFactory.prototype.SIMPLE_PROPS_DESCRIPTORS);


//----------------------------------------------------------------------------------------------------------------------
//
//  enabled.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter/setter for enabled.
 * @param {?boolean=} opt_value Value to set.
 * @return {!anychart.core.ui.LabelsFactory|boolean|null} .
 */
anychart.core.ui.LabelsFactory.prototype.enabled = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var prevEnabledState = this.getOption('enabled');
    if (!goog.isNull(opt_value)) {
      if (goog.isNull(prevEnabledState) && !!opt_value) {
        this.invalidate(anychart.ConsistencyState.ENABLED, this.getEnableChangeSignals());
      }
      anychart.core.ui.LabelsFactory.base(this, 'enabled', /** @type {boolean} */(opt_value));
    } else {
      anychart.core.ui.LabelsFactory.base(this, 'enabled', opt_value);
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
    return this;
  }
  return /** @type {?boolean} */(this.getOption('enabled'));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Background and Padding.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets the labels background settings.
 * @param {(string|Object|null|boolean)=} opt_value Background object to set.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.ui.Background)} Returns the background or itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.background = function(opt_value) {
  if (!this.ownSettings['background']) {
    var background = this.ownSettings['background'] = new anychart.core.ui.Background();
    background.markConsistent(anychart.ConsistencyState.ALL);
    background.listenSignals(this.backgroundInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    this.ownSettings['background'].setup(opt_value);
    return this;
  }
  return this.ownSettings['background'];
};


/**
 * Internal background invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.backgroundInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.ownSettings['background'].markConsistent(anychart.ConsistencyState.ALL);
    this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
  }
};


/**
 * Labels padding.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom Space object or top or top and bottom
 *    space.
 * @param {(string|number)=} opt_rightOrRightAndLeft Right or right and left space.
 * @param {(string|number)=} opt_bottom Bottom space.
 * @param {(string|number)=} opt_left Left space.
 * @return {!(anychart.core.ui.LabelsFactory|anychart.core.utils.Padding)} Padding or LabelsFactory for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.padding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.ownSettings['padding']) {
    var padding = this.ownSettings['padding'] = new anychart.core.utils.Padding();
    padding.listenSignals(this.paddingInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.ownSettings['padding'].setup.apply(this.ownSettings['padding'], arguments);
    return this;
  }
  return this.ownSettings['padding'];
};


/**
 * Listener for bounds invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.core.ui.LabelsFactory.prototype.paddingInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Text formatter.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets text formatter.
 * @return {Function|string} Text formatter.
 */
anychart.core.ui.LabelsFactory.prototype.getFormat = function() {
  return /** @type {Function|string} */(this.getOwnOption('format'));
};


/**
 * Sets text formatter.
 * @param {Function|string} value Text formatter value.
 */
anychart.core.ui.LabelsFactory.prototype.setFormat = function(value) {
  this.setOption('format', value);
};


/**
 * Getter/setter for textSettings.
 * @param {(Object|string)=} opt_objectOrName Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|Function)=} opt_value Setting value if used as a setter.
 * @return {!(anychart.core.ui.LabelsFactory|Object|string|number|boolean)} A copy of settings or the title for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.textSettings = function(opt_objectOrName, opt_value) {
  if (goog.isDef(opt_objectOrName)) {
    if (goog.isString(opt_objectOrName)) {
      if (goog.isDef(opt_value)) {
        if (opt_objectOrName in this.TEXT_DESCRIPTORS) {
          this[opt_objectOrName](opt_value);
        }
        return this;
      } else {
        return /** @type {!(Object|boolean|number|string)} */ (this.getOwnOption(opt_objectOrName));
      }
    } else if (goog.isObject(opt_objectOrName)) {
      for (var item in opt_objectOrName) {
        if (item in this.TEXT_DESCRIPTORS)
          this[item](opt_objectOrName[item]);
      }
    }
    return this;
  }

  var res = {};
  for (var key in this.TEXT_DESCRIPTORS) {
    if (key in this.TEXT_DESCRIPTORS) {
      var value = this.getOption(key);
      if (goog.isDef(value))
        res[key] = this.getOption(key);
    }
  }
  return res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Other settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Helper method.
 * @return {boolean} is adjustment enabled.
 */
anychart.core.ui.LabelsFactory.prototype.adjustEnabled = function() {
  var adjustFontSize = this.getOption('adjustFontSize');
  return !!adjustFontSize && (adjustFontSize['width'] || adjustFontSize['height']);
};


/**
 * @param {(anychart.enums.AdjustFontSizeMode|string)=} opt_value Adjust font size mode to set.
 * @return {anychart.enums.AdjustFontSizeMode|anychart.core.ui.LabelsFactory}
 */
anychart.core.ui.LabelsFactory.prototype.adjustFontSizeMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAdjustFontSizeMode(opt_value);
    if (this.adjustFontSizeMode_ != opt_value) {
      this.adjustFontSizeMode_ = opt_value;
      if (this.adjustEnabled())
        this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.adjustFontSizeMode_;
};


/**
 * Sets current ajust font size calculated for current bounds.
 * @param {null|string|number} value Adjusted font size.
 * @return {anychart.core.ui.LabelsFactory} Itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.setAdjustFontSize = function(value) {
  var needInvalidate = this.getOption('fontSize') != value;
  if (goog.isNull(value)) {
    delete this.autoSettings['fontSize'];
  } else {
    this.autoSettings['fontSize'] = value;
  }
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);

  return this;
};


/**
 * Sets labels color that parent series have set for it.
 * @param {string} value Auto color distributed by the series.
 * @return {anychart.core.ui.LabelsFactory} Itself for chaining call.
 */
anychart.core.ui.LabelsFactory.prototype.setAutoColor = function(value) {
  var needInvalidate = this.getOption('fontColor') != value;
  if (goog.isNull(value)) {
    delete this.autoSettings['fontColor'];
  } else {
    this.autoSettings['fontColor'] = value;
  }
  if (needInvalidate)
    this.invalidate(anychart.ConsistencyState.BOUNDS);

  return this;
};


//endregion
//region --- IResolvable implementation
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/**
 * Getter/setter for resolution low and high chain cache.
 * @param {Array.<Object|null|undefined>=} opt_value
 * @return {?Array.<Object|null|undefined>}
 */
anychart.core.ui.LabelsFactory.prototype.resolutionLowAndHighChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionLowAndHighChainCache_ = opt_value;
  }
  return this.resolutionLowAndHighChainCache_;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.getResolutionChain = function() {
  var chain = this.resolutionChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), this.getMidPriorityResolutionChain(), this.getLowPriorityResolutionChain());
    this.resolutionChainCache(chain);
  }
  return chain;
};


/**
 * Gets chain of low and high priority settings.
 * @return {?Array.<Object|null|undefined>}
 */
anychart.core.ui.LabelsFactory.prototype.getLowAndHighResolutionChain = function() {
  var chain = this.resolutionLowAndHighChainCache();
  if (!chain) {
    chain = goog.array.concat(this.getHighPriorityResolutionChain(), this.getLowPriorityResolutionChain());
    this.resolutionLowAndHighChainCache(chain);
  }
  return chain;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.autoSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/**
 * Gets chain of middle priority settings.
 * @return {Array.<Object|null|undefined>} - Chain of settings.
 */
anychart.core.ui.LabelsFactory.prototype.getMidPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getMidPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.ui.LabelsFactory.prototype.getOption = anychart.core.settings.getOption;


/**
 * Returns own and auto option value.
 * @param {string} name .
 * @return {*}
 */
anychart.core.ui.LabelsFactory.prototype.getOwnAndAutoOption = function(name) {
  var chain = this.getLowAndHighResolutionChain();
  for (var i = 0; i < chain.length; i++) {
    var obj = chain[i];
    if (obj) {
      var res = obj[name];
      if (goog.isDef(res))
        return res;
    }
  }
  return void 0;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.isResolvable = function() {
  return true;
};


//endregion
//region --- Settings management
/**
 * Returns object with changed states.
 * @return {Object.<boolean>}
 */
anychart.core.ui.LabelsFactory.prototype.getSettingsChangedStatesObj = function() {
  return this.ownSettings;
};


/**
 * Returns changed settings.
 * @return {Object}
 */
anychart.core.ui.LabelsFactory.prototype.getChangedSettings = function() {
  var result = {};
  goog.object.forEach(this.ownSettings, function(value, key) {
    if (goog.isDef(value)) {
      if (key == 'adjustByHeight' || key == 'adjustByWidth') {
        key = 'adjustFontSize';
      }

      result[key] = this[key]();
      if (key == 'padding' || key == 'background') {
        result[key] = this.getOwnOption(key).serialize();
      } else {
        result[key] = this.getOwnOption(key);
      }
    }
  }, this);
  return result;
};


//endregion
//region --- DOM Elements
/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Gets labels factory root layer;
 * @return {acgraph.vector.Layer}
 */
anychart.core.ui.LabelsFactory.prototype.getRootLayer = function() {
  return this.layer_;
};


//endregion
//region --- Labels management
/**
 * Clears an array of labels.
 * @param {number=} opt_index If set, removes only the label that is in passed index.
 * @return {anychart.core.ui.LabelsFactory} Returns itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.clear = function(opt_index) {
  if (!this.freeToUseLabelsPool_)
    this.freeToUseLabelsPool_ = [];

  if (this.labels_ && this.labels_.length) {
    if (goog.isDef(opt_index)) {
      if (this.labels_[opt_index]) {
        this.labels_[opt_index].clear();
        this.freeToUseLabelsPool_.push(this.labels_[opt_index]);
        this.dropCallsCache(opt_index);
        delete this.labels_[opt_index];
      }
    } else {
      this.dropCallsCache();
      for (var i = this.labels_.length; i--;) {
        var label = this.labels_[i];
        if (label) {
          label.clear();
          this.freeToUseLabelsPool_.push(label);
        }
      }
      this.labels_.length = 0;
      this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_HANDLERS, anychart.Signal.NEEDS_REDRAW);
    }
  } else
    this.labels_ = [];

  return this;
};


/**
 * Returns label by index (if there is such label).
 * @param {number} index Label index.
 * @return {anychart.core.ui.LabelsFactory.Label} Already existing label.
 */
anychart.core.ui.LabelsFactory.prototype.getLabel = function(index) {
  index = +index;
  return this.labels_ && this.labels_[index] ? this.labels_[index] : null;
};


/**
 * Labels count
 * @return {number}
 */
anychart.core.ui.LabelsFactory.prototype.labelsCount = function() {
  return this.labels_ ? this.labels_.length : 0;
};


/**
 * Creates new instance of anychart.core.ui.LabelsFactory.Label, saves it in the factory
 * and returns it.
 * @param {*} formatProvider Object that provides info for format function.
 * @param {*} positionProvider Object that provides info for positionFormatter function.
 * @param {number=} opt_index Label index.
 * @return {!anychart.core.ui.LabelsFactory.Label} Returns new label instance.
 */
anychart.core.ui.LabelsFactory.prototype.add = function(formatProvider, positionProvider, opt_index) {
  var label, index;
  if (!goog.isDef(this.labels_)) this.labels_ = [];

  if (goog.isDef(opt_index)) {
    index = +opt_index;
    label = this.labels_[index];
  }

  if (label) {
    label.suspendSignalsDispatching();
    label.clear();
  } else {
    label = this.freeToUseLabelsPool_ && this.freeToUseLabelsPool_.length > 0 ?
        this.freeToUseLabelsPool_.pop() :
        this.createLabel();
    label.suspendSignalsDispatching();

    if (goog.isDef(index)) {
      this.labels_[index] = label;
    } else {
      this.labels_.push(label);
      index = this.labels_.length - 1;
    }
    label.setIndex(index);
  }

  label.formatProvider(formatProvider);
  label.positionProvider(positionProvider);
  label.setFactory(this);
  label.state('pointNormal', label);
  label.state('seriesNormal', this);
  label.state('seriesNormalTheme', this.themeSettings);
  label.resumeSignalsDispatching(false);

  return label;
};


/**
 * @protected
 * @return {anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.LabelsFactory.prototype.createLabel = function() {
  return new anychart.core.ui.LabelsFactory.Label();
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Labels drawing.
 * @return {anychart.core.ui.LabelsFactory} Returns itself for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.draw = function() {
  if (this.isDisposed())
    return this;

  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    this.bindHandlersToGraphics(this.layer_);
  }

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.labels_) {
    goog.array.forEach(this.labels_, function(label, index) {
      if (label) {
        label.container(this.layer_);
        label.draw();
      }
    }, this);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.markConsistent(anychart.ConsistencyState.ALL);

  if (manualSuspend) stage.resume();
  return this;
};


//endregion
//region --- Measuring
/**
 * Returns label size.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.core.ui.LabelsFactory.prototype.getDimension = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var text;
  var textElementBounds;
  var textWidth;
  var textHeight;
  /** @type {anychart.math.Rect} */
  var outerBounds = new anychart.math.Rect(0, 0, 0, 0);
  var isWidthSet;
  var isHeightSet;
  var parentWidth;
  var parentHeight;
  var formatProvider;
  var positionProvider;

  //define parent bounds
  var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var measureLabel, textElement;
  var padding, widthSettings, heightSettings, offsetY, offsetX, anchor, format, isHtml;
  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.LabelsFactory.Label) && !opt_settings) {
    measureLabel = formatProviderOrLabel;
    textElement = measureLabel.getTextElement();
    formatProvider = measureLabel.formatProvider();
    positionProvider = opt_positionProvider || measureLabel.positionProvider() || {'value': {'x': 0, 'y': 0}};
    var settings = measureLabel.getMergedSettings();
    isHtml = settings['useHtml'];
    widthSettings = settings['width'];
    heightSettings = settings['height'];
    offsetY = /** @type {number|string} */(settings['offsetY']);
    offsetX = /** @type {number|string} */(settings['offsetX']);
    anchor = /** @type {string} */(settings['anchor']);
    format = /** @type {Function|string} */(settings['format']);
    padding = settings['padding'];
    if (!(anychart.utils.instanceOf(padding, anychart.core.utils.Padding)))
      padding = new anychart.core.utils.Padding(padding);

    textElement.style(settings);
  } else {
    if (!this.measureCustomLabel_) {
      this.measureCustomLabel_ = this.createLabel();
      this.measureCustomLabel_.setFactory(this);
    } else {
      this.measureCustomLabel_.clear();
    }
    if (!this.measureTextElement_) {
      this.measureTextElement_ = acgraph.text();
      this.measureTextElement_.attr('aria-hidden', 'true');
    }
    measureLabel = this.measureCustomLabel_;
    textElement = this.measureTextElement_;

    if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.LabelsFactory.Label)) {
      var label = (/** @type {anychart.core.ui.LabelsFactory.Label} */(formatProviderOrLabel));
      this.measureCustomLabel_.setup(label.getMergedSettings());
      formatProvider = label.formatProvider();
      positionProvider = opt_positionProvider || label.positionProvider() || {'value': {'x': 0, 'y': 0}};
    } else {
      formatProvider = formatProviderOrLabel;
      positionProvider = opt_positionProvider || {'value': {'x': 0, 'y': 0}};
    }
    this.measureCustomLabel_.setup(opt_settings);
    isHtml = goog.isDef(measureLabel.getOption('useHtml')) ? measureLabel.getOption('useHtml') : this.getOption('useHtml');
    padding = measureLabel.getOption('padding') || this.getOption('padding') || null;
    widthSettings = goog.isDef(measureLabel.getOption('width')) ? measureLabel.getOption('width') : this.getOption('width');
    heightSettings = goog.isDef(measureLabel.getOption('height')) ? measureLabel.getOption('height') : this.getOption('height');
    offsetY = /** @type {number|string} */(measureLabel.getOption('offsetY') || this.getOption('offsetY')) || 0;
    offsetX = /** @type {number|string} */(measureLabel.getOption('offsetX') || this.getOption('offsetX')) || 0;
    anchor = /** @type {string} */(measureLabel.getOption('anchor') || this.getOption('anchor'));
    format = /** @type {Function|string} */(measureLabel.getOption('format') || this.getOption('format'));

    measureLabel.applyTextSettings(textElement, true, this.themeSettings);
    measureLabel.applyTextSettings.call(this, textElement, false);
    measureLabel.applyTextSettings(textElement, false);
  }

  //we should ask text element about bounds only after text format and text settings are applied

  text = this.callFormat(format, formatProvider, opt_cacheIndex);
  textElement.width(null);
  textElement.height(null);
  if (isHtml) {
    textElement.htmlText(goog.isDefAndNotNull(text) ? String(text) : null);
  } else {
    textElement.text(goog.isDefAndNotNull(text) ? String(text) : null);
  }

  //define is width and height set from settings
  isWidthSet = !goog.isNull(widthSettings);
  isHeightSet = !goog.isNull(heightSettings);

  textElementBounds = textElement.getBounds();

  //calculate text width and outer width
  var width;
  if (isWidthSet) {
    width = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(widthSettings), parentWidth));
    textWidth = padding ? padding.tightenWidth(width) : width;
    outerBounds.width = width;
  } else {
    width = textElementBounds.width;
    outerBounds.width = padding ? padding.widenWidth(width) : width;
  }

  if (goog.isDef(textWidth)) textElement.width(textWidth);

  textElementBounds = textElement.getBounds();

  //calculate text height and outer height
  var height;
  if (isHeightSet) {
    height = Math.ceil(anychart.utils.normalizeSize(/** @type {number|string} */(heightSettings), parentHeight));
    textHeight = padding ? padding.tightenHeight(height) : height;
    outerBounds.height = height;
  } else {
    height = textElementBounds.height;
    outerBounds.height = padding ? padding.widenHeight(height) : height;
  }

  if (goog.isDef(textHeight)) textElement.height(textHeight);

  var formattedPosition = goog.object.clone(this.getOption('positionFormatter').call(positionProvider, positionProvider));

  return this.getDimensionInternal(outerBounds, formattedPosition, parentBounds, offsetX, offsetY, anchor);
};


/**
 * Get dimension internal
 * @param {anychart.math.Rect} outerBounds
 * @param {Object} formattedPosition
 * @param {anychart.math.Rect} parentBounds
 * @param {number|string} offsetX
 * @param {number|string} offsetY
 * @param {string} anchor
 * @return {anychart.math.Rect}
 */
anychart.core.ui.LabelsFactory.prototype.getDimensionInternal = function(outerBounds, formattedPosition, parentBounds, offsetX, offsetY, anchor) {
  var parentWidth, parentHeight;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      /** @type {string} */(anchor));

  position.x -= anchorCoordinate.x;
  position.y -= anchorCoordinate.y;

  offsetX = goog.isDef(offsetX) ? anychart.utils.normalizeSize(offsetX, parentWidth) : 0;
  offsetY = goog.isDef(offsetY) ? anychart.utils.normalizeSize(offsetY, parentHeight) : 0;

  anychart.utils.applyOffsetByAnchor(position, /** @type {anychart.enums.Anchor} */(anchor), offsetX, offsetY);

  outerBounds.left = position.x;
  outerBounds.top = position.y;

  return /** @type {anychart.math.Rect} */(outerBounds);
};


/**
 * Measure labels using formatProvider, positionProvider and returns labels bounds.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Labels bounds.
 */
anychart.core.ui.LabelsFactory.prototype.measure = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var arr = this.measureWithTransform(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);
  return anychart.math.Rect.fromCoordinateBox(arr);
};


/**
 * Measures label in its coordinate system and returns bounds as an array of points in parent coordinate system.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {Array.<number>} Label bounds.
 */
anychart.core.ui.LabelsFactory.prototype.measureWithTransform = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var rotation, anchor;
  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.LabelsFactory.Label)) {
    var labelRotation = formatProviderOrLabel.getOption('rotation');
    rotation = goog.isDef(labelRotation) ? labelRotation : this.getOption('rotation') || 0;
    anchor = formatProviderOrLabel.getOption('anchor') || this.getOption('anchor');
    if (anchor == anychart.enums.Anchor.AUTO && opt_settings && opt_settings['anchor']) {
      anchor = opt_settings['anchor'];
    }
    opt_cacheIndex = goog.isDef(opt_cacheIndex) ? opt_cacheIndex : formatProviderOrLabel.getIndex();
  } else {
    rotation = goog.isDef(opt_settings) && goog.isDef(opt_settings['rotation']) ? opt_settings['rotation'] : this.getOption('rotation') || 0;
    anchor = goog.isDef(opt_settings) && opt_settings['anchor'] || this.getOption('anchor');
  }

  var bounds = this.getDimension(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);

  var rotationAngle = /** @type {number} */(rotation);
  var point = anychart.utils.getCoordinateByAnchor(bounds, /** @type {anychart.enums.Anchor} */(anchor));
  var tx = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(rotationAngle), point.x, point.y);

  var arr = bounds.toCoordinateBox() || [];
  tx.transform(arr, 0, arr, 0, 4);

  return arr;
};


//endregion
//region --- Format calls management
/**
 * Calls text formatter in scope of provider, or returns value from cache.
 * @param {Function|string} formatter Text formatter function.
 * @param {*} provider Provider for text formatter.
 * @param {number=} opt_cacheIndex Label index.
 * @return {*}
 */
anychart.core.ui.LabelsFactory.prototype.callFormat = function(formatter, provider, opt_cacheIndex) {
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
  if (!this.formatCallsCache_)
    this.formatCallsCache_ = {};
  if (goog.isDefAndNotNull(opt_cacheIndex)) {
    if (!goog.isDef(this.formatCallsCache_[opt_cacheIndex])) {
      if (goog.isDef(provider) && provider['series']) {
        var series = /** @type {{getIterator: Function}} */ (provider['series']);
        var iterator = series.getIterator();
        if (goog.isFunction(iterator.select))
          iterator.select(goog.isDef(provider['index']) ? provider['index'] : opt_cacheIndex);
      }
      this.formatCallsCache_[opt_cacheIndex] = formatter.call(provider, provider);
    }

    return this.formatCallsCache_[opt_cacheIndex];
  }
  return formatter.call(provider, provider);
};


/**
 * Drops tet formatter calls cache.
 * @param {number=} opt_index
 * @return {anychart.core.ui.LabelsFactory} Self for chaining.
 */
anychart.core.ui.LabelsFactory.prototype.dropCallsCache = function(opt_index) {
  if (!goog.isDef(opt_index)) {
    this.formatCallsCache_ = {};
  } else {
    if (this.formatCallsCache_ && goog.isDef(this.formatCallsCache_[opt_index])) {
      delete this.formatCallsCache_[opt_index];
    }
  }
  return this;
};


//endregion
//region --- Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.ui.LabelsFactory.base(this, 'makeBrowserEvent', e);
  var target = res['domTarget'];
  var tag;
  while (anychart.utils.instanceOf(target, acgraph.vector.Element)) {
    tag = target.tag;
    if (anychart.utils.instanceOf(tag, anychart.core.VisualBase) || !anychart.utils.isNaN(tag))
      break;
    target = target.parent();
  }
  res['labelIndex'] = anychart.utils.toNumber(tag);
  return res;
};


//endregion
//region --- Setup & Dispose
/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.labels_,
      this.freeToUseLabelsPool_,
      this.measureCustomLabel_,
      this.layer_,
      this.ownSettings['background'],
      this.ownSettings['padding']);

  this.labels_ = null;
  this.freeToUseLabelsPool_ = null;
  this.measureCustomLabel_ = null;
  this.layer_ = null;
  this.ownSettings['background'] = null;
  this.ownSettings['padding'] = null;

  anychart.core.ui.LabelsFactory.base(this, 'disposeInternal');
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.serialize = function() {
  var json = anychart.core.ui.LabelsFactory.base(this, 'serialize');
  if (!goog.isDef(json['enabled'])) delete json['enabled'];

  var val;
  if (this.hasOwnOption('background')) {
    val = this.background().serialize();
    if (!goog.object.isEmpty(val))
      json['background'] = val;
  }
  if (this.hasOwnOption('padding')) {
    val = this.padding().serialize();
    if (!goog.object.isEmpty(val))
      json['padding'] = val;
  }

  var adjustFontSize = json['adjustFontSize'];
  if (!(adjustFontSize && (goog.isDef(adjustFontSize['width']) || goog.isDef(adjustFontSize['height']))))
    delete json['adjustFontSize'];

  anychart.core.settings.serialize(this, this.TEXT_DESCRIPTORS, json, 'Labels factory label text');
  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Labels factory label props');

  return json;
};


/** @inheritDoc */
anychart.core.ui.LabelsFactory.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.enabled();
  anychart.core.ui.LabelsFactory.base(this, 'setupByJSON', config, opt_default);
  if (opt_default) {
    anychart.core.settings.deserialize(this.themeSettings, this.TEXT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this.themeSettings, this.SIMPLE_PROPS_DESCRIPTORS, config);
    if ('enabled' in config) this.themeSettings['enabled'] = config['enabled'];
  } else {
    anychart.core.settings.deserialize(this, this.TEXT_DESCRIPTORS, config);
    anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
    this.enabled('enabled' in config ? config['enabled'] : enabledState);
  }

  if ('background' in config)
    this.background().setupInternal(!!opt_default, config['background']);

  if ('padding' in config)
    this.padding().setupInternal(!!opt_default, config['padding']);
};
//endregion