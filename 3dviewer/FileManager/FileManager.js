'use strict';
define(['brease',
    'widgets/3dviewer/common/MpLinkHandler/libs/MpLinkHandler'
], function ({
    callWidget,
    settings: breaseSettings,
    appElem,
    core: { BaseWidget },
    controller: { uiController, pageController, bindingController },
    events: { BreaseEvent }
}, MpLinkHandler) {

    /**
     * @class widgets.3dviewer.FileManager
     * @finalClass
     * FileManager class creates an interface for all widgets that need a communication with the backend. The widget creates one instance
     * and there after only returns this one instance to all other widget requesting it. I.e. a singelton class. The widget implicitly binds
     * to the backend with the mpLink binding to the FileManager component over a virtual content, as the widget itself doesn't belong to a
     * content but is rather global. The only libraries that are demanded to be on target are MpFile and MpServer. The widget will load a file
     * in chunks as some files are too big to be loaded all at once, for this the FileManager will keep track of which widget downloads which
     * file and where in the transfer it is. Once the file is fully downloaded it will return a resolved promise. All methods returns a promise
     * to the calling widget; which will either be resolved or rejected depending on the result from the back end. The FileManger cannot be
     * suspended, disabled or disposed of as any number of widgets could be using the FileManager in any type of content at any time.
     *    
     * Please read the ./docs/MpFile_WidgetConnection.docx for more information on how the communication with the backend works.
     *   
     * Example on how to use widget:
     * Instantiate the FileManager:
     * 
     *      this.filemanager = FileManager.createWidget(this.elem.id);
     *   
     * In wake method to handle pre-caching: 
     *      p.wake = function () {
     *          if (this.internalData.preLoaded) {
     *              this.internalData.preLoaded = false;
     *              //Init comm to FileHandlerComm
     *              this.filemanager = FileManager.createWidget(this.elem.id);
     *          }
     *      }
     * 
     * Known list of widgets using the FileManager (please expand if your widget is going to use it):
     * -FileExplorer
     * -TextPad
     * -MotionPad
     *
     * @extends brease.core.BaseWidget
     * @singleton
     *
     * @iatMeta studio:visible
     * false
     */

    var settings = {
            mpLink: 'FileManagement',
            className: 'widgets/3dviewer/FileManager'
        },
        instance,

        ModuleClass = BaseWidget.extend(function FileManager(elemId) {
            if (instance === undefined) {
                instance = this;
                var elem = document.createElement('div');
                elem.id = 'FESVirt_FileManager_3dviewer';
                elem.classList.add('3dviewerFileManager');
                document.getElementsByTagName('body')[0].appendChild(elem);
                BaseWidget.apply(this, [elem]);
                this.addPromises(elemId);
            }
        }, settings),

        p = ModuleClass.prototype;

    /**
     * @method createWidget
     * @static
     * creates a new instance of the FileManager if it doesn't exist and returns this, else it just adds the necessary Promises on widgetId
     * passed and returns an instance of it.
     * @param {String} elemId widget element id
     * @return {Object} reference to an instance of the FileManager
     */
    ModuleClass.createWidget = function (elemId) {
        if (!instance) {
            instance = new ModuleClass(elemId);
            instance.settings.parentContentId = breaseSettings.globalContent;
            uiController.addWidget(instance);
            instance._dispatchReady();
        } else {
            instance.addPromises(elemId);
        }
        return instance;
    };

    /**
     * @method init
     * instantiates the widget, adds it to the body (OBS not to a content). Set's the chunkSize (maximum number of bytes to be transferred at once) to 100Kb
     * creates the mpLinkHandler
     * @param {String} elemId widget element id
     */
    p.init = function () {

        this.elem.addEventListener(BreaseEvent.WIDGET_READY, this._bind('_widgetReadyHandler'));

        BaseWidget.prototype.init.apply(this, arguments);

        this.linkHandler = new MpLinkHandler(this);

        this.isError = false;
        this.isConnected = false;
        this.errorMessage = '';
        this.promises = {};
        this.data = {};
        this.chunkSize = 100 * 1024; //In kB
    };

    /**
     * @method addPromises
     * adds all promises for one widget, should be called when a widget gets created or woken.
     * @param {String} elemId widget element id
     */
    p.addPromises = function (elemId) {
        this.promises[elemId] = {
            Browse: {},
            Load: {},
            Restriction: {},
            ErrorDetails: {},
            Save: {},
            Delete: {},
            Rename: {},
            Lock: {},
            ClearFlags: {},
            CreateFolder: {},
            Copy: {},
            Subcriptions: {}
        };
    };

    /**
     * @method removePromises
     * removes all promises for one widget, should be called when a widget gets disposed or suspended.
     * @param {String} elemId widget element id
     */
    p.removePromises = function (elemId) {
        this.promises[elemId] = {};
    };

    /**
     * @method dispose
     * overrides superclass dispose method without calling it. Makes sure the FileManager cannot be disposed off
     */
    p.dispose = function () {
        //We do not want to dispose this class - ever
    };

    /**
     * @method setUpMpLinkConnection
     * @private
     * method for setting up the mplink connection. Sets up the virtual content and creates the a binding on this content.
     */
    p.setUpMpLinkConnection = function () {
        var visuId = pageController.getVisu4Page(pageController.getCurrentPage(appElem.id));

        var self = this;
        return bindingController.activateVirtualContent('FESVirt', visuId).then(function () {
            bindingController.createBindings('FESVirt', visuId, [{
                'mode': 'twoWay',
                'source': {
                    'type': 'mapp',
                    'refId': 'FileManagement',
                    'attribute': 'link'
                },
                'target': {
                    'type': 'brease',
                    'refId': self.elem.id,
                    'attribute': 'mpLink'
                }
            }]).then(function () {
                self.isConnected = true;
                self.isError = false;
            }, function (responseStatus) {
                console.log('MpLink for FileHandler is not connecting: ' + responseStatus.message);
                self.isConnected = false;
                self.isError = true;
                self.errorMessage = responseStatus;
            });
        }, function (responseStatus) {
            console.log('FileExplorer cannot create virtual binding: ' + responseStatus.message);
            self.isError = true;
            self.isConnected = false;
            self.errorMessage = responseStatus;
        });
    };

    /* Handler */
    /**
     * @method _widgetReadyHandler
     * @private
     * event handler method for setting up the mplink connection. Can only be called after the widget is ready event is thrown by the widget
     * @param {Object} e
     */
    p._widgetReadyHandler = function (e) {
        if (e.target.id === this.elem.id) {
            this.setUpMpLinkConnection();
            this.elem.removeEventListener(BreaseEvent.WIDGET_READY, this._bind('_widgetReadyHandler'));
        }
    };

    /**
     * @method setMpLink
     * Data is received from
     * @param {MpComIdentType} telegram
     */
    p.setMpLink = function (telegram) {
        this.linkHandler.incomingMessage(telegram);
    };

    /**
     * @method getMpLink
     * At initialization it is called, it may not be called later
     * @return {Object}
     */
    p.getMpLink = function () {
        return this.settings.mpLink;
    };

    //GETTERS
    /**
     * @method browse
     * Browse a path from backend, returns a promise that will resolve the data the backend sends.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} path default = ''
     * @param {String} flags
     * @return {core.javascript.Promise}
     */
    p.browse = function (elemId, path, flags) {
        if (path === null || path === undefined) {
            path = '';
        }
        return this._handleGetter(elemId, 'Browse', { Path: path, Flags: flags });
    };

    /**
     * @method load
     * Loads data from backend, returns a promise that will resolve the data the backend sends.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} path
     * @param {String} flags
     * @param {String} encoding will be overwritten to BINARY so we can read everything from the backend regardless of encoding
     * @param {String} maxSize
     * @param {String} offset
     * @return {core.javascript.Promise}
     */
    p.load = function (elemId, path, flags, enc, ms, offset) {
        if (this.data[elemId]) delete this.data[elemId];
        this.data[elemId] = {
            path: path,
            data: ''
        };
        return this._handleGetter(elemId, 'Load', { Path: path, Flags: flags, Encoding: enc, MaxSize: (ms > this.chunkSize) ? this.chunkSize : ms, Offset: offset });
    };

    /**
     * @method _load
     * @private
     * DO NOT USE!
     * Used for recursively load data from the backend, may only be called from the _loadingChunks method.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} path
     * @param {String} flags
     * @param {String} encoding
     * @param {String} maxSize
     * @param {String} offset
     */
    p._load = function (elemId, path, flags, enc, ms, offset) {
        this._handleGetterNoPromise(elemId, 'Load', { Path: path, Flags: flags, Encoding: enc, MaxSize: ms, Offset: offset });
    };

    /**
     * @method notification
     * Loads data from backend, returns a promise that will resolve the data the backend sends.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} path
     * @param {String} flags
     */
    p.notification = function (elemId, callbackReference) {
        this.promises[elemId].Subcriptions = callbackReference;
        this.linkHandler.subscribeWithCallback('Notification', this._subscribeUpdate, {}, { Path: 'Files/', Flags: '', elemId: elemId });
    };

    // Unclear so far
    /**
     * @method denotification
     * @private
     * DO NOT USE - under construction
     */
    p.denotification = function () {
        //We need our own subscription handling here
        this.linkHandler.unSubscribe('Notification');
    };

    /**
     * @method restriction
     * Reteives the restrictions for a component, returns a promise that resolves once the data is retrieved.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} Component
     * @return {core.javascript.Promise}
     */
    p.restriction = function (elemId, comp) {
        return this._handleGetter(elemId, 'Restriction', { Component: comp });
    };

    /**
     * @method error
     * Reteives all the errors currently active in the backend. Returns promise that will be resolved once data is retrieved from the backend
     * @param {String} elemId id of the widget using the FileManager
     * @return {core.javascript.Promise}
     */
    p.error = function (elemId) {
        return this._handleGetter(elemId, 'ErrorDetails', {});
    };

    //SETTERS
    /**
     * @method save
     * Saves data to the backend, returns a promise that will resolve once the data is stored.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} path
     * @param {String} flags
     * @param {String} encoding
     * @param {String} data
     * @return {core.javascript.Promise}
     */
    p.save = function (elemId, path, flags, enc, data) {
        return this._handleSetter(elemId, 'Save', { Path: path, Flags: flags, Encoding: enc }, data);
    };

    /**
     * @method delete
     * Deletes a file or a folder in the backend, if folder the deletion is recursive (linux: rm -r), returns a promise that will resolve once the data is removed.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} path
     * @return {core.javascript.Promise}
     */
    p.delete = function (elemId, path) {
        return this._handleSetter(elemId, 'Delete', { Path: path });
    };

    /**
     * @method rename
     * Renames a file or a folder in the backend, returns a promise that will resolve once the data is renamed.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} path
     * @param {String} name
     * @param {String} flags
     * @return {core.javascript.Promise}
     */
    p.rename = function (elemId, path, name, flags) {
        return this._handleSetter(elemId, 'Rename', { Path: path, Flags: flags, Name: name });
    };

    /**
     * @method copy
     * Copies data from the source path to the destination path in the backend, returns a promise that will resolve once the data is copy/pasted or cut/pasted depending on the flags set.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} source
     * @param {String} destination
     * @param {String} flags
     * @return {core.javascript.Promise}
     */
    p.copy = function (elemId, src, dest, flags) {
        return this._handleSetter(elemId, 'Copy', { Source: src, Dest: dest, Flags: flags });
    };

    /**
     * @method lock
     * Locks a file or folder so other users cannot interact with it. Returns a promise that resolves once the lock is set in the backend.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} Path
     * @return {core.javascript.Promise}
     */
    p.lock = function (elemId, path) {
        return this._handleSetter(elemId, 'Lock', { Path: path });
    };

    /**
     * @method clearFlags
     * Clear locks on file or folder so other users can interact with it again. Returns a promise that resolves once the lock is reset in the backend.
     * @param {String} elemId id of the widget using the FileManager
     * @param {String} Path
     * @return {core.javascript.Promise}
     */
    p.clearFlags = function (elemId, path) {
        return this._handleSetter(elemId, 'ClearFlags', { Path: path });

    };

    /**
     * @method createFolder
     * Creates a folder on the backend at given path. Returns a promise that resolves once the folder is created in the backend.
     * @param {String} Path
     * @return {core.javascript.Promise}
     */
    p.createFolder = function (elemId, path) {
        return this._handleSetter(elemId, 'CreateFolder', { Path: path });
    };

    //Handle the actual request and build the promise
    /**
     * @method _handleSetter
     * @private
     * Collects all communication in one place and calls the sendDataAndProvideCallback from the linkhandler, appends the elemId to the parameters, returns a Promise
     * @param {String} elemId
     * @param {String} methodId
     * @param {Object} params params depend on which method is calling the _handleSetter, see documentation for further information
     * @param {Object} data the data that is to be passed to the backend, optional: see documentation for further information
     * @return {core.javascript.Promise}
     */
    p._handleSetter = function (elemId, methodId, params, data) {
        params.elemId = elemId;
        this.linkHandler.sendDataAndProvideCallback(methodId, this._return, data, params);
        return this._getPromise(elemId, methodId);
    };

    /**
     * @method _handleGetter
     * @private
     * Collects all communication in one place and calls the sendRequestAndProvideCallback from the linkhandler, appends the elemId to the parameters, returns a Promise
     * @param {String} elemId
     * @param {String} methodId
     * @param {Object} params params depend on which method is calling the _handleSetter, see documentation for further information
     * @return {core.javascript.Promise}
     */
    p._handleGetter = function (elemId, methodId, params) {
        params.elemId = elemId;
        if (this.promises[elemId][methodId] && this.promises[elemId][methodId].reject) {
            this._handlePromise({ error: { code: -120202020, text: 'Loading of data from ' + params.Path + ' abruptly halted' } }, elemId, methodId, 'reject');
        }
        this.linkHandler.sendRequestAndProvideCallback(methodId, this._return, undefined, params);
        return this._getPromise(elemId, methodId);
    };

    /**
     * @method _handleGetterNoPromise
     * @private
     * Collects all communication in one place and calls the sendRequestAndProvideCallback from the linkhandler, appends the elemId to the parameters, wihtout returning a Promse,
     * only to be used by internal helper functions and not any functions providing an external interface
     * @param {String} elemId
     * @param {String} methodId
     * @param {Object} params params depend on which method is calling the _handleSetter, see documentation for further information
     * @return {core.javascript.Promise}
     */
    p._handleGetterNoPromise = function (elemId, methodId, params) {
        params.elemId = elemId;
        this.linkHandler.sendRequestAndProvideCallback(methodId, this._return, undefined, params);
    };

    /**
     * @method _getPromise
     * @private
     * creates a promise, stores this in the internal structure on the calling widget's place and returns this Promise
     * @param {String} elemId
     * @param {String} methodId
     * @return {core.javascript.Promise}
     */
    p._getPromise = function (elemId, methodId) {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.promises[elemId][methodId].reject = reject;
            self.promises[elemId][methodId].resolve = resolve;

            if (self.isError) {
                reject(self.errorMessage);
            }
        });
    };

    //Return statement
    /**
     * @method _return
     * @private
     * DO NOT EXPLICITLY CALL. Only to be used as callback for mpLinkHandler
     * the callback method that is passed to the mpLinkHandler. When method is returned from the server, the return value will end up in this method.
     * If a file needs to be loaded in chunks then this method takes car of this by calling the loadingChunks. When the loading is finished the
     * _handlePromise is called to resolve the loading (or any other function call), if a message fails the Promise will be rejected
     * @param {String} message
     * @param {Object} telegram
     * @return {core.javascript.Promise}
     */
    p._return = function (message, telegram) {
        if (message === 'GetError' || message === 'SetError') {
            this._handlePromise(telegram, telegram.parameter.elemId, telegram.methodID, 'reject');
        } else if (telegram.methodID === 'Load') {
            this._loadingChunks(telegram);
        } else {
            this._handlePromise(telegram.data, telegram.parameter.elemId, telegram.methodID, 'resolve');
        }
    };

    /**
     * @method _handlePromise
     * @private
     * handles the promises. Will resolve or reject a promise for a widget's specific method and reset the Promise so it can be used again
     * @param {Object|Array|String|Integer} data data could be anything the backend passes
     * @param {String} elemId elementId, the widget's id
     * @param {String} methodId the method id (one of the public methods in the FileManager) that has been used to call the server
     * @param {String} resolveType the action of the Promise, resolve or reject
     * @return {core.javascript.Promise}
     */
    p._handlePromise = function (data, elemId, methodId, resolveType) {
        try {
            this.promises[elemId][methodId][resolveType](data);
            this.promises[elemId][methodId].resolve = null;
            this.promises[elemId][methodId].reject = null;
            this.promises[elemId][methodId] = {};
        } catch (error) {
            console.log('DozerPad failed at', data, elemId, methodId, resolveType);
            // throw error;
        }
    };

    /**
     * @method _loadingChunks
     * @private
     * Checks if the telegram has reached the end of file, and if it has calls the _handlePromise to resolve the promise and send the file back to the widget asking for it,
     * if it hasn't it keeps on loading the file by calling the internal _load method with an increased value of the offset.
     * @param {Object} telegram
     * @return {core.javascript.Promise}
     */
    p._loadingChunks = function (telegram) {
        if (this.data[telegram.parameter.elemId].path !== telegram.parameter.Path) return;
        if (!telegram.data.Eof) {
            //(elemId, path, flags, enc, ms, offset)
            this.data[telegram.parameter.elemId].data += telegram.data.Content;
            this._load(telegram.parameter.elemId,
                telegram.parameter.Path,
                telegram.parameter.Flags,
                telegram.parameter.Encoding,
                this.chunkSize,
                telegram.parameter.Offset + telegram.data.BytesRead);
        } else {
            this.data[telegram.parameter.elemId].data += telegram.data.Content;
            if (telegram.parameter.Encoding === 'BINARY') {
                this.data[telegram.parameter.elemId].data = this._decodeHEX(this.data[telegram.parameter.elemId].data);
            }
            this._handlePromise(this.data[telegram.parameter.elemId].data, telegram.parameter.elemId, telegram.methodID, 'resolve');
            delete this.data[telegram.parameter.elemId];
        }
    };

    /**
     * @method _subscribeUpdate
     * @private
     * DO NOT USE - under construction
     */
    // eslint-disable-next-line no-unused-vars
    p._subscribeUpdate = function (message, telegram) {
        callWidget(telegram.parameter.elemId, this.promises[telegram.parameter.elemId].Subcriptions, telegram);
    };

    /**
     * @method _onErrorHandler
     * @private
     * DO NOT USE - under construction
     */
    p._onErrorHandler = function (code) {
        console.iatWarn(code);
    };

    p._decodeHEX = function (encoded) {
        return btoa(encoded);
    };

    return ModuleClass;
});
