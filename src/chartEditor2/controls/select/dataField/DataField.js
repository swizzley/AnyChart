goog.provide('anychart.chartEditor2.controls.select.DataField');
goog.require('anychart.chartEditor2.controls.select.DataFieldSelect');
goog.require('anychart.ui.Component');


/**
 * @param {anychart.chartEditor2.controls.select.DataFieldModel} opt_model
 * @param {goog.ui.Menu=} opt_menu
 * @param {goog.ui.ButtonRenderer=} opt_renderer
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @param {!goog.ui.MenuRenderer=} opt_menuRenderer
 * @param {string=} opt_menuAdditionalClass
 * @constructor
 * @extends {anychart.ui.Component}
 */
anychart.chartEditor2.controls.select.DataField = function (opt_model, opt_menu, opt_renderer, opt_domHelper, opt_menuRenderer, opt_menuAdditionalClass) {
    anychart.chartEditor2.controls.select.DataField.base(this, 'constructor');

    /**
     * @type {anychart.chartEditor2.controls.select.DataFieldSelect}
     * @private
     */
    this.select_ = new anychart.chartEditor2.controls.select.DataFieldSelect(
        opt_model,
        opt_menu,
        opt_renderer,
        opt_domHelper,
        opt_menuRenderer,
        opt_menuAdditionalClass
    );
    this.addClassName('anychart-select-data-field');
    this.setModel(opt_model);
};
goog.inherits(anychart.chartEditor2.controls.select.DataField, anychart.ui.Component);


/**
 * @typedef {{
 *  caption: string,
 *  label: string
 * }}
 */
anychart.chartEditor2.controls.select.DataFieldModel;


/** @inheritDoc */
anychart.chartEditor2.controls.select.DataField.prototype.createDom = function (e) {
    anychart.chartEditor2.controls.select.DataField.base(this, 'createDom', e);

    var model = /** @type {anychart.chartEditor2.controls.select.DataFieldModel} */(this.getModel());
    var element = this.getElement();

    var label = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-select-data-field-label', model.label);
    goog.dom.appendChild(element, label);

    this.addChild(this.select_, true);

    var clear = new anychart.ui.Component();
    clear.addClassName('anychart-clear');
    this.addChild(clear, true);
};


/** @return {!anychart.chartEditor2.controls.select.DataFieldSelect} */
anychart.chartEditor2.controls.select.DataField.prototype.getSelect = function() {
    return this.select_;
};