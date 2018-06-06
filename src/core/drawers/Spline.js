goog.provide('anychart.core.drawers.Spline');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');



/**
 * Spline drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.Spline = function(series) {
  anychart.core.drawers.Spline.base(this, 'constructor', series);
  /**
   * Spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.drawers.SplineDrawer();
};
goog.inherits(anychart.core.drawers.Spline, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.SPLINE] = anychart.core.drawers.Spline;


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.type = anychart.enums.SeriesDrawerTypes.SPLINE;


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
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
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.requiredShapes = (function() {
  var res = {};
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/**
 *
 */
anychart.core.drawers.Spline.prototype.getShapeName = function(value) {
  var name;
  var baseline = /** @type {number} */(this.series.plot.getOption('baseline'));
  if (this.hasNegativeColoring) {
    name = value < baseline ? 'negative' : 'stroke';
  } else if (this.hasRisingFallingColoring) {
    name = value < this.prevValue ? 'falling' : value > this.prevValue ? 'rising' : 'stroke';
  } else {
    name = 'stroke';
  }

  return name;
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.Spline.base(this, 'startDrawing', shapeManager);
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  this.queue_.isVertical(this.isVertical);
  this.queue_.rtl(this.series.planIsXScaleInverted());


  var normSettings = this.series.normal();
  /**
   * @type {boolean}
   */
  this.hasNegativeColoring = goog.isDef(normSettings.getOption('negativeStroke'));

  /**
   * @type {boolean}
   */
  this.hasRisingFallingColoring = goog.isDef(normSettings.getOption('risingStroke')) ||
      goog.isDef(normSettings.getOption('fallingStroke'));
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.drawFirstPoint = function(point, state) {
  var value = point.get(this.series.getYValueNames()[0]);
  var name = this.getShapeName(value);
  var shapeNames = {};
  shapeNames[name] = true;

  this.currentShapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));

  this.queue_.setPaths([/** @type {acgraph.vector.Path} */(this.currentShapes[name])]);
  this.queue_.resetDrawer(false);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(this.currentShapes[name]), this.isVertical, x, y);
  this.queue_.processPoint(x, y);

  this.prevX = x;
  this.prevY = y;
  this.prevValue = value;
  this.prevShapeName = name;
};


anychart.core.drawers.Spline.prototype.drawBreaker = function() {
  if (shapes != this.currentShapes) {
    var crossX, crossY, prevX, prevY, prevName;
    prevX = /** @type {number} */(this.prevX);
    prevY = /** @type {number} */(this.prevY);
    prevName = this.prevShapeName;
    var baseline = /** @type {number} */(this.series.plot.getOption('baseline'));
    var baselineCrossed = (this.prevValue - baseline) * (currValue - baseline) < 0;

    if (this.hasNegativeColoring && baselineCrossed) {
      crossY = /** @type {number} */(point.meta('zero'));
      // crossX = (x - this.prevX) * (crossY - this.prevY) / (y - this.prevY) + this.prevX;

      var p1x = this.queue_.x1_;
      var p1y = this.queue_.y1_;
      var p2x = this.queue_.x2_;
      var p2y = this.queue_.y2_;
      var p3x = x;
      var p3y = y;

      this.queue_.calcTangent_(p1x, p1y, p2x, p2y, p3x, p3y);

      var c1x = p1x + this.queue_.tangent_[0];
      var c1y = p1y + this.queue_.tangent_[1];
      var c2x = p2x - this.queue_.tan_[0] * this.queue_.tanLen_;
      var c2y = p2y - this.queue_.tan_[1] * this.queue_.tanLen_;
      var mpx = (c1x + c2x) / 2;
      var mpy = (c1y + c2y) / 2;

      var crossPoint;
      if ((p1y < crossY && mpy > crossY) || (mpy < crossY && p1y > crossY)) {
        crossPoint = anychart.math.intersectBezier2Line(p1x, p1y, c1x, c1y, mpx, mpy, p1x, crossY, mpx, crossY);
      } else {
        crossPoint = anychart.math.intersectBezier2Line(mpx, mpy, c2x, c2y, p2x, p2y, mpx, crossY, p2x, crossY);
      }
      console.log(crossPoint);
    }

    // this.queue_.processPoint(x, y);

    // anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(this.currentShapes[prevName]), this.isVertical, crossX, crossY);
    // this.currentShapes = shapes;
    // anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(this.currentShapes[name]), this.isVertical, crossX, crossY);
  }
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.drawSubsequentPoint = function(point, state) {
  var currValue = point.get(this.series.getYValueNames()[0]);
  var name = this.getShapeName(currValue);
  var shapeNames = {};
  shapeNames[name] = true;
  var shapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var y = /** @type {number} */(point.meta('value'));

  this.queue_.processPoint(x, y);

  this.prevX = x;
  this.prevY = y;
  this.prevValue = currValue;
  this.prevShapeName = name;
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  this.queue_.finalizeProcessing();
};


/** @inheritDoc */
anychart.core.drawers.Spline.prototype.disposeInternal = function() {
  this.queue_.setPaths(null);
  anychart.core.drawers.Spline.base(this, 'disposeInternal');
};
