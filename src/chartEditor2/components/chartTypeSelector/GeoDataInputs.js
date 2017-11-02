goog.provide('anychart.chartEditor2Module.GeoDataInputs');

goog.require('anychart.chartEditor2Module.EditorModel');
goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.controls.select.DataField');
goog.require('anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem');



/**
 * Inputs specific for map charts.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.GeoDataInputs = function(model, opt_domHelper) {
  anychart.chartEditor2Module.GeoDataInputs.base(this, 'constructor', model, opt_domHelper);
  this.name = null;
};
goog.inherits(anychart.chartEditor2Module.GeoDataInputs, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.GeoDataInputs.prototype.createDom = function() {
  anychart.chartEditor2Module.GeoDataInputs.base(this, 'createDom');
  goog.dom.classlist.add(this.getElement(), 'anychart-geo-data-inputs');

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  this.geoDataField_ = new anychart.chartEditor2Module.controls.select.DataField({caption: 'Choose geo data', label: 'Geo data'});
  this.geoDataField_.init(model, [['dataSettings'], 'activeGeo'], 'setActiveGeo');
  this.addChild(this.geoDataField_, true);

  this.geoIdField_ = new anychart.chartEditor2Module.controls.select.DataField({caption: 'Choose geo id', label: 'Geo ID field'});
  this.geoIdField_.init(model, [['dataSettings'], 'geoIdField']);
  this.addChild(this.geoIdField_, true);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.GeoDataInputs.prototype.onLoadGeoDataIndex_ = function(evt) {
  this.createGeoDataOptions_(evt.data);
};

/**
 * Creates options for geo data sets select.
 * @param {Object} geoDataIndex
 * @private
 */
anychart.chartEditor2Module.GeoDataInputs.prototype.createGeoDataOptions_ = function(geoDataIndex) {
  for (var key = 0; key < geoDataIndex.length; key++) {
    this.geoDataField_.getSelect().addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
      caption: geoDataIndex[key]['name'],
      value: anychart.chartEditor2Module.EditorModel.DataType.GEO + geoDataIndex[key]['id']
    }));
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.GeoDataInputs.prototype.exclude = function(value) {
  anychart.chartEditor2Module.GeoDataInputs.base(this, 'exclude', value);
  if (value)
    this.hide();
  else {
    if (this.geoDataField_ && !this.geoDataField_.getSelect().getItemCount()) {
      var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
      var geoDataIndex = model.getGeoDataIndex();
      if (geoDataIndex)
        this.createGeoDataOptions_(geoDataIndex);
      else
        this.getHandler().listenOnce(model, anychart.chartEditor2Module.events.EventType.GEO_DATA_INDEX_LOADED, this.onLoadGeoDataIndex_);
    }

    if (this.geoIdField_ && !this.geoIdField_.getSelect().getItemCount())
      this.createGeoIdFieldOptions_();

    this.show();
  }
};


/** @inheritDoc */
anychart.chartEditor2Module.GeoDataInputs.prototype.onChartDraw = function(evt) {
  if (this.isExcluded()) return;
  anychart.chartEditor2Module.GeoDataInputs.base(this, 'onChartDraw', evt);

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  if (model.getModel()['dataSettings']['activeGeo']) {
    if (this.geoDataField_) this.geoDataField_.getSelect().setValueByModel();
    if (this.geoIdField_) this.geoIdField_.getSelect().setValueByModel();
  }
};


/**
 * Creates options for geo id field select.
 * @private
 */
anychart.chartEditor2Module.GeoDataInputs.prototype.createGeoIdFieldOptions_ = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var activeGeo = model.getActiveGeo();
  if (!activeGeo) return;

  var preparedData = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).getPreparedData(activeGeo);
  if (!preparedData.length) return;

  for (var key in preparedData[0].fields) {
    this.geoIdField_.getSelect().addItem(new anychart.chartEditor2Module.controls.select.DataFieldSelectMenuItem({
      caption: preparedData[0].fields[key].name,
      value: preparedData[0].fields[key].name
    }));
  }
};
