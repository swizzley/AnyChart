goog.provide('anychart.chartEditorModule.DataLabelsPanel');

goog.require('anychart.chartEditorModule.SettingsPanel');
goog.require('anychart.chartEditorModule.settings.Title');



/**
 * @param {anychart.chartEditorModule.EditorModel} model
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @constructor
 * @extends {anychart.chartEditorModule.SettingsPanel}
 */
anychart.chartEditorModule.DataLabelsPanel = function(model, opt_domHelper) {
  anychart.chartEditorModule.DataLabelsPanel.base(this, 'constructor', model, opt_domHelper);

  this.name = 'Data Labels';

  this.stringId = 'data-labels';

  this.key = [['chart'], ['settings'], 'labels()'];
};
goog.inherits(anychart.chartEditorModule.DataLabelsPanel, anychart.chartEditorModule.SettingsPanel);


/** @inheritDoc */
anychart.chartEditorModule.DataLabelsPanel.prototype.createDom = function() {
  anychart.chartEditorModule.DataLabelsPanel.base(this, 'createDom');
  var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());

  this.enableContentCheckbox.init(model, this.genKey('enabled()'), 'setSettingForSeries');

  var title = new anychart.chartEditorModule.settings.Title(model);
  title.allowEnabled(false);
  title.allowEditPosition(false);
  title.allowEditAlign(false);
  title.setTitleKey('format()');
  title.setKey([['chart'], ['settings'], 'labels()']);
  this.addChild(title, true);

  this.title_ = title;
};


/** @inheritDoc */
anychart.chartEditorModule.DataLabelsPanel.prototype.update = function(opt_evt) {
  anychart.chartEditorModule.DataLabelsPanel.base(this, 'update');

  // Set values for all series.
  var lastKey = opt_evt && opt_evt.lastKey;
  if (lastKey) {
    var model = /** @type {anychart.chartEditorModule.EditorModel} */(this.getModel());
    model.suspendDispatch();
    for (var c = 0, count = this.title_.getChildCount(); c < count; c++) {
      var child = this.title_.getChildAt(c);
      if (goog.isFunction(child.getKey)) {
        var key = child.getKey();
        var stringKey = key[key.length - 1];

        if (lastKey == stringKey) {
          var value = model.getValue(key);
          var chartType = model.getValue([['chart'], 'type']);
          var singleSeries = !!anychart.chartEditorModule.EditorModel.ChartTypes[chartType]['singleSeries'];

          if (!singleSeries) {
            var mappings = model.getValue([['dataSettings'], 'mappings']);
            for (var i = 0; i < mappings.length; i++) {
              for (var j = 0; j < mappings[i].length; j++) {
                var seriesId = mappings[i][j]['id'];
                var stringKey2 = (chartType == 'stock' ? 'plot(' + i + ').' : '') + 'getSeries(\'' + seriesId + '\').' + stringKey;
                var key2 = [['chart'], ['settings'], stringKey2];
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
anychart.chartEditorModule.DataLabelsPanel.prototype.disposeInternal = function() {
  this.title_ = null;
  anychart.chartEditorModule.DataLabelsPanel.base(this, 'disposeInternal');
};
