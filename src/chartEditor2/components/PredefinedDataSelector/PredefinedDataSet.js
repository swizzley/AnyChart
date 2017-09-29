goog.provide('anychart.chartEditor2Module.PredefinedDataSet');

goog.require('anychart.chartEditor2Module.Component');


/**
 * Predefined data set panel.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.PredefinedDataSet = function(model, opt_domHelper) {
  anychart.chartEditor2Module.PredefinedDataSet.base(this, 'constructor', opt_domHelper);
  this.setModel(model);

  this.dataType = anychart.chartEditor2Module.EditorModel.dataType.PREDEFINED;

  this.jsonUrl = 'https://cdn.anychart.com/anydata/common/';
};
goog.inherits(anychart.chartEditor2Module.PredefinedDataSet, anychart.chartEditor2Module.Component);


/**
 * @param {Object} json
 * @param {number} state
 */
anychart.chartEditor2Module.PredefinedDataSet.prototype.init = function(json, state) {
  this.json_ = json;
  this.state_ = state;
};


/** @inheritDoc */
anychart.chartEditor2Module.PredefinedDataSet.prototype.createDom = function() {
  anychart.chartEditor2Module.PredefinedDataSet.base(this, 'createDom');

  var element = this.getElement();
  var dom = this.getDomHelper();
  var imgUrl = this.json_['logo'].replace('./', 'https://cdn.anychart.com/anydata/common/');

  this.downloadButton = dom.createDom(goog.dom.TagName.A, {'class': 'anychart-button anychart-button-success download'}, 'Download');
  this.downloadButton.setAttribute('data-set-id', this.json_['id']);

  this.removeButton = dom.createDom(goog.dom.TagName.A, {'class': 'anychart-button anychart-button-danger remove'}, 'Remove');
  this.removeButton.setAttribute('data-set-id', this.json_['id']);

  goog.dom.classlist.add(element, 'data-set');
  goog.dom.classlist.add(element, 'data-set-' + this.json_['id']);

  dom.appendChild(element,
      dom.createDom(goog.dom.TagName.DIV, 'content',
          dom.createDom(goog.dom.TagName.IMG, {'src': imgUrl}),
          dom.createDom(goog.dom.TagName.DIV, 'title', this.json_['name']),
          // dom.createTextNode(this.json_['description']),
          dom.createDom(goog.dom.TagName.DIV, 'buttons',
              this.downloadButton,
              this.removeButton,
              dom.createDom(goog.dom.TagName.A,
                  {
                    'href': this.json_['sample'],
                    'class': 'anychart-button anychart-button-primary sample',
                    'target': 'blank_'
                  },
                  'View sample'))));
};


/** @inheritDoc */
anychart.chartEditor2Module.PredefinedDataSet.prototype.enterDocument = function() {
  anychart.chartEditor2Module.PredefinedDataSet.base(this, 'enterDocument');

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  this.getHandler().listen(model, anychart.chartEditor2Module.events.EventType.EDITOR_MODEL_UPDATE, this.onModelUpdate);
  this.onModelUpdate();

  this.getHandler().listen(this.downloadButton, goog.events.EventType.CLICK, this.onClickDownload_);
  this.getHandler().listen(this.removeButton, goog.events.EventType.CLICK, this.onClickRemove_);
};


/** @private */
anychart.chartEditor2Module.PredefinedDataSet.prototype.onModelUpdate = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var loaded = Boolean(model.getPreparedData(this.dataType + this.json_['id']).length);
  goog.dom.classlist.enable(this.getElement(), 'loaded', loaded);
  this.state_ = loaded ?
      anychart.chartEditor2Module.PredefinedDataSelector.DatasetState.LOADED :
      anychart.chartEditor2Module.PredefinedDataSelector.DatasetState.NOT_LOADED;
};


/**
 * Loads data set.
 *
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.PredefinedDataSet.prototype.onClickDownload_ = function(evt) {
  var setId = this.json_['id'];

  if (setId && this.state_ != anychart.chartEditor2Module.PredefinedDataSelector.DatasetState.LOADED) {
    this.state_ = anychart.chartEditor2Module.PredefinedDataSelector.DatasetState.PROCESSING;
    this.dispatchEvent({
      type: anychart.chartEditor2Module.events.EventType.WAIT,
      wait: true
    });

    var setUrl = this.json_['data'].replace('./', this.jsonUrl);
    var self = this;
    goog.net.XhrIo.send(setUrl,
        function(e) {
          if (e.target.getStatus() == 200) {
            var json = e.target.getResponseJson();
            self.dispatchLoadData(json, setId, self.json_['name']);
            goog.dom.classlist.add(self.getElement(), 'loaded');
          } else
            self.state_ = anychart.chartEditor2Module.PredefinedDataSelector.DatasetState.NOT_LOADED;

          self.dispatchEvent({
            type: anychart.chartEditor2Module.events.EventType.WAIT,
            wait: false
          });
        });
  }
};


/** @private */
anychart.chartEditor2Module.PredefinedDataSet.prototype.onClickRemove_ = function() {
  this.dispatchEvent({
    type: anychart.chartEditor2Module.events.EventType.DATA_REMOVE,
    dataType: this.dataType,
    setId: this.json_['id'],
    setFullId: this.dataType + this.json_['id']
  });
};


/**
 * @param {Object} json
 * @param {string} setId
 * @param {string=} opt_name
 */
anychart.chartEditor2Module.PredefinedDataSet.prototype.dispatchLoadData = function(json, setId, opt_name) {
  if (json['data']) {
    this.dispatchEvent({
      type: anychart.chartEditor2Module.events.EventType.DATA_ADD,
      data: json['data'],
      dataType: this.dataType,
      setId: setId,
      setFullId: this.dataType + setId,
      title: opt_name
    });
  }
};
