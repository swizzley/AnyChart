goog.provide('anychart.core.drawers.RangeSplineArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.core.drawers.SplineDrawer');
goog.require('anychart.enums');



/**
 * RangeSplineArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeSplineArea = function(series) {
  anychart.core.drawers.RangeSplineArea.base(this, 'constructor', series);
  /**
   * Spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.strokeQueue_ = new anychart.core.drawers.SplineDrawer();

  /**
   * Stroke spline drawer.
   * @type {!anychart.core.drawers.SplineDrawer}
   * @private
   */
  this.fillQueue_ = new anychart.core.drawers.SplineDrawer();
};
goog.inherits(anychart.core.drawers.RangeSplineArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA] = anychart.core.drawers.RangeSplineArea;


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_SPLINE_AREA;


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    // anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.requiredShapes = (function() {
  var res = {};
  res['highFill'] = anychart.enums.ShapeType.PATH;
  res['lowFill'] = anychart.enums.ShapeType.PATH;
  res['highStroke'] = anychart.enums.ShapeType.PATH;
  res['lowStroke'] = anychart.enums.ShapeType.PATH;
  res['highHatchFill'] = anychart.enums.ShapeType.PATH;
  res['lowHatchFill'] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.yValueNames = (function () { return ['low', 'high']; })();


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.getShapeNames = function(var_args) {
  var high = /** @type {number} */(arguments[0]);
  var low = /** @type {number} */(arguments[1]);

  var names = {};
  var fillName, hatchFillName;

  if (high > low) {
    fillName = 'highFill';
    hatchFillName = 'highHatchFill';
  } else {
    fillName = 'lowFill';
    hatchFillName = 'lowHatchFill';
  }

  names.highStroke = 'highStroke';
  names.lowStroke = 'lowStroke';
  names.fill = fillName;
  names.hatchFill = hatchFillName;

  return names;
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.RangeSplineArea.base(this, 'startDrawing', shapeManager);
  this.strokeQueue_.isVertical(this.isVertical);
  this.strokeQueue_.rtl(this.series.planIsXScaleInverted());
  this.fillQueue_.isVertical(this.isVertical);
  this.fillQueue_.rtl(this.series.planIsXScaleInverted());

  this.highSplineCoords = [];
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawFirstPoint = function(point, state) {
  var shapesManager = this.shapesManager;
  // var valueNames = this.series.getYValueNames();
  //
  // var highValue = point.get(valueNames[1]);
  // var lowValue = point.get(valueNames[0]);
  //
  // var names = this.getShapeNames(highValue, lowValue);
  //
  var shapeNames = {};
  shapeNames['highStroke'] = true;
  shapeNames['lowStroke'] = true;

  var strokeShapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);
  this.hightStrokeShape = strokeShapes['highStroke'];
  this.lowStrokeShape = strokeShapes['lowStroke'];

  // shapeNames = {};
  // shapeNames[names.fill] = true;
  // shapeNames[names.hatchFill] = true;
  //
  // this.currentShapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));

  // var fillShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.fill]);
  // var hatchShape = /** @type {acgraph.vector.Path} */(this.currentShapes[names.hatchFill]);

  this.strokeQueue_.resetDrawer(false);
  this.strokeQueue_.setPaths([this.hightStrokeShape]);
  var splineCoords = this.strokeQueue_.processPoint(x, high);

  if (splineCoords)
    this.highSplineCoords.push.apply(this.highSplineCoords, splineCoords);

  /** @type {Array.<number>} */
  this.lowsStack = [point];

  // this.prevX_ = x;
  // this.prevHigh_ = high;
  // this.prevLow_ = low;
  // this.prevNames_ = names;
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.drawSubsequentPoint = function(point, state) {
  // var shapesManager = this.shapesManager;
  // var valueNames = this.series.getYValueNames();
  //
  // var highValue = point.get(valueNames[1]);
  // var lowValue = point.get(valueNames[0]);
  //
  // var names = this.getShapeNames(highValue, lowValue, true);
  //
  // var shapeNames = {};
  // shapeNames[names.fill] = true;
  // shapeNames[names.hatchFill] = true;
  //
  // var fill, hatchFill;
  //
  // var shapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

  var x = /** @type {number} */(point.meta('x'));
  var high = /** @type {number} */(point.meta('high'));

  var splineCoords = this.strokeQueue_.processPoint(x, high);

  if (splineCoords)
    this.highSplineCoords.push.apply(this.highSplineCoords, splineCoords);

  this.lowsStack.push(point);
  //
  // this.prevX_ = x;
  // this.prevHigh_ = high;
  // this.prevLow_ = low;
  // this.prevNames_ = names;
};


/** @inheritDoc */
anychart.core.drawers.RangeSplineArea.prototype.finalizeSegment = function() {
  // if (shapes != this.currentShapes) {
  //   fill = /** @type {acgraph.vector.Path} */(shapes[names.fill]);
  //   hatchFill = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);
  //
  //   this.strokeQueue_.setBreak([x_, low, this.prevX_, low], [fill, this.hightStrokeShape, hatchFill]);
  //   this.currentShapes = shapes;
  //
  //   this.lowsStack.push(NaN, NaN, fill, hatchFill);
  // }

  var shapesManager = this.shapesManager;

  if (!this.prevPointDrawn) return;
  var splineCoords = this.strokeQueue_.finalizeProcessing();

  if (splineCoords)
    this.highSplineCoords.push.apply(this.highSplineCoords, splineCoords);

  this.strokeQueue_.setPaths([this.lowStrokeShape]);
  this.strokeQueue_.resetDrawer(true);
  this.fillQueue_.resetDrawer(true);

  var fill, hatchFill;
  var valueNames = this.series.getYValueNames();

  if (this.lowsStack) {
    /** @type {boolean} */
    var firstPoint = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 1) {
      var point = this.lowsStack[i];

      var highValue = point.get(valueNames[1]);
      var lowValue = point.get(valueNames[0]);

      var names = this.getShapeNames(highValue, lowValue, true);

      var shapeNames = {};
      shapeNames[names.fill] = true;
      shapeNames[names.hatchFill] = true;

      var shapes = shapesManager.getShapesGroup(this.seriesState, shapeNames);

      var x = /** @type {number} */(point.meta('x'));
      var high = /** @type {number} */(point.meta('high'));
      var low = /** @type {number} */(point.meta('low'));

      this.fillQueue_.processPoint(x, low);

      if (firstPoint) {
        this.currentShapes = shapes;

        fill = /** @type {acgraph.vector.Path} */(shapes[names.fill]);
        hatchFill = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);

        this.fillQueue_.setPaths([fill, hatchFill]);
        firstPoint = false;
      } else {
        if (this.currentShapes != shapes) {
          fill = /** @type {acgraph.vector.Path} */(shapes[names.fill]);
          hatchFill = /** @type {acgraph.vector.Path} */(shapes[names.hatchFill]);


          //
          console.log('break');


          this.fillQueue_.setBreak([x_, low, this.prevX_, low], [fill, hatchFill]);

          // this.highSplineCoords
          // this.currentShapes = shapes;
        }
      }

    }
    this.strokeQueue_.finalizeProcessing();
    this.lowsStack = null;
  }
};
