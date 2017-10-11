goog.provide('anychart.ui.Component');

goog.require('anychart');
goog.require('goog.ui.Component');


/**
 *
 * @constructor
 * @name anychart.ui.Component
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @extends {goog.ui.Component}
 */
anychart.ui.Component = function(opt_domHelper) {
  anychart.ui.Component.base(this, 'constructor', opt_domHelper);
};
goog.inherits(anychart.ui.Component, goog.ui.Component);


// region ---- extra class names
/**
 * @type {Array<string>|null}
 * @private
 */
anychart.ui.Component.prototype.extraClassNames_ = null;


/** @override */
anychart.ui.Component.prototype.createDom = function() {
  anychart.ui.Component.base(this, 'createDom');
  var element = this.getElement();
  if (element && this.extraClassNames_) {
    goog.dom.classlist.addAll(element, this.extraClassNames_);
  }
};


/** @param {string} className */
anychart.ui.Component.prototype.addClassName = function(className) {
  if (className) {
    if (this.extraClassNames_) {
      if (!goog.array.contains(this.extraClassNames_, className)) {
        this.extraClassNames_.push(className);
      }
    } else {
      this.extraClassNames_ = [className];
    }
    var element = this.getElement();
    if (element) {
      goog.dom.classlist.add(element, className);
    }
  }
};


/**
 * Removes the given class name from the list of classes to be applied to
 * the component's root element.
 * @param {string} className Class name to be removed from the component's root
 *     element.
 */
anychart.ui.Component.prototype.removeClassName = function(className) {
  if (className && this.extraClassNames_ && goog.array.remove(this.extraClassNames_, className)) {
    if (this.extraClassNames_.length === 0) {
      this.extraClassNames_ = null;
    }

    var element = this.getElement();
    if (element) {
      goog.dom.classlist.remove(element, className);
    }
  }
};


/**
 * @param {boolean} enabled
 */
anychart.ui.Component.prototype.setVisible = function(enabled) {
  if (this.isInDocument())
    goog.style.setElementShown(this.getElement(), enabled);
};


/** @override */
anychart.ui.Component.prototype.disposeInternal = function() {
  this.extraClassNames_ = null;
  anychart.ui.Component.base(this, 'disposeInternal');
};
// endregion


// region ---- event listeners
/** @inheritDoc */
anychart.ui.Component.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.ui.Component.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.ui.Component.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.ui.Component.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.ui.Component.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return anychart.ui.Component.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/** @inheritDoc */
anychart.ui.Component.prototype.unlistenByKey = function(key) {
  return anychart.ui.Component.base(this, 'unlistenByKey', key);
};


/** @inheritDoc */
anychart.ui.Component.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) opt_type = String(opt_type).toLowerCase();
  return anychart.ui.Component.base(this, 'removeAllListeners', opt_type);
};
// endregion


//exports
// (function() {
//   var proto = anychart.ui.Component.prototype;
//   proto['listen'] = proto.listen;
//   proto['listenOnce'] = proto.listenOnce;
//   proto['unlisten'] = proto.unlisten;
//   proto['unlistenByKey'] = proto.unlistenByKey;
//   proto['removeAllListeners'] = proto.removeAllListeners;
// })();
