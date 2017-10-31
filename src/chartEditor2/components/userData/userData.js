goog.provide('anychart.chartEditor2Module.UserData');
goog.require('anychart.ui.Component');



/**
 * @param {Array.<{id: string, type:string, caption: string, icon:string}>=} opt_model
 * @constructor
 * @extends {anychart.ui.Component}
 */
anychart.chartEditor2Module.UserData = function(opt_model) {
  anychart.chartEditor2Module.UserData.base(this, 'constructor');
  this.addClassName('anychart-user-data');
  this.setModel(opt_model);

  this.items_ = [];
};
goog.inherits(anychart.chartEditor2Module.UserData, anychart.ui.Component);

/** @enum {string} */
anychart.chartEditor2Module.UserData.EventType = {
  ACTION: goog.events.getUniqueId('action')
};


/** @inheritDoc */
anychart.chartEditor2Module.UserData.prototype.createDom = function() {
  anychart.chartEditor2Module.UserData.base(this, 'createDom');
  var element = this.getElement();
  var model = /** @type {Array.<{id: string, caption: string, icon:string}>} */(this.getModel());

  var connectCaption = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-user-data-caption', 'Connect External Data');
  goog.dom.appendChild(element, connectCaption);

  var connectContainer = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-user-data-container');
  goog.dom.appendChild(element, connectContainer);

  var uploadCaption = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-user-data-caption', 'Upload Your Data');
  goog.dom.appendChild(element, uploadCaption);

  var uploadContainer = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-user-data-container');
  goog.dom.appendChild(element, uploadContainer);

  if (model) {
    for (var i = 0, count = model.length; i < count; i++) {
      var item = model[i];
      var itemElement = goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-user-data-item', [
        goog.dom.createDom(goog.dom.TagName.IMG, {
          'src': item.icon,
          'class': 'anychart-user-data-item-icon'
        }),
        goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-user-data-item-caption', item.caption)
      ]);
      goog.dom.setProperties(itemElement, {'data-value': item.id});
      var container = item.type === 'connect' ? connectContainer : uploadContainer;
      goog.dom.appendChild(container, itemElement);

      this.items_.push(itemElement);
    }
  }

  goog.dom.appendChild(connectContainer, goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-clear'));
  goog.dom.appendChild(uploadContainer, goog.dom.createDom(goog.dom.TagName.DIV, 'anychart-clear'));
};


/** @inheritDoc */
anychart.chartEditor2Module.UserData.prototype.enterDocument = function() {
  anychart.chartEditor2Module.UserData.base(this, 'enterDocument');
  for (var i = 0; i < this.items_.length; i++) {
    var itemElement = this.items_[i];
    this.getHandler().listen(itemElement, goog.events.EventType.CLICK, this.onItemClick_);
  }
};


/**
 * @param {Object} e
 * @private
 */
anychart.chartEditor2Module.UserData.prototype.onItemClick_ = function(e) {
  e.preventDefault();
  e.stopPropagation();
  this.dispatchEvent({
    type: anychart.chartEditor2Module.UserData.EventType.ACTION,
    value: e.currentTarget.getAttribute('data-value')
  });
};


/** @inheritDoc */
anychart.chartEditor2Module.UserData.prototype.disposeInternal = function () {
  this.items_.length = 0;
  anychart.chartEditor2Module.UserData.base(this, 'disposeInternal');
};
