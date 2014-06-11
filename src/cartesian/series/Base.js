goog.provide('anychart.cartesian.series.Base');
goog.require('anychart.VisualBaseWithBounds');
goog.require('anychart.color');
goog.require('anychart.data');
goog.require('anychart.elements.Multilabel');
goog.require('anychart.elements.Tooltip');
goog.require('anychart.events.EventType');



/**
 * Base class for all cartesian series.<br/>
 * Текущий класс определяет базовые методы для всех серий, которые позволяют настроить:
 * <ul>
 *   <li>Привязку серии к шкале: <i>xScale, yScale</i></li>
 *   <li>Настройки базового цвета: <i>color</i></li>
 * </ul>
 * Помимо этого можно получить итераторы данных: <i>getIterator, getResetIterator</i>.
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)} data Series data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.VisualBaseWithBounds}
 */
anychart.cartesian.series.Base = function(data, opt_csvSettings) {
  this.suspendSignalsDispatching();
  goog.base(this);
  this.data(data, opt_csvSettings);

  this.zIndex(30);

  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.suspendSignalsDispatching();
  tooltip.isFloating(true);
  tooltip.titleFormatter(function() {
    return this['name'];
  });
  tooltip.textFormatter(function() {
    return this['x'] + ': ' + this['value'];
  });
  tooltip.resumeSignalsDispatching(false);

  this.realLabels_ = new anychart.elements.Multilabel();
  this.realLabels_.listen(acgraph.events.EventType.MOUSEOVER, this.handleLabelMouseOver, false, this);
  this.realLabels_.listen(acgraph.events.EventType.MOUSEOUT, this.handleLabelMouseOut, false, this);
  this.statistics_ = {};
  this.labels().textFormatter(function(provider) {
    return provider['value'];
  }).enabled(false);
  this.hoverLabels().textFormatter(function(provider) {
    return provider['value'];
  }).enabled(false);
  this.labels().position(anychart.utils.NinePositions.CENTER);
  this.hoverLabels().position(anychart.utils.NinePositions.CENTER);
  this.resumeSignalsDispatching(false);
};
goog.inherits(anychart.cartesian.series.Base, anychart.VisualBaseWithBounds);


/**
 * Supported signals.
 * @type {number}
 */
anychart.cartesian.series.Base.prototype.SUPPORTED_SIGNALS =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS |
        anychart.Signal.DATA_CHANGED |
        anychart.Signal.NEEDS_RECALCULATION;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.cartesian.series.Base.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
        anychart.ConsistencyState.HATCH_FILL |
        anychart.ConsistencyState.APPEARANCE |
        anychart.ConsistencyState.LABELS |
        anychart.ConsistencyState.DATA;


/**
 * Default hatch fill type.
 * @type {acgraph.vector.HatchFill.HatchFillType|string}
 */
anychart.cartesian.series.Base.DEFAULT_HATCH_FILL_TYPE = 'none';


/**
 * Series name.
 * @type {string}
 * @private
 */
anychart.cartesian.series.Base.prototype.name_;


/**
 * Series index.
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.index_;


/**
 * Series meta map.
 * @type {Object}
 * @private
 */
anychart.cartesian.series.Base.prototype.meta_;


/**
 * @type {!anychart.data.View}
 * @private
 */
anychart.cartesian.series.Base.prototype.data_;


/**
 * @type {Object}
 * @private
 */
anychart.cartesian.series.Base.prototype.statistics_;


/**
 * @type {anychart.data.View}
 * @private
 */
anychart.cartesian.series.Base.prototype.parentView_;


/**
 * @type {goog.Disposable}
 * @private
 */
anychart.cartesian.series.Base.prototype.parentViewToDispose_;


/**
 * @type {!anychart.data.Iterator}
 * @private
 */
anychart.cartesian.series.Base.prototype.iterator_;


/**
 * @type {boolean}
 * @protected
 */
anychart.cartesian.series.Base.prototype.firstPointDrawn = false;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.cartesian.series.Base.prototype.yScale_ = null;


/**
 * @type {anychart.scales.Base}
 * @private
 */
anychart.cartesian.series.Base.prototype.xScale_ = null;


/**
 * @type {anychart.elements.Multilabel}
 * @private
 */
anychart.cartesian.series.Base.prototype.labels_ = null;


/**
 * @type {anychart.elements.Multilabel}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverLabels_ = null;


/**
 * @type {anychart.elements.Multilabel}
 * @private
 */
anychart.cartesian.series.Base.prototype.realLabels_ = null;


/**
 * @type {anychart.elements.Tooltip}
 * @private
 */
anychart.cartesian.series.Base.prototype.tooltip_ = null;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.pointPosition_ = NaN;


/**
 * @type {number}
 * @private
 */
anychart.cartesian.series.Base.prototype.autoPointPosition_ = 0.5;


/**
 * Zero y base value.
 * @type {number}
 * @protected
 */
anychart.cartesian.series.Base.prototype.zeroY = 0;


/**
 * Список имен полей, которые требуются серии из данных.
 * Например ['x', 'value']. Должен создаваться в конструкторе. Без этого списка не работает метод getReferenceCoords().
 * @type {!Array.<string>}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValueNames;


/**
 * Список атрибутов имен полей из referenceValueNames. Должен быть той же длины, что и referenceValueNames.
 * Например ['x', 'y']. Должен создаваться в конструкторе. Без этого списка не работает метод getReferenceCoords().
 * Возможные значения элементов:
 *    'x' - трансформируется через xScale,
 *    'y' - трансформируется через yScale,
 *    'z' - получается как zero Y.
 * NOTE: если нужно значение zeroY, то его нужно спрашивать ДО всех 'y' значений.
 * @type {!Array.<string>}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValueMeanings;


/**
 * Определяет, должен ли метод getReferenceCoords() поддерживать стэкирование.
 * @type {boolean}
 * @protected
 */
anychart.cartesian.series.Base.prototype.referenceValuesSupportStack = true;


/**
 * Поддерживает ли серия стэкирование.
 * @return {boolean} .
 */
anychart.cartesian.series.Base.prototype.supportsStack = function() {
  return this.referenceValuesSupportStack;
};


/**
 * Цвет серии. См. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.cartesian.series.Base.prototype.color_ = null;


/**
 * Цвет серии, распределенный чартом. См. this.color().
 * @type {?acgraph.vector.Fill}
 * @private
 */
anychart.cartesian.series.Base.prototype.autoColor_ = null;


/**
 * Hatch fill type автоматически назначаемый чартом.
 * @type {acgraph.vector.HatchFill}
 * @protected
 */
anychart.cartesian.series.Base.prototype.autoHatchFill_;


/**
 * Hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * Hover hatch fill.
 * @type {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverHatchFill_ = (function() {
  return this['sourceHatchFill'];
});


/**
 * @type {anychart.elements.Marker.Type}
 * @protected
 */
anychart.cartesian.series.Base.prototype.autoMarkerType;


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.fill_ = (function() {
  return this['sourceColor'];
});


/**
 * @type {(acgraph.vector.Fill|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverFill_ = (function() {
  return anychart.color.lighten(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @protected
 */
anychart.cartesian.series.Base.prototype.strokeInternal = (function() {
  return anychart.color.darken(this['sourceColor']);
});


/**
 * @type {(acgraph.vector.Stroke|Function|null)}
 * @private
 */
anychart.cartesian.series.Base.prototype.hoverStroke_ = null;


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleLabelMouseOver = function(event) {
  if (event && goog.isDef(event['labelIndex'])) {
    this.hoverPoint(event['labelIndex'], event);
  } else
    this.unhover();
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleLabelMouseOut = function(event) {
  this.unhover();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Data
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series statistics.
 * @param {string=} opt_name Statistics parameter name.
 * @param {number=} opt_value Statistics parameter value.
 * @return {anychart.cartesian.series.Base|Object.<number>|number}
 */
anychart.cartesian.series.Base.prototype.statistics = function(opt_name, opt_value) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      this.statistics_[opt_name] = opt_value;
      return this;
    } else {
      return this.statistics_[opt_name];
    }
  } else {
    return this.statistics_;
  }
};


/**
 * Getter for series name.
 * @return {string|undefined} Series name value.
 *//**
 * Setter for series name.
 * @example <t>listingOnly</t>
 * series.name('My Custom series name');
 * @param {string=} opt_value Value to set.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value Series name value.
 * @return {!(string|anychart.cartesian.series.Base|undefined)} Series name value or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.name = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.name_ != opt_value) {
      this.name_ = opt_value;
      //todo: send signal to redraw name depend components, series, legend etc
    }
    return this;
  } else {
    return this.name_;
  }
};


/**
 * Sets/gets series number.
 * @param {number=} opt_value
 * @return {anychart.cartesian.series.Base|number}
 */
anychart.cartesian.series.Base.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.index_ != opt_value) {
      this.index_ = opt_value;
    }
    return this;
  } else {
    return this.index_;
  }
};


/**
 * Sets/Gets series meta data.
 * @param {*=} opt_object_or_key Object to replace metadata or metadata key.
 * @param {*=} opt_value Meta data value.
 * @return {*} Metadata object, key value or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.meta = function(opt_object_or_key, opt_value) {
  if (!this.meta_) this.meta_ = {};

  if (goog.isDef(opt_object_or_key)) {
    if (goog.isDef(opt_value)) {
      var value = this.meta_[opt_object_or_key];
      if (!goog.isDef(value) || value != opt_value) {
        this.meta_[opt_object_or_key] = opt_value;
        //todo: send signal to redraw components which depends on meta (legend)
      }
      return this;
    } else {
      if (goog.isObject(opt_object_or_key)) {
        if (this.meta_ != opt_object_or_key) {
          this.meta_ = opt_object_or_key;
          //todo: send signal to redraw components which depends on meta (legend)
        }
        return this;
      } else {
        return this.meta_[opt_object_or_key];
      }
    }
  } else {
    return this.meta_;
  }
};


/**
 * Getter for series mapping.
 * @return {!anychart.data.View} Returns current mapping.
 *//**
 * Setter for series mapping.
 * @example <t>listingOnly</t>
 * series.data([20, 7, 10, 14]);
 *  // or
 * series.data([
 *    [1, 22, 13],
 *    [13, 22, 23],
 *    [17, 22, 33],
 *    [21, 22, 43]
 *  ]);
 *  // or
 * series.data([
 *    {name: 'Point 1', value: 10},
 *    {name: 'Point 2', value: 7},
 *    {name: 'Point 3', value: 20},
 *    {name: 'Point 4', value: 14}
 *  ]);
 *   // or
 *  series.data(
 *    '17;21;11.1;4\n'+
 *    '11;11;0.21;0\n'+
 *    '21;17;23.1;1\n'+
 *    '10;.4;14;4.4\n',
 *    {'rowsSeparator': '\n', columnsSeparator: ';'})
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed by first param, you can pass CSV parser settings here as a hash map.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {!(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.cartesian.series.Base|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.cartesian.series.Base.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
    if (opt_value instanceof anychart.data.View)
      this.parentView_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
    else if (opt_value instanceof anychart.data.Set)
      this.parentView_ = this.parentViewToDispose_ = opt_value.mapAs();
    else
      this.parentView_ = (this.parentViewToDispose_ = new anychart.data.Set(
          (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
    this.registerDisposable(this.parentViewToDispose_);
    this.data_ = this.parentView_;
    this.data_.listenSignals(this.dataInvalidated_, this);
    // DATA поддерживается только в Bubble, для него и инвалидируется.
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.DATA,
        anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return this.data_;
};


/**
 * Listens to data invalidation.
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.cartesian.series.Base.prototype.dataInvalidated_ = function(e) {
  if (e.hasSignal(anychart.Signal.DATA_CHANGED)) {
    this.dispatchSignal(anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.DATA_CHANGED);
  }
};


/**
 * DO NOT PUBLISH.
 * @param {?Array.<*>} categories .
 */
anychart.cartesian.series.Base.prototype.categoriseData = function(categories) {
  this.data_ = this.parentView_.prepare('x', categories || undefined);
};


/**
 * Возвращает итератор текщего мапппинга.
 * @return {!anychart.data.Iterator} Currnet series iterator.
 */
anychart.cartesian.series.Base.prototype.getIterator = function() {
  return this.iterator_ || this.getResetIterator();
};


/**
 * Возвращает нвоый дефолтный итератор текщего мапппинга.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.cartesian.series.Base.prototype.getResetIterator = function() {
  return this.iterator_ = this.data().getIterator();
};


/**
 * Извлекает из ряда, на который указывает итератор данных, массив значений опорных полей типа 'y'.
 * Опорные поля серии определяются массивами referenceValueNames и referenceValueMeanings.
 * Если такое поле одно - вернется его значение.
 * Если их несколько - массив значений.
 * Если хоть одно из этих значений не определено - возвращает null.
 *
 * @return {Array.<*>|null} Fetches significant scale values from current data row.
 */
anychart.cartesian.series.Base.prototype.getReferenceScaleValues = function() {
  if (!this.enabled()) return null;
  var res = [];
  var iterator = this.getIterator();
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    if (this.referenceValueMeanings[i] != 'y') continue;
    var val = iterator.get(this.referenceValueNames[i]);
    if (isNaN(val)) return null;
    res.push(val);
  }
  return res;
};


/**
 * Извлекает из ряда, на который указывает итератор данных, массив значений опорных полей и получает их пиксельные
 * значения. Опорные поля серии определяются массивами referenceValueNames и referenceValueMeanings.
 * Если хоть одно из этих значений не определено - возвращает null.
 *
 * @return {Array.<number>|null} Массив со значениями колонок или null, если хоть одно значение не определено.
 *    (так сделано, чтобы не нужно было еще раз перебирать этот массив для определения того, missing ли это).
 * @protected
 */
anychart.cartesian.series.Base.prototype.getReferenceCoords = function() {
  if (!this.enabled()) return null;
  var res = [];
  var yScale = /** @type {anychart.scales.Base} */(this.yScale());
  var xScale = /** @type {anychart.scales.Base} */(this.xScale());
  var iterator = this.getIterator();
  var fail = false;
  var stacked = yScale.stackMode() != anychart.scales.StackMode.NONE;
  for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
    var val = iterator.get(this.referenceValueNames[i]);

    if (!goog.isDef(val)) {
      if (stacked && this.referenceValuesSupportStack)
        fail = true;
      else
        return null;
    }

    var pix;
    switch (this.referenceValueMeanings[i]) {
      case 'x':
        pix = this.applyRatioToBounds(
            xScale.transform(val, /** @type {number} */(this.xPointPosition())),
            true);
        break;
      case 'y':
        if (this.referenceValuesSupportStack)
          val = yScale.applyStacking(val);
        pix = this.applyRatioToBounds(yScale.transform(val, 0.5), false);
        break;
      case 'z':
        if (stacked) {
          if (this.referenceValuesSupportStack)
            val = yScale.getPrevVal(val);
          pix = this.applyRatioToBounds(goog.math.clamp(yScale.transform(val, 0.5), 0, 1), false);
        } else {
          pix = this.zeroY;
        }
        break;
      case 'n':
        pix = /** @type {number} */(+val);
        break;
    }

    if (isNaN(pix)) fail = true;

    res.push(pix);
  }
  return fail ? null : res;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Sufficient properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Возвращает текущее положение точки на ординальной шкале.
 * @return {number} Current x-point position.
 *//**
 * Задает положение точки на ординальной шкале.
 * @illustration <t>simple-h100</t>
 * stage.path()
 *     .moveTo(20, 50)
 *     .lineTo(380, 50)
 *     .moveTo(20, 55)
 *     .lineTo(20,45)
 *     .moveTo(100, 55)
 *     .lineTo(100,45)
 *     .moveTo(180, 55)
 *     .lineTo(180,45)
 *     .moveTo(260, 55)
 *     .lineTo(260,45)
 *     .stroke('2px black');
 * stage.text(40, 60, 'Point 1');
 * stage.text(118, 60, 'Point 2');
 * stage.text(200, 60, 'Point 3');
 * stage.text(350, 60, 'X-Axis');
 * stage.path()
 *     .moveTo(20, 20)
 *     .lineTo(100, 20)
 *     .stroke('blue');
 * stage.text(12, 13, '0').color('blue');
 * stage.text(102, 13, '1').color('blue');
 * stage.text(142, 30, '0.7').color('blue');
 * stage.circle(150, 47, 4).fill('lightblue');
 * stage.text(182, 30, '0.1').color('blue');
 * stage.circle(190, 47, 4).fill('lightblue');
 * @illustrationDesc
 * Точке на ординальной шкале отводится место, внутри которого может разместиться точка, данное значение можно выставить вручную.
 * Если серий больше чем одна, то это положение рассчитывается пропорционально количеству серий, что бы точки могли размещаться рядом.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_position [0.5] Положение точки (число от 0 до 1).
 * @return {number|anychart.cartesian.series.Base} .
 */
anychart.cartesian.series.Base.prototype.xPointPosition = function(opt_position) {
  if (goog.isDef(opt_position)) {
    if (this.pointPosition_ != +opt_position) {
      this.pointPosition_ = +opt_position;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return isNaN(this.pointPosition_) ? this.autoPointPosition_ : this.pointPosition_;
};


/**
 * Служит для автоназначения позиции плотом - если установлено внешнее значение, то не забивает его.
 * @param {number} position .
 * @return {anychart.cartesian.series.Base} .
 */
anychart.cartesian.series.Base.prototype.setAutoXPointPosition = function(position) {
  this.autoPointPosition_ = +position;
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Рисует серию в текущий контейнер. Если у серии не заданы шкалы - создает их автоматически.
 * @example <t>listingOnly</t>
 * series.draw(400, 200);
 * @param {number=} opt_parentWidth [0] Optional width of the parent container for series bounds calculation.
 * @param {number=} opt_parentHeight [0] Optional height of the parent container for series bounds calculation.
 */
anychart.cartesian.series.Base.prototype.draw = function(opt_parentWidth, opt_parentHeight) {
  this.suspendSignalsDispatching();
  var iterator;
  var value;
  var scale;
  if (!this.xScale()) {
    scale = new anychart.scales.Ordinal();
    this.xScale(scale);
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = iterator.get('x');
      if (goog.isDef(value))
        scale.extendDataRange(value);
    }
    scale.finishAutoCalc();
  }
  if (!this.yScale()) {
    scale = new anychart.scales.Linear();
    this.yScale(scale);
    scale.startAutoCalc();
    iterator = this.getResetIterator();
    while (iterator.advance()) {
      value = this.getReferenceScaleValues();
      if (value)
        scale.extendDataRange.apply(scale, value);
    }
    scale.finishAutoCalc();
  }

  var hasParentBounds = goog.isDef(opt_parentWidth) && goog.isDef(opt_parentHeight);
  if (hasParentBounds)
    this.pixelBounds(/** @type {anychart.math.Rect} */(this.pixelBounds(opt_parentWidth, opt_parentHeight)));

  iterator = this.getResetIterator();
  this.startDrawing();
  while (iterator.advance())
    this.drawPoint();
  this.finalizeDrawing();

  if (hasParentBounds) this.pixelBounds(null);
  this.resumeSignalsDispatching(false);
  this.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Рисует точку, на которую указывает итератор.<br/>
 * Корретно завершает полигон серии, если всретился missing;
 */
anychart.cartesian.series.Base.prototype.drawPoint = function() {
  if (this.enabled()) {
    if (this.firstPointDrawn)
      this.firstPointDrawn = this.drawSubsequentPoint();
    else
      this.firstPointDrawn = this.drawFirstPoint();
    if (this.firstPointDrawn) {
      this.drawLabel(false);
    }
  }
};


/**
 * Этот метод используется параллельным итератором в случае, если серии необходимо явно сказать, что нужно
 * нарисовать отсутствующую точку (для случая, когда в данных этой серии такой Х отстутсвует, а в других
 * сериях он есть).
 */
anychart.cartesian.series.Base.prototype.drawMissing = function() {
  this.firstPointDrawn = false;
  if (this.yScale().stackMode() != anychart.scales.StackMode.NONE && this.referenceValuesSupportStack) {
    for (var i = 0, len = this.referenceValueNames.length; i < len; i++) {
      if (this.referenceValueMeanings[i] == 'y')
        this.yScale().applyStacking(NaN);
    }
  }
};


/**
 * Инициализирует начало рисования серии.<br/>
 * Если шкала не задана явно, то создает дефолтную.
 */
anychart.cartesian.series.Base.prototype.startDrawing = function() {
  this.firstPointDrawn = false;

  /** @type {anychart.scales.Base} */
  var scale = /** @type {anychart.scales.Base} */(this.yScale());
  var res = scale.transform(0);
  if (isNaN(res))
    res = 0;
  this.zeroY = this.applyRatioToBounds(goog.math.clamp(res, 0, 1), false);

  this.checkDrawingNeeded();

  this.labels().suspendSignalsDispatching();
  this.hoverLabels().suspendSignalsDispatching();
  this.realLabels_.suspendSignalsDispatching();
  this.realLabels_.deserialize(this.labels_.serialize(true));
  this.realLabels_.container(/** @type {acgraph.vector.ILayer} */(this.container()));
  this.realLabels_.parentBounds(/** @type {anychart.math.Rect} */(this.pixelBounds()));
};


/**
 * Завершает рисование серии.
 * @example <t>listingOnly</t>
 * series.startDrawing();
 * while(series.getIterator().advance())
 *   series.drawPoint();
 * series.finalizeDrawing();
 */
anychart.cartesian.series.Base.prototype.finalizeDrawing = function() {
  this.realLabels_.end();
  this.labels().resumeSignalsDispatching(false);
  this.hoverLabels().resumeSignalsDispatching(false);
  this.realLabels_.resumeSignalsDispatching(false);

  this.realLabels_.markConsistent(anychart.ConsistencyState.ALL);
  if (this.labels_)
    this.labels_.markConsistent(anychart.ConsistencyState.ALL);
  if (this.hoverLabels_)
    this.hoverLabels_.markConsistent(anychart.ConsistencyState.ALL);
  this.markConsistent(anychart.ConsistencyState.ALL);
};


/**
 * Draws marker for the point.
 * @param {boolean} hovered If it is a hovered marker drawing.
 * @protected
 */
anychart.cartesian.series.Base.prototype.drawLabel = function(hovered) {
  var pointLabel = this.getIterator().get(hovered ? 'hoverLabel' : 'label');
  var index = this.getIterator().getIndex();
  var labels = /** @type {anychart.elements.Multilabel} */(hovered ? this.hoverLabels() : this.labels());
  if (goog.isDef(pointLabel))
    labels.deserializeAt(index, /** @type {Object} */(pointLabel));
  this.realLabels_.dropCustomSettingsAt(index);
  this.realLabels_.deserializeAt(index, labels.serializeAt(index, !hovered));
  this.realLabels_.textFormatter(/** @type {Function} */(labels.textFormatter()));
  this.realLabels_.positionFormatter(/** @type {Function} */(labels.positionFormatter()));
  this.realLabels_.draw(this.createFormatProvider(),
      this.createPositionProvider(/** @type {anychart.utils.NinePositions|string} */(this.realLabels_.positionAt(index))),
      index);
};


/**
 * Show data point tooltip.
 * @protected
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate tooltip to show.
 */
anychart.cartesian.series.Base.prototype.showTooltip = function(opt_event) {
  this.moveTooltip(opt_event);
  acgraph.events.listen(
      goog.dom.getDocument(),
      acgraph.events.EventType.MOUSEMOVE,
      this.moveTooltip,
      false,
      this);
};


/**
 * Hide data point tooltip.
 * @protected
 */
anychart.cartesian.series.Base.prototype.hideTooltip = function() {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  acgraph.events.unlisten(
      goog.dom.getDocument(),
      acgraph.events.EventType.MOUSEMOVE,
      this.moveTooltip,
      false,
      this);
  tooltip.hide();
};


/**
 * @protected
 * @param {goog.events.BrowserEvent=} opt_event that initiate tooltip to show.
 */
anychart.cartesian.series.Base.prototype.moveTooltip = function(opt_event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());

  if (tooltip.isFloating() && opt_event) {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(opt_event.clientX, opt_event.clientY));
  } else {
    tooltip.show(
        this.createFormatProvider(),
        new acgraph.math.Coordinate(0, 0));
  }
};


/**
 * Create column series format provider.
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.cartesian.series.Base.prototype.createFormatProvider = function() {
  var iterator = this.getIterator();
  var index = iterator.getIndex();
  var provider = {
    'index': index,
    'seriesName': this.name_ ? this.name_ : 'Series: ' + this.index_,
    'seriesPointsCount': this.statistics('seriesPointsCount'),
    'pointsCount': this.statistics('pointsCount')
  };

  var seriesMax = this.statistics('seriesMax');
  var seriesMin = this.statistics('seriesMin');
  var seriesSum = this.statistics('seriesSum');
  var seriesAverage = this.statistics('seriesAverage');
  var max = this.statistics('max');
  var min = this.statistics('min');
  var sum = this.statistics('sum');
  var average = this.statistics('average');

  if (seriesMax) provider['seriesMax'] = seriesMax;
  if (seriesMin) provider['seriesMin'] = seriesMin;
  if (seriesSum) provider['seriesSum'] = seriesSum;
  if (seriesAverage) provider['seriesAverage'] = seriesAverage;
  if (max) provider['max'] = max;
  if (min) provider['min'] = min;
  if (sum) provider['sum'] = sum;
  if (average) provider['average'] = average;

  var referenceName;
  for (var i in this.referenceValueNames) {
    referenceName = this.referenceValueNames[i];
    provider[referenceName] = iterator.get(referenceName);
  }

  return provider;
};


/**
 * Create column series format provider.
 * @param {anychart.utils.NinePositions|string} position
 * @return {Object} Object with info for labels formatting.
 * @protected
 */
anychart.cartesian.series.Base.prototype.createPositionProvider = goog.abstractMethod;


/**
 * Draws first point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.cartesian.series.Base.prototype.drawFirstPoint = function() {
  return this.drawSubsequentPoint();
};


/**
 * Draws subsequent point in continuous series.
 * @return {boolean} Returns true if point was successfully drawn.
 * @protected
 */
anychart.cartesian.series.Base.prototype.drawSubsequentPoint = goog.abstractMethod;


/**
 * Применяет переданное ратио (обычно значение, трансформированное шкалой) к баундам, в которые должна нарисоваться
 * серия.
 * @param {number} ratio .
 * @param {boolean} horizontal .
 * @return {number} .
 * @protected
 */
anychart.cartesian.series.Base.prototype.applyRatioToBounds = function(ratio, horizontal) {
  /** @type {acgraph.math.Rect} */
  var bounds = /** @type {acgraph.math.Rect} */(this.pixelBounds());
  var min, range;
  if (horizontal) {
    min = bounds.left;
    range = bounds.width;
  } else {
    min = bounds.getBottom();
    range = -bounds.height;
  }
  return min + ratio * range;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Interactivity
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleMouseOver = function(event) {
  var res = this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
  if (res) {
    if (event && event.target) {
      if (goog.isDef(event.target['__tagIndex']))
        this.hoverPoint(event.target['__tagIndex'], event);
      else if (event.target['__tagSeriesGlobal'])
        this.hoverSeries();
      else
        this.unhover();
    } else
      this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event .
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleMouseOut = function(event) {
  var res = this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
  if (res) {
    this.unhover();
  }
};


/**
 * @param {acgraph.events.Event} event
 * @protected
 */
anychart.cartesian.series.Base.prototype.handleBrowserEvents = function(event) {
  this.dispatchEvent(new anychart.cartesian.series.Base.BrowserEvent(this, event));
};


/**
 * Series hover status. NaN - not hovered, -1 - series hovered, non-negative number - point with this index hovered.
 * @type {number}
 * @protected
 */
anychart.cartesian.series.Base.prototype.hoverStatus = NaN;


/**
 * Hovers all points of the series. Use <b>unhover</b> method for unhover series.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 */
anychart.cartesian.series.Base.prototype.hoverSeries = goog.abstractMethod;


/**
 * Hovers a point of the series by its index.
 * @param {number} index Index of the point to hover.
 * @param {goog.events.BrowserEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Используется только для отображения float tooltip.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 */
anychart.cartesian.series.Base.prototype.hoverPoint = goog.abstractMethod;


/**
 * Removes hover from the series.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 */
anychart.cartesian.series.Base.prototype.unhover = goog.abstractMethod;


/**
 * Временно работает только на acgraph.vector.Element.
 * @param {acgraph.vector.IElement} element .
 * @param {boolean=} opt_seriesGlobal .
 * @protected
 */
anychart.cartesian.series.Base.prototype.makeHoverable = function(element, opt_seriesGlobal) {
  if (!element) return;
  if (opt_seriesGlobal)
    element['__tagSeriesGlobal'] = true;
  else
    element['__tagIndex'] = this.getIterator().getIndex();
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.MOUSEOVER, this.handleMouseOver, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.MOUSEOUT, this.handleMouseOut, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.CLICK, this.handleBrowserEvents, false, this);
  (/** @type {acgraph.vector.Element} */(element)).listen(acgraph.events.EventType.DBLCLICK, this.handleBrowserEvents, false, this);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Scales.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for current series X scale.
 * @return {anychart.scales.Base} Current series X Scale.
 *//**
 * Setter for series X scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|anychart.cartesian.series.Base)} Series X Scale or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.xScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.xScale_ != opt_value) {
      if (this.xScale_)
        this.xScale_.unlisten(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.xScale_ = opt_value;
      this.xScale_.listen(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.xScale_;
  }
};


/**
 * Getter for current series Y scale.
 * @return {anychart.scales.Base} Current series Y Scale.
 *//**
 * Setter for series Y scale.
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {anychart.scales.Base=} opt_value Value to set.
 * @return {(anychart.scales.Base|anychart.cartesian.series.Base)} Series Y Scale or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.yScale = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.yScale_ != opt_value) {
      if (this.yScale_)
        this.yScale_.unlisten(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.yScale_ = opt_value;
      this.yScale_.listen(anychart.Base.SIGNAL, this.scaleInvalidated_, false, this);
      this.invalidate(anychart.ConsistencyState.APPEARANCE,
          anychart.Signal.NEEDS_RECALCULATION | anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  } else {
    return this.yScale_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.series.Base.prototype.scaleInvalidated_ = function(event) {
  var signal = 0;
  if (event.hasSignal(anychart.Signal.NEEDS_RECALCULATION))
    signal |= anychart.Signal.NEEDS_RECALCULATION;
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION))
    signal |= anychart.Signal.NEEDS_REDRAW;
  this.invalidate(anychart.ConsistencyState.APPEARANCE, signal);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Tooltip.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Series data tooltip.
 * @param {(null|string|Object|anychart.elements.Tooltip)=} opt_value Tooltip settings.
 * @return {!(anychart.cartesian.series.Base|anychart.elements.Tooltip)} Tooltip instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.tooltip = function(opt_value) {
  if (!this.tooltip_) {
    this.tooltip_ = new anychart.elements.Tooltip();
    this.registerDisposable(this.tooltip_);
    this.tooltip_.listenSignals(this.onTooltipSignal_, this);
  }
  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Tooltip) {
      this.tooltip_.deserialize(opt_value.serialize());
    } else if (goog.isObject(opt_value)) {
      this.tooltip_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.tooltip_.enabled(false);
    }
    return this;
  } else {
    return this.tooltip_;
  }
};


/**
 * Scales invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.cartesian.series.Base.prototype.onTooltipSignal_ = function(event) {
  var tooltip = /** @type {anychart.elements.Tooltip} */(this.tooltip());
  tooltip.redraw();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Labels.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets or sets series data labels.
 * @param {(anychart.elements.Multilabel|Object|string|null)=} opt_value Series data labels settings.
 * @return {!(anychart.elements.Multilabel|anychart.cartesian.series.Base)} Labels instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.labels = function(opt_value) {
  if (!this.labels_) {
    this.labels_ = new anychart.elements.Multilabel();
    this.registerDisposable(this.labels_);
    this.labels_.listenSignals(this.labelsInvalidated_, this);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Multilabel) {
      var data = opt_value.serialize();
      this.labels_.deserialize(data);
    } else if (goog.isObject(opt_value)) {
      this.labels_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.labels_.enabled(false);
    }
    return this;
  }
  return this.labels_;
};


/**
 * Gets or sets series hover data labels.
 * @param {(anychart.elements.Multilabel|Object|string|null)=} opt_value Series data labels settings.
 * @return {!(anychart.elements.Multilabel|anychart.cartesian.series.Base)} Labels instance or itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.hoverLabels = function(opt_value) {
  if (!this.hoverLabels_) {
    this.hoverLabels_ = new anychart.elements.Multilabel();
    this.registerDisposable(this.hoverLabels_);
  }

  if (goog.isDef(opt_value)) {
    if (opt_value instanceof anychart.elements.Multilabel) {
      var data = opt_value.serialize();
      this.hoverLabels_.deserialize(data);
    } else if (goog.isObject(opt_value)) {
      this.hoverLabels_.deserialize(opt_value);
    } else if (anychart.utils.isNone(opt_value)) {
      this.hoverLabels_.enabled(false);
    }
    return this;
  }
  return this.hoverLabels_;
};


/**
 * Listener for labels invalidation.
 * @param {anychart.SignalEvent} event Invalidation event.
 * @private
 */
anychart.cartesian.series.Base.prototype.labelsInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REDRAW)) {
    this.invalidate(anychart.ConsistencyState.LABELS, anychart.Signal.NEEDS_REDRAW);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring
//
//----------------------------------------------------------------------------------------------------------------------
// Здесь будут лежать настройки фила и строука, но экспортироваться они должны ТОЛЬКО в конечных сериях.
/**
 * Getter for current series color.
 * @return {!acgraph.vector.Fill} Current color.
 *//**
 * Setter for series color.<br/>
 * Цвет серии. Используется как базовый цвет серии в филах и строуках, а так же в легенде.<br/>
 * О том как задавать цвет, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * <b>Note:</b> Метод <u>color</u> определет настройки <u>fill</u> и <b>stroke</b>, а это значит, что передавать в него
 * заливку картинкой не благоразумно, так как stroke не поддерживает заливку картинкой.
 * @shortDescription Setter for series color by one value.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys Цвет, или градиент.
 * @param {number=} opt_opacityOrAngleOrCx Прозрачность, или угол градиента, или X-координата центра радиального градиента.
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy Режим
 *  заливки или Y-координата центра радиального градиента.
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode Прозрачность
 *  или режим заливки.
 * @param {number=} opt_opacity Opacity (value from 0 to 1).
 * @param {number=} opt_fx The focus-point x-coordinate.
 * @param {number=} opt_fy The focus-point y-coordinate.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!(acgraph.vector.Fill|anychart.cartesian.series.Base)} .
 */
anychart.cartesian.series.Base.prototype.color = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var color = goog.isNull(opt_fillOrColorOrKeys) ? null : anychart.color.normalizeFill.apply(null, arguments);
    if (this.color_ != color) {
      this.color_ = color;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.color_ || this.autoColor_ || 'blue';
};


/**
 * Sets series color that parent chart have set for it.
 * @param {acgraph.vector.Fill} value Auto color fill distributed by the chart.
 */
anychart.cartesian.series.Base.prototype.setAutoColor = function(value) {
  this.autoColor_ = value;
};


/**
 * Sets series marker type that parent chart have set for it.
 * @param {anychart.elements.Marker.Type} value Auto marker type distributed by the chart.
 */
anychart.cartesian.series.Base.prototype.setAutoMarkerType = function(value) {
  this.autoMarkerType = value;
};


/**
 * Sets series hatch fill type that parent chart have set for it.
 * @param {?acgraph.vector.HatchFill.HatchFillType} value Auto hatch fill type distributed by the chart.
 */
anychart.cartesian.series.Base.prototype.setAutoHatchFill = function(value) {
  this.autoHatchFill_ = /** @type {acgraph.vector.HatchFill} */(anychart.color.normalizeHatchFill(value));
};


/**
 * Set/get hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Hatch fill.
 */
anychart.cartesian.series.Base.prototype.hatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    var hatchFill = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);

    if (hatchFill != this.hatchFill_) {
      this.hatchFill_ = hatchFill;
      this.invalidate(anychart.ConsistencyState.HATCH_FILL, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.hatchFill_;
};


/**
 * Set/get hover hatch fill.
 * @param {(acgraph.vector.PatternFill|acgraph.vector.HatchFill|Function|acgraph.vector.HatchFill.HatchFillType|
 * string)=} opt_patternFillOrType PatternFill or HatchFill instance or type of hatch fill.
 * @param {string=} opt_color Color.
 * @param {number=} opt_thickness Thickness.
 * @param {number=} opt_size Pattern size.
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill|anychart.cartesian.series.Base|Function} Hover hatch fill.
 */
anychart.cartesian.series.Base.prototype.hoverHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  if (goog.isDef(opt_patternFillOrType)) {
    this.hoverHatchFill_ = goog.isFunction(opt_patternFillOrType) ?
        opt_patternFillOrType :
        anychart.color.normalizeHatchFill.apply(null, arguments);
    return this;
  }
  return this.hoverHatchFill_;
};


/**
 * Метод, получающий финальное значение hatch fill для текущей точки с учетом всех fallback.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the hatch fill should be a hover hatch fill.
 * @return {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} Final hatch fill for the current row.
 */
anychart.cartesian.series.Base.prototype.getFinalHatchFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalHatchFill = /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
      (usePointSettings && iterator.get('hatchFill')) || this.hatchFill());

  return /** @type {!(acgraph.vector.HatchFill|acgraph.vector.PatternFill)} */(hover ?
      this.normalizeHatchFill(
          /** @type {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} */(
              (usePointSettings && iterator.get('hoverHatchFill')) ||
              this.hoverHatchFill() || normalHatchFill),
          normalHatchFill) :
      this.normalizeHatchFill(normalHatchFill));
};


/**
 * Gets final normalized pattern/hatch fill.
 * @param {acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function} hatchFill Normal state hatch fill.
 * @param {...(acgraph.vector.HatchFill|acgraph.vector.PatternFill|Function)} var_args .
 * @return {acgraph.vector.HatchFill|acgraph.vector.PatternFill} Normalized hatch fill.
 * @protected
 */
anychart.cartesian.series.Base.prototype.normalizeHatchFill = function(hatchFill, var_args) {
  var fill;
  if (goog.isFunction(hatchFill)) {
    var sourceHatchFill = arguments.length > 1 ?
        this.normalizeHatchFill.apply(this, goog.array.slice(arguments, 1)) :
        this.autoHatchFill_ ||
        anychart.color.normalizeHatchFill(anychart.cartesian.series.Base.DEFAULT_HATCH_FILL_TYPE);

    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceHatchFill': sourceHatchFill,
      'iterator': this.getIterator()
    };
    fill = anychart.color.normalizeHatchFill(hatchFill.call(scope));
  } else
    fill = anychart.color.normalizeHatchFill(hatchFill);
  return fill;
};


/**
 * Getter for current series color.
 * @return {!acgraph.vector.Fill} Current color.
 *//**
 * Setter for series fill by function.
 * @param {function():acgraph.vector.Fill=} opt_fillFunction [function() {
 *  return this.sourceColor;
 * }] Функция вида <code>function(){
 *    // this.sourceColor - это цвет, который возвращается геттреом color().
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * Setter for series fill by one value.<br/>
 * Цвет серии. Используется как базовый цвет серии в филах и строуках, а так же в легенде.<br/>
 * О том как задавать цвет, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * <b>Note:</b> Метод <u>color</u> определет настройки <u>fill</u> и <b>stroke</b>, а это значит, что передавать в него
 * заливку картинкой не благоразумно, так как stroke не поддерживает заливку картинкой.
 * @shortDescription Setter for series color by one value.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys Цвет, или градиент.
 * @param {number=} opt_opacityOrAngleOrCx Прозрачность, или угол градиента, или X-координата центра радиального градиента.
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy Режим
 *  заливки или Y-координата центра радиального градиента.
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode Прозрачность
 *  или режим заливки
 * @param {number=} opt_opacity Opacity (value from 0 to 1).
 * @param {number=} opt_fx The focus-point x-coordinate.
 * @param {number=} opt_fy The focus-point y-coordinate.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Base.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    var fill = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    if (fill != this.fill_) {
      this.fill_ = fill;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.fill_;
};


/**
 * Getter for current series fill.
 * @return {!acgraph.vector.Fill} Current color.
 *//**
 * Setter for series fill by function.
 * @param {function():acgraph.vector.Fill=} opt_fillFunction [function() {
 *  return anychart.color.lighten(this.sourceColor);
 * }] Функция вида <code>function(){
 *    // this.sourceColor - это цвет, который возвращается геттером fill().
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * Setter for series fill by one value.<br/>
 * Цвет серии. Используется как базовый цвет серии в филах и строуках, а так же в легенде.<br/>
 * О том как задавать цвет, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * <b>Note:</b> Метод <u>color</u> определет настройки <u>fill</u> и <b>stroke</b>, а это значит, что передавать в него
 * заливку картинкой не благоразумно, так как stroke не поддерживает заливку картинкой.
 * @shortDescription Setter for series color by one value.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys Цвет, или градиент.
 * @param {number=} opt_opacityOrAngleOrCx Прозрачность, или угол градиента, или X-координата центра радиального градиента.
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy Режим
 *  заливки или Y-координата центра радиального градиента.
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode Прозрачность
 *  или режим заливки
 * @param {number=} opt_opacity Opacity (value from 0 to 1).
 * @param {number=} opt_fx The focus-point x-coordinate.
 * @param {number=} opt_fy The focus-point y-coordinate.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.cartesian.series.Base|Function} .
 */
anychart.cartesian.series.Base.prototype.hoverFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDef(opt_fillOrColorOrKeys)) {
    this.hoverFill_ = goog.isFunction(opt_fillOrColorOrKeys) ?
        opt_fillOrColorOrKeys :
        anychart.color.normalizeFill.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverFill_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Fill} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Base.prototype.getFinalFill = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Fill|Function} */(
      (usePointSettings && iterator.get('fill')) ||
          this.fill());
  return /** @type {!acgraph.vector.Fill} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Fill|Function} */(
              (usePointSettings && iterator.get('hoverFill')) ||
                  this.hoverFill() ||
                  normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return anychart.color.darken(this.sourceColor);
 * }] Функция вида <code>function(){
 *    // this.sourceColor - это цвет, который возвращается геттером fill().
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * Setter for stroke settings.
 * О том как задавать настройки, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Base.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    var stroke = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    if (stroke != this.strokeInternal) {
      this.strokeInternal = stroke;
      this.invalidate(anychart.ConsistencyState.APPEARANCE, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.strokeInternal;
};


/**
 * Getter for current stroke settings.
 * @return {acgraph.vector.Stroke|Function} Current stroke settings.
 *//**
 * Setter for series stroke by function.
 * @param {function():(acgraph.vector.ColoredFill|acgraph.vector.Stroke)=} opt_fillFunction [function() {
 *  return this.sourceColor;
 * }] Функция вида <code>function(){
 *    // this.sourceColor - это цвет, который возвращается геттером fill().
 *    return fillValue; // type acgraph.vector.Fill
 * }</code>.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * Setter for stroke settings.
 * О том как задавать настройки, можно почитать тут:
 * {@link http://docs.anychart.com/v1.0/reference-articles/elements-fill}<br/>
 * @shortDescription Setter for stroke settings.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {!anychart.cartesian.series.Base} An instance of the {@link anychart.cartesian.series.Base} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Настройки заливки
 *    границ или просто настройки заливки.
 * @param {number=} opt_thickness [1] Толщина линии.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Стиль (форма) соединения меду двумя линиями.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Style of line cap.
 * @return {anychart.cartesian.series.Base|acgraph.vector.Stroke|Function} .
 */
anychart.cartesian.series.Base.prototype.hoverStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    this.hoverStroke_ = goog.isFunction(opt_strokeOrFill) ?
        opt_strokeOrFill :
        anychart.color.normalizeStroke.apply(null, arguments);
    // Ничего не выставляем, потому что и так все ок?
    return this;
  }
  return this.hoverStroke_;
};


/**
 * Метод, получающий финальное значение цвета линии для текущей точки с учетом всех fallback.
 * @param {boolean} usePointSettings If point settings should count too (iterator questioning).
 * @param {boolean} hover If the stroke should be a hover stroke.
 * @return {!acgraph.vector.Stroke} Final hover stroke for the current row.
 * @protected
 */
anychart.cartesian.series.Base.prototype.getFinalStroke = function(usePointSettings, hover) {
  var iterator = this.getIterator();
  var normalColor = /** @type {acgraph.vector.Stroke|Function} */(
      (usePointSettings && iterator.get('stroke')) ||
          this.stroke());
  return /** @type {!acgraph.vector.Stroke} */(hover ?
      this.normalizeColor(
          /** @type {acgraph.vector.Stroke|Function} */(
              (iterator.get('hoverStroke') && usePointSettings) ||
                  this.hoverStroke() ||
                  normalColor),
          normalColor) :
      this.normalizeColor(normalColor));
};


/**
 * Gets final normalized fill or stroke color.
 * @param {acgraph.vector.Fill|acgraph.vector.Stroke|Function} color Normal state color.
 * @param {...(acgraph.vector.Fill|acgraph.vector.Stroke|Function)} var_args .
 * @return {!(acgraph.vector.Fill|acgraph.vector.Stroke)} Normalized color.
 * @protected
 */
anychart.cartesian.series.Base.prototype.normalizeColor = function(color, var_args) {
  var fill;
  if (goog.isFunction(color)) {
    var sourceColor = arguments.length > 1 ?
        this.normalizeColor.apply(this, goog.array.slice(arguments, 1)) :
        this.color();
    var scope = {
      'index': this.getIterator().getIndex(),
      'sourceColor': sourceColor,
      'iterator': this.getIterator()
    };
    fill = color.call(scope);
  } else
    fill = color;
  return fill;
};


/**
 * Return color for legend item.
 * @return {!anychart.elements.Legend.LegendItemProvider} Color for legend item.
 */
anychart.cartesian.series.Base.prototype.getLegendItemData = function() {
  return {
    'index': this.index_,
    'text': goog.isDef(this.name_) ? this.name_ : 'Series: ' + this.index_,
    'iconType': null,
    'iconStroke': this.getFinalStroke(false, false),
    'iconFill': this.getFinalFill(false, false),
    'iconMarker': null,
    'meta': this.meta_
  };
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Series default settings.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Restore series default settings.
 * @return {anychart.cartesian.series.Base} Return itself for chaining call.
 */
anychart.cartesian.series.Base.prototype.restoreDefaults = function() {

  return this;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Base.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');
  json['data'] = this.data().serialize();
  json['name'] = this.name();

  json['color'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.color()));

  if (goog.isFunction(this.fill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize fill function, you should reset it manually.');
    }
  } else {
    json['fill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.fill()));
  }

  if (goog.isFunction(this.hoverFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverFill function, you should reset it manually.');
    }
  } else {
    json['hoverFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverFill()));
  }

  if (goog.isFunction(this.stroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize stroke function, you should reset it manually.');
    }
  } else {
    json['stroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.stroke()));
  }

  if (goog.isFunction(this.hoverStroke())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverStroke function, you should reset it manually.');
    }
  } else {
    json['hoverStroke'] = anychart.color.serialize(/** @type {acgraph.vector.Stroke}*/(this.hoverStroke()));
  }

  if (goog.isFunction(this.hatchFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hatchFill function, you should reset it manually.');
    }
  } else {
    json['hatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hatchFill()));
  }

  if (goog.isFunction(this.hoverHatchFill())) {
    if (window.console) {
      window.console.log('Warning: We cant serialize hoverHatchFill function, you should reset it manually.');
    }
  } else {
    json['hoverHatchFill'] = anychart.color.serialize(/** @type {acgraph.vector.Fill}*/(this.hoverHatchFill()));
  }

  json['tooltip'] = this.tooltip().serialize();
  json['labels'] = this.labels().serialize();
  return json;
};


/**
 * @inheritDoc
 */
anychart.cartesian.series.Base.prototype.deserialize = function(config) {
  this.suspendSignalsDispatching();

  goog.base(this, 'deserialize', config);

  this.data(config['data']);
  this.name(config['name']);
  this.color(config['color']);
  this.fill(config['fill']);
  this.hoverFill(config['hoverFill']);
  this.stroke(config['stroke']);
  this.hoverStroke(config['hoverStroke']);
  this.hatchFill(config['hatchFill']);
  this.hoverHatchFill(config['hoverHatchFill']);
  this.tooltip(config['tooltip']);
  this.labels(config['labels']);

  this.resumeSignalsDispatching(false);

  return this;
};



/**
 * Encapsulates browser event for acgraph.
 * @param {anychart.cartesian.series.Base} target EventTarget to be set as a target of the event.
 * @param {goog.events.BrowserEvent=} opt_e Normalized browser event to initialize this event.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
anychart.cartesian.series.Base.BrowserEvent = function(target, opt_e) {
  goog.base(this);
  if (opt_e)
    this.copyFrom(opt_e, target);

  /**
   * Point index.
   * @type {number}
   */
  this['pointIndex'] = opt_e && opt_e.target && opt_e.target['__tagIndex'];
  if (isNaN(this['pointIndex']))
    this['pointIndex'] = -1;

  /**
   * Series data iterator ready for the point capturing.
   * @type {!anychart.data.Iterator}
   */
  this['iterator'] = target.data().getIterator();
  this['iterator'].select(this['pointIndex']) || this['iterator'].reset();

  /**
   * Series.
   * @type {anychart.cartesian.series.Base}
   */
  this['series'] = target;
};
goog.inherits(anychart.cartesian.series.Base.BrowserEvent, goog.events.BrowserEvent);


/**
 * An override of BrowserEvent.event_ field to allow compiler to treat it properly.
 * @private
 * @type {goog.events.BrowserEvent}
 */
anychart.cartesian.series.Base.BrowserEvent.prototype.event_;


/**
 * Copies all info from a BrowserEvent to represent a new one, rearmed event, that can be redispatched.
 * @param {goog.events.BrowserEvent} e Normalized browser event to copy the event from.
 * @param {goog.events.EventTarget=} opt_target EventTarget to be set as a target of the event.
 */
anychart.cartesian.series.Base.BrowserEvent.prototype.copyFrom = function(e, opt_target) {
  var type = e.type;
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.events.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.events.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.events.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.events.EventType.POINT_DOUBLE_CLICK;
      break;
  }
  this.type = type;
  // TODO (Anton Saukh): this awful typecast must be removed when it is no longer needed.
  // In the BrowserEvent.init() method there is a TODO from Santos, asking to change typification
  // from Node to EventTarget, which would make more sense.
  /** @type {Node} */
  var target = /** @type {Node} */(/** @type {Object} */(opt_target));
  this.target = target || e.target;
  this.currentTarget = e.currentTarget || this.target;
  this.relatedTarget = e.relatedTarget || this.target;

  this.offsetX = e.offsetX;
  this.offsetY = e.offsetY;

  this.clientX = e.clientX;
  this.clientY = e.clientY;

  this.screenX = e.screenX;
  this.screenY = e.screenY;

  this.button = e.button;

  this.keyCode = e.keyCode;
  this.charCode = e.charCode;
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = e.platformModifierKey;
  this.state = e.state;

  this.event_ = e;
  delete this.propagationStopped_;
};
