//region --- Requiring and Providing
goog.provide('anychart.core.utils.LabelsFactory');
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
};
goog.inherits(anychart.core.utils.LabelsFactory, anychart.core.utils.Factory);


//region --- Static props
/**
 * Default labels constructor.
 * @return {anychart.core.Label}
 */
anychart.core.utils.LabelsFactory.DEFAULT_CONSTRUCTOR = function() {
  return new anychart.core.Label();
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
//region --- Measuring
/**
 * Returns label size.
 * @param {!Object} defaultSettings Default settings.
 * @param {*|anychart.core.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.core.utils.LabelsFactory.prototype.getDimension = function(defaultSettings, formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
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
  var parentBounds = /** @type {anychart.math.Rect} */(defaultSettings['parentBounds']);
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var measureLabel, textElement;
  var padding, widthSettings, heightSettings, offsetY, offsetX, anchor, format, isHtml;
  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.ui.Label) && !opt_settings) {
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
      this.measureCustomLabel_ = new anychart.core.Label();
    } else {
      this.measureCustomLabel_.clear();
    }
    if (!this.measureTextElement_) {
      this.measureTextElement_ = acgraph.text();
      this.measureTextElement_.attr('aria-hidden', 'true');
    }
    measureLabel = this.measureCustomLabel_;
    textElement = this.measureTextElement_;

    if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.Label)) {
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
 * @param {!Object} defaultSettings Default settings.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Labels bounds.
 */
anychart.core.utils.LabelsFactory.prototype.measure = function(defaultSettings, formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var arr = this.measureWithTransform(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);
  return anychart.math.Rect.fromCoordinateBox(arr);
};


/**
 * Measures label in its coordinate system and returns bounds as an array of points in parent coordinate system.
 * @param {!Object} defaultSettings Default settings.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {Array.<number>} Label bounds.
 */
anychart.core.utils.LabelsFactory.prototype.measureWithTransform = function(defaultSettings, formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var rotation = defaultSettings['rotation'] || 0;
  var anchor = defaultSettings['anchor'] || 'center';

  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.Label)) {
    var label = /** @type {anychart.core.Label} */(formatProviderOrLabel);
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

