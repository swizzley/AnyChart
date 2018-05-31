//region --- Requiring and Providing
goog.provide('anychart.core.Marker');
goog.require('acgraph.math');
goog.require('anychart.core.VisualBase');
goog.require('anychart.core.reporting');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.Background');
goog.require('anychart.core.utils.Factory');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.core.utils.TokenParser');
goog.require('anychart.enums');
goog.require('anychart.math.Rect');
goog.require('goog.array');
goog.require('goog.math.Coordinate');
//endregion



/**
 * Class for creation of sets of similar labels and management of such sets.
 * Any individual label can be changed after all labels are displayed.
 * @constructor
 * @extends {anychart.core.VisualBase}
 * @implements {anychart.core.IFactoryElement}
 */
anychart.core.Marker = function(opt_crispEdges) {
  anychart.core.Marker.base(this, 'constructor');
  delete this.themeSettings['enabled'];

  /**
   * If the markers factory should try to draw markers crisply by passing an additional param to the drawers.
   * @type {boolean}
   */
  this.crispEdges = !!opt_crispEdges;

  /**
   * Label index.
   * @type {number}
   * @private
   */
  this.index_;

  /**
   * @type {acgraph.vector.Element}
   * @private
   */
  this.markerElement_;

  /**
   * @type {Object}
   * @protected
   */
  this.mergedSettings;

  /**
   * States.
   * @type {Array.<anychart.core.Marker|Object>}
   * @private
   */
  this.settings_ = [this.ownSettings, this.autoSettings, this.themeSettings];

  this.resetSettings();

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['positionFormatter', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['position', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['anchor', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetX', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['offsetY', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['type', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['rotation', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['size', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED],
    ['fill', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['stroke', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW],
    ['clip', anychart.ConsistencyState.MARKERS_FACTORY_CLIP, anychart.Signal.NEEDS_REDRAW],
    ['enabled', anychart.ConsistencyState.ENABLED, anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW],
    ['disablePointerEvents', anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW]
  ]);
};
goog.inherits(anychart.core.Marker, anychart.core.VisualBase);


//region --- Class const

/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.Marker.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBase.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.APPEARANCE |
    anychart.ConsistencyState.MARKERS_FACTORY_CLIP;


/**
 * @type {Array.<string>}
 * @private
 */
anychart.core.Marker.settingsFieldsForMerge_ = [
  'positionFormatter',
  'position',
  'anchor',
  'offsetX',
  'offsetY',
  'type',
  'rotation',
  'size',
  'fill',
  'stroke',
  'clip',
  'enabled',
  'disablePointerEvents'
];


//endregion
//region --- Dom elements
/**
 * Returns DOM element.
 * @return {acgraph.vector.Layer}
 */
anychart.core.Marker.prototype.getDomElement = function() {
  return this.markerElement_;
};


//endregion
//region --- States
/**
 * Root factory.
 * @param {anychart.core.utils.MarkersFactory} value .
 */
anychart.core.Marker.prototype.setFactory = function(value) {
  this.factory_ = value;
};


/**
 * Root factory.
 * @return {anychart.core.utils.MarkersFactory} .
 */
anychart.core.Marker.prototype.getFactory = function() {
  return this.factory_;
};


/**
 * Label settings.
 * @param {Array.<anychart.core.Marker|Object>=} opt_value Set of settings.
 * @return {Array.<anychart.core.Marker|Object>} .
 */
anychart.core.Marker.prototype.settings = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.settings_ = opt_value ? goog.array.slice(opt_value, 0) : opt_value;

    this.invalidate(
        anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ENABLED,
        anychart.Signal.BOUNDS_CHANGED | anychart.Signal.NEEDS_REDRAW);
  }

  return this.settings_;
};


/**
 * Invalidation state checker.
 * @param {number} state .
 * @return {boolean} .
 */
anychart.core.Marker.prototype.checkInvalidationState = function(state) {
  return /** @type {boolean} */(this.iterateSettings_(function(stateOrStateName, settings) {
    if (anychart.utils.instanceOf(settings, anychart.core.Marker)) {
      if (settings.hasInvalidationState(state))
        return true;
    }
  }, true) || this.hasInvalidationState(state));
};


//endregion
//region --- Settings
/**
 * Simple properties descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.core.Marker.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  function anchorNormalizer(value) {
    return goog.isNull(value) ? value : anychart.enums.normalizeAnchor(value);
  }

  anychart.core.settings.createDescriptors(map, [
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'positionFormatter', anychart.core.settings.stringOrFunctionNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'position', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'anchor', anchorNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetX', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'offsetY', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'type', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'rotation', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'size', anychart.core.settings.numberNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'fill', anychart.core.settings.fillNormalizer],
    [anychart.enums.PropertyHandlerType.MULTI_ARG, 'stroke', anychart.core.settings.strokeNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'clip', anychart.core.settings.asIsNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'enabled', anychart.core.settings.boolOrNullNormalizer],
    [anychart.enums.PropertyHandlerType.SINGLE_ARG, 'disablePointerEvents', anychart.core.settings.booleanNormalizer]
  ]);

  return map;
})();
anychart.core.settings.populate(anychart.core.Marker, anychart.core.Marker.prototype.SIMPLE_PROPS_DESCRIPTORS);


/**
 * Returns label index.
 * @return {number}
 */
anychart.core.Marker.prototype.getIndex = function() {
  return this.index_;
};


/**
 * Sets labels index.
 * @param {number} index Index to set.
 * @return {anychart.core.Marker}
 */
anychart.core.Marker.prototype.setIndex = function(index) {
  this.index_ = +index;
  return this;
};


/**
 * Gets/Sets position provider.
 * @param {*=} opt_value Position provider.
 * @return {*} Position provider or self for chaining.
 */
anychart.core.Marker.prototype.positionProvider = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.positionProvider_ != opt_value) {
      this.positionProvider_ = opt_value;
      this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.positionProvider_;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Auto settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Auto type settings.
 * @param {string=} opt_value Auto rotation angle.
 * @return {string|anychart.core.Marker}
 */
anychart.core.Marker.prototype.autoType = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoSettings['type'] !== opt_value) {
      this.autoSettings['type'] = opt_value;
      if (!goog.isDef(this.ownSettings['type']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.autoSettings['type'];
  }
};


/**
 * Auto fill settings.
 * @param {acgraph.vector.Fill=} opt_value .
 * @return {!anychart.core.Marker|acgraph.vector.Fill} .
 */
anychart.core.Marker.prototype.autoFill = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = acgraph.vector.normalizeFill(opt_value);
    if (this.autoSettings['fill'] !== value) {
      this.autoSettings['fill'] = value;
      if (!goog.isDef(this.ownSettings['fill']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['fill'];
  }
};


/**
 * Auto stroke settings.
 * @param {acgraph.vector.Stroke=} opt_value .
 * @return {!anychart.core.Marker|acgraph.vector.Stroke} .
 */
anychart.core.Marker.prototype.autoStroke = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var value = anychart.core.settings.strokeSimpleNormalizer(opt_value);
    if (this.autoSettings['stroke'] !== value) {
      this.autoSettings['stroke'] = value;
      if (!goog.isDef(this.ownSettings['stroke']))
        this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['stroke'];
  }
};


/**
 * Auto clip element settings.
 * @param {(acgraph.vector.Clip|acgraph.vector.Element|anychart.math.Rect|boolean)=} opt_value .
 * @return {!anychart.core.Marker|acgraph.vector.Clip|acgraph.vector.Element} .
 */
anychart.core.Marker.prototype.autoClip = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoSettings['clip'] !== opt_value) {
      this.autoSettings['clip'] = opt_value;
      this.invalidate(anychart.ConsistencyState.MARKERS_FACTORY_CLIP, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['clip'];
  }
};


/**
 * Auto clip element settings.
 * @param {(acgraph.vector.Clip|acgraph.vector.Element|anychart.math.Rect)=} opt_value .
 * @return {!anychart.core.Marker|acgraph.vector.Clip|acgraph.vector.Element} .
 */
anychart.core.Marker.prototype.autoClipElement = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.autoSettings['clipElement'] !== opt_value) {
      this.autoSettings['clipElement'] = opt_value;
      this.invalidate(anychart.ConsistencyState.MARKERS_FACTORY_CLIP, anychart.Signal.BOUNDS_CHANGED);
    }
    return this;
  } else {
    return this.autoSettings['clipElement'];
  }
};


//endregion
//region --- IObjectWithSettings implementation
/** @inheritDoc */
anychart.core.Marker.prototype.hasOwnOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]);
};


/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.core.Marker.prototype.getOption = function(name) {
  return this.ownSettings[name];
};


/**
 * Returns own and auto option value.
 * @param {string} name
 * @return {*}
 */
anychart.core.Marker.prototype.getOwnAndAutoOption = function(name) {
  return this.ownSettings[name];
};


//endregion
//region --- Settings manipulations
/**
 * Measures plain text on label's settings. NOTE: avoid using string tokens.
 * @param {string} text - Text to measure.
 * @return {anychart.math.Rect}
 */
anychart.core.Marker.prototype.measureWithText = function(text) {
  var factory;
  if (this.factory_) {
    factory = this.factory_;
  } else {
    if (!anychart.core.ui.LabelsFactory.measureTextFactory) {
      anychart.core.ui.LabelsFactory.measureTextFactory = new anychart.core.ui.LabelsFactory();
      anychart.core.ui.LabelsFactory.measureTextFactory.setOption('positionFormatter', function() {
        return this['value'];
      });
    }
    factory = anychart.core.ui.LabelsFactory.measureTextFactory;
  }

  var sett = this.getMergedSettings();
  sett['format'] = String(text);
  return factory.measure({}, this.positionProvider(), sett);
};


/**
 * Reset settings.
 */
anychart.core.Marker.prototype.resetSettings = function() {
  goog.disposeAll(this.background_, this.padding_);

  this.background_ = null;
  this.padding_ = null;

  this.ownSettings = {};
  this.autoSettings = {};
  this.settings_ = [this.ownSettings, this.autoSettings, this.themeSettings];

  this.dropMergedSettings();
};


/**
 * Returns final value of settings with passed name.
 * @param {string} value Name of settings.
 * @param {boolean=} opt_forceMerging Force merging settings.
 * @return {*} settings value.
 */
anychart.core.Marker.prototype.getFinalSettings = function(value, opt_forceMerging) {
  return this.mergedSettings && !opt_forceMerging ? this.mergedSettings[value] : this.resolveSetting_(value);
};


/**
 * Drawing plans iterator.
 * @param {Function} processor .
 * @param {boolean=} opt_invert .
 * @param {string=} opt_field .
 * @param {Function=} opt_handler .
 * @return {*}
 * @private
 */
anychart.core.Marker.prototype.iterateSettings_ = function(processor, opt_invert, opt_field, opt_handler) {
  var iterator = opt_invert ? goog.array.forEachRight : goog.array.forEach;

  var result = void 0;
  var settings = this.settings();
  if (settings) {
    iterator(settings, function(state, i) {
      if (!state)
        return;

      var processedSetting = processor.call(this, state, i, opt_field, opt_handler);
      if (goog.isDef(processedSetting)) {
        if (goog.typeOf(processedSetting) == 'object' && !anychart.utils.instanceOf(processedSetting, goog.Disposable)) {
          if (goog.isDefAndNotNull(result)) {
            opt_invert ? goog.object.extend(result, processedSetting) : goog.object.extend(processedSetting, result);
          } else {
            result = goog.object.clone(processedSetting);
          }
        } else {
          result = processedSetting;
        }
      }
    }, this);
  }

  return result;
};


/**
 * AdjustFontSize normalizer.
 * @param {Object=} opt_value
 * @return {{width:boolean,height:boolean}} .
 */
anychart.core.Marker.normalizeAdjustFontSize = function(opt_value) {
  var adjustByWidth, adjustByHeight;
  if (goog.isDef(opt_value)) {
    if (goog.isArray(opt_value)) {
      adjustByWidth = opt_value[0];
      adjustByHeight = opt_value[1];
    } else if (goog.isObject(opt_value)) {
      adjustByWidth = opt_value['width'];
      adjustByHeight = opt_value['height'];
    } else {
      adjustByWidth = !!opt_value;
      adjustByHeight = !!opt_value;
    }
  } else {
    adjustByWidth = void 0;
    adjustByHeight = void 0;
  }

  return {width: adjustByWidth, height: adjustByHeight};
};


/**
 * Default function for processing settings.
 * @param {anychart.core.Marker|Object} settings
 * @param {number} index
 * @param {string} field
 * @param {Function=} opt_handler
 * @return {*}
 * @private
 */
anychart.core.Marker.defaultSettingsProcessor_ = function(settings, index, field, opt_handler) {
  var setting;

  if (anychart.utils.instanceOf(settings, anychart.core.Marker)) {
    if (field == 'enabled') {
      var result = settings[field]();
      setting = !goog.isNull(result) ? result : undefined;
    } else {
      setting = settings.getOwnAndAutoOption(field);
    }
  } else if (goog.typeOf(settings) == 'object') {
    setting = settings[field];
    if (field == 'enabled' && goog.isNull(setting))
      setting = undefined;
  }
  if (opt_handler && goog.isDef(setting))
    setting = opt_handler(setting);
  return setting;
};


/**
 * Settings resolver.
 * @param {string} field
 * @param {Function=} opt_handler
 * @return {*}
 * @private
 */
anychart.core.Marker.prototype.resolveSetting_ = function(field, opt_handler) {
  return this.iterateSettings_(anychart.core.Marker.defaultSettingsProcessor_, true, field, opt_handler);
};


/**
 * Drops merged settings.
 */
anychart.core.Marker.prototype.dropMergedSettings = function() {
  this.mergedSettings = null;
};


/**
 * Returns merged settings.
 * @return {!Object}
 */
anychart.core.Marker.prototype.getMergedSettings = function() {
  if (!this.mergedSettings) {
    var settings = this.settings();
    if (settings.length == 1) {
      this.mergedSettings = settings[0];
    } else {
      var fields = anychart.core.Marker.settingsFieldsForMerge_;
      var mergedSettings = {};
      for (var i = 0, len = fields.length; i < len; i++) {
        var field = fields[i];
        mergedSettings[field] = this.getFinalSettings(field);
      }
      this.mergedSettings = mergedSettings;
    }
  }
  return this.mergedSettings;
};


//endregion
//region --- Drawing
/**
 * Resets label to the initial state, but leaves DOM elements intact, but without the parent.
 */
anychart.core.Marker.prototype.clear = function() {
  this.resetSettings();
  if (this.markerElement_) {
    this.markerElement_.parent(null);
    this.markerElement_.removeAllListeners();
  }
  this.invalidate(anychart.ConsistencyState.CONTAINER);
};


/**
 * Marker drawing.
 * @return {anychart.core.Marker}
 */
anychart.core.Marker.prototype.draw = function() {
  if (this.isDisposed())
    return this;

  if (!this.markerElement_)
    this.markerElement_ = acgraph.path();
  this.markerElement_.tag = this.getIndex();

  var settings;
  var enabled = this.getFinalSettings('enabled');

  if (this.hasInvalidationState(anychart.ConsistencyState.ENABLED)) {
    if (!enabled) {
      this.markerElement_.parent(null);
      this.markConsistent(anychart.ConsistencyState.ALL);
      return this;
    } else {
      if (this.container())
        this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
      this.markConsistent(anychart.ConsistencyState.ENABLED);
    }
  }

  if (!enabled)
    return this;

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    if (enabled) {
      if (this.container())
        this.markerElement_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    }
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.markerElement_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.BOUNDS)) {
    settings = this.getMergedSettings();

    var drawer = goog.isString(settings['type']) ?
        anychart.utils.getMarkerDrawer(settings['type']) :
        settings['type'];

    //define parent bounds
    var parentWidth, parentHeight;
    var parentBounds = /** @type {anychart.math.Rect} */(this.parentBounds());
    if (parentBounds) {
      parentWidth = parentBounds.width;
      parentHeight = parentBounds.height;
    }

    this.markerElement_.clear();

    var anchor = /** @type {anychart.enums.Anchor} */(anychart.enums.normalizeAnchor(settings['anchor']));

    var strokeThickness = anychart.utils.extractThickness(/** @type {acgraph.vector.Stroke} */(settings['stroke']));
    if (this.crispEdges)
      drawer.call(this, this.markerElement_, 0, 0, settings['size'], strokeThickness);
    else
      drawer.call(this, this.markerElement_, 0, 0, settings['size']);
    var markerBounds = this.markerElement_.getBoundsWithoutTransform();

    var positionProvider = this.positionProvider();
    var formattedPosition = goog.object.clone(settings['positionFormatter'].call(positionProvider, positionProvider));
    var position = new goog.math.Coordinate(formattedPosition['x'], formattedPosition['y']);
    var anchorCoordinate = anychart.utils.getCoordinateByAnchor(new anychart.math.Rect(0, 0, markerBounds.width, markerBounds.height), anchor);

    position.x -= anchorCoordinate.x;
    position.y -= anchorCoordinate.y;

    var offsetXNorm = goog.isDef(settings['offsetX']) ?
        anychart.utils.normalizeSize(/** @type {string|number} */(settings['offsetX']), parentWidth) : 0;
    var offsetYNorm = goog.isDef(settings['offsetY']) ?
        anychart.utils.normalizeSize(/** @type {string|number} */(settings['offsetY']), parentHeight) : 0;

    anychart.utils.applyOffsetByAnchor(position, anchor, offsetXNorm, offsetYNorm);

    markerBounds.left = position.x + markerBounds.width / 2;
    markerBounds.top = position.y + markerBounds.height / 2;

    this.markerElement_.clear();
    if (this.crispEdges)
      drawer.call(this, this.markerElement_, markerBounds.left, markerBounds.top, settings['size'], strokeThickness);
    else
      drawer.call(this, this.markerElement_, markerBounds.left, markerBounds.top, settings['size']);

    this.markerElement_.fill(settings['fill']);
    this.markerElement_.stroke(settings['stroke']);

    //clear all transform of element
    this.markerElement_.setTransformationMatrix(1, 0, 0, 1, 0, 0);
    //Sets rotation.
    this.markerElement_.setRotation(/** @type {number} */(settings['rotation'] || 0),
        position.x + anchorCoordinate.x, position.y + anchorCoordinate.y);

    this.markConsistent(anychart.ConsistencyState.APPEARANCE);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.MARKERS_FACTORY_CLIP)) {
    settings = this.getMergedSettings();
    var clipSettings = settings['clip'];

    var clip = null;
    if (goog.isDef(clipSettings) && clipSettings) {
      if (anychart.utils.instanceOf(clipSettings, acgraph.vector.Element)) {
        clip = clipSettings;
      } else {
        clip = /** @type {anychart.math.Rect} */(this.iterateSettings_(function(settings, index, field) {
          var parentBounds;
          if (anychart.utils.instanceOf(settings, anychart.core.Marker)) {
            parentBounds = settings[field]();
          } else if (goog.typeOf(settings) == 'object') {
            parentBounds = settings[field];
          }
          return parentBounds;
        }, true, 'clipElement'));
      }
    }
    this.markerElement_.clip(clip);
    this.markConsistent(anychart.ConsistencyState.MARKERS_FACTORY_CLIP);
  }

  this.markConsistent(anychart.ConsistencyState.BOUNDS);

  return this;
};


//endregion
//region --- Setup & Dispose
/** @inheritDoc */
anychart.core.Marker.prototype.serialize = function() {
  var json = anychart.core.Marker.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Marker factory props');

  if (!this.hasOwnOption('enabled'))
    delete json['enabled'];

  return json;
};


/** @inheritDoc */
anychart.core.Marker.prototype.setupByJSON = function(config, opt_default) {
  var enabledState = this.getOption('enabled');

  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config, opt_default);

  anychart.core.Marker.base(this, 'setupByJSON', config, opt_default);

  if (opt_default) {
    if ('enabled' in config) this.themeSettings['enabled'] = config['enabled'];
  } else {
    this.enabled('enabled' in config ? config['enabled'] : enabledState);
  }

};


/** @inheritDoc */
anychart.core.Marker.prototype.disposeInternal = function() {
  this.clear();
  goog.dispose(this.markerElement_);

  anychart.core.Marker.base(this, 'disposeInternal');
};



//endregion
//region --- Exports
//exports
(function() {
  var proto = anychart.core.Marker.prototype;
  proto['getIndex'] = proto.getIndex;
  proto['clear'] = proto.clear;
  proto['draw'] = proto.draw;

  // proto['positionFormatter'] = proto.positionFormatter;
  // proto['position'] = proto.position;
  // proto['anchor'] = proto.anchor;
  // proto['offsetX'] = proto.offsetX;
  // proto['offsetY'] = proto.offsetY;
  // proto['rotation'] = proto.rotation;
  // proto['type'] = proto.type;
  // proto['size'] = proto.size;
  // proto['fill'] = proto.fill;
  // proto['stroke'] = proto.stroke;
})();
//endregion