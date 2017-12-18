goog.provide('anychart.mapModule.projections.Composite');
goog.require('anychart.mapModule.projections.Base');



/**
 * AnyChart Map class.
 * @param {Object} config Projection configuration.
 * @extends {anychart.mapModule.projections.Base}
 * @constructor
 */
anychart.mapModule.projections.Composite = function(config) {
  anychart.mapModule.projections.Composite.base(this, 'constructor');

  this.config = config;
};
goog.inherits(anychart.mapModule.projections.Composite, anychart.mapModule.projections.Base);


/** @inheritDoc */
anychart.mapModule.projections.Composite.prototype.forward = function(x, y) {
  // x = goog.math.toDegrees(x);
  // y = goog.math.toDegrees(y);

  // console.log(x, y);

  return [x, y];
};


/** @inheritDoc */
anychart.mapModule.projections.Composite.prototype.invert = function(x, y) {
  // x = goog.math.toRadians(x);
  // y = goog.math.toRadians(y);

  return [x, y];
};
