//region --- Requiring and Providing
goog.provide('anychart.core.utils.CircularLabelsFactory');
goog.require('acgraph.math');
goog.require('anychart.core.CircularLabel');
goog.require('anychart.core.utils.LabelsFactory');
goog.require('anychart.enums');
//endregion



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @param {function():anychart.core.IFactoryElement=} opt_ctor .
 * @constructor
 * @extends {anychart.core.utils.LabelsFactory}
 */
anychart.core.utils.CircularLabelsFactory = function(opt_ctor) {
  anychart.core.utils.CircularLabelsFactory.base(
      this,
      'constructor',
      opt_ctor || anychart.core.utils.CircularLabelsFactory.DEFAULT_CONSTRUCTOR);
};
goog.inherits(anychart.core.utils.CircularLabelsFactory, anychart.core.utils.LabelsFactory);


//region --- Static props
anychart.core.utils.CircularLabelsFactory.DEFAULT_CONSTRUCTOR = function() {
  return new anychart.core.CircularLabel();
};


//endregion
//region --- Settings
/**
 * Pix X coord of center.
 * @param {?(number)=} opt_value Pixel value of radial center.
 * @return {!anychart.core.utils.CircularLabelsFactory|number} Pix X coord of center or itself for chaining.
 */
anychart.core.utils.CircularLabelsFactory.prototype.cx = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.cx_ != opt_value) {
      this.cx_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.cx_;
  }
};


/**
 * Pix Y coord of center.
 * @param {?(number)=} opt_value Pixel value of radial center.
 * @return {!anychart.core.utils.CircularLabelsFactory|number} Pix Y coord of center or itself for chaining.
 */
anychart.core.utils.CircularLabelsFactory.prototype.cy = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.cy_ != opt_value) {
      this.cy_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.cy_;
  }
};


/**
 * Parent radius.
 * @param {?(number)=} opt_value Parent radius.
 * @return {!anychart.core.utils.CircularLabelsFactory|number} Parent radius or itself for chaining.
 */
anychart.core.utils.CircularLabelsFactory.prototype.parentRadius = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.toNumber(opt_value);
    if (this.parentRadius_ != opt_value) {
      this.parentRadius_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.parentRadius_;
  }
};


/**
 * Set start angle.
 * @param {(null|string|number)=} opt_value .
 * @return {(number|anychart.core.utils.CircularLabelsFactory)} .
 */
anychart.core.utils.CircularLabelsFactory.prototype.startAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.standardAngle(anychart.utils.toNumber(opt_value) || 0);
    if (this.startAngle_ != opt_value) {
      this.startAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.startAngle_;
  }
};


/**
 * Set sweep angle.
 * @param {(null|string|number)=} opt_value .
 * @return {(number|anychart.core.utils.CircularLabelsFactory)} .
 */
anychart.core.utils.CircularLabelsFactory.prototype.sweepAngle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = goog.isNull(opt_value) ? opt_value : goog.math.clamp(anychart.utils.toNumber(opt_value) || 0, -360, 360);
    if (this.sweepAngle_ != opt_value) {
      this.sweepAngle_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS,
          anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.sweepAngle_;
  }
};


//endregion
//region --- Measuring
/** @inheritDoc */
anychart.core.utils.CircularLabelsFactory.prototype.getDimensionInternal = function(outerBounds, formattedPosition, parentBounds, offsetX, offsetY, anchor) {
  var parentWidth, parentHeight;
  if (parentBounds) {
    parentWidth = parentBounds.width;
    parentHeight = parentBounds.height;
  }

  var angle = formattedPosition['angle'];
  var radius = formattedPosition['radius'];
  var radiusY = goog.isDef(formattedPosition['radiusY']) ? formattedPosition['radiusY'] : radius;

  var cx = 0;
  var cy = 0;
  var factoryCx = this.cx();
  var factoryCy = this.cy();
  var factorySweepAngle = /** @type {number} */(this.sweepAngle());
  var factoryParentRadius = /** @type {number} */(this.parentRadius());

  if (parentBounds || (!isNaN(factoryCx) && !isNaN(factoryCy))) {
    //bounds
    var parentX = parentBounds.left;
    var parentY = parentBounds.top;

    cx = isNaN(factoryCx) ? parentX + parentWidth / 2 : factoryCx;
    cy = isNaN(factoryCy) ? parentY + parentHeight / 2 : factoryCy;

    var sweepAngle = goog.isDefAndNotNull(factorySweepAngle) ? factorySweepAngle : 360;

    var offsetRadius = goog.isDef(factoryParentRadius) && !isNaN(factoryParentRadius) ?
        anychart.utils.normalizeSize(offsetY, factoryParentRadius) :
        parentBounds ?
            anychart.utils.normalizeSize(offsetY, Math.min(parentWidth, parentHeight) / 2) :
            0;

    angle += anychart.utils.normalizeSize(offsetX, sweepAngle);
    radius += offsetRadius;
    radiusY += offsetRadius;
  }

  var x = cx + goog.math.angleDx(angle, radius);
  var y = cy + goog.math.angleDy(angle, radiusY);

  var anchorCoordinate = anychart.utils.getCoordinateByAnchor(
      new anychart.math.Rect(0, 0, outerBounds.width, outerBounds.height),
      anchor);

  x -= anchorCoordinate.x;
  y -= anchorCoordinate.y;

  outerBounds.left = /** @type {number} */(x);
  outerBounds.top = /** @type {number} */(y);

  return /** @type {anychart.math.Rect} */(outerBounds);
};


/**
 * Measures label in its coordinate system and returns bounds as an array of points in parent coordinate system.
 * @param {*|anychart.core.ui.LabelsFactory.Label} formatProviderOrLabel Object that provides info for format function.
 * @param {*=} opt_positionProvider Object that provides info for positionFormatter function.
 * @param {Object=} opt_settings .
 * @param {number=} opt_cacheIndex .
 * @return {anychart.math.Rect} Label bounds.
 */
anychart.core.utils.CircularLabelsFactory.prototype.measureWithoutAutoRotate = function(formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var points = anychart.core.ui.LabelsFactory.prototype.measureWithTransform.call(this, formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex);
  return anychart.math.Rect.fromCoordinateBox(points);
};


/** @inheritDoc */
anychart.core.utils.CircularLabelsFactory.prototype.measureWithTransform = function(defaultSettings, formatProviderOrLabel, opt_positionProvider, opt_settings, opt_cacheIndex) {
  var angle;
  var rotation = defaultSettings['rotation'] || 0;
  var anchor = defaultSettings['anchor'] || 'center';

  if (anychart.utils.instanceOf(formatProviderOrLabel, anychart.core.CircularLabel)) {
    angle = (formatProviderOrLabel.positionProvider() ? formatProviderOrLabel.positionProvider()['value']['angle'] : 0) || 0;
    rotation = formatProviderOrLabel.getRotation(angle);
    anchor = formatProviderOrLabel.getFinalSettings('anchor');
    if (anchor == anychart.enums.Anchor.AUTO)
      anchor = formatProviderOrLabel.getFinalSettings('autoRotate') ?
          anychart.enums.Anchor.CENTER :
          anychart.utils.getAnchorForAngle(angle);
    opt_cacheIndex = goog.isDef(opt_cacheIndex) ? opt_cacheIndex : formatProviderOrLabel.getIndex();
  } else {
    var currentRotation = (goog.isDef(opt_settings) ? opt_settings['rotation'] : rotation) || 0;
    var autoRotate = (goog.isDef(opt_settings)) ? opt_settings['autoRotate'] : !!defaultSettings['autoRotate'];
    angle = (opt_positionProvider ? opt_positionProvider['value']['angle'] : 0) || 0;
    if (autoRotate) {
      if (angle > 0 && angle < 180)
        rotation = currentRotation + angle + 270;
      else
        rotation = currentRotation + angle + 90;
    } else {
      rotation = currentRotation;
    }
    anchor = goog.isDef(opt_settings) && opt_settings['anchor'] || anchor;
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

