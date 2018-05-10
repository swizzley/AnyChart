//region --- Requiring and Providing
goog.provide('anychart.core.utils.LabelsFactory');
goog.provide('anychart.core.utils.LabelsFactory.Label');
goog.require('acgraph.math');
goog.require('anychart.core.utils.Factory');
goog.require('anychart.enums');
//endregion



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @param {function():anychart.core.IFactoryElement=} opt_ctor .
 * @constructor
 * @extends {anychart.core.utils.Factory}
 */
anychart.core.utils.LabelsFactory = function(opt_ctor) {
  anychart.core.utils.LabelsFactory.base(
      this,
      'constructor',
      opt_ctor || anychart.core.utils.LabelsFactory.DEFAULT_CONSTRUCTOR);

  this.adjustFontSizeMode_  = 'different';
};
goog.inherits(anychart.core.utils.LabelsFactory, anychart.core.utils.Factory);


//region --- Static props
/**
 * Default labels constructor.
 * @return {anychart.core.utils.LabelsFactory.Label}
 */
anychart.core.utils.LabelsFactory.DEFAULT_CONSTRUCTOR = function() {
  return new anychart.core.utils.LabelsFactory.Label();
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
anychart.core.utils.LabelsFactory.prototype.callFormat = function(formatter, provider, opt_cacheIndex) {
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
 * @return {anychart.core.utils.LabelsFactory} Self for chaining.
 */
anychart.core.utils.LabelsFactory.prototype.dropCallsCache = function(opt_index) {
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
//region --- Adjust font size mode
/**
 * @param {(anychart.enums.AdjustFontSizeMode|string)=} opt_value Adjust font size mode to set.
 * @return {anychart.enums.AdjustFontSizeMode|anychart.core.utils.LabelsFactory}
 */
anychart.core.utils.LabelsFactory.prototype.adjustFontSizeMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeAdjustFontSizeMode(opt_value);
    if (this.adjustFontSizeMode_ != opt_value) {
      this.adjustFontSizeMode_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  }
  return this.adjustFontSizeMode_;
};


//endregion
//region --- Measuring
/**
 * Returns label size.
 * @param {*|anychart.core.utils.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.core.utils.LabelsFactory.prototype.getDimension = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
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
  var defaultSettings = opt_settings || {};

  //define parent bounds
  var parentBounds = /** @type {anychart.math.Rect} */(defaultSettings['parentBounds']);
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var measureLabel, textElement;
  var padding, widthSettings, heightSettings, offsetY, offsetX, anchor, format, isHtml;
  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.utils.LabelsFactory.Label) && !opt_settings) {
    measureLabel = /** @type {anychart.core.ui.Label} */(formatProviderOrLabel);
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

    textElement.style(settings);
  } else {
    if (!this.measureCustomLabel_) {
      this.measureCustomLabel_ = new anychart.core.utils.LabelsFactory.Label();
    } else {
      this.measureCustomLabel_.clear();
    }
    if (!this.measureTextElement_) {
      this.measureTextElement_ = acgraph.text();
      this.measureTextElement_.attr('aria-hidden', 'true');
    }
    measureLabel = this.measureCustomLabel_;
    textElement = this.measureTextElement_;

    if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.utils.LabelsFactory.Label)) {
      var label = (/** @type {anychart.core.ui.Label} */(formatProviderOrLabel));
      measureLabel.setup(label.getMergedSettings());
      formatProvider = label.formatProvider();
      positionProvider = opt_positionProvider || label.positionProvider() || {'value': {'x': 0, 'y': 0}};
    } else {
      formatProvider = formatProviderOrLabel;
      positionProvider = opt_positionProvider || {'value': {'x': 0, 'y': 0}};
    }
    measureLabel.setup(opt_settings);
    isHtml = measureLabel.getFinalSettings('useHtml');
    if (!goog.isDef(isHtml))
      isHtml = defaultSettings['useHtml'];

    var labelPadding = !goog.object.isEmpty(measureLabel.ownSettings['padding']) || !goog.object.isEmpty(measureLabel.themeSettings['padding']) ?
        measureLabel.padding() : void 0;

    padding = labelPadding || defaultSettings['padding'] || null;
    widthSettings = measureLabel.getFinalSettings('width');

    if (!goog.isDef(widthSettings))
      widthSettings = defaultSettings['width'] || 0;
    heightSettings = measureLabel.getFinalSettings('height');
    if (!goog.isDef(heightSettings))
      heightSettings = defaultSettings['height'] || 0;

    offsetY = /** @type {number|string} */(measureLabel.getFinalSettings('offsetY')) || defaultSettings['offsetY'] || 0;
    offsetX = /** @type {number|string} */(measureLabel.getFinalSettings('offsetX')) || defaultSettings['offsetX'] || 0;
    anchor = /** @type {string} */(measureLabel.getFinalSettings('anchor') || defaultSettings['anchor']);
    format = /** @type {Function|string} */(measureLabel.getFinalSettings('format')) || defaultSettings['format'];

    measureLabel.applyTextSettings(textElement, true, defaultSettings);
    measureLabel.applyTextSettings(textElement, false);
  }
  if (!(anychart.utils.instanceOf(padding, anychart.core.utils.Padding)))
    padding = new anychart.core.utils.Padding(/** @type {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})} */(padding));

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

  var formattedPosition = goog.object.clone(defaultSettings['positionFormatter'].call(positionProvider, positionProvider));

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
anychart.core.utils.LabelsFactory.prototype.getDimensionInternal = function(outerBounds, formattedPosition, parentBounds, offsetX, offsetY, anchor) {
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
anychart.core.utils.LabelsFactory.prototype.measure = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
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
anychart.core.utils.LabelsFactory.prototype.measureWithTransform = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var rotation = opt_settings ? opt_settings['rotation'] : 0;
  var anchor = opt_settings ? opt_settings['anchor'] : 'center';

  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.utils.LabelsFactory.Label)) {
    var label = /** @type {anychart.core.utils.LabelsFactory.Label} */(formatProviderOrLabel);
    rotation = /** @type {number} */(label.getFinalSettings('rotation')) || rotation;
    anchor = /** @type {anychart.enums.Anchor} */(label.getFinalSettings('anchor')) || anchor;

    if (anchor == anychart.enums.Anchor.AUTO && opt_settings && opt_settings['anchor']) {
      anchor = opt_settings['anchor'];
    }
    opt_cacheIndex = goog.isDef(opt_cacheIndex) ? opt_cacheIndex : label.getIndex();
  } else if (goog.isDef(opt_settings)) {
    rotation = opt_settings['rotation'] || rotation;
    anchor = opt_settings['anchor'] || anchor;
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


/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.utils.LabelsFactory.Label = function() {
  anychart.core.utils.LabelsFactory.Label.base(this, 'constructor');

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
   * @type {Array.<anychart.core.utils.LabelsFactory.Label|Object>}
   * @private
   */
  this.settings_ = [];

  this.resetSettings();

  this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);
};
goog.inherits(anychart.core.utils.LabelsFactory.Label, anychart.core.VisualBase);


//region --- Class const
/**
 * Supported signals.
 * @type {number}
 */
anychart.core.utils.LabelsFactory.Label.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBase.prototype.SUPPORTED_SIGNALS |
    anychart.Signal.BOUNDS_CHANGED;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.utils.LabelsFactory.Label.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.LABELS_FACTORY_POSITION |
    anychart.ConsistencyState.LABELS_FACTORY_CLIP |
    anychart.ConsistencyState.LABELS_FACTORY_CONNECTOR |
    anychart.ConsistencyState.LABELS_FACTORY_CACHE;


/**
 * @type {Array.<string>}
 */
anychart.core.utils.LabelsFactory.Label.settingsFieldsForMerge = [
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
  'disablePointerEvents',
  'zIndex',
  'enabled'
];


//endregion
//region --- Dom elements
/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.utils.LabelsFactory.Label.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Returns connector graphics element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.utils.LabelsFactory.Label.prototype.getConnectorElement = function() {
  return this.connector;
};


//endregion
//region --- Settings
/**
 * Returns label index.
 * @return {number}
 */
anychart.core.utils.LabelsFactory.Label.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets labels index.
 * @param {number} index Index to set.
 * @return {anychart.core.utils.LabelsFactory.Label}
 */
anychart.core.utils.LabelsFactory.Label.prototype.setIndex = function(index) {
  this.index_ = +index;
  return this;
};


/**
 * Root factory.
 * @param {anychart.core.utils.LabelsFactory} value .
 */
anychart.core.utils.LabelsFactory.Label.prototype.setFactory = function(value) {
  this.factory_ = value;
};


/**
 * Root factory.
 * @return {anychart.core.utils.LabelsFactory} value .
 */
anychart.core.utils.LabelsFactory.Label.prototype.getFactory = function() {
  return this.factory_;
};


/**
 * Label settings.
 * @param {Array.<anychart.core.utils.LabelsFactory.Label|Object>=} opt_value Set of settings.
 * @return {Array.<anychart.core.utils.LabelsFactory.Label|Object>} .
 */
anychart.core.utils.LabelsFactory.Label.prototype.settings = function(opt_value) {
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
anychart.core.utils.LabelsFactory.Label.prototype.checkInvalidationState = function(state) {
  return /** @type {boolean} */(this.iterateSettings_(function(stateOrStateName, settings) {
    if (anychart.utils.instanceOf(settings, anychart.core.utils.LabelsFactory.Label)) {
      if (settings.hasInvalidationState(state))
        return true;
    }
  }, true) || this.hasInvalidationState(state));
};


/**
 * Gets/Sets format provider.
 * @param {*=} opt_value Format provider.
 * @return {*} Format provider or self for chaining.
 */
anychart.core.utils.LabelsFactory.Label.prototype.formatProvider = function(opt_value) {
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
anychart.core.utils.LabelsFactory.Label.prototype.positionProvider = function(opt_value) {
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
//region --- Settings manipulations
/**
 * Measures plain text on label's settings. NOTE: avoid using string tokens.
 * @param {string} text - Text to measure.
 * @return {anychart.math.Rect}
 */
anychart.core.utils.LabelsFactory.Label.prototype.measureWithText = function(text) {
  var factory;
  if (this.factory_) {
    factory = this.factory_;
  } else {
    if (!anychart.core.utils.LabelsFactory.Label.measureTextFactory) {
      anychart.core.utils.LabelsFactory.Label.measureTextFactory = new anychart.core.utils.LabelsFactory.Label();
      anychart.core.utils.LabelsFactory.Label.measureTextFactory.setOption('positionFormatter', function() {
        return this['value'];
      });
    }
    factory = anychart.core.utils.LabelsFactory.Label.measureTextFactory;
  }

  var sett = this.getMergedSettings();
  sett['format'] = String(text);
  return factory.measure({}, this.positionProvider(), sett);
};


/**
 * Reset settings.
 */
anychart.core.utils.LabelsFactory.Label.prototype.resetSettings = function() {
  this.settings_ = [];

  this.dropMergedSettings();
};


/**
 * Returns final value of settings with passed name.
 * @param {string} value Name of settings.
 * @return {*} settings value.
 */
anychart.core.utils.LabelsFactory.Label.prototype.getFinalSettings = function(value) {
  if (this.mergedSettings) {
    return this.mergedSettings[value];
  } else if (value == 'adjustFontSize') {
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
anychart.core.utils.LabelsFactory.Label.prototype.iterateSettings_ = function(processor, opt_invert, opt_field, opt_handler) {
  var iterator = opt_invert ? goog.array.forEachRight : goog.array.forEach;

  var result = void 0;
  var settings = this.settings();

  iterator(settings, function(state, i) {
    if (!state)
      return;

    var processedSetting = processor.call(this, state, i, opt_field, opt_handler);
    if (goog.isDef(processedSetting)) {
      if (goog.typeOf(processedSetting) == 'object' && !anychart.utils.instanceOf(processedSetting, goog.Disposable)) {
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
anychart.core.utils.LabelsFactory.Label.normalizeAdjustFontSize = function(opt_value) {
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
 * @param {anychart.core.utils.LabelsFactory.Label|Object} settings
 * @param {number} index
 * @param {string} field
 * @param {Function=} opt_handler
 * @return {*}
 * @private
 */
anychart.core.utils.LabelsFactory.Label.defaultSettingsProcessor_ = function(settings, index, field, opt_handler) {
  var setting;

  if (anychart.utils.instanceOf(settings, anychart.core.Label)) {
    if (field == 'enabled') {
      var result = settings[field]();
      setting = !goog.isNull(result) ? result : undefined;
    } else {
      setting = settings.getOption(field);
    }
  } else if (goog.typeOf(settings) == 'object') {
    if (field == 'adjustFontSize') {
      setting = anychart.core.utils.LabelsFactory.Label.normalizeAdjustFontSize(settings[field]);
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
anychart.core.utils.LabelsFactory.Label.prototype.resolveSetting_ = function(field, opt_handler) {
  return this.iterateSettings_(anychart.core.utils.LabelsFactory.Label.defaultSettingsProcessor_, true, field, opt_handler);
};


/**
 * Drops merged settings.
 */
anychart.core.utils.LabelsFactory.Label.prototype.dropMergedSettings = function() {
  this.mergedSettings = null;
};


/**
 * Returns merged settings.
 * @return {!Object}
 */
anychart.core.utils.LabelsFactory.Label.prototype.getMergedSettings = function() {
  if (!this.mergedSettings) {
    var settings = this.settings();
    if (settings.length == 1) {
      mergedSettings = settings[0];
    } else {
      var fields = anychart.core.utils.LabelsFactory.Label.settingsFieldsForMerge;
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
    }
    this.mergedSettings = mergedSettings;
  }
  return this.mergedSettings;
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
anychart.core.utils.LabelsFactory.Label.prototype.calculateFontSize = function(originWidth, originHeight, minFontSize, maxFontSize, adjustByWidth, adjustByHeight) {
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
anychart.core.utils.LabelsFactory.Label.prototype.createSizeMeasureElement_ = function() {
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
    if (anychart.utils.instanceOf(settings, anychart.core.utils.LabelsFactory.Label)) {
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
anychart.core.utils.LabelsFactory.Label.prototype.clear = function() {
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
anychart.core.utils.LabelsFactory.Label.prototype.drawLabel = function(bounds, parentBounds) {
  var positionFormatter = this.mergedSettings['positionFormatter'];
  var isTextByPath = !!this.textElement.path();
  var anchor = isTextByPath ?
      anychart.enums.Anchor.CENTER :
      anychart.core.utils.LabelsFactory.Label.anchorNoAutoNormalizer(this.mergedSettings['anchor']) || anychart.enums.Anchor.LEFT_TOP;

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
anychart.core.utils.LabelsFactory.Label.prototype.drawConnector = function() {
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
 * @this {anychart.core.utils.LabelsFactory.Label}
 */
anychart.core.utils.LabelsFactory.Label.prototype.applyTextSettings = function(textElement, isInitial, opt_settings) {
  var textVal, useHtml, text;
  var target = goog.isDef(opt_settings) ?
      function(value) { return opt_settings[value]; } :
      this.getOwnOption;

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
 * @return {anychart.core.utils.LabelsFactory.Label} Returns self for chaining.
 */
anychart.core.utils.LabelsFactory.Label.prototype.draw = function() {
  var factory = this.factory_;
  var mergedSettings;

  if (!this.layer_)
    this.layer_ = acgraph.layer();
  this.layer_.tag = this.index_;

  this.dropMergedSettings();
  mergedSettings = this.getMergedSettings();

  var enabled = mergedSettings['enabled'];

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
    this.layer_.zIndex(/** @type {number} */(mergedSettings['zIndex']));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.LABELS_FACTORY_CACHE)) {
    factory.dropCallsCache(this.getIndex());
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CACHE);
  }

  if (this.checkInvalidationState(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS)) {
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
      if (anychart.utils.instanceOf(settings, anychart.core.utils.LabelsFactory.Label/**/)) {
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
          if (anychart.utils.instanceOf(settings, anychart.core.utils.LabelsFactory.Label)) {
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
    var settings = this.getMergedSettings();
    var clipSettings = settings['clip'];

    var clip = null;
    if (goog.isDef(clipSettings) && clipSettings) {
      if (anychart.utils.instanceOf(clipSettings, acgraph.vector.Element)) {
        clip = clipSettings;
      } else {
        clip = /** @type {anychart.math.Rect} */(this.iterateSettings_(function(settings, index, field) {
          var parentBounds;
          if (anychart.utils.instanceOf(settings, anychart.core.utils.LabelsFactory.Label)) {
            parentBounds = settings[field]();
          } else if (goog.typeOf(settings) == 'object') {
            parentBounds = settings[field];
          }
          return parentBounds;
        }, true, 'clipElement'));
      }
    }
    this.layer_.clip(clip);
    this.markConsistent(anychart.ConsistencyState.LABELS_FACTORY_CLIP);
  }
  return this;
};


/**
 * Returns the textElement.
 * @return {!acgraph.vector.Text}
 */
anychart.core.utils.LabelsFactory.Label.prototype.getTextElement = function() {
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
anychart.core.utils.LabelsFactory.Label.prototype.serialize = function() {
  var json = anychart.core.utils.LabelsFactory.Label.base(this, 'serialize');
};


/** @inheritDoc */
anychart.core.utils.LabelsFactory.Label.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.utils.LabelsFactory.Label.base(this, 'setupByJSON', config, opt_default);
};


/** @inheritDoc */
anychart.core.utils.LabelsFactory.Label.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.backgroundElement_,
      this.textElement,
      this.layer_);

  this.backgroundElement_ = null;
  this.textElement = null;
  this.layer_ = null;

  anychart.core.utils.LabelsFactory.Label.base(this, 'disposeInternal');
};



//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.utils.LabelsFactory.Label.prototype;
  proto['getIndex'] = proto.getIndex;
  proto['clear'] = proto.clear;
  proto['measureWithText'] = proto.measureWithText;
  proto['draw'] = proto.draw;
})();
//endregion