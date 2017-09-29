goog.provide('anychart.chartEditor2Module.Item');
goog.require('anychart.ui.Component');


/**
 * @constructor
 * @extends {anychart.ui.Component}
 */
anychart.chartEditor2Module.Item = function(caption) {
    anychart.chartEditor2Module.Item.base(this, 'constructor');
    this.caption_ = caption;

    this.addClassName('anychart-breadcrumbs-item');
};
goog.inherits(anychart.chartEditor2Module.Item, anychart.ui.Component);


/** @inheritDoc */
anychart.chartEditor2Module.Item.prototype.createDom = function() {
    anychart.chartEditor2Module.Item.base(this, 'createDom');
    var element = this.getElement();

    var caption = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-breadcrumbs-item-caption', this.caption_);
    goog.dom.appendChild(element, caption);

    var indicator = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-breadcrumbs-item-indicator');
    goog.dom.appendChild(element, indicator);

    this.getHandler().listen(element, goog.events.EventType.CLICK, function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.dispatchEvent(goog.ui.Component.EventType.ACTION);
    })
};