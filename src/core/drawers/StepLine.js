goog.provide('anychart.core.drawers.StepLine');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');



/**
 * StepLine drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.StepLine = function(series) {
  anychart.core.drawers.StepLine.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.StepLine, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.STEP_LINE] = anychart.core.drawers.StepLine;


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.type = anychart.enums.SeriesDrawerTypes.STEP_LINE;


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.requiredShapes = (function() {
  var res = {};
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.StepLine.base(this, 'startDrawing', shapeManager);
  this.direction_ = /** @type {anychart.enums.StepDirection} */ (this.series.getOption('stepDirection') || anychart.enums.StepDirection.CENTER);
};


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.drawFirstPoint = function(point, state) {
  var value = point.get(this.series.getYValueNames()[0]);
  var names = this.shapesManager.getShapeNames(value, this.prevValue);
  var shapeNames = {};
  shapeNames[names.stroke] = true;

  this.currentShapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));

  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]), this.isVertical, x, y);

  /**
   * @type {number}
   * @private
   */
  this.prevX_ = x;
  /**
   * @type {number}
   * @private
   */
  this.prevY_ = y;

  this.prevValue = value;
  this.prevShapeNames = names;
};


/** @inheritDoc */
anychart.core.drawers.StepLine.prototype.drawSubsequentPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  var value = point.get(this.series.getYValueNames()[0]);
  var names = shapesManager.getShapeNames(value, this.prevValue);
  var shapeNames = {};
  shapeNames[names.stroke] = true;

  var shapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));

  var line = /** @type {acgraph.vector.Path} */((shapes[names.stroke]));

  // if (shapes != this.currentShapes) {
  //   var crossX, crossY, prevX, prevY;
  //   prevX = /** @type {number} */(this.prevX);
  //   prevY = /** @type {number} */(this.prevY);
  //
  //   var isBaselineIntersect = this.isBaselineIntersect(value);
  //
  //   if (shapesManager.hasNegativeColoring && isBaselineIntersect) {
  //     crossY = /** @type {number} */(point.meta('zero'));
  //     crossX = (x - this.prevX) * (crossY - this.prevY) / (y - this.prevY) + this.prevX;
  //   } else if (shapesManager.hasRisingFallingColoring && !shapesManager.hasNegativeColoring) {
  //     crossX = prevX;
  //     crossY = prevY;
  //   } else {
  //     crossX = prevX + (x - prevX) / 2;
  //     crossY = prevY + (y - prevY) / 2;
  //   }
  //
  //   anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(this.currentShapes[this.prevShapeNames.stroke]), this.isVertical, crossX, crossY);
  //   this.currentShapes = shapes;
  //   anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]), this.isVertical, crossX, crossY);
  // }


  switch (this.direction_) {
    case anychart.enums.StepDirection.FORWARD:
      anychart.core.drawers.line(line, this.isVertical, x, this.prevY_);
      break;
    case anychart.enums.StepDirection.BACKWARD:
      anychart.core.drawers.line(line, this.isVertical, this.prevX_, y);
      break;
    default:
      var midX = (x + this.prevX_) / 2;
      anychart.core.drawers.line(line, this.isVertical, midX, this.prevY_, midX, y);
  }

  anychart.core.drawers.line(line, this.isVertical, x, y);

  this.prevX_ = x;
  this.prevY_ = y;
  this.prevValue = value;
  this.prevShapeNames = names;
};
