//region --- Requiring and Providing
goog.provide('anychart.core.utils.Factory');
goog.require('acgraph.math');
goog.require('anychart.core.VisualBase');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');
goog.require('goog.math.Coordinate');
//endregion



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @param {Function} ctor .
 * @param {boolean=} opt_isNonInteractive
 * @constructor
 * @extends {anychart.core.VisualBase}
 */
anychart.core.utils.Factory = function(ctor, opt_isNonInteractive) {
  anychart.core.utils.Factory.base(this, 'constructor');

  /**
   * If the factory is allowed to listen and intercept events.
   * @type {boolean}
   */
  this.isInteractive = !opt_isNonInteractive;

  /**
   * Factory elements constructor.
   * @type {Function}
   * @private
   */
  this.elementsCtor_ = ctor;

  /**
   * Labels layer.
   * @type {acgraph.vector.Layer}
   * @private
   */
  this.layer_ = null;

  /**
   * Labels Array.
   * @type {Array.<anychart.core.utils.Factory.Label>}
   * @private
   */
  this.elements_;
};
goog.inherits(anychart.core.utils.Factory, anychart.core.VisualBase);


//region --- Class const
/**
 * Enumeration to handle composite event handlers attachment on DOM create.
 * @const {Object.<number>}
 * @private
 */
anychart.core.utils.Factory.HANDLED_EVENT_TYPES_ = {
  /** Click. */
  'click': 0x01,

  /** Double click. */
  'dblclick': 0x02,

  /** Mouse down */
  'mousedown': 0x04,

  /** Mouse up */
  'mouseup': 0x08,

  /** Mouse over. */
  'mouseover': 0x10,

  /** Mouse out. */
  'mouseout': 0x20,

  /** Mouse move */
  'mousemove': 0x40,

  /** Touch start */
  'touchstart': 0x80,

  /** Touch move */
  'touchmove': 0x100,

  /** Touch end */
  'touchend': 0x200,

  /** Touch cancel.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  'touchcancel': 0x400

  //  /** Tap (fast touchstart-touchend) */
  //  'tap': 0x800
};


/**
 * MAGIC NUMBERS!!! MAGIC NUMBERS!!!111
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code! Tada!
 * @type {number}
 * @private
 */
anychart.core.utils.Factory.HANDLED_EVENT_TYPES_CAPTURE_SHIFT_ = 12;


/**
 * Factory to measure plain text with styles.
 * NOTE: Do not export!
 * @type {?anychart.core.utils.Factory}
 */
anychart.core.utils.Factory.measureTextFactory = null;


//endregion
//region --- DOM Elements
/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.utils.Factory.prototype.getDomElement = function() {
  return this.layer_;
};


/**
 * Gets labels factory root layer;
 * @return {acgraph.vector.Layer}
 */
anychart.core.utils.Factory.prototype.getRootLayer = function() {
  return this.layer_;
};


//endregion
//region --- Elements management
/**
 * Clears an array of labels.
 * @param {number=} opt_index If set, removes only the label that is in passed index.
 * @return {anychart.core.utils.Factory} Returns itself for chaining.
 */
anychart.core.utils.Factory.prototype.clear = function(opt_index) {
  if (!this.freeToUseLabelsPool_)
    this.freeToUseLabelsPool_ = [];

  if (this.elements_ && this.elements_.length) {
    if (goog.isDef(opt_index)) {
      if (this.elements_[opt_index]) {
        this.elements_[opt_index].clear();
        this.freeToUseLabelsPool_.push(this.elements_[opt_index]);
        this.dropCallsCache(opt_index);
        delete this.elements_[opt_index];
      }
    } else {
      this.dropCallsCache();
      for (var i = this.elements_.length; i--;) {
        var label = this.elements_[i];
        if (label) {
          label.clear();
          this.freeToUseLabelsPool_.push(label);
        }
      }
      this.elements_.length = 0;
      this.invalidate(anychart.ConsistencyState.LABELS_FACTORY_HANDLERS, anychart.Signal.NEEDS_REDRAW);
    }
  } else
    this.elements_ = [];

  return this;
};


/**
 * Returns label by index (if there is such label).
 * @param {number} index Label index.
 * @return {anychart.core.IFactoryElement} Already existing label.
 */
anychart.core.utils.Factory.prototype.getElement = function(index) {
  index = +index;
  return this.elements_ && this.elements_[index] ? this.elements_[index] : null;
};


/**
 * Labels count
 * @return {number}
 */
anychart.core.utils.Factory.prototype.elementsCount = function() {
  return this.elements_ ? this.elements_.length : 0;
};


/**
 * Creates new instance of anychart.core.utils.Factory.Label, saves it in the factory
 * and returns it.
 * @param {number=} opt_index Label index.
 * @return {!anychart.core.utils.Factory.Label} Returns new label instance.
 */
anychart.core.utils.Factory.prototype.add = function(opt_index) {
  var elem, index;
  if (!goog.isDef(this.elements_)) this.elements_ = [];

  if (goog.isDef(opt_index)) {
    index = +opt_index;
    elem = this.elements_[index];
  }

  if (elem) {
    elem.suspendSignalsDispatching();
    elem.clear();
  } else {
    elem = this.freeToUseLabelsPool_ && this.freeToUseLabelsPool_.length > 0 ?
        this.freeToUseLabelsPool_.pop() :
        this.createElement();
    elem.suspendSignalsDispatching();

    if (goog.isDef(index)) {
      this.elements_[index] = elem;
    } else {
      this.elements_.push(elem);
      index = this.elements_.length - 1;
    }
    elem.setIndex(index);
    elem.setFactory(this);
  }

  elem.resumeSignalsDispatching(false);

  return elem;
};


/**
 * @protected
 * @return {anychart.core.utils.Factory.Label}
 */
anychart.core.utils.Factory.prototype.createElement = function() {
  return this.elementsCtor_();
};


//endregion
//region --- Drawing
/** @inheritDoc */
anychart.core.utils.Factory.prototype.remove = function() {
  if (this.layer_) this.layer_.parent(null);
};


/**
 * Labels drawing.
 * @return {anychart.core.utils.Factory} Returns itself for chaining.
 */
anychart.core.utils.Factory.prototype.draw = function() {
  if (this.isDisposed())
    return this;

  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    if (this.isInteractive)
      this.bindHandlersToGraphics(this.layer_);
  }

  var stage = this.container() ? this.container().getStage() : null;
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.elements_) {
    goog.array.forEach(this.elements_, function(elem) {
      if (elem) {
        elem.container(this.layer_);
        elem.draw();
      }
    }, this);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  this.markConsistent(anychart.ConsistencyState.ALL);

  if (manualSuspend) stage.resume();
  return this;
};


//endregion
//region --- Format calls management
/**
 * Calls text formatter in scope of provider, or returns value from cache.
 * @param {Function|string} formatter Text formatter function.
 * @param {*} provider Provider for text formatter.
 * @param {number=} opt_cacheIndex Label index.
 * @return {*}
 */
anychart.core.utils.Factory.prototype.callFormat = function(formatter, provider, opt_cacheIndex) {
  if (goog.isString(formatter))
    formatter = anychart.core.utils.TokenParser.getInstance().getFormat(formatter);
  if (!this.formatCallsCache_)
    this.formatCallsCache_ = {};
  if (goog.isDefAndNotNull(opt_cacheIndex)) {
    if (!goog.isDef(this.formatCallsCache_[opt_cacheIndex])) {
      if (goog.isDef(provider) && provider['series']) {
        var series = /** @type {{getIterator: Function}} */ (provider['series']);
        var iterator = series.getIterator();
        if (goog.isFunction(iterator.select))
          iterator.select(goog.isDef(provider['index']) ? provider['index'] : opt_cacheIndex);
      }
      this.formatCallsCache_[opt_cacheIndex] = formatter.call(provider, provider);
    }

    return this.formatCallsCache_[opt_cacheIndex];
  }
  return formatter.call(provider, provider);
};


/**
 * Drops tet formatter calls cache.
 * @param {number=} opt_index
 * @return {anychart.core.utils.Factory} Self for chaining.
 */
anychart.core.utils.Factory.prototype.dropCallsCache = function(opt_index) {
  if (!goog.isDef(opt_index)) {
    this.formatCallsCache_ = {};
  } else {
    if (this.formatCallsCache_ && goog.isDef(this.formatCallsCache_[opt_index])) {
      delete this.formatCallsCache_[opt_index];
    }
  }
  return this;
};


//endregion
//region --- Interactivity
//----------------------------------------------------------------------------------------------------------------------
//
//  Events
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
anychart.core.utils.Factory.prototype.makeBrowserEvent = function(e) {
  var res = anychart.core.utils.Factory.base(this, 'makeBrowserEvent', e);
  var target = res['domTarget'];
  var tag;
  while (anychart.utils.instanceOf(target, acgraph.vector.Element)) {
    tag = target.tag;
    if (anychart.utils.instanceOf(tag, anychart.core.VisualBase) || !anychart.utils.isNaN(tag))
      break;
    target = target.parent();
  }
  res['labelIndex'] = anychart.utils.toNumber(tag);
  return res;
};


//endregion
//region --- Setup & Dispose
/** @inheritDoc */
anychart.core.utils.Factory.prototype.disposeInternal = function() {
  goog.disposeAll(
      this.elements_,
      this.freeToUseLabelsPool_,
      this.layer_);

  this.elements_ = null;
  this.freeToUseLabelsPool_ = null;
  this.layer_ = null;

  anychart.core.utils.Factory.base(this, 'disposeInternal');
};
//endregion
