goog.provide('anychart.chartEditor2Module.Component');

goog.require('anychart.ui.Component');



/**
 * Component, that can be hidden.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.ui.Component}
 */
anychart.chartEditor2Module.Component = function(opt_domHelper) {
  anychart.chartEditor2Module.Component.base(this, 'constructor', opt_domHelper);

  /**
   * @type {boolean}
   * @private
   */
  this.hidden_ = false;


  /**
   * State of exclusion
   * @type {boolean}
   */
  this.excluded = false;
};
goog.inherits(anychart.chartEditor2Module.Component, anychart.ui.Component);


/** @inheritDoc */
anychart.chartEditor2Module.Component.prototype.createDom = function() {
  anychart.chartEditor2Module.Component.base(this, 'createDom');

  if (!this.isExcluded()) {
    var parent = this.getParent();
    this.exclude(parent && goog.isFunction(parent.isExcluded) && parent.isExcluded());
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.Component.prototype.enterDocument = function() {
  anychart.chartEditor2Module.Component.base(this, 'enterDocument');

  if (!this.isExcluded()) {
    var parent = this.getParent();
    this.exclude(parent && goog.isFunction(parent.isExcluded) && parent.isExcluded());
  }
};


/**
 * Shows component by assigning 'anychart-hidden' class.
 */
anychart.chartEditor2Module.Component.prototype.hide = function() {
  goog.dom.classlist.enable(this.getElement(), 'anychart-hidden', true);
  this.hidden_ = true;
};


/**
 * Shows component by removing 'anychart-hidden' class.
 */
anychart.chartEditor2Module.Component.prototype.show = function() {
  goog.dom.classlist.enable(this.getElement(), 'anychart-hidden', false);
  this.hidden_ = false;
};


/**
 * Getter for hidden state.
 * @return {boolean}
 */
anychart.chartEditor2Module.Component.prototype.isHidden = function() {
  return this.hidden_;
};


/**
 * Updates component on model change.
 * @param {Object=} opt_evt
 */
anychart.chartEditor2Module.Component.prototype.update = function(opt_evt) {

};


/** @param {boolean} value */
anychart.chartEditor2Module.Component.prototype.exclude = function(value) {
  if (this.excluded != value) {
    for (var i = 0, count = this.getChildCount(); i < count; i++) {
      var child = this.getChildAt(i);
      if (goog.isFunction(child.exclude))
        child.exclude(value);
    }

    this.excluded = value;

    if (this.isInDocument())
      goog.style.setElementShown(this.getElement(), !this.excluded);
  }
};


/** @return {boolean} */
anychart.chartEditor2Module.Component.prototype.isExcluded = function() {
  return this.excluded;
};