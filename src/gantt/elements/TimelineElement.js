goog.provide('anychart.ganttModule.elements.TimelineElement');

//region -- Requirements.
goog.require('anychart.core.Base');
goog.require('anychart.core.StateSettings');
goog.require('anychart.core.settings');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.ganttModule.rendering.Settings');
goog.require('anychart.ganttModule.rendering.ShapeManager');

goog.require('goog.array');



//endregion
//region -- Constructor.
/**
 * Base element settings storage and provider.
 * @param {anychart.ganttModule.TimeLine} timeline - Related timeline.
 * @constructor
 * @implements {anychart.core.settings.IResolvable}
 * @extends {anychart.core.Base}
 */
anychart.ganttModule.elements.TimelineElement = function(timeline) {
  anychart.ganttModule.elements.TimelineElement.base(this, 'constructor');

  /**
   * State settings state holder.
   * @type {anychart.core.settings.IObjectWithSettings}
   */
  this.stateHolder = this;

  /**
   * Related timeline.
   * @type {anychart.ganttModule.TimeLine}
   * @private
   */
  this.timeline_ = timeline;

  /**
   * Parent element.
   * @type {?anychart.ganttModule.elements.TimelineElement}
   * @private
   */
  this.parent_ = null;

  anychart.core.settings.createDescriptorsMeta(this.descriptorsMeta, [
    ['height', 0, anychart.Signal.NEEDS_REDRAW],
    ['anchor', 0, anychart.Signal.NEEDS_REDRAW],
    ['position', 0, anychart.Signal.NEEDS_REDRAW],
    ['offset', 0, anychart.Signal.NEEDS_REDRAW]
  ]);


  var normalDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(normalDescriptorsMeta, [
    ['fill', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE],
    ['stroke', 0, anychart.Signal.NEEDS_REDRAW_APPEARANCE]
  ]);
  this.normal_ = new anychart.core.StateSettings(this.stateHolder, normalDescriptorsMeta, anychart.PointState.NORMAL);

  var selectedDescriptorsMeta = {};
  anychart.core.settings.createDescriptorsMeta(selectedDescriptorsMeta, [
    ['fill', 0, 0],
    ['stroke', 0, 0]
  ]);
  this.selected_ = new anychart.core.StateSettings(this.stateHolder, selectedDescriptorsMeta, anychart.PointState.SELECT);

  /**
   * Labels settings.
   * @type {anychart.core.ui.LabelsFactory}
   * @private
   */
  this.labels_ = null;

  /**
   * Labels resolution chain.
   * @type {?Array.<anychart.core.ui.LabelsFactory>}
   */
  this.labelsResolution = null;

  /**
   * Point settings resolution names list. Includes deprecated point fields.
   * @type {?Array.<string>}
   */
  this.pointSettingsResolution = null;

  /**
   * Resolution chain cache.
   * @type {?Array.<Object|null|undefined>}
   * @private
   */
  this.resolutionChainCache_ = null;

  this.renderingSettings = new anychart.ganttModule.rendering.Settings(this.timeline_, this);
  this.renderingSettings.listenSignals(this.renderingSettingsInvalidated_, this);
};
goog.inherits(anychart.ganttModule.elements.TimelineElement, anychart.core.Base);
anychart.core.settings.populateAliases(anychart.ganttModule.elements.TimelineElement, ['fill', 'stroke'], 'normal');


//endregion
//region -- Consistency states and signals.
/**
 * Supported signals.
 * @type {number}
 */
anychart.ganttModule.elements.TimelineElement.prototype.SUPPORTED_SIGNALS =
    anychart.Signal.NEEDS_REDRAW | //Needs to redraw position.
    anychart.Signal.NEEDS_REDRAW_LABELS | //Needs to redraw labels.
    anychart.Signal.NEEDS_REDRAW_APPEARANCE; //Needs to reapply coloring.


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.ganttModule.elements.TimelineElement.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.Base.prototype.SUPPORTED_CONSISTENCY_STATES;


//endregion
//region -- Normalisers adaptation
/**
 * Timeline specific anchor normalizer.
 * @param {*} value - Value to normalize.
 * @return {?anychart.enums.Anchor}
 */
anychart.ganttModule.elements.TimelineElement.normalizeAnchor = function(value) {
  if (goog.isNull(value))
    return null;

  value = anychart.enums.normalizeAnchor(value, anychart.enums.Anchor.LEFT_CENTER);
  if (value == anychart.enums.Anchor.AUTO)
    return anychart.enums.Anchor.AUTO;
  if (anychart.utils.isTopAnchor(value))
    return anychart.enums.Anchor.LEFT_TOP;
  if (anychart.utils.isBottomAnchor(value))
    return anychart.enums.Anchor.LEFT_BOTTOM;
  return anychart.enums.Anchor.LEFT_CENTER;
};


/**
 * Timeline specific position normalizer.
 * @param {*} value - Value to normalize.
 * @return {?anychart.enums.Position}
 */
anychart.ganttModule.elements.TimelineElement.normalizePosition = function(value) {
  if (goog.isNull(value))
    return null;

  value = /** @type {anychart.enums.Anchor} */ (anychart.enums.normalizePosition(value, anychart.enums.Position.LEFT_CENTER));
  if (anychart.utils.isTopAnchor(value))
    return anychart.enums.Position.LEFT_TOP;
  if (anychart.utils.isBottomAnchor(value))
    return anychart.enums.Position.LEFT_BOTTOM;
  return anychart.enums.Position.LEFT_CENTER;
};


//endregion
//region -- Optimized props descriptors
/**
 * Simple descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.ganttModule.elements.TimelineElement.DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'height',
      anychart.core.settings.numberOrPercentNormalizer);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'anchor',
      anychart.ganttModule.elements.TimelineElement.normalizeAnchor);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'position',
      anychart.ganttModule.elements.TimelineElement.normalizePosition);

  anychart.core.settings.createDescriptor(
      map,
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'offset',
      anychart.core.settings.numberOrPercentNormalizer);

  return map;
})();
anychart.core.settings.populate(anychart.ganttModule.elements.TimelineElement, anychart.ganttModule.elements.TimelineElement.DESCRIPTORS);


//endregion
//region -- IResolvable impl.
/**
 * @override
 * @param {string} name
 * @return {*}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getOption = anychart.core.settings.getOption;


/** @inheritDoc */
anychart.ganttModule.elements.TimelineElement.prototype.getResolutionChain = anychart.core.settings.getResolutionChain;


/** @inheritDoc */
anychart.ganttModule.elements.TimelineElement.prototype.resolutionChainCache = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.resolutionChainCache_ = opt_value;
  }
  return this.resolutionChainCache_;
};


/** @inheritDoc */
anychart.ganttModule.elements.TimelineElement.prototype.getLowPriorityResolutionChain = function() {
  var sett = [this.themeSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getLowPriorityResolutionChain());
  }
  return sett;
};


/** @inheritDoc */
anychart.ganttModule.elements.TimelineElement.prototype.getHighPriorityResolutionChain = function() {
  var sett = [this.ownSettings];
  if (this.parent_) {
    sett = goog.array.concat(sett, this.parent_.getHighPriorityResolutionChain());
  }
  return sett;
};


//endregion
//region -- Parental relations.
/**
 * Gets/sets parent element.
 * @param {?anychart.ganttModule.elements.TimelineElement=} opt_value - Value to set.
 * @return {?anychart.ganttModule.elements.TimelineElement} - Current parent or itself for chaining.
 */
anychart.ganttModule.elements.TimelineElement.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.parent_ != opt_value) {
      this.resolutionChainCache_ = null;
      if (goog.isNull(opt_value)) {
        //this.parent_ is not null here.
        this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.rendering().parent(null);
        this.parent_ = null;
      } else {
        if (this.parent_)
          this.parent_.unlistenSignals(this.parentInvalidated_, this);
        this.parent_ = opt_value;
        this.rendering().parent(this.parent_.rendering());
        this.parent_.listenSignals(this.parentInvalidated_, this);
      }
    }
    return this;
  }
  return this.parent_;
};


/**
 * Parent invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.elements.TimelineElement.prototype.parentInvalidated_ = function(e) {
  this.resolutionChainCache_ = null;
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- State settings.
/**
 * Normal state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.elements.TimelineElement.prototype.normal = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.normal_.setup(opt_value);
    return this;
  }
  return this.normal_;
};


/**
 * Selected state settings.
 * @param {!Object=} opt_value
 * @return {anychart.core.StateSettings|anychart.ganttModule.elements.TimelineElement}
 */
anychart.ganttModule.elements.TimelineElement.prototype.selected = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.selected_.setup(opt_value);
    return this;
  }
  return this.selected_;
};


//endregion
//region -- Point settings resolution.
/**
 * Gets point settings resolution names.
 * @return {!Array.<string>}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getPointSettingsResolutionOrder = function() {
  return this.pointSettingsResolution || (this.pointSettingsResolution = []);
};


//endregion
//region -- Color resolution.
/**
 * Gets color context.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree Data Item.
 * @param {string} colorName - 'fill' or 'stroke'.
 * @param {anychart.PointState} state - State.
 * @param {number=} opt_periodIndex - Period index.
 * @return {Object}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getColorResolutionContext = function(item, colorName, state, opt_periodIndex) {
  var rv = {
    'sourceColor': colorName == 'stroke' ? this.getSourceStrokeColor(state) : this.getSourceFillColor(state),
    'item': item,
    'itemIndex': item.meta('index')
  };

  if (goog.isDef(opt_periodIndex)) {
    rv['period'] = item.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndex];
    rv['periodIndex'] = opt_periodIndex;
  }
  return rv;
};


/**
 * Gets point settings color.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree Data Item.
 * @param {number=} opt_periodIndex - Period index.
 * @return {Object|undefined}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getPointSettings = function(item, opt_periodIndex) {
  var settings;
  if (goog.isDef(opt_periodIndex)) {
    return item.get(anychart.enums.GanttDataFields.PERIODS)[opt_periodIndex];
  } else {
    var fields = this.getPointSettingsResolutionOrder();
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      var sett = /** @type {Object} */ (item.get(field));
      if (goog.isDef(sett)) {
        settings = sett;
        break;
      }
    }
  }
  return settings;
};


/**
 * Gets color.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree Data Item.
 * @param {anychart.PointState} state - State.
 * @param {string} colorName - 'fill' or 'stroke'.
 * @param {number=} opt_periodIndex - Period index.
 * @return {acgraph.vector.Fill|acgraph.vector.Stroke}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getColor = function(item, state, colorName, opt_periodIndex) {
  var color;

  var isNormal = (state === anychart.PointState.NORMAL);
  var normalizer = (colorName == 'stroke') ?
      anychart.core.settings.strokeOrFunctionSimpleNormalizer :
      anychart.core.settings.fillOrFunctionSimpleNormalizer;

  var pointSettings = this.getPointSettings(item, opt_periodIndex);
  if (pointSettings) {
    color = isNormal ?
        pointSettings[colorName] :
        (goog.typeOf(pointSettings['selected']) == 'object' ? pointSettings['selected'][colorName] : void 0);
  }

  if (color) {
    //Here we suppose that point settings can not contain color as function.
    color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(normalizer(color));
  } else {
    //TODO (A.Kudryavtsev): In current implementation (6 Mar 2018) only 'normal' and 'selected' are supported.
    var colorSource = isNormal ? this.normal() : this.selected();
    var stateColor = colorSource.getOption(colorName);


    if (goog.isFunction(stateColor)) {
      var context = this.getColorResolutionContext(item, colorName, state, opt_periodIndex);
      color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(normalizer(stateColor.call(context, context)));
    } else {
      color = /** @type {acgraph.vector.Fill|acgraph.vector.Stroke} */(normalizer(stateColor));
    }
  }
  return color;
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getPaletteNormalFill = function() {
  return 'blue';
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getPaletteNormalStroke = function() {
  return 'blue';
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getPaletteSelectedFill = function() {
  return this.getPalette().itemAt(2);
};


/**
 * Gets palette normal fill.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getPaletteSelectedStroke = function() {
  return anychart.color.darken(this.getPalette().itemAt(2));
};


/**
 * Gets source fill color.
 * @param {anychart.PointState} state - State.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getSourceFillColor = function(state) {
  return state == anychart.PointState.NORMAL ?
      this.getPaletteNormalFill() :
      this.getPaletteSelectedFill();
};


/**
 * Gets source fill color.
 * @param {anychart.PointState} state - State.
 * @return {acgraph.vector.AnyColor}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getSourceStrokeColor = function(state) {
  return state == anychart.PointState.NORMAL ?
      this.getPaletteNormalStroke() :
      this.getPaletteSelectedStroke();
};


/**
 * Gets palette.
 * @return {anychart.palettes.RangeColors|anychart.palettes.DistinctColors}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getPalette = function() {
  var paletteSource = /** @type {anychart.ganttModule.IInteractiveGrid} */(this.getTimeline().interactivityHandler);
  return /** @type {anychart.palettes.RangeColors|anychart.palettes.DistinctColors} */ (paletteSource.palette());
};


//endregion
//region -- Labels resolution.
/**
 * Getter for labels resolution order.
 * @return {!Array.<anychart.core.ui.LabelsFactory>}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getLabelsResolutionOrder = function() {
  return this.labelsResolution ||
      (this.labelsResolution = [
        this.labels(),
        this.getTimeline().elements().labels(), //Yes, this is duplication, but this method will never be used not overridden.
        this.getTimeline().labels()
      ]);
};


/**
 * Gets label point settings.
 * TODO (A.Kudryavtsev): In current implementation (14 Mar 2018) labels selected state is not supported.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Tree Data Item.
 * @param {number=} opt_periodIndex - Period index.
 * @return {Object|undefined}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getLabelPointSettings = function(item, opt_periodIndex) {
  var labelSettings;
  var pointSettings = this.getPointSettings(item, opt_periodIndex);
  if (pointSettings) {
    labelSettings = pointSettings['label'];
  }
  return labelSettings;
};


//endregion
//region -- Internal API.
/**
 * Gets type.
 * @return {anychart.enums.TLElementTypes}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getType = function() {
  return anychart.enums.TLElementTypes.ALL;
};


/**
 * Gets current related timeline.
 * @return {anychart.ganttModule.TimeLine}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getTimeline = function() {
  return this.timeline_;
};


/**
 * Gets fill represented as suitable for acgraph coloring.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Related data item.
 * @param {anychart.PointState} state - Point state.
 * @param {number=} opt_periodIndex - Related period index.
 * @return {acgraph.vector.Fill}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getFill = function(item, state, opt_periodIndex) {
  return /** @type {acgraph.vector.Fill} */ (this.getColor(item, state, 'fill', opt_periodIndex));
};


/**
 * Gets stroke represented as suitable for acgraph coloring.
 * @param {(anychart.treeDataModule.Tree.DataItem|anychart.treeDataModule.View.DataItem)} item - Related data item.
 * @param {anychart.PointState} state - Point state.
 * @param {number=} opt_periodIndex - Related period index.
 * @return {acgraph.vector.Stroke}
 */
anychart.ganttModule.elements.TimelineElement.prototype.getStroke = function(item, state, opt_periodIndex) {
  return /** @type {acgraph.vector.Stroke} */ (this.getColor(item, state, 'stroke', opt_periodIndex));
};


/**
 * Recreates shape manager.
 */
anychart.ganttModule.elements.TimelineElement.prototype.recreateShapeManager = function() {
  goog.dispose(this.shapeManager);
  var shapes = /** @type {!Array.<anychart.ganttModule.rendering.shapes.ShapeConfig>} */ (this.renderingSettings.getOption('shapes'));
  this.shapeManager = new anychart.ganttModule.rendering.ShapeManager(this.getTimeline(), this, shapes);
  this.shapeManager.setContainer(this.getTimeline().getDrawLayer());
};


//endregion
//region -- External API.
/**
 * Labels factory getter/setter.
 * @param {(Object|boolean)=} opt_value - Value to be set.
 * @return {anychart.ganttModule.elements.TimelineElement|anychart.core.ui.LabelsFactory} - Current value or itself for method chaining.
 */
anychart.ganttModule.elements.TimelineElement.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.core.ui.LabelsFactory();
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (goog.isObject(opt_value) && !('enabled' in opt_value))
      opt_value['enabled'] = true;
    this.labels_.setup(opt_value);
    return this;
  }

  return this.labels_;
};


/**
 * Labels invalidation.
 * @param {anychart.SignalEvent} e - Event.
 * @private
 */
anychart.ganttModule.elements.TimelineElement.prototype.labelsInvalidated_ = function(e) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW_LABELS);
};


/**
 * Rendering settings getter/setter.
 * @param {(Object|string)=} opt_value - Value to set.
 * @return {anychart.ganttModule.elements.TimelineElement|anychart.ganttModule.rendering.Settings} - .
 */
anychart.ganttModule.elements.TimelineElement.prototype.rendering = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.renderingSettings != opt_value) {
      this.renderingSettings.setup(opt_value);
    }
    return this;
  }
  return this.renderingSettings;
};


/**
 * Rendering settings invalidation handler.
 * @param {anychart.SignalEvent} e - Signal event.
 * @private
 */
anychart.ganttModule.elements.TimelineElement.prototype.renderingSettingsInvalidated_ = function(e) {
  this.recreateShapeManager();
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};


//endregion
//region -- Parent States.
/** @inheritDoc */
anychart.ganttModule.elements.TimelineElement.prototype.getParentState = function(stateType) {
  var parent = this.parent();
  if (parent) {
    var state = !!(stateType & anychart.PointState.SELECT) ? 'selected' : 'normal';
    return parent[state]();
  }
  return null;
};


//endregion
//region -- Serialization/Deserialization.
/**
 * @inheritDoc
 */
anychart.ganttModule.elements.TimelineElement.prototype.setupByJSON = function(config, opt_default) {
  anychart.ganttModule.elements.TimelineElement.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, anychart.ganttModule.elements.TimelineElement.DESCRIPTORS, config, opt_default);
  this.labels().setupInternal(!!opt_default, config['labels']);
  this.normal().setupInternal(!!opt_default, config);
  this.normal().setupInternal(!!opt_default, config['normal']);
  this.selected().setupInternal(!!opt_default, config['selected']);
  this.rendering().setupInternal(!!opt_default, config['rendering']);
};


/**
 * @inheritDoc
 */
anychart.ganttModule.elements.TimelineElement.prototype.serialize = function() {
  var json = anychart.ganttModule.elements.TimelineElement.base(this, 'serialize');
  anychart.core.settings.serialize(this, anychart.ganttModule.elements.TimelineElement.DESCRIPTORS, json);
  json['labels'] = this.labels().serialize();
  json['rendering'] = this.rendering().serialize();
  json['normal'] = this.normal().serialize();
  json['selected'] = this.selected().serialize();
  return json;
};


//endregion
//region -- Disposing.
/** @inheritDoc */
anychart.ganttModule.elements.TimelineElement.prototype.disposeInternal = function() {
  this.renderingSettings.unlistenSignals(this.renderingSettingsInvalidated_, this);
  goog.dispose(this.renderingSettings);
  delete this.renderingSettings;

  if (this.parent_) {
    this.parent_.unlistenSignals(this.parentInvalidated_, this);
    delete this.parent_;
  }

  this.resolutionChainCache_ = null;
  goog.disposeAll(this.normal_, this.selected_, this.labels_, this.shapeManager);
  if (this.labelsResolution)
    this.labelsResolution.length = 0;

  anychart.ganttModule.elements.TimelineElement.base(this, 'disposeInternal');
};


//endregion
//region -- Exports.
//exports
(function() {
  var proto = anychart.ganttModule.elements.TimelineElement.prototype;
  proto['rendering'] = proto.rendering;
  proto['normal'] = proto.normal;
  proto['selected'] = proto.selected;
  proto['labels'] = proto.labels;
})();


//endregion
