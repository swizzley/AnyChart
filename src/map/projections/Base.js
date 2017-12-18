goog.provide('anychart.mapModule.projections.Base');



/**
 * AnyChart map projection class.
 * @constructor
 */
anychart.mapModule.projections.Base = function() {
  this.deltaX_;
  this.deltaY_;

  this.scale_ = 150;

  this.translationX_ = 480;
  this.translationY_ = 250;

  this.rotateAlfa_ = 0;
  this.rotatePhi_ = 0;
  this.rotateGamma_ = 0;

  this.centerAlfa_ = 0;
  this.centerPhi_ = 0;

  // this.rotate(0, 0);
};


/**
 * Sinci.
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.sinci = function(x) {
  return x ? x / Math.sin(x) : 1;
};


/**
 * Sgn.
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.sgn = function(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.asin = function(x) {
  return x > 1 ? Math.PI / 2 : x < -1 ? -Math.PI / 2 : Math.asin(x);
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.acos = function(x) {
  return x > 1 ? 0 : x < -1 ? Math.PI : Math.acos(x);
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.asqrt = function(x) {
  return x > 0 ? Math.sqrt(x) : 0;
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.sinh = function(x) {
  return .5 * (Math.exp(x) - Math.exp(-x));
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.cosh = function(x) {
  return .5 * (Math.exp(x) + Math.exp(-x));
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.arsinh = function(x) {
  return Math.log(x + this.asqrt(x * x + 1));
};


/**
 * @param {number} x .
 * @return {number}
 */
anychart.mapModule.projections.Base.prototype.arcosh = function(x) {
  return Math.log(x + this.asqrt(x * x - 1));
};


/**
 * Convert latitude and longitude coordinates into coordinates in radians in accordance with this projection.
 * @param {number} x
 * @param {number} y
 * @return {Array.<number>}
 */
anychart.mapModule.projections.Base.prototype.forward = function(x, y) {
  // x = goog.math.toRadians(x);
  // y = goog.math.toRadians(y);
  //
  // var coords = this.rotation(x, y);
  //
  // x = coords[0];
  // y = coords[1];
  //
  // x = goog.math.toDegrees(x);
  // y = goog.math.toDegrees(y);
  return [x, y];
};


/**
 * Convert coordinates in radians into coordinates in degrees (lat/lon) in accordance with this projection.
 * @param {number} x
 * @param {number} y
 * @return {Array.<number>}
 */
anychart.mapModule.projections.Base.prototype.invert = function(x, y) {
  return [x, y];
};


anychart.mapModule.projections.Base.prototype.scale = function(scale) {
  this.scale_ = scale;
  this.reset_();
};


anychart.mapModule.projections.Base.prototype.translate = function(x, y) {
  this.translationX_ = x;
  this.translationY_ = y;
  this.reset_();
};


anychart.mapModule.projections.Base.prototype.center = function(alfa, phi) {
  this.centerAlfa_ = goog.math.toRadians(alfa % 360);
  this.centerPhi_ = goog.math.toRadians(phi % 360);
  this.reset_();
};


anychart.mapModule.projections.Base.prototype.rotate = function(alfa, phi, gamma) {
  this.rotateAlfa_ = goog.math.toRadians(alfa % 360);
  this.rotatePhi_ = goog.math.toRadians(phi % 360);
  this.rotateGamma_ = goog.isDef(gamma) ? goog.math.toRadians(gamma % 360) : 0;
  this.reset_();
};


anychart.mapModule.projections.Base.prototype.reset_ = function() {
  this.rotation = d3_geo_rotation(this.rotateAlfa_, this.rotatePhi_, this.rotateGamma_);
  var projectRotate = d3_geo_compose(this.rotation, this.forward);
  var center = this.forward(this.centerAlfa_, this.centerPhi_);
  this.deltaX_ = this.translationX_ - center[0] * this.scale_;
  this.deltaY_ = this.translationY_ + center[1] * this.scale_;
};

var ε = 1e-6, ε2 = ε * ε, π = Math.PI, τ = 2 * π, τε = τ - ε, halfπ = π / 2, d3_radians = π / 180, d3_degrees = 180 / π;

function d3_geo_rotation(δλ, δφ, δγ) {
  return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
}

function d3_geo_rotationλ(δλ) {
  var rotation = d3_geo_forwardRotationλ(δλ);
  rotation.invert = d3_geo_forwardRotationλ(-δλ);
  return rotation;
}

function d3_geo_forwardRotationλ(δλ) {
  return function(λ, φ) {
    return λ += δλ, [λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ];
  };
}

function d3_geo_rotationφγ(δφ, δγ) {
  var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);

  function rotation(λ, φ) {
    var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
    return [Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), anychart.mapModule.projections.Base.prototype.asin(k * cosδγ + y * sinδγ)];
  }

  rotation.invert = function(λ, φ) {
    var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
    return [Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), anychart.mapModule.projections.Base.prototype.asin(k * cosδφ - x * sinδφ)];
  };
  return rotation;
}

function d3_geo_identityRotation(λ, φ) {
  return [λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ];
}

function d3_geo_compose(a, b) {
  function compose(x, y) {
    return x = a(x, y), b(x[0], x[1]);
  }
  if (a.invert && b.invert) compose.invert = function(x, y) {
    return x = b.invert(x, y), x && a.invert(x[0], x[1]);
  };
  return compose;
}

