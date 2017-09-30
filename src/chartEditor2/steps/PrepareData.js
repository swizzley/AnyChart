goog.provide('anychart.chartEditor2Module.steps.PrepareData');

goog.require('anychart.chartEditor2Module.DataDialog');
goog.require('anychart.chartEditor2Module.DataSetPanelList');
goog.require('anychart.chartEditor2Module.PredefinedDataSelector');
goog.require('anychart.chartEditor2Module.UserData');
goog.require('anychart.chartEditor2Module.events');
goog.require('anychart.chartEditor2Module.steps.Base');
goog.require('anychart.dataAdapterModule.entry');
goog.require('goog.ui.Button');

goog.forwardDeclare('anychart.data.Mapping');


/**
 * Chart Editor First Step Class.
 *
 * @constructor
 * @param {number} index Step index
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @extends {anychart.chartEditor2Module.steps.Base}
 */
anychart.chartEditor2Module.steps.PrepareData = function (index, opt_domHelper) {
    goog.base(this, index, opt_domHelper);

    this.name('Prepare Data');
    this.title('Prepare Data');

    /**
     * @type {?anychart.chartEditor2Module.DataDialog}
     * @private
     */
    this.dataDialog_ = null;
};
goog.inherits(anychart.chartEditor2Module.steps.PrepareData, anychart.chartEditor2Module.steps.Base);


/** @override */
anychart.chartEditor2Module.steps.PrepareData.prototype.createDom = function () {
    goog.base(this, 'createDom');

    var editor = /** @type {anychart.chartEditor2Module.Editor} */(this.getParent());
    var model = /** @type {anychart.chartEditor2Module.EditorModel} */(editor.getModel());

    // connected data sets section
    this.panelsList_ = new anychart.chartEditor2Module.DataSetPanelList(model);
    this.addChild(this.panelsList_, true);

    // user data and predefined data sets sections wrapper
    var wrapper = new anychart.ui.Component();
    wrapper.addClassName('anychart-prepare-data-step-wrapper');
    this.addChild(wrapper, true);

    // user data section
    var userData = new anychart.chartEditor2Module.UserData([
        {id: 'google-spreadsheets', type: 'connect', caption: 'Google Spreadsheet', icon: '../dist/img/google-spreadsheet.png'},
        {id: 'string-csv', type: 'upload', caption: 'CSV String', icon: '../dist/img/csv-string.png'},
        {id: 'file-csv', type: 'upload', caption: 'CSV File', icon: '../dist/img/csv-file.png'},
        {id: 'string-json', type: 'upload', caption: 'JSON String', icon: '../dist/img/json-string.png'},
        {id: 'file-json', type: 'upload', caption: 'JSON File', icon: '../dist/img/json-file.png'}
    ]);
    wrapper.addChild(userData, true);
    this.getHandler().listen(userData, anychart.chartEditor2Module.UserData.EventType.ACTION, function(e) {
        var tmp = e.value.split('-');
        this.openDataDialog(tmp[0], tmp[1]);
    });

    // predefined data set section
    var predefinedDataSelector = new anychart.chartEditor2Module.PredefinedDataSelector(model);
    wrapper.addChild(predefinedDataSelector, true);
};


/**
 * @param {Object} evt
 */
anychart.chartEditor2Module.steps.PrepareData.prototype.onUploadButtonClick = function (evt) {
    var type = (/** @type {goog.ui.Button} */ (evt.target)).getValue();
    var tmp = type.split('-');
    this.openDataDialog(tmp[0], tmp[1]);
};


/**
 * Opend data dialog.
 * @param {string} dialogType
 * @param {string=} opt_dataType
 */
anychart.chartEditor2Module.steps.PrepareData.prototype.openDataDialog = function (dialogType, opt_dataType) {
    this.dialogType_ = dialogType;
    this.dialogDataType_ = opt_dataType;

    if (!this.dataDialog_) {
        this.dataDialog_ = new anychart.chartEditor2Module.DataDialog('data-dialog');
        this.dataDialog_.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());
        goog.events.listen(this.dataDialog_, goog.ui.Dialog.EventType.SELECT, this.onCloseDataDialog, void 0, this);
    }

    this.dataDialog_.update(dialogType, opt_dataType);
    this.dataDialog_.setVisible(true);
};


/**
 * Starts processing inputs from data dialog if pressed 'ok'.
 * @param {Object} evt
 */
anychart.chartEditor2Module.steps.PrepareData.prototype.onCloseDataDialog = function (evt) {
    var dialog = /** @type {anychart.chartEditor2Module.DataDialog} */(evt.target);
    if (evt.key == 'ok') {
        var self = this;
        var dialogType = this.dialogType_;
        var dataType = this.dialogDataType_;

        var inputValue = dialog.getInputValue();
        if (inputValue) {
            var urlExpression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            var urlRegex = new RegExp(urlExpression);
            var errorCallback = goog.bind(this.onErrorDataLoad, this);

            if (dialogType == 'file') {
                if (inputValue.match(urlRegex)) {
                    this.dispatchEvent({
                        type: anychart.chartEditor2Module.events.EventType.WAIT,
                        wait: true
                    });

                    switch (dataType) {
                        case 'json':
                            anychart.dataAdapterModule.loadJsonFile(inputValue,
                                function (data) {
                                    self.onSuccessDataLoad(data, dataType);
                                }, errorCallback);

                            break;

                        case 'csv':
                            anychart.dataAdapterModule.loadCsvFile(inputValue,
                                function (data) {
                                    self.onSuccessDataLoad(data, dataType);
                                }, errorCallback);
                            break;

                        case 'xml':
                            anychart.dataAdapterModule.loadXmlFile(inputValue,
                                function (data) {
                                    self.onSuccessDataLoad(data, dataType);
                                }, errorCallback);
                            break;
                    }
                } else {
                    console.warn("Invalid url!");
                }

            } else if (dialogType == 'string') {
                this.addLoadedData(inputValue, dataType);

            } else if (dialogType == 'google') {
                var key = {'key': inputValue};
                var keyRegex = new RegExp(/spreadsheets\/d\/([\w|-]+)\//);
                var parseResult = inputValue.match(keyRegex);
                if (parseResult) {
                    key['key'] = parseResult[1];
                }
                var input2Value = dialog.getInput2Value();
                if (input2Value)
                    key['sheet'] = input2Value;

                this.dispatchEvent({
                    type: anychart.chartEditor2Module.events.EventType.WAIT,
                    wait: true
                });
                anychart.dataAdapterModule.loadGoogleSpreadsheet(key,
                    function (data) {
                        self.onSuccessDataLoad(data, dataType);
                    },
                    errorCallback);
            }
        }
    }
};


/**
 * Preprocesses loaded data and adds new data set to Editor Model.
 * @param {*} data
 * @param {string} dataType
 */
anychart.chartEditor2Module.steps.PrepareData.prototype.addLoadedData = function (data, dataType) {
    var result = null;
    var typeOf = goog.typeOf(data);
    if (dataType != 'spreadsheets' && (typeOf == 'object' || typeOf == 'array')) {
        result = data;

    } else {
        var error = false;
        switch (dataType) {
            case 'spreadsheets':
                result = data['rows'];
                break;
            case 'json':
                if (typeOf == 'string') {
                    try {
                        result = goog.json.hybrid.parse(/** @type {string} */(data));
                    } catch (err) {
                        // parsing error
                        error = true;
                    }
                }
                break;

            case 'csv':
                var csvSettings = this.dataDialog_.getCSVSettings();
                result = anychart.data.parseText(/** @type {string} */(data), csvSettings);
                break;

            case 'xml':
                try {
                    result = anychart.chartEditor2Module.steps.PrepareData.xmlStringToJson_(/** @type {string} */(data));
                } catch (err) {
                    // parsing error
                    error = true;
                }
                break;
        }

        if (!result || error)
            console.warn("Invalid data!");
    }

    if (result) {
        var type = anychart.chartEditor2Module.EditorModel.dataType.UPLOADED;
        this.uploadedSetId_ = this.uploadedSetId_ ? ++this.uploadedSetId_ : 1;
        var title = "Custom data " + this.uploadedSetId_ + " (" + dataType + ")";
        if (data.title) {
            title = data.title.substr(0, 30) + '..';
        }

        this.dispatchEvent({
            type: anychart.chartEditor2Module.events.EventType.DATA_ADD,
            data: result,
            dataType: type,
            setId: this.uploadedSetId_,
            setFullId: type + this.uploadedSetId_,
            title: title
        });
    }
};


/**
 * @param {string} data
 * @param {string} dataType
 * @return {*}
 */
anychart.chartEditor2Module.steps.PrepareData.prototype.onSuccessDataLoad = function (data, dataType) {
    this.dispatchEvent({
        type: anychart.chartEditor2Module.events.EventType.WAIT,
        wait: false
    });

    if (!data) return;
    this.addLoadedData(data, dataType);
};


/**
 * Callback in case of error while data load.
 * @param {string} errorCode
 */
anychart.chartEditor2Module.steps.PrepareData.prototype.onErrorDataLoad = function (errorCode) {
    this.dispatchEvent({
        type: anychart.chartEditor2Module.events.EventType.WAIT,
        wait: false
    });

    console.warn("Invalid data!", errorCode);
};


/**
 * Converts xml-string to xml document.
 * @param {string} xmlString
 * @return {?(Object|string)} XML document
 * @private
 */
anychart.chartEditor2Module.steps.PrepareData.xmlStringToJson_ = function (xmlString) {
    var wnd = goog.dom.getWindow();
    var parseXml;

    if (wnd.DOMParser) {
        var isParseError = function (parsedDocument) {
            // parser and parsererrorNS could be cached on startup for efficiency
            var parser = new DOMParser(),
                errorneousParse = parser.parseFromString('<', 'text/xml'),
                parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

            if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
                // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
                return parsedDocument.getElementsByTagName("parsererror").length > 0;
            }
            return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
        };

        parseXml = function (xmlStr) {
            var parser = new DOMParser();
            var dom = parser.parseFromString(xmlStr, 'text/xml');
            if (isParseError(dom)) {
                throw new Error('Error parsing XML');
            }
            return dom;
        };
    } else if (typeof wnd.ActiveXObject != "undefined" && new wnd.ActiveXObject("Microsoft.XMLDOM")) {
        parseXml = function (xmlStr) {
            var xmlDoc = new wnd.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    } else {
        parseXml = function () {
            return null;
        };
    }

    var xmlDoc = parseXml(xmlString);
    if (xmlDoc) {
        return anychart.utils.xml2json(xmlDoc);
    }

    return null;
};
