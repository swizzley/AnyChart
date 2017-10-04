goog.provide('anychart.chartEditor2Module.SeriesPanel');

goog.require('anychart.chartEditor2.controls.select.DataField');
goog.require('anychart.chartEditor2.controls.select.DataFieldSelectMenuItem');
goog.require('anychart.chartEditor2Module.ComponentWithKey');
goog.require('anychart.chartEditor2Module.input.Base');
goog.require('goog.ui.Component');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');


/**
 * Series panel on a Plot panel on Setup chart step.
 *
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {number} index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.ComponentWithKey}
 */
anychart.chartEditor2Module.SeriesPanel = function(model, index, opt_domHelper) {
  anychart.chartEditor2Module.SeriesPanel.base(this, 'constructor', model, opt_domHelper);

  /**
   * @type {number}
   * @private
   */
  this.index_ = index;

  /**
   * @type {Array.<anychart.chartEditor2.controls.select.DataField>}
   * @private
   */
  this.fields_ = [];

  this.addClassName('anychart-plot-panel-series');
};
goog.inherits(anychart.chartEditor2Module.SeriesPanel, anychart.chartEditor2Module.ComponentWithKey);


/** @inheritDoc */
anychart.chartEditor2Module.SeriesPanel.prototype.createDom = function() {
  anychart.chartEditor2Module.SeriesPanel.base(this, 'createDom');

  var dom = this.getDomHelper();

  this.removeBtn_ = dom.createDom(
      goog.dom.TagName.DIV,
      'anychart-plot-panel-series-remove-btn',
      goog.dom.createDom(goog.dom.TagName.IMG, {'src': 'https://cdn.anychart.com/images/chart_editor/remove-btn.png'})
  );
  goog.dom.appendChild(this.getElement(), this.removeBtn_);

  this.getKey();
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var chartType = model.getValue([['chart'], 'type']);
  var singleSeries = !!anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['singleSeries'];
  if (!singleSeries) {
    var mappings = model.getValue([['dataSettings'], ['mappings', this.plotIndex_]]);
    var keyStr = chartType === 'stock' ? 'plot(' + this.plotIndex_ + ').' : '';
    var id = goog.isDef(mappings[this.index_]['id']) ? mappings[this.index_]['id'] : this.index_;
    keyStr += 'getSeries(\'' + id + '\').name()';
    var key = [['chart'], ['settings'], keyStr];

    var input = new anychart.chartEditor2Module.input.Base();
    this.addChild(input, true);
    input.init(model, key, void 0, true, true);
    this.nameInput_ = input;

    //TODO: rework this hack
    goog.dom.classlist.add(input.getElement(), 'anychart-plot-panel-series-name');
  }

  this.typeSelect_ = new anychart.chartEditor2.controls.select.DataField({
    label: 'Series Type',
    caption: 'Select Series Type',
    value: 'ctor'
  });

  this.typeSelect_.getSelect().init(model, this.getKey('ctor'), 'setSeriesType');

  this.addChild(this.typeSelect_, true);
};


/** @inheritDoc */
anychart.chartEditor2Module.SeriesPanel.prototype.update = function() {
  anychart.chartEditor2Module.SeriesPanel.base(this, 'update');

  var chartType = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel()).getValue([['chart'], 'type']);
  var seriesTypes = anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['series'];
  for (var i = 0; i < seriesTypes.length; i++) {
    var type = seriesTypes[i];
    var caption = anychart.chartEditor2Module.EditorModel.Series[type]['name'] ?
        anychart.chartEditor2Module.EditorModel.Series[type]['name'] :
        goog.string.capitalize(type);

    var item = new anychart.chartEditor2.controls.select.DataFieldSelectMenuItem({
      caption: caption,
      value: type
    });
    this.typeSelect_.getSelect().addItem(item);
  }

  //this.typeSelect_.getSelect().updateOptions();
  this.typeSelect_.getSelect().setValueByModel();

  this.createFields();
  this.createFieldsOptions();
};


/** @inheritDoc */
anychart.chartEditor2Module.SeriesPanel.prototype.onChartDraw = function(evt) {
  anychart.chartEditor2Module.SeriesPanel.base(this, 'onChartDraw', evt);
  if (this.nameInput_) this.nameInput_.setValueByTarget(evt.chart);
};


/** @inheritDoc */
anychart.chartEditor2Module.SeriesPanel.prototype.enterDocument = function() {
  if (this.removeBtn_)
    this.getHandler().listen(this.removeBtn_, goog.events.EventType.CLICK, function() {
      var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
      var plotIndex = this.getParent().index();
      model.dropSeries(plotIndex, this.index_);
    });

  anychart.chartEditor2Module.SeriesPanel.base(this, 'enterDocument');
};


/** @inheritDoc */
anychart.chartEditor2Module.SeriesPanel.prototype.exitDocument = function() {
  this.removeAllFields_();
  anychart.chartEditor2Module.SeriesPanel.base(this, 'exitDocument');
};


/**
 * Creates fields without options.
 */
anychart.chartEditor2Module.SeriesPanel.prototype.createFields = function() {
  this.removeAllFields_();

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var seriesType = model.getValue(this.getKey('ctor'));

  var fieldsMap = anychart.chartEditor2Module.EditorModel.Series[seriesType]['fields'];
  goog.object.forEach(fieldsMap, function(item) {
    var fieldLabel = item['name'] ? item['name'] : item['field'];
    var fieldSelect = new anychart.chartEditor2.controls.select.DataField({
      label: fieldLabel,
      caption: 'Select ' + fieldLabel,
      value: item['field']
    });

    fieldSelect.getSelect().init(model, this.getKey([['mapping'], item['field']]));

    this.fields_.push(fieldSelect);
    this.addChild(fieldSelect, true);
  }, this);
};


/**
 * Creates options for all fields.
 */
anychart.chartEditor2Module.SeriesPanel.prototype.createFieldsOptions = function() {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  var active = model.getActive();
  var preparedData = model.getPreparedData();

  var data;
  for (var a = preparedData.length; a--;) {
    if (preparedData[a].type + preparedData[a].setId === active) {
      data = preparedData[a];
      break;
    }
  }

  if (data) {
    for (var i = 0; i < this.fields_.length; i++) {
      var field = this.fields_[i];
      var fieldSelect = field.getSelect();

      for (var b = fieldSelect.getItemCount(); b--;) {
        fieldSelect.removeItemAt(b);
      }

      var dataFields = data.fields;
      for (var j = 0; j < dataFields.length; j++) {
        var caption = dataFields[j].name;
        var option = new anychart.chartEditor2.controls.select.DataFieldSelectMenuItem({
          caption: caption,
          value: dataFields[j].key
        });
        // var option = new goog.ui.MenuItem(caption, dataFields[j].key);
        fieldSelect.addItem(option);
      }

      // fieldSelect.updateOptions();
      fieldSelect.setValueByModel();
    }
  }
};


/**
 * Removes all fields from panel.
 * @private
 */
anychart.chartEditor2Module.SeriesPanel.prototype.removeAllFields_ = function() {
  for (var a = this.fields_.length; a--;) {
    var field = this.fields_[a];
    this.removeChild(field, true);
    field.dispose();
  }
  this.fields_.length = 0;
};


/**
 * Getter/setter for index.
 *
 * @param {number=} opt_value
 * @return {number|anychart.chartEditor2Module.SeriesPanel}
 */
anychart.chartEditor2Module.SeriesPanel.prototype.index = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isNumber(opt_value)) {
      this.index_ = opt_value;
    }
    return this;
  }
  return this.index_;
};


/** @inheritDoc */
anychart.chartEditor2Module.SeriesPanel.prototype.getKey = function(opt_completion) {
  if (!this.key || !this.key.length) {
    if (!this.plotIndex_ && this.getParent())
      this.plotIndex_ = this.getParent().index();

    this.key = [['dataSettings'], ['mappings', this.plotIndex_], [this.index_]];
  }

  return anychart.chartEditor2Module.SeriesPanel.base(this, 'getKey', opt_completion);
};


/** @inheritDoc */
anychart.chartEditor2Module.SeriesPanel.prototype.dispose = function() {
  this.removeAllFields_();
  anychart.chartEditor2Module.SeriesPanel.base(this, 'dispose');
};
