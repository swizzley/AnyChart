goog.provide('anychart.chartEditor2Module.DataLabelsPanel');

goog.require('anychart.chartEditor2Module.SettingsPanel');
goog.require('anychart.chartEditor2Module.settings.Title');



/**
 * @param {anychart.chartEditor2Module.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditor2Module.SettingsPanel}
 */
anychart.chartEditor2Module.DataLabelsPanel = function(model, opt_domHelper) {
  anychart.chartEditor2Module.DataLabelsPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Data Labels';

  this.stringId = 'data-labels';

  this.key = [['chart'], ['settings'], 'labels()'];
};
goog.inherits(anychart.chartEditor2Module.DataLabelsPanel, anychart.chartEditor2Module.SettingsPanel);


/** @inheritDoc */
anychart.chartEditor2Module.DataLabelsPanel.prototype.createDom = function() {
  anychart.chartEditor2Module.DataLabelsPanel.base(this, 'createDom');
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());

  this.enableContentCheckbox.init(model, this.genKey('enabled()'), 'setSettingForSeries');

  var title = new anychart.chartEditor2Module.settings.Title(model);
  title.allowEnabled(false);
  title.allowEditPosition(false);
  title.allowEditAlign(false);
  title.setTitleKey('format()');
  title.setKey([['chart'], ['settings'], 'labels()']);
  this.addChild(title, true);

  this.title_ = title;
};


/** @inheritDoc */
anychart.chartEditor2Module.DataLabelsPanel.prototype.update = function(opt_evt) {
  anychart.chartEditor2Module.DataLabelsPanel.base(this, 'update');

  // Set values for all series.
  var lastKey = opt_evt && opt_evt.lastKey;
  if (lastKey) {
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
    model.suspendDispatch();
    for (var c = 0, count = this.title_.getChildCount(); c < count; c++) {
      var child = this.title_.getChildAt(c);
      if (goog.isFunction(child.getKey)) {
        var key = child.getKey();
        var stringKey = key[key.length - 1];
        if (lastKey == stringKey) {

          var chartType = model.getValue([['chart'], 'type']);
          var singleSeries = !!anychart.chartEditor2Module.EditorModel.ChartTypes[chartType]['singleSeries'];
          if (!singleSeries) {
            var mappings = model.getValue([['dataSettings'], 'mappings']);
            for (var i = 0; i < mappings.length; i++) {
              for (var j = 0; j < mappings[i].length; j++) {
                var seriesId = mappings[i][j]['id'];
                var stringKey2 = (chartType == 'stock' ? 'plot(' + i + ').' : '') + 'getSeries(\'' + seriesId + '\').' + stringKey;
                var key2 = [['chart'], ['settings'], stringKey2];
                var value = model.getValue(key);
                model.setValue(key2, value);
              }
            }
          }
        }
      }
    }
    model.resumeDispatch();
  }
};


/** @override */
anychart.chartEditor2Module.DataLabelsPanel.prototype.disposeInternal = function() {
  this.title_ = null;
  anychart.chartEditor2Module.DataLabelsPanel.base(this, 'disposeInternal');
};
