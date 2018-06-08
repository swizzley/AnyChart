goog.provide('anychart.core.drawers.SplineDrawer');



/**
 * Queue too draw splines. Pass a path in a constuctor and then feed it with a sequence of points.
 * As soon as it has enough points to draw a spline - it draws it.
 * @param {boolean=} opt_rtl If the drawing goes right-to-left (occurs on inverted X scale or on low path of rangeArea).
 * @constructor
 */
anychart.core.drawers.SplineDrawer = function(opt_rtl) {
  /**
   * Queue state.
   * 0 - no items,
   * 1 - one item,
   * 2 - ready to draw first segment,
   * 3 - first segment drawn
   * @type {number}
   * @private
   */
  this.state_ = 0;
  /**
   * @type {number}
   * @private
   */
  this.x1_ = NaN;
  /**
   * @type {number}
   * @private
   */
  this.y1_ = NaN;
  /**
   * @type {number}
   * @private
   */
  this.x2_ = NaN;
  /**
   * @type {number}
   * @private
   */
  this.y2_ = NaN;
  /**
   * @type {boolean}
   * @private
   */
  this.isVertical_ = false;
  /**
   * @type {boolean}
   * @private
   */
  this.rtl_ = !!opt_rtl;
  /**
   * @type {!Array.<number>}
   * @private
   */
  this.v1_ = [];
  /**
   * @type {!Array.<number>}
   * @private
   */
  this.v2_ = [];
  /**
   * @type {!Array.<number>}
   * @private
   */
  this.tan_ = [];
  /**
   * @type {Array.<number>}
   * @private
   */
  this.tangent_ = [];
  /**
   * @type {number}
   * @private
   */
  this.tanLen_ = 1;
};


/**
 * If the drawer is rtl (draws right-to-left on forward layout).
 * @param {boolean=} opt_rtl .
 * @return {!anychart.core.drawers.SplineDrawer|boolean} .
 */
anychart.core.drawers.SplineDrawer.prototype.rtl = function(opt_rtl) {
  if (goog.isDef(opt_rtl)) {
    this.rtl_ = opt_rtl;
    return this;
  }
  return this.rtl_;
};


/**
 * If the drawer is vertical.
 * @param {boolean=} opt_value .
 * @return {!anychart.core.drawers.SplineDrawer|boolean} .
 */
anychart.core.drawers.SplineDrawer.prototype.isVertical = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.isVertical_ = opt_value;
    return this;
  }
  return this.isVertical_;
};


/**
 * @param {number} position
 * @param {Array.<acgraph.vector.Element>} paths
 */
anychart.core.drawers.SplineDrawer.prototype.setBreak = function(position, paths) {
  this.breakPos_ = position;
  this.breakPaths_ = paths;
};


/**
 * Switch to break path.
 */
anychart.core.drawers.SplineDrawer.prototype.applyBreakPath = function() {
  this.paths_ = this.breakPaths_;
  this.breakPaths_ = null;
};


/**
 * Processes next spline point.
 * @param {number} x .
 * @param {number} y .
 * @param {boolean=} opt_skip
 */
anychart.core.drawers.SplineDrawer.prototype.processPoint = function(x, y, opt_skip) {
  switch (this.state_) {
    case 3:
      if (this.x2_ == x && this.y2_ == y) break;
      this.drawNextSplinePoint_(this.x1_, this.y1_, this.x2_, this.y2_, x, y, opt_skip);
      this.x1_ = this.x2_;
      this.y1_ = this.y2_;
      this.x2_ = x;
      this.y2_ = y;
      break;
    case 2:
      if (this.x2_ == x && this.y2_ == y) break;
      this.startSplineDrawing_(this.x1_, this.y1_, this.x2_, this.y2_, x, y, opt_skip);
      this.x1_ = this.x2_;
      this.y1_ = this.y2_;
      this.x2_ = x;
      this.y2_ = y;
      this.state_ = 3;
      break;
    case 1:
      if (this.x1_ == x && this.y1_ == y) break;
      this.x2_ = x;
      this.y2_ = y;
      this.state_ = 2;
      break;
    case 0:
      this.x1_ = x;
      this.y1_ = y;
      this.state_ = 1;
      break;
  }
};


/**
 * Finalizes spline drawing.
 */
anychart.core.drawers.SplineDrawer.prototype.finalizeProcessing = function() {
  switch (this.state_) {
    case 3:
      this.finalizeSplineDrawing_(this.x1_, this.y1_, this.x2_, this.y2_);
      break;
    case 2:
      this.drawDummySpline_(this.x1_, this.y1_, this.x2_, this.y2_);
      break;
    case 1:
      this.drawSingleSplinePoint_(this.x1_, this.y1_);
      break;
  }
  this.state_ = 0;
};


/**
 * Sets paths to draw to.
 * @param {Array.<acgraph.vector.Path>} paths Path to set.
 */
anychart.core.drawers.SplineDrawer.prototype.setPaths = function(paths) {
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.paths_ = paths;
};


/**
 * Resets drawer to its initial state.
 * @param {boolean} backward If the drawing is going to start rtl.
 */
anychart.core.drawers.SplineDrawer.prototype.resetDrawer = function(backward) {
  if (this.rtl_ ^ this.isVertical_) backward = !backward;
  /**
   * @type {number}
   * @private
   */
  this.tangentLengthPercent_ = backward ? -0.25 : 0.25;
};


/**
 * Calculates a normalized vector from p1 to p2 and puts it to result.
 * @param {!Array.<number>} result
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.writeDiffVector_ = function(result, p1x, p1y, p2x, p2y) {
  result[0] = p2x - p1x;
  result[1] = p2y - p1y;
  var len = Math.sqrt(result[0] * result[0] + result[1] * result[1]);
  result[0] /= len;
  result[1] /= len;
};


/**
 * Calculates the tangent and puts it to the tan_ vector.
 * @param {number} p1x
 * @param {number} p1y
 * @param {number} p2x
 * @param {number} p2y
 * @param {number} p3x
 * @param {number} p3y
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.calcTangent_ = function(p1x, p1y, p2x, p2y, p3x, p3y) {
  // v1 is a normalized vector from p2 to p1
  this.writeDiffVector_(this.v1_, p2x, p2y, p1x, p1y);
  // v2 is a normalized vector from p2 to p3
  this.writeDiffVector_(this.v2_, p2x, p2y, p3x, p3y);

  // tan is a direction of a tangent to the spline that should go through p2
  if (this.v1_[1] * this.v2_[1] >= 0) {
    if (this.tangentLengthPercent_ < 0)
      this.tan_[0] = -1;
    else
      this.tan_[0] = 1;
    this.tan_[1] = 0;
  } else {
    this.writeDiffVector_(this.tan_, this.v1_[0], this.v1_[1], this.v2_[0], this.v2_[1]);
  }
};


/**
 *
 */
anychart.core.drawers.SplineDrawer.prototype.makeSplineBreak = function(p0x, p0y, p1x, p1y, p2x, p2y) {
  var t, tt, cX1x, cX1y, cX2x, cX2y, crossPoint;
  if (this.breakPos_ == 'middle') {
    t = .5;
    tt = 1 - t;
    crossPoint = new anychart.math.Point2D(
        tt * tt * p0x + 2 * t * tt * p1x + t * t * p2x,
        tt * tt * p0y + 2 * t * tt * p1y + t * t * p2y
    );
  } else if (anychart.math.roughlyEqual(p0y, this.breakPos_)) {
    crossPoint = new anychart.math.Point2D(p0x, p0y);
    t = 0;
  } else if (anychart.math.roughlyEqual(p2y, this.breakPos_)) {
    crossPoint = new anychart.math.Point2D(p2x, p2y);
    t = 1;
  } else {
    crossPoint = anychart.math.intersectBezier2Line(p0x, p0y, p1x, p1y, p2x, p2y, p0x, this.breakPos_, p2x, this.breakPos_)[0];
    t = anychart.math.getQuadraticCurveDistanceByPoint(p0x, p0y, p1x, p1y, p2x, p2y, crossPoint.x, crossPoint.y);
  }

  tt = 1 - t;
  cX1x = p0x * tt + p1x * t;
  cX1y = p0y * tt + p1y * t;
  cX2x = p1x * tt + p2x * t;
  cX2y = p1y * tt + p2y * t;

  return [p0x, p0y, cX1x, cX1y, crossPoint.x, crossPoint.y, cX2x, cX2y, p2x, p2y];
};


/**
 * Draw move or curve spline segments.
 * @param {...*} var_args Move and Curve params sequence.
 */
anychart.core.drawers.SplineDrawer.prototype.splineTo = function(var_args) {
  var i, j, argsLen;
  var args = arguments;
  var m0, m1, c1, c2, p1, p2;

  for (i = 0; i < this.paths_.length; i++) {
    for (j = 0, argsLen = args.length; j < argsLen; j++) {
      if (args[j] == 'm') {
        if (this.isVertical_) {
          m0 = args[j + 2]; m1 = args[j + 1];
        } else {
          m0 = args[j + 1]; m1 = args[j + 2];
        }
        this.paths_[i].moveTo(m0, m1);
        j += 2;
      } else if (args[j] == 'c') {
        if (this.isVertical_) {
          c1 = args[j + 2]; c2 = args[j + 1]; p1 = args[j + 4]; p2 = args[j + 3]
        } else {
          c1 = args[j + 1]; c2 = args[j + 2]; p1 = args[j + 3]; p2 = args[j + 4]
        }
        this.paths_[i].quadraticCurveTo(c1, c2, p1, p2);
        j += 4;
      } else if (args[j] == 'l') {
        if (this.isVertical_) {
          m0 = args[j + 2]; m1 = args[j + 1];
        } else {
          m0 = args[j + 1]; m1 = args[j + 2];
        }
        this.paths_[i].lineTo(m0, m1);
      }
    }
  }
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @param {number} p3x .
 * @param {number} p3y .
 * @param {boolean=} opt_skip
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.startSplineDrawing_ = function(p1x, p1y, p2x, p2y, p3x, p3y, opt_skip) {
  this.calcTangent_(p1x, p1y, p2x, p2y, p3x, p3y);

  if (!opt_skip) {
    var tLen, c1x, c1y, points;

    // real length of the tangent vector
    tLen = (p2x - p1x) * this.tangentLengthPercent_;
    c1x = p2x - this.tan_[0] * tLen;
    c1y = p2y - this.tan_[1] * tLen;

    // this.paths_[0].getStage().path().moveTo(p1x, p1y).lineTo(p2x, p2y, p2x + tx, p2y + ty, p1x, p1y).fill(null).stroke('5 black').zIndex(1000);
    // this.paths_[0].getStage().pie(p2x + tx, p2y + ty, 5, 0, 360).fill(this.paths_[0].fill()).stroke('black').zIndex(1000);
    // console.log(tx, ty);

    if (this.breakPaths_) {
      points = this.makeSplineBreak(p1x, p1y, c1x, c1y, p2x, p2y);
      this.splineTo('m', points[0], points[1], 'c', points[2], points[3], points[4], points[5]);
      this.applyBreakPath();
      this.splineTo('m', points[4], points[5], 'c', points[6], points[7], points[8], points[9]);
    } else {
      this.splineTo('m', p1x, p1y, 'c', c1x, c1y, p2x, p2y);
    }
  }

  this.tanLen_ = (p3x - p2x) * this.tangentLengthPercent_;
  this.tangent_[0] = this.tan_[0] * this.tanLen_;
  this.tangent_[1] = this.tan_[1] * this.tanLen_;
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @param {number} p3x .
 * @param {number} p3y .
 * @param {boolean=} opt_skip
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.drawNextSplinePoint_ = function(p1x, p1y, p2x, p2y, p3x, p3y, opt_skip) {
  this.calcTangent_(p1x, p1y, p2x, p2y, p3x, p3y);

  if (!opt_skip) {
    var c1x, c1y, c2x, c2y, mpx, mpy, i, points;
    c1x = anychart.math.round(p1x + this.tangent_[0]);
    c1y = anychart.math.round(p1y + this.tangent_[1]);
    c2x = anychart.math.round(p2x - this.tan_[0] * this.tanLen_);
    c2y = anychart.math.round(p2y - this.tan_[1] * this.tanLen_);
    mpx = anychart.math.round((c1x + c2x) / 2);
    mpy = anychart.math.round((c1y + c2y) / 2);

    // this.paths_[0].getStage().path().moveTo(p1x, p1y).lineTo(mpx, mpy, c1x, c1y, p1x, p1y).fill(null).stroke('2 red').zIndex(1000);
    // this.paths_[0].getStage().path().moveTo(mpx, mpy).lineTo(p2x, p2y, c2x, c2y, mpx, mpy).fill(null).stroke('2 green').zIndex(1000);
    // this.paths_[0].getStage().pie(mpx, mpy, 5, 0, 360).fill(this.paths_[0].fill()).stroke('red').zIndex(1000);
    // this.paths_[0].getStage().pie(c1x, c1y, 5, 0, 360).fill(this.paths_[0].fill()).stroke('blue').zIndex(1000);
    // this.paths_[0].getStage().pie(c2x, c2y, 5, 0, 360).fill(this.paths_[0].fill()).stroke('green').zIndex(1000);

    if (this.breakPaths_) {
      if (this.breakPos_ == 'middle')
        this.breakPos_ = mpy;
      var firsSegmentCrossed = (p1y <= this.breakPos_ && mpy >= this.breakPos_) || (p1y >= this.breakPos_ && mpy <= this.breakPos_);
      if (firsSegmentCrossed) {
        points = this.makeSplineBreak(p1x, p1y, c1x, c1y, mpx, mpy);
        this.splineTo('c', points[2], points[3], points[4], points[5]);
        this.applyBreakPath();
        this.splineTo('m', points[4], points[5], 'c', points[6], points[7], points[8], points[9], 'c', c2x, c2y, p2x, p2y);
      } else {
        points = this.makeSplineBreak(mpx, mpy, c2x, c2y, p2x, p2y);
        this.splineTo('c', c1x, c1y, mpx, mpy, 'c', points[2], points[3], points[4], points[5]);
        this.applyBreakPath();
        this.splineTo('m', points[4], points[5], 'c', points[6], points[7], points[8], points[9]);
      }
    } else {
      this.splineTo('c', c1x, c1y, mpx, mpy, 'c', c2x, c2y, p2x, p2y);
    }
  }

  this.tanLen_ = (p3x - p2x) * this.tangentLengthPercent_;
  this.tangent_[0] = this.tan_[0] * this.tanLen_;
  this.tangent_[1] = this.tan_[1] * this.tanLen_;
};


/**
 * Curve from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.finalizeSplineDrawing_ = function(p1x, p1y, p2x, p2y) {
  var c1x, c1y, points;

  c1x = p1x + this.tangent_[0];
  c1y = p1y + this.tangent_[1];

  if (this.breakPaths_) {
    points = this.makeSplineBreak(p1x, p1y, c1x, c1y, p2x, p2y);
    this.splineTo('c', points[2], points[3], points[4], points[5]);
    this.applyBreakPath();
    this.splineTo('m', points[4], points[5], 'c', points[6], points[7], points[8], points[9]);
  } else {
    this.splineTo('c', c1x, c1y, p2x, p2y);
  }

  // this.paths_[0].getStage().pie(p1x + this.tangent_[0], p1y + this.tangent_[1], 5, 0, 360).fill(this.paths_[0].fill()).stroke('black').zIndex(1000);
  // this.paths_[0].getStage().path().moveTo(p1x, p1y).lineTo(p2x, p2y, p1x + this.tangent_[0], p1y + this.tangent_[1], p1x, p1y).fill(null).stroke('5 black').zIndex(1000);
  // console.log(this.tangent_[0], this.tangent_[1]);
};


/**
 * Point p1
 * @param {number} x .
 * @param {number} y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.drawSingleSplinePoint_ = function(x, y) {
};


/**
 * Line from p1 to p2
 * @param {number} p1x .
 * @param {number} p1y .
 * @param {number} p2x .
 * @param {number} p2y .
 * @private
 */
anychart.core.drawers.SplineDrawer.prototype.drawDummySpline_ = function(p1x, p1y, p2x, p2y) {
  if (this.breakPaths_) {
    var crossY = this.breakPos_;
    var crossX = (p2x - p1x) * (crossY - p1y) / (p2y - p1y) + p1x;
    this.splineTo('m', p1x, p1y, 'l', crossX, crossY);
    this.applyBreakPath();
    this.splineTo('m', crossX, crossY, 'l', p2x, p2y);
  } else {
    this.splineTo('m', p1x, p1y, 'l', p2x, p2y);
  }
};
