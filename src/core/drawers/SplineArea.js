goog.provide('anychart.core.drawers.SplineArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');



/**
 * SplineArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.SplineArea = function(series) {
  anychart.core.drawers.SplineArea.base(this, 'constructor', series);
  /**
   * Spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.queue_ = new anychart.core.drawers.SplineDrawer();
};
goog.inherits(anychart.core.drawers.SplineArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.SPLINE_AREA] = anychart.core.drawers.SplineArea;


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.type = anychart.enums.SeriesDrawerTypes.SPLINE_AREA;


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.flags = (
    anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    // anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.requiredShapes = (function() {
  var res = {};
  res['fill'] = anychart.enums.ShapeType.PATH;
  res['hatchFill'] = anychart.enums.ShapeType.PATH;
  res['stroke'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/**
 * @param {number} value .
 * @return {Object.<string>}
 */
anychart.core.drawers.SplineArea.prototype.getShapeNames = function(value) {
  var names = {};
  var strokeName = 'stroke', fillName = 'fill', hatchFillName = 'hatchFill';
  var baseline = /** @type {number} */(this.series.plot.getOption('baseline'));

  if (this.hasNegativeColoring) {
    if (value < baseline) {
      strokeName = 'negativeStroke';
      fillName = 'negativeFill';
      hatchFillName = 'negativeHatchFill';
    }
  } else if (this.hasRisingFallingColoring) {
    if (value < this.prevValue) {
      strokeName = 'fallingStroke';
      fillName = 'fallingFill';
      hatchFillName = 'fallingHatchFill';
    } else if (value > this.prevValue) {
      strokeName = 'risingStroke';
      fillName = 'risingFill';
      hatchFillName = 'risingHatchFill';
    }
  }

  names.stroke = strokeName;
  names.fill = fillName;
  names.hatchFill = hatchFillName;

  return names;
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.SplineArea.base(this, 'startDrawing', shapeManager);
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

  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.forwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes['fill']),
    /** @type {acgraph.vector.Path} */(shapes['hatchFill']),
    /** @type {acgraph.vector.Path} */(shapes['stroke'])];
  /**
   * @type {Array.<acgraph.vector.Path>}
   * @private
   */
  this.backwardPaths_ = [
    /** @type {acgraph.vector.Path} */(shapes['fill']),
    /** @type {acgraph.vector.Path} */(shapes['hatchFill'])];
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawMissingPoint = function(point, state) {
  if (this.connectMissing) {
    if (this.series.planIsStacked()) {
      var x = /** @type {number} */(point.meta('x'));
      var zero = /** @type {number} */(point.meta('zero'));
      var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
      this.zeroesStack.push(x, zero, zeroMissing);
    }
  } else {
    this.finalizeSegment();
  }
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawFirstPoint = function(point, state) {
  var value = point.get(this.series.getYValueNames()[0]);
  var names = this.getShapeNames(value);

  var shapeNames = {};
  shapeNames[names.stroke] = true;
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  this.currentShapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
  var y = /** @type {number} */(point.meta('value'));

  this.queue_.resetDrawer(false);
  this.queue_.baseline(zero);

  var fillShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
  fillShape.baselineDepened = true;
  var hatchShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);
  hatchShape.baselineDepened = true;
  var strokeShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.stroke]);
  strokeShape.baselineDepened = false;

  this.queue_.setPaths([fillShape, strokeShape, hatchShape]);

  // anychart.core.drawers.move(fillShape, this.isVertical, x, zero);
  // anychart.core.drawers.line(fillShape, this.isVertical, x, y);
  // anychart.core.drawers.move(hatchShape, this.isVertical, x, zero);
  // anychart.core.drawers.line(hatchShape, this.isVertical, x, y);
  // anychart.core.drawers.move(strokeShape, this.isVertical, x, y);

  this.queue_.processPoint(x, y);

  if (this.series.planIsStacked()) {
    /** @type {Array.<number|boolean>} */
    this.zeroesStack = [x, zero, zeroMissing];
  } else {
    /** @type {number} */
    this.lastDrawnX = x;
    /** @type {number} */
    this.zeroY = zero;
  }

  this.prevY = y;
  this.prevValue = value;
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.drawSubsequentPoint = function(point, state) {
  var currValue = point.get(this.series.getYValueNames()[0]);
  var names = this.getShapeNames(currValue);
  var shapeNames = {};
  shapeNames[names.stroke] = true;
  shapeNames[names.fill] = true;
  shapeNames[names.hatchFill] = true;

  var shapes = this.shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var zeroMissing = /** @type {boolean} */(point.meta('zeroMissing'));
  var y = /** @type {number} */(point.meta('value'));

  this.queue_.baseline(zero);
  this.queue_.processPoint(x, y);

  if (shapes != this.currentShapes) {
    var crossY, prevY;
    prevY = /** @type {number} */(this.prevY);

    var isBaselineIntersect = this.isBaselineIntersect(currValue);
    if (this.hasNegativeColoring && isBaselineIntersect) {
      crossY = zero;
    } else if (this.hasRisingFallingColoring && !this.hasNegativeColoring) {
      crossY = prevY;
    } else {
      crossY = 'middle';
    }
    var fillShape = /** @type {acgraph.vector.Path} */(shapes[names.fill]);
    fillShape.baselineDepened = true;
    var hatchShape = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);
    hatchShape.baselineDepened = true;
    var strokeShape = /** @type {acgraph.vector.Path} */(shapes[names.stroke]);
    strokeShape.baselineDepened = false;

    this.queue_.setBreak(crossY, [fillShape, strokeShape, hatchShape]);
    this.currentShapes = shapes;
  }

  if (this.series.planIsStacked()) {
    this.zeroesStack.push(x, zero, zeroMissing);
  } else {
    this.lastDrawnX = x;
  }

  this.prevY = y;
  this.prevValue = currValue;
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  this.queue_.finalizeProcessing();
  if (!isNaN(this.lastDrawnX)) {
    // anychart.core.drawers.line(this.backwardPaths_[0], this.isVertical, this.lastDrawnX, this.zeroY);
    // this.backwardPaths_[0].close();
    // anychart.core.drawers.line(this.backwardPaths_[1], this.isVertical, this.lastDrawnX, this.zeroY);
    // this.backwardPaths_[1].close();
  } else if (this.zeroesStack) {
    this.queue_.setPaths(this.backwardPaths_);
    this.queue_.resetDrawer(true);
    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    /** @type {boolean} */
    var prevWasMissing = false;
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.zeroesStack.length - 1; i >= 0; i -= 3) {
      /** @type {number} */
      var x = /** @type {number} */(this.zeroesStack[i - 2]);
      /** @type {number} */
      var y = /** @type {number} */(this.zeroesStack[i - 1]);
      /** @type {boolean} */
      var isMissing = /** @type {boolean} */(this.zeroesStack[i]);
      if (firstPoint) {
        anychart.core.drawers.line(this.backwardPaths_[0], this.isVertical, x, y);
        anychart.core.drawers.line(this.backwardPaths_[1], this.isVertical, x, y);
        if (!isMissing)
          this.queue_.processPoint(x, y);
        firstPoint = false;
      } else if (isMissing && prevWasMissing) {
        anychart.core.drawers.line(this.backwardPaths_[0], this.isVertical, x, y);
        anychart.core.drawers.line(this.backwardPaths_[1], this.isVertical, x, y);
      } else if (isMissing) {
        this.queue_.finalizeProcessing();
        this.queue_.resetDrawer(true);
        anychart.core.drawers.line(this.backwardPaths_[0], this.isVertical, prevX, y, x, y);
        anychart.core.drawers.line(this.backwardPaths_[1], this.isVertical, prevX, y, x, y);
      } else if (prevWasMissing) {
        anychart.core.drawers.line(this.backwardPaths_[0], this.isVertical, x, prevY, x, y);
        anychart.core.drawers.line(this.backwardPaths_[1], this.isVertical, x, prevY, x, y);
        this.queue_.processPoint(x, y);
      } else {
        this.queue_.processPoint(x, y);
      }
      prevX = x;
      prevY = y;
      prevWasMissing = isMissing;
    }
    this.queue_.finalizeProcessing();
    this.zeroesStack = null;
  }
};


/** @inheritDoc */
anychart.core.drawers.SplineArea.prototype.disposeInternal = function() {
  this.queue_.setPaths(null);
  anychart.core.drawers.SplineArea.base(this, 'disposeInternal');
};
