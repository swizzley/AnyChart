goog.provide('anychart.chartEditor2Module.Editor');
goog.provide('anychart.chartEditor2Module.Editor.Dialog');

goog.require('anychart.chartEditor2Module.Breadcrumbs');
goog.require('anychart.chartEditor2Module.Component');
goog.require('anychart.chartEditor2Module.EditorModel');
goog.require('anychart.chartEditor2Module.Steps');
goog.require('anychart.chartEditor2Module.events');
goog.require('anychart.ui.Preloader');
goog.require('goog.net.ImageLoader');
goog.require('goog.ui.Dialog');



/**
 * Chart Editor application Component Class.
 * @constructor
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 * @extends {anychart.chartEditor2Module.Component}
 */
anychart.chartEditor2Module.Editor = function(opt_domHelper) {
  anychart.chartEditor2Module.Editor.base(this, 'constructor', opt_domHelper);

  /**
   * @type {?goog.ui.Dialog}
   * @private
   */
  this.dialog_ = null;

  this.setModel(new anychart.chartEditor2Module.EditorModel());

  this.imagesLoaded_ = true;
  this.preloader_ = new anychart.ui.Preloader();

  /**
   * @type {anychart.chartEditor2Module.Steps}
   * @private
   */
  this.steps_ = new anychart.chartEditor2Module.Steps();

  /**
   * @type {anychart.chartEditor2Module.Breadcrumbs}
   * @private
   */
  this.breadcrumbs_ = null;

  // var imageLoader = new goog.net.ImageLoader();
  // this.registerDisposable(imageLoader);
  // goog.events.listen(imageLoader, goog.net.EventType.COMPLETE, function() {
  //   this.imagesLoaded_ = true;
  //   this.preloader_.visible(false);
  // }, false, this);
  // goog.array.forEach(this.sharedModel_.presetsList, function(category) {
  //   goog.array.forEach(category.list, function(chart) {
  //     imageLoader.addImage(chart.type, 'https://cdn.anychart.com/images/chartopedia/' + chart.image);
  //   });
  // });
  //imageLoader.start();

  goog.events.listen(this, anychart.chartEditor2Module.Breadcrumbs.EventType.COMPLETE, this.onComplete_, false, this);

  this.listen(anychart.chartEditor2Module.events.EventType.DATA_ADD, this.onDataAdd_);
  this.listen(anychart.chartEditor2Module.events.EventType.DATA_REMOVE, this.onDataRemove_);
  this.listen(anychart.chartEditor2Module.events.EventType.WAIT, this.onWait_);

  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  this.getHandler().listen(model, anychart.chartEditor2Module.events.EventType.WAIT, this.onWait_);
};
goog.inherits(anychart.chartEditor2Module.Editor, anychart.chartEditor2Module.Component);


/**
 * CSS class name.
 * @type {string}
 */
anychart.chartEditor2Module.Editor.CSS_CLASS = goog.getCssName('anychart-chart-editor');


/** @inheritDoc */
anychart.chartEditor2Module.Editor.prototype.render = function(opt_parentElement) {
  anychart.chartEditor2Module.Editor.base(this, 'render', opt_parentElement);
  this.waitForImages_();
};


/** @inheritDoc */
anychart.chartEditor2Module.Editor.prototype.decorate = function(element) {
  anychart.chartEditor2Module.Editor.base(this, 'decorate', element);
  this.waitForImages_();
};


/**
 * Renders the Chart Editor as modal dialog.
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *     as a class name prefix for related elements; defaults to modal-dialog.
 *     This should be a single, valid CSS class name.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link goog.ui.Component} for semantics.
 */
anychart.chartEditor2Module.Editor.prototype.renderAsDialog = function(opt_class, opt_useIframeMask, opt_domHelper) {
  this.dialog_ = new anychart.chartEditor2Module.Editor.Dialog(opt_class, opt_useIframeMask, opt_domHelper);
  this.dialog_.addChild(this, true);

  this.getHandler().listen(this.dialog_, goog.ui.PopupBase.EventType.HIDE, this.onCloseDialog_);
};


/**
 * Sets the visibility of the dialog box and moves focus to the
 * default button. Lazily renders the component if needed.
 * @param {boolean=} opt_value Whether the dialog should be visible.
 * @return {boolean|!anychart.chartEditor2Module.Editor}
 */
anychart.chartEditor2Module.Editor.prototype.visible = function(opt_value) {
  if (!this.dialog_) return true;

  if (goog.isDef(opt_value)) {
    var prevVisible = this.dialog_.isVisible();
    this.dialog_.setVisible(opt_value);
    this.waitForImages_();

    if (!prevVisible && opt_value) {
      this.setFirstStep_();
      this.breadcrumbs_.setStep(this.steps_.getCurrentStepIndex(), this.steps_.getDescriptors());
    }

    return this;
  }

  return this.dialog_.isVisible();
};


// region ---- chart export
/**
 * Returns JS code string that creates a configured chart.
 * @param {anychart.chartEditor2Module.EditorModel.OutputOptions=} opt_options Output options object.
 * @return {string}
 */
anychart.chartEditor2Module.Editor.prototype.getChartAsJsCode = function(opt_options) {
  return (/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel())).getChartAsJsCode(opt_options);
};


/**
 * Returns configured chart in JSON representation.
 * @return {string}
 */
anychart.chartEditor2Module.Editor.prototype.getChartAsJson = function() {
  return (/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel())).getChartAsJson();
};


/**
 * Returns configured chart in XML representation.
 * @return {string}
 */
anychart.chartEditor2Module.Editor.prototype.getChartAsXml = function() {
  return (/** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel())).getChartAsXml();
};
// endregion

/**
 * @param {boolean} show
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.showWaitAnimation_ = function(show) {
  if (show && !this.preloader_.isInDocument()) {
    var element = this.getContentElement();
    this.preloader_.render(element);
  }

  this.preloader_.visible(show);
};


/**
 * Check if images are not fully loaded and shows preloader if need.
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.waitForImages_ = function() {
  if (!this.imagesLoaded_)
    this.showWaitAnimation_(true);
};


/**
 * Close dialog (if exists) on complete button press.
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.onComplete_ = function(evt) {
  this.dispatchEvent(anychart.enums.EventType.COMPLETE);
  if (this.dialog_)
    this.dialog_.setVisible(false);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.onCloseDialog_ = function(evt) {
  if (evt.target == this.dialog_) {
    this.dispatchEvent(anychart.enums.EventType.CLOSE);
  }
};


/** @override */
anychart.chartEditor2Module.Editor.prototype.createDom = function() {
  anychart.chartEditor2Module.Editor.base(this, 'createDom');

  goog.dom.classlist.add(this.getElement(), anychart.chartEditor2Module.Editor.CSS_CLASS);

  // Add breadcrumbs
  var BreadcrumbsEventType = anychart.chartEditor2Module.Breadcrumbs.EventType;
  this.breadcrumbs_ = new anychart.chartEditor2Module.Breadcrumbs();
  this.addChild(this.breadcrumbs_, true);

  this.getHandler().listen(this.breadcrumbs_, BreadcrumbsEventType.NEXT, function() {
    var nextIndex = this.steps_.getCurrentStepIndex() + 1;
    this.setCurrentStep(nextIndex, true);
  });
  this.getHandler().listen(this.breadcrumbs_, BreadcrumbsEventType.PREV, function() {
    var nextIndex = this.steps_.getCurrentStepIndex() - 1;
    this.setCurrentStep(nextIndex, true);
  });

  this.getHandler().listen(this.breadcrumbs_, BreadcrumbsEventType.COMPLETE, function() {

  });
  this.getHandler().listen(this.breadcrumbs_, BreadcrumbsEventType.CHANGE_STEP, function(e) {
    this.setCurrentStep(e.step, true);
  });

  // Add steps
  var stepNames = ['PrepareData', 'SetupChart', 'VisualAppearance'];
  for (var i = 0; i < stepNames.length; i++) {
    var step = this.steps_.createStep(stepNames[i]);
    this.addChildAt(step, i); // don't render until this.setCurrentStep() call
  }

  this.getHandler().listen(this.steps_, anychart.chartEditor2Module.Steps.EventType.BEFORE_CHANGE_STEP, this.onBeforeChangeStep_);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.onBeforeChangeStep_ = function(evt) {
  this.breadcrumbs_.setStep(evt.index, this.steps_.getDescriptors());
  if (evt.index !== 0) this.getModel().onChangeView();
};


/** @override */
anychart.chartEditor2Module.Editor.prototype.enterDocument = function() {
  anychart.chartEditor2Module.Editor.base(this, 'enterDocument');
  this.setFirstStep_();
};


/** @private */
anychart.chartEditor2Module.Editor.prototype.setFirstStep_ = function() {
  var index = this.steps_.getFirstStepIndex();
  this.setCurrentStep(index, false);
};


/**
 * Render the step at the given index.
 * @param {number} index Index of the step to render (-1 to render none).
 * @param {boolean} doAnimation
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.setCurrentStep = function(index, doAnimation) {
  if (index > 0 && this.getModel().getDataSetsCount() <= 0) {
    alert('You need at least one data set for the next step!');

  } else {
    this.steps_.setStep(index, doAnimation);
  }
};


/**
 * @return {anychart.chartEditor2Module.Steps}
 */
anychart.chartEditor2Module.Editor.prototype.steps = function() {
  return this.steps_;
};


/**
 * Add data to editor while initialization.
 * @param {Object} data
 */
anychart.chartEditor2Module.Editor.prototype.data = function(data) {
  if (goog.isObject(data)) {
    var preparedData;
    if (goog.isObject(data['data']))
      preparedData = data;
    else
      preparedData = {data: data};

    this.getModel().addData(preparedData);
  }
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.onDataAdd_ = function(evt) {
  this.getModel().addData(evt);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.onDataRemove_ = function(evt) {
  this.getModel().removeData(evt.setFullId);
};


/**
 * @param {Object} evt
 * @private
 */
anychart.chartEditor2Module.Editor.prototype.onWait_ = function(evt) {
  this.showWaitAnimation_(evt.wait);
};


/**
 *  @return {string}
 */
anychart.chartEditor2Module.Editor.prototype.serializeModel = function() {
  var model = this.getModel().getModel();
  return goog.json.hybrid.stringify(model);
};


/**
 * @param {?string} serializedModel
 */
anychart.chartEditor2Module.Editor.prototype.deserializeModel = function(serializedModel) {
  if (serializedModel) {
    var deserialized = /** @type {anychart.chartEditor2Module.EditorModel.Model} */(goog.json.hybrid.parse(serializedModel));
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
    model.setModel(deserialized);
  }
};


/**
 * @param {Array.<{key: anychart.chartEditor2Module.EditorModel.Key, value: (string|boolean|Object) }>} values
 */
anychart.chartEditor2Module.Editor.prototype.setDefaults = function(values) {
  var model = /** @type {anychart.chartEditor2Module.EditorModel} */(this.getModel());
  model.setDefaults(values);
};

// region Editor.Dialog
/**
 * @constructor
 * @param {string=} opt_class CSS class name for the dialog element, also used
 *     as a class name prefix for related elements; defaults to modal-dialog.
 *     This should be a single, valid CSS class name.
 * @param {boolean=} opt_useIframeMask Work around windowed controls z-index
 *     issue by using an iframe instead of a div for bg element.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper; see {@link
    *     goog.ui.Component} for semantics.
 * @extends {goog.ui.Dialog}
 */
anychart.chartEditor2Module.Editor.Dialog = function(opt_class, opt_useIframeMask, opt_domHelper) {
  anychart.chartEditor2Module.Editor.Dialog.base(this, 'constructor', opt_class || goog.getCssName('anychart-chart-editor-dialog'), opt_useIframeMask, opt_domHelper);

  /**
   * Element for the logo of the title bar.
   * @type {Element}
   * @private
   */
  this.titleLogoEl_ = null;

  this.setTitle('Chart Editor');
  this.setButtonSet(null);
};
goog.inherits(anychart.chartEditor2Module.Editor.Dialog, goog.ui.Dialog);


/** @override */
anychart.chartEditor2Module.Editor.Dialog.prototype.createDom = function() {
  anychart.chartEditor2Module.Editor.Dialog.base(this, 'createDom');
  this.initTitleElements_();
};


/** @override */
anychart.chartEditor2Module.Editor.Dialog.prototype.decorateInternal = function(element) {
  anychart.chartEditor2Module.Editor.Dialog.base(this, 'decorateInternal', element);
  this.initTitleElements_();
};


/** @private */
anychart.chartEditor2Module.Editor.Dialog.prototype.initTitleElements_ = function() {
  var dom = this.getDomHelper();

  var titleElement = this.getTitleElement();
  this.titleLogoEl_ = dom.createDom(
      goog.dom.TagName.A,
      {
        'class': goog.getCssName(this.getCssClass(), 'title-logo'),
        'href': 'https://anychart.com',
        'target': '_blank'
      });
  goog.dom.insertSiblingBefore(this.titleLogoEl_, goog.dom.getFirstElementChild(titleElement));

  this.setTitle('Chart Editor');

  var close = this.getTitleCloseElement();
  goog.dom.appendChild(close, goog.dom.createDom(goog.dom.TagName.I, ['ac', 'ac-remove']));
};


/** @override */
anychart.chartEditor2Module.Editor.Dialog.prototype.enterDocument = function() {
  anychart.chartEditor2Module.Editor.Dialog.base(this, 'enterDocument');
  var bgEl = this.getBackgroundElement();
  if (bgEl)
    this.getHandler().listen(bgEl, goog.events.EventType.CLICK, this.onBackgroundClick_);
};


/** @override */
anychart.chartEditor2Module.Editor.Dialog.prototype.disposeInternal = function() {
  this.titleLogoEl_ = null;
  anychart.chartEditor2Module.Editor.Dialog.base(this, 'disposeInternal');
};


/** @private */
anychart.chartEditor2Module.Editor.Dialog.prototype.onBackgroundClick_ = function() {
  this.setVisible(false);
};
// endregion


/**
 * Constructor function for Chart Editor.
 * @return {anychart.chartEditor2Module.Editor}
 */
anychart.ui.editor = function() {
  return new anychart.chartEditor2Module.Editor();
};

//exports
(function() {
  goog.exportSymbol('anychart.ui.editor', anychart.ui.editor);
  var proto = anychart.chartEditor2Module.Editor.prototype;
  proto['render'] = proto.render;
  proto['decorate'] = proto.decorate;
  proto['renderAsDialog'] = proto.renderAsDialog;
  proto['visible'] = proto.visible;
  proto['getChartAsJsCode'] = proto.getChartAsJsCode;
  proto['getChartAsJson'] = proto.getChartAsJson;
  proto['getChartAsXml'] = proto.getChartAsXml;
  proto['steps'] = proto.steps;
  proto['data'] = proto.data;
  proto['setDefaults'] = proto.setDefaults;
  proto['listen'] = proto.listen;
  proto['listenOnce'] = proto.listenOnce;
  proto['unlisten'] = proto.unlisten;
  proto['unlistenByKey'] = proto.unlistenByKey;
  proto['removeAllListeners'] = proto.removeAllListeners;
  proto['serializeModel'] = proto.serializeModel;
  proto['deserializeModel'] = proto.deserializeModel;
  proto['dispose'] = proto.dispose;
})();
