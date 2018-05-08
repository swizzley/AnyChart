//region --- Requiring and Providing
goog.provide('anychart.core.CircularLabel');
goog.require('anychart.core.settings');
goog.require('anychart.core.Label');
goog.require('anychart.math.Rect');
//endregion



/**
 * @constructor
 * @extends {anychart.core.Label}
 */
anychart.core.CircularLabel = function() {
  anychart.core.CircularLabel.base(this, 'constructor');

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['autoRotate', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED]
  ]);
};
goog.inherits(anychart.core.CircularLabel, anychart.core.Label);


//region --- Settings
/** @inheritDoc */
anychart.core.CircularLabel.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = goog.object.clone(anychart.core.ui.LabelsFactory.Label.prototype.SIMPLE_PROPS_DESCRIPTORS);
  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'autoRotate',
      anychart.core.settings.booleanNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.core.CircularLabel, anychart.core.CircularLabel.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
//region --- Drawing
/**
 * Returns angle for labels.
 * @param {number} angle Label angle position.
 * @return {number} final rotation angle.
 */
anychart.core.CircularLabel.prototype.getRotation = function(angle) {
  var currentRotation = /** @type {number} */(this.getFinalSettings('rotation'));
  var autoRotate = this.getFinalSettings('autoRotate');
  if (autoRotate) {
    if (angle > 0 && angle < 180)
      return currentRotation + angle + 270;
    else
      return currentRotation + angle + 90;
  } else {
    return currentRotation;
  }
};


/** @inheritDoc */
anychart.core.CircularLabel.prototype.drawLabel = function(bounds, parentBounds) {
  var positionFormatter = this.mergedSettings['positionFormatter'];
  var isTextByPath = !!this.textElement.path();
  var anchor = isTextByPath ?
      anychart.enums.Anchor.CENTER :
      anychart.core.ui.LabelsFactory.anchorNoAutoNormalizer(this.mergedSettings['anchor']) || anychart.enums.Anchor.LEFT_TOP;

  var offsetX = this.mergedSettings['offsetX'] || 0;
  var offsetY = this.mergedSettings['offsetY'] || 0;

  var factory = /** @type {anychart.core.ui.CircularLabelsFactory} */(this.getFactory());

  var positionProvider = this.positionProvider();
  var formattedPosition = goog.object.clone(positionFormatter.call(positionProvider, positionProvider));
  var angle = formattedPosition['angle'];
  var radius = formattedPosition['radius'];
  var radiusY = goog.isDef(formattedPosition['radiusY']) ? formattedPosition['radiusY'] : radius;
  var cx = 0;
  var cy = 0;
  var factoryCx = factory.cx();
  var factoryCy = factory.cy();
  var factorySweepAngle = /** @type {number} */(factory.sweepAngle());
  var factoryParentRadius = /** @type {number} */(factory.parentRadius());

  if (parentBounds || (!isNaN(factoryCx) && !isNaN(factoryCy))) {
    //bounds
    var parentX = parentBounds.left;
    var parentY = parentBounds.top;
    var parentWidth = parentBounds.width;
    var parentHeight = parentBounds.height;

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
      new anychart.math.Rect(0, 0, bounds.width, bounds.height), anchor);

  x -= anchorCoordinate.x;
  y -= anchorCoordinate.y;

  this.textX += x;
  this.textY += y;
  bounds.left = /** @type {number} */(x);
  bounds.top = /** @type {number} */(y);

  this.mergedSettings['rotation'] = this.getRotation(angle);
  this.textElement.x(/** @type {number} */(this.textX)).y(/** @type {number} */(this.textY));
};


//endregion
//region --- Exports
//exports
(function() {
  // proto = anychart.core.CircularLabel.prototype;
  // proto['autoRotate'] = proto.autoRotate;
})();
//endregion