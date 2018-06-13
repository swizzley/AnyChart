goog.provide('anychart.core.shapeManagers.PerSeries');
goog.require('anychart.core.shapeManagers.Base');



/**
 * Series paths manager.
 * @param {anychart.core.IShapeManagerUser} series
 * @param {!Array.<anychart.core.shapeManagers.ShapeConfig>} config
 * @param {boolean} interactive
 * @param {?string=} opt_shapesFieldName
 * @param {?function(anychart.core.IShapeManagerUser, Object.<string, acgraph.vector.Shape>, number)=} opt_postProcessor
 * @param {boolean=} opt_disableStrokeScaling
 * @constructor
 * @extends {anychart.core.shapeManagers.Base}
 */
anychart.core.shapeManagers.PerSeries = function(series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling) {
  anychart.core.shapeManagers.PerSeries.base(this, 'constructor', series, config, interactive, opt_shapesFieldName, opt_postProcessor, opt_disableStrokeScaling);

  /**
   * Shapes.
   * @type {?Object.<string, Object.<string, acgraph.vector.Shape>>}
   * @private
   */
  this.shapes = {};
};
goog.inherits(anychart.core.shapeManagers.PerSeries, anychart.core.shapeManagers.Base);


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.setupInteractivity = function(shape, nonInteractive, indexOrGlobal) {
  anychart.core.shapeManagers.PerSeries.base(this, 'setupInteractivity', shape, nonInteractive, true);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.clearShapes = function() {
  anychart.core.shapeManagers.PerSeries.base(this, 'clearShapes');
  this.shapes = {};
};


/**
 * Returns point color full hash.
 * @param {number} state .
 * @param {Object.<string>=} opt_only .
 * @return {string}
 */
anychart.core.shapeManagers.PerSeries.prototype.getPointColorHash = function(state, opt_only) {
  var names = opt_only || this.defs;

  var hash = '';
  for (var name in names) {
    var descriptor = this.defs[name];
    var fill = /** @type {acgraph.vector.Fill} */(descriptor.fill(this.series, state));
    var stroke = /** @type {acgraph.vector.Stroke} */(descriptor.stroke(this.series, state));

    hash += name + anychart.color.hash(fill) + anychart.color.hash(stroke);
  }

  return hash;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.getShapesGroup = function(state, opt_only, opt_baseZIndex, opt_shape) {
  var hash = this.getPointColorHash(state, opt_only);

  this.currentShapes = this.shapes[hash];
  if (!this.currentShapes) {
    var shapes = anychart.core.shapeManagers.PerSeries.base(this, 'getShapesGroup', state, opt_only);
    this.currentShapes = this.shapes[hash] = {
      row: this.series.getIterator().current(),
      shapes: shapes
    };
  }

  return this.currentShapes.shapes;
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.addShapesGroup = function(state) {
  return this.getShapesGroup(state);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateZIndex = function(newBaseZIndex) {
  var current = this.series.getIterator().current();
  for (var key in this.shapes) {
    var shape = this.shapes[key];
    this.series.getIterator().specialSelect(shape.row);
    anychart.core.shapeManagers.PerSeries.base(this, 'updateZIndex', newBaseZIndex);
  }
  this.series.getIterator().specialSelect(current);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.updateColors = function(state, opt_shapesGroup) {
  var current = this.series.getIterator().current();
  for (var key in this.shapes) {
    var shape = this.shapes[key];
    this.series.getIterator().specialSelect(shape.row);
    anychart.core.shapeManagers.PerSeries.base(this, 'updateColors', state, shape.shapes);
  }
  this.series.getIterator().specialSelect(current);
};


/** @inheritDoc */
anychart.core.shapeManagers.PerSeries.prototype.disposeInternal = function() {
  this.shapes = null;
  anychart.core.shapeManagers.PerSeries.base(this, 'disposeInternal');
};
