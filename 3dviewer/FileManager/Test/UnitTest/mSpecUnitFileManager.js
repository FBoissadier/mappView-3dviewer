'use strict';
define([
    'brTest',
    'brease',
    'widgets/brease/common/MpLinkHandler/libs/MpLinkHandler',
    'widgets/brease/FileManager/FileManager',
    'widgets/brease/common/libs/Test/Jasmine-moduleTest'], 
function ({ TestUtils }, { core: { Class }, controller: { uiController, pageController, bindingController }, callWidget }, MpLinkHandler, FileManager) {
 
    return {
        suite: function (specParam) {

            m.describe(specParam.functions.run, 'Testing all functions in the wrapper class', function () {
                var fmId = 'FESVirt_FileManager',
                    fm;

                m.describe(specParam.functions.createWidget.createsingleton.run, '\u00BB createWidget - static method \u00AB', function () {
                    m.it(specParam.functions.createWidget.run, '/ Test the static method createWidget that is actually used to instantiate the FileManager ', function () {
                        spyOn(FileManager.prototype, 'addPromises');
                        spyOn(FileManager.prototype.superClass, 'apply').and.callThrough();

                        spyOn(uiController, 'addWidget').and.callThrough();
                        spyOn(FileManager.prototype, '_dispatchReady');

                        var instanceAlreadyExists = callWidget(fmId, 'widget') !== null;

                        fm = FileManager.createWidget(fmId);
                        fm.settings.mpLink = 'FileManagement';
                        var instance = callWidget(fmId, 'widget');
                        if (!instanceAlreadyExists) {
                            expect(uiController.addWidget).toHaveBeenCalled();
                            expect(FileManager.prototype._dispatchReady).toHaveBeenCalled();
                        }
                        expect(callWidget(fmId, 'widget') !== null).toBeTrue();
                        expect(FileManager.prototype.addPromises).toHaveBeenCalled();
                        expect(instance.defaultSettings.mpLink).toEqual(specParam.functions.createWidget.createsingleton.expect.mpLink);
                    });
                    
                    m.it(specParam.functions.createWidget.usesingleton.run, '/ Instantiate the FileManager - use the Singleton class', function () {
                        spyOn(FileManager.prototype, 'addPromises');
                        spyOn(FileManager.prototype.superClass, 'apply');

                        fm = FileManager.createWidget(fmId);
                        expect(FileManager.prototype.addPromises).toHaveBeenCalled();
                        expect(FileManager.prototype.superClass.apply).not.toHaveBeenCalled();
                    });
                });                       

                m.describe(specParam.functions.init.run, '\u00BB init \u00AB', function () {
                    m.it(specParam.functions.init.run, '/ Test init method ', function () {
                        var safe = {
                            promises: fm.promises,
                            data: fm.data
                        };
                        spyOn(MpLinkHandler.prototype, 'init').and.callThrough();
                        spyOn(fm.superClass.prototype, 'init');
                        
                        fm.init();

                        expect(fm.isError).toBe(specParam.functions.init.expect.isError);
                        expect(fm.isConnected).toBe(specParam.functions.init.expect.isConnected);
                        expect(fm.errorMessage).toBe(specParam.functions.init.expect.errorMessage);
                        expect(fm.promises).toEqual(specParam.functions.init.expect.promises);
                        expect(fm.chunkSize).toEqual(specParam.functions.init.expect.chunkSize);
                        
                        fm.promises = safe.promises;
                        fm.data = safe.data;
                    });
                });

                m.describe(specParam.functions.browse.run, '\u00BB Browse \u00AB', function () {
                    m.it(specParam.functions.browse.run, '/ Test browse method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleGetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.browse(fm.elem.id, specParam.functions.browse.params.path, specParam.functions.browse.params.flags);
                        
                        expect(fm._handleGetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.browse.expect.elemId);
                        expect(methodId).toBe(specParam.functions.browse.expect.methodId);
                        expect(params).toEqual(specParam.functions.browse.expect.params);
                    });
                });
                
                m.describe(specParam.functions.load.run, '\u00BB Load \u00AB', function () {
                    m.it(specParam.functions.load.small.run, '/ Test load method for a small file', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleGetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.load(fm.elem.id, specParam.functions.load.small.params.path, 
                            specParam.functions.load.small.params.flags, 
                            specParam.functions.load.small.params.enc, 
                            specParam.functions.load.small.params.ms, 
                            specParam.functions.load.small.params.offset);
                        
                        expect(fm._handleGetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.load.small.expect.elemId);
                        expect(methodId).toBe(specParam.functions.load.small.expect.methodId);
                        expect(params).toEqual(specParam.functions.load.small.expect.params);
                    });

                    m.it(specParam.functions.load.large.run, '/ Test load method for a large file and split it into chunks of 5 kB', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleGetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.load(fm.elem.id, specParam.functions.load.large.params.path, 
                            specParam.functions.load.large.params.flags, 
                            specParam.functions.load.large.params.enc, 
                            specParam.functions.load.large.params.ms, 
                            specParam.functions.load.large.params.offset);
                        
                        expect(fm._handleGetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.load.large.expect.elemId);
                        expect(methodId).toBe(specParam.functions.load.large.expect.methodId);
                        expect(params).toEqual(specParam.functions.load.large.expect.params);
                    });
                });

                m.describe(specParam.functions.restriction.run, '\u00BB Restriction \u00AB', function () {
                    m.it(specParam.functions.restriction.run, '/ Test restriction method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleGetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.restriction(fm.elem.id, specParam.functions.restriction.params.comp);
                        
                        expect(fm._handleGetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.restriction.expect.elemId);
                        expect(methodId).toBe(specParam.functions.restriction.expect.methodId);
                        expect(params).toEqual(specParam.functions.restriction.expect.params);
                    });
                });

                m.describe(specParam.functions.error.run, '\u00BB Error \u00AB', function () {
                    m.it(specParam.functions.error.run, '/ Test error method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleGetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.error(fm.elem.id);
                        
                        expect(fm._handleGetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.error.expect.elemId);
                        expect(methodId).toBe(specParam.functions.error.expect.methodId);
                        expect(params).toEqual(specParam.functions.error.expect.params);
                    });
                });

                m.describe(specParam.functions.save.run, '\u00BB Save \u00AB', function () {
                    m.it(specParam.functions.save.run, '/ Test save method', function () {

                        var elemId, methodId, params, data;
                        spyOn(fm, '_handleSetter').and.callFake(function (eId, m, p, d) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            data = d;
                            return null;    
                        });

                        fm.save(fm.elem.id, specParam.functions.save.params.path, 
                            specParam.functions.save.params.flags, 
                            specParam.functions.save.params.enc, 
                            specParam.functions.save.params.data);
                        
                        expect(fm._handleSetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.save.expect.elemId);
                        expect(methodId).toBe(specParam.functions.save.expect.methodId);
                        expect(params).toEqual(specParam.functions.save.expect.params);
                        expect(data).toEqual(specParam.functions.save.expect.data);
                    });
                });

                m.describe(specParam.functions.delete.run, '\u00BB Delete \u00AB', function () {
                    m.it(specParam.functions.delete.run, '/ Test delete method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleSetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.delete(fm.elem.id, specParam.functions.delete.params.path, 
                            specParam.functions.delete.params.flags, 
                            specParam.functions.delete.params.enc, 
                            specParam.functions.delete.params.ms, 
                            specParam.functions.delete.params.offset);
                        
                        expect(fm._handleSetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.delete.expect.elemId);
                        expect(methodId).toBe(specParam.functions.delete.expect.methodId);
                        expect(params).toEqual(specParam.functions.delete.expect.params);
                    });
                });

                m.describe(specParam.functions.rename.run, '\u00BB Rename \u00AB', function () {
                    m.it(specParam.functions.rename.run, '/ Test rename method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleSetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.rename(fm.elem.id, specParam.functions.rename.params.path, 
                            specParam.functions.rename.params.name, 
                            specParam.functions.rename.params.flags); 
                        
                        expect(fm._handleSetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.rename.expect.elemId);
                        expect(methodId).toBe(specParam.functions.rename.expect.methodId);
                        expect(params).toEqual(specParam.functions.rename.expect.params);
                    });
                });

                m.describe(specParam.functions.copy.run, '\u00BB Copy \u00AB', function () {
                    m.it(specParam.functions.copy.run, '/ Test copy method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleSetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.copy(fm.elem.id, specParam.functions.copy.params.source, 
                            specParam.functions.copy.params.destination, 
                            specParam.functions.copy.params.flags);
                        
                        expect(fm._handleSetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.copy.expect.elemId);
                        expect(methodId).toBe(specParam.functions.copy.expect.methodId);
                        expect(params).toEqual(specParam.functions.copy.expect.params);
                    });
                });

                m.describe(specParam.functions.lock.run, '\u00BB Lock \u00AB', function () {
                    m.it(specParam.functions.lock.run, '/ Test lock method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleSetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.lock(fm.elem.id, specParam.functions.lock.params.path);
                        
                        expect(fm._handleSetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.lock.expect.elemId);
                        expect(methodId).toBe(specParam.functions.lock.expect.methodId);
                        expect(params).toEqual(specParam.functions.lock.expect.params);
                    });
                });

                m.describe(specParam.functions.clearFlags.run, '\u00BB ClearFlags \u00AB', function () {
                    m.it(specParam.functions.clearFlags.run, '/ Test clearFlags method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleSetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.clearFlags(fm.elem.id, specParam.functions.clearFlags.params.path);
                        
                        expect(fm._handleSetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.clearFlags.expect.elemId);
                        expect(methodId).toBe(specParam.functions.clearFlags.expect.methodId);
                        expect(params).toEqual(specParam.functions.clearFlags.expect.params);
                    });
                });

                m.describe(specParam.functions.createFolder.run, '\u00BB CreateFolder \u00AB', function () {
                    m.it(specParam.functions.createFolder.run, '/ Test createFolder method', function () {

                        var elemId, methodId, params;
                        spyOn(fm, '_handleSetter').and.callFake(function (eId, m, p) {
                            elemId = eId;
                            methodId = m;
                            params = p;
                            return null;    
                        });

                        fm.createFolder(fm.elem.id, specParam.functions.createFolder.params.path);
                        
                        expect(fm._handleSetter).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions.createFolder.expect.elemId);
                        expect(methodId).toBe(specParam.functions.createFolder.expect.methodId);
                        expect(params).toEqual(specParam.functions.createFolder.expect.params);
                    });
                });

                m.describe(specParam.functions._handleGetter.run, '\u00BB _handleGetter \u00AB', function () {
                    m.it(specParam.functions._handleGetter.default.run, '/ Test _handleGetter method', function () {

                        var elemId, methodId, returnMethod, params, promiseMethod, data;
                        spyOn(fm.linkHandler, 'sendRequestAndProvideCallback').and.callFake(function (m, _return, d, p) {
                            methodId = m;
                            data = d;
                            returnMethod = _return;
                            params = p;
                            return null;    
                        });

                        spyOn(fm, '_handlePromise');

                        spyOn(fm, '_getPromise').and.callFake(function (eId, pm) {
                            elemId = eId;
                            promiseMethod = pm;
                            return null;    
                        });

                        //setup promises
                        fm.promises[fm.elem.id] = {};

                        fm._handleGetter(fm.elem.id, specParam.functions._handleGetter.default.methodId, specParam.functions._handleGetter.default.params);
                        
                        expect(fm.linkHandler.sendRequestAndProvideCallback).toHaveBeenCalled();
                        expect(fm._getPromise).toHaveBeenCalled();
                        expect(fm._handlePromise).not.toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions._handleGetter.default.expect.elemId);
                        expect(methodId).toBe(specParam.functions._handleGetter.default.expect.methodId);
                        expect(promiseMethod).toBe(specParam.functions._handleGetter.default.expect.methodId);
                        expect(data).toEqual(specParam.functions._handleGetter.default.expect.data);
                        expect(params).toEqual(specParam.functions._handleGetter.default.expect.params);
                        expect(returnMethod).toEqual(fm._return);
                    });
                    m.it(specParam.functions._handleGetter.rapid.run, '/ Test _handleGetter method with two rapid calls after each other, the first should be aborted', function () {

                        var elemId, methodId, returnMethod, params, promiseMethod, data, elemId2, methodId2, error, methodcall;
                        spyOn(fm.linkHandler, 'sendRequestAndProvideCallback').and.callFake(function (m, _return, d, p) {
                            methodId = m;
                            data = d;
                            returnMethod = _return;
                            params = p;
                            return null;    
                        });

                        spyOn(fm, '_getPromise').and.callFake(function (eId, pm) {
                            elemId = eId;
                            promiseMethod = pm;
                            return null;    
                        });

                        spyOn(fm, '_handlePromise').and.callFake(function (e, id, m, r) {
                            elemId2 = id;
                            error = e;
                            methodId2 = m;
                            methodcall = r;
                            return null;    
                        });
                        //setup promises
                        fm.promises[fm.elem.id] = {};
                        fm.promises[fm.elem.id][specParam.functions._handleGetter.rapid.methodId] = {
                            reject: function () {}
                        };

                        fm._handleGetter(fm.elem.id, specParam.functions._handleGetter.rapid.methodId, specParam.functions._handleGetter.rapid.params, specParam.functions._handleGetter.rapid.data);
                        
                        expect(fm.linkHandler.sendRequestAndProvideCallback).toHaveBeenCalled();
                        expect(fm._getPromise).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions._handleGetter.rapid.expect.elemId);
                        expect(methodId).toBe(specParam.functions._handleGetter.rapid.expect.methodId);
                        expect(promiseMethod).toBe(specParam.functions._handleGetter.rapid.expect.methodId);
                        expect(data).toEqual(specParam.functions._handleGetter.rapid.expect.data);
                        expect(params).toEqual(specParam.functions._handleGetter.rapid.expect.params);
                        expect(returnMethod).toEqual(fm._return);

                        expect(elemId2).toBe(specParam.functions._handleGetter.rapid.expect.elemId2);
                        expect(methodId2).toBe(specParam.functions._handleGetter.rapid.expect.methodId2);
                        expect(error).toEqual(specParam.functions._handleGetter.rapid.expect.error);
                        expect(methodcall).toEqual(specParam.functions._handleGetter.rapid.expect.methodcall);
                    });
                });

                m.describe(specParam.functions._handleSetter.run, '\u00BB _handleSetter \u00AB', function () {
                    m.it(specParam.functions._handleSetter.run, '/ Test _handleSetter method', function () {

                        var elemId, methodId, returnMethod, params, promiseMethod, data;
                        spyOn(fm.linkHandler, 'sendDataAndProvideCallback').and.callFake(function (m, _return, d, p) {
                            methodId = m;
                            data = d;
                            returnMethod = _return;
                            params = p;
                            return null;    
                        });

                        spyOn(fm, '_getPromise').and.callFake(function (eId, pm) {
                            elemId = eId;
                            promiseMethod = pm;
                            return null;    
                        });

                        fm._handleSetter(fm.elem.id, specParam.functions._handleSetter.methodId, specParam.functions._handleSetter.params, specParam.functions._handleSetter.data);
                        
                        expect(fm.linkHandler.sendDataAndProvideCallback).toHaveBeenCalled();
                        expect(fm._getPromise).toHaveBeenCalled();
                        expect(elemId).toBe(specParam.functions._handleSetter.expect.elemId);
                        expect(methodId).toBe(specParam.functions._handleSetter.expect.methodId);
                        expect(promiseMethod).toBe(specParam.functions._handleSetter.expect.methodId);
                        expect(data).toEqual(specParam.functions._handleSetter.expect.data);
                        expect(params).toEqual(specParam.functions._handleSetter.expect.params);
                        expect(returnMethod).toEqual(fm._return);
                    });
                });

                m.describe(specParam.functions._widgetReadyHandler.run, '\u00BB _widgetReadyHandler \u00AB', function () {
                    m.it(specParam.functions._widgetReadyHandler.rightId.run, '/ Test _widgetReadyHandler method with correct ID', function () {

                        spyOn(fm.elem, 'removeEventListener');
                        spyOn(Class.prototype, '_bind');
                        spyOn(fm, 'setUpMpLinkConnection');

                        fm._widgetReadyHandler(specParam.functions._widgetReadyHandler.rightId.event);
                        
                        expect(fm.elem.removeEventListener).toHaveBeenCalled();
                        expect(Class.prototype._bind).toHaveBeenCalled();
                        expect(fm.setUpMpLinkConnection).toHaveBeenCalled();
                    });

                    m.it(specParam.functions._widgetReadyHandler.wrongId.run, '/ Test _widgetReadyHandler method with wrong ID', function () {

                        spyOn(fm.elem, 'removeEventListener');
                        spyOn(Class.prototype, '_bind');
                        spyOn(fm, 'setUpMpLinkConnection');

                        fm._widgetReadyHandler(specParam.functions._widgetReadyHandler.wrongId.event);
                        
                        expect(fm.elem.removeEventListener).not.toHaveBeenCalled();
                        expect(Class.prototype._bind).not.toHaveBeenCalled();
                        expect(fm.setUpMpLinkConnection).not.toHaveBeenCalled();
                    });
                });

                m.describe(specParam.functions.setMpLink.run, '\u00BB setMpLink \u00AB', function () {
                    m.it(specParam.functions.setMpLink.run, '/ Test setMpLink method ', function () {

                        var telegram;
                        spyOn(fm.linkHandler, 'incomingMessage').and.callFake(function (t) {
                            telegram = t;
                            return null;    
                        });

                        fm.setMpLink(specParam.functions.setMpLink.telegram);
                        
                        expect(fm.linkHandler.incomingMessage).toHaveBeenCalled();
                        expect(telegram).toEqual(specParam.functions.setMpLink.expect.telegram);
                    });
                });

                m.describe(specParam.functions.getMpLink.run, '\u00BB getMpLink \u00AB', function () {
                    m.it(specParam.functions.getMpLink.run, '/ Test getMpLink method ', function () {

                        var getter = fm.getMpLink();

                        expect(getter).toEqual(specParam.functions.getMpLink.expect.mpLink);
                    });
                });
                m.describe(specParam.functions.removePromises.run, '\u00BB removePromises \u00AB', function () {
                    m.it(specParam.functions.removePromises.run, '/ Test removePromises method ', function () {

                        fm.removePromises(fm.elem.id);

                        expect(fm.promises[fm.elem.id]).toEqual(specParam.functions.removePromises.expect.promises);
                    });
                });

                m.describe(specParam.functions.addPromises.run, '\u00BB addPromises \u00AB', function () {
                    m.it(specParam.functions.addPromises.run, '/ Test addPromises method ', function () {

                        fm.addPromises(fm.elem.id);

                        expect(fm.promises[fm.elem.id]).toEqual(specParam.functions.addPromises.expect.promises);
                    });
                });

                m.describe(specParam.functions._getPromise.run, '\u00BB _getPromise \u00AB', function () {
                    m.it(specParam.functions._getPromise.correctID.run, '/ Test _getPromise method - with a correct methodID', async function () {

                        var resolved = false, 
                            rejected = false;
                        
                        var getter = fm._getPromise(fm.elem.id, specParam.functions._getPromise.correctID.methodId);

                        fm.promises[fm.elem.id][specParam.functions._getPromise.correctID.methodId].resolve();

                        await getter.then(function () {
                            resolved = true;
                        }, function () {
                            rejected = true;
                        });

                        expect(resolved).toBeTruthy();
                        expect(rejected).toBeFalsy();
                    });

                    m.it(specParam.functions._getPromise.incorrectID.run, '/ Test _getPromise method - with an incorrect methodID', async function () {

                        var resolved = false, rejected = false;

                        var getter = fm._getPromise(fm.elem.id, specParam.functions._getPromise.incorrectID.methodId);

                        await getter.then(function () {
                            resolved = true;
                        }, function () {
                            rejected = true;
                        });

                        expect(resolved).toBeFalsy();
                        expect(rejected).toBeTruthy();
                    });

                    m.it(specParam.functions._getPromise.errorState.run, '/ Test _getPromise method - when in error state', async function () {

                        var resolved = false, rejected = false;
                        fm.isError = true;
                        
                        var getter = fm._getPromise(fm.elem.id, specParam.functions._getPromise.errorState.methodId);

                        await getter.then(function () {
                            resolved = true;
                        }, function () {
                            rejected = true;
                        });
                        expect(resolved).toBeFalsy();
                        expect(rejected).toBeTruthy();
                        fm.isError = false;
                    });
                });

                m.describe(specParam.functions._return.run, '\u00BB _return \u00AB', function () {
                    m.it(specParam.functions._return.resolve.run, '/ Test _return method - with resolve method', function () {

                        var data, id, methodId, resolver;
                        spyOn(fm, '_handlePromise').and.callFake(function (d, i, m, r) {
                            data = d;
                            id = i;
                            methodId = m;
                            resolver = r;
                        });
                        spyOn(fm, '_loadingChunks');

                        fm._return(specParam.functions._return.resolve.message, specParam.functions._return.resolve.telegram);
                        
                        expect(fm._handlePromise).toHaveBeenCalled();
                        expect(fm._loadingChunks).not.toHaveBeenCalled();

                        expect(data).toEqual(specParam.functions._return.resolve.expect.data);
                        expect(id).toEqual(specParam.functions._return.resolve.expect.id);
                        expect(methodId).toEqual(specParam.functions._return.resolve.expect.methodId);
                        expect(resolver).toEqual(specParam.functions._return.resolve.expect.resolver);
                    });

                    m.it(specParam.functions._return.geterror.run, '/ Test _return method - with reject method on GetError', function () {

                        var telegram, id, methodId, resolver;
                        spyOn(fm, '_handlePromise').and.callFake(function (t, i, m, r) {
                            telegram = t;
                            id = i;
                            methodId = m;
                            resolver = r;
                        });
                        spyOn(fm, '_loadingChunks');

                        fm._return(specParam.functions._return.geterror.message, specParam.functions._return.geterror.telegram);
                        
                        expect(fm._handlePromise).toHaveBeenCalled();
                        expect(fm._loadingChunks).not.toHaveBeenCalled();

                        expect(telegram).toEqual(specParam.functions._return.geterror.expect.telegram);
                        expect(id).toEqual(specParam.functions._return.geterror.expect.id);
                        expect(methodId).toEqual(specParam.functions._return.geterror.expect.methodId);
                        expect(resolver).toEqual(specParam.functions._return.geterror.expect.resolver);
                    });
                    
                    m.it(specParam.functions._return.seterror.run, '/ Test _return method - with reject method on SetError', function () {

                        var telegram, id, methodId, resolver;
                        spyOn(fm, '_handlePromise').and.callFake(function (t, i, m, r) {
                            telegram = t;
                            id = i;
                            methodId = m;
                            resolver = r;
                        });
                        spyOn(fm, '_loadingChunks');

                        fm._return(specParam.functions._return.seterror.message, specParam.functions._return.seterror.telegram);
                        
                        expect(fm._handlePromise).toHaveBeenCalled();
                        expect(fm._loadingChunks).not.toHaveBeenCalled();

                        expect(telegram).toEqual(specParam.functions._return.seterror.expect.telegram);
                        expect(id).toEqual(specParam.functions._return.seterror.expect.id);
                        expect(methodId).toEqual(specParam.functions._return.seterror.expect.methodId);
                        expect(resolver).toEqual(specParam.functions._return.seterror.expect.resolver);
                    });

                    m.it(specParam.functions._return.loadChunks.run, '/ Test _return method - with loading data in chunks', function () {

                        var telegram;
                        spyOn(fm, '_handlePromise');
                        spyOn(fm, '_loadingChunks').and.callFake(function (t) {
                            telegram = t;
                        });

                        fm._return(specParam.functions._return.loadChunks.message, specParam.functions._return.loadChunks.telegram);
                        
                        expect(fm._handlePromise).not.toHaveBeenCalled();
                        expect(fm._loadingChunks).toHaveBeenCalled();

                        expect(telegram).toEqual(specParam.functions._return.loadChunks.expect.telegram);
                    });
                });

                m.describe(specParam.functions._handlePromise.run, '\u00BB _handlePromise \u00AB', function () {
                    m.it(specParam.functions._handlePromise.resolve.run, '/ Test _handlePromise method - with resolve method', async function () {
                        var data, rejectedTelegram = {};

                        var getter = fm._getPromise(fm.elem.id, specParam.functions._handlePromise.resolve.methodId);

                        fm._handlePromise(specParam.functions._handlePromise.resolve.data,
                            specParam.functions._handlePromise.resolve.elemId,
                            specParam.functions._handlePromise.resolve.methodId,
                            specParam.functions._handlePromise.resolve.resolveType);

                        await getter.then(function (d) {
                            data = d;
                        }).catch(function (telegram) {
                            rejectedTelegram = telegram;
                        });

                        expect(data).toEqual(specParam.functions._handlePromise.resolve.expect.data);
                        expect(rejectedTelegram).toEqual(specParam.functions._handlePromise.resolve.expect.empty);
                    });

                    m.it(specParam.functions._handlePromise.reject.run, '/ Test _handlePromise method - with reject method on GetError', async function () {

                        var rejectedTelegram = {}, resolvedTelegram = {};

                        var getter = fm._getPromise(fm.elem.id, specParam.functions._handlePromise.reject.methodId);

                        fm._handlePromise(specParam.functions._handlePromise.reject.data,
                            specParam.functions._handlePromise.reject.elemId,
                            specParam.functions._handlePromise.resolve.methodId,
                            specParam.functions._handlePromise.reject.resolveType);
                      
                        await getter.then(function (telegram) {
                            resolvedTelegram = telegram;
                        }).catch(function (telegram) {
                            rejectedTelegram = telegram;
                        });
                        expect(rejectedTelegram).toEqual(specParam.functions._handlePromise.reject.expect.telegram);
                        expect(resolvedTelegram).toEqual(specParam.functions._handlePromise.reject.expect.empty);
                    });
                });

                m.describe(specParam.functions._loadingChunks.run, '\u00BB _loadingChunks \u00AB', function () {
                    m.it(specParam.functions._loadingChunks.neof.run, '/ Test the function when the End-Of-File flag is not set ', function () {
                        var elemId, path, flags, enc, ms, offset;
                        spyOn(fm, '_load').and.callFake(function (e, p, f, en, m, o) {
                            path = p;
                            elemId = e;
                            flags = f;
                            enc = en;
                            ms = m;
                            offset = o;
                        });

                        spyOn(fm, '_handlePromise');
                        
                        //setup data
                        fm.data[fm.elem.id] = {
                            path: specParam.functions._loadingChunks.neof.expect.path,
                            data: ''
                        };

                        fm._loadingChunks(specParam.functions._loadingChunks.neof.telegram);

                        expect(fm._load).toHaveBeenCalled();
                        expect(fm._handlePromise).not.toHaveBeenCalled();

                        expect(fm.data[elemId].data).toEqual(specParam.functions._loadingChunks.neof.expect.data);
                        expect(path).toEqual(specParam.functions._loadingChunks.neof.expect.path);
                        expect(elemId).toEqual(specParam.functions._loadingChunks.neof.expect.elemId);
                        expect(flags).toEqual(specParam.functions._loadingChunks.neof.expect.flags);
                        expect(enc).toEqual(specParam.functions._loadingChunks.neof.expect.enc);
                        expect(ms).toEqual(specParam.functions._loadingChunks.neof.expect.ms);
                        expect(offset).toEqual(specParam.functions._loadingChunks.neof.expect.offset);
                    });

                    m.it(specParam.functions._loadingChunks.eof.run, '/ Test the function when the End-Of-File flag is set ', function () {
                        var data, elemId, methodId, resolve;
                        spyOn(fm, '_load');
                        spyOn(fm, '_handlePromise').and.callFake(function (d, e, m, r) {
                            data = d;
                            elemId = e;
                            methodId = m;
                            resolve = r;
                        });

                        fm._loadingChunks(specParam.functions._loadingChunks.eof.telegram);

                        expect(fm._load).not.toHaveBeenCalled();
                        expect(fm._handlePromise).toHaveBeenCalled();
                        
                        expect(data).toEqual(specParam.functions._loadingChunks.eof.expect.data);
                        expect(elemId).toEqual(specParam.functions._loadingChunks.eof.expect.elemId);
                        expect(methodId).toEqual(specParam.functions._loadingChunks.eof.expect.methodID);
                        expect(resolve).toEqual(specParam.functions._loadingChunks.eof.expect.resolve);
                    });
                });

                m.it(specParam.functions.setUpMpLinkConnection.failVirtualContent.run, '/ Test setUpMpLinkConnection method where the activation of the VirtualContent fails', async function () {
                    spyOn(pageController, 'getCurrentPage').and.returnValue('MockedPage');
                    spyOn(pageController, 'getVisu4Page').and.returnValue('MockedVisu');

                    var content1, visu1, content2, visu2;
                    spyOn(bindingController, 'createBindings').and.callFake(function (c, v) {
                        return new Promise(function (resolve) {
                            content1 = c;
                            visu1 = v;
                            resolve();
                        });
                    });
                    TestUtils.spyOnConsole('log', { startsWith: 'FileExplorer cannot create virtual binding' });
                    spyOn(bindingController, 'activateVirtualContent').and.callFake(function (c, v) {
                        // eslint-disable-next-line no-unused-vars
                        return new Promise(function (resolve, reject) {
                            content2 = c;
                            visu2 = v;
                            reject(specParam.functions.setUpMpLinkConnection.failVirtualContent.message);
                        });
                    });

                    await fm.setUpMpLinkConnection().finally(function () {
                        expect(fm.isConnected).toBe(specParam.functions.setUpMpLinkConnection.failVirtualContent.expect.isConnected);
                        expect(fm.isError).toBe(specParam.functions.setUpMpLinkConnection.failVirtualContent.expect.isError);
                        expect(fm.errorMessage.message).toEqual(specParam.functions.setUpMpLinkConnection.failVirtualContent.expect.errorMessage.message);
                        expect(content1).toBe(specParam.functions.setUpMpLinkConnection.failVirtualContent.expect.content1);
                        expect(visu1).toBe(specParam.functions.setUpMpLinkConnection.failVirtualContent.expect.visu1);
                        expect(content2).toBe(specParam.functions.setUpMpLinkConnection.failVirtualContent.expect.content2);
                        expect(visu2).toBe(specParam.functions.setUpMpLinkConnection.failVirtualContent.expect.visu2);

                        expect(pageController.getCurrentPage).toHaveBeenCalled();
                        expect(pageController.getVisu4Page).toHaveBeenCalled();
                        expect(bindingController.createBindings).not.toHaveBeenCalled();
                        expect(bindingController.activateVirtualContent).toHaveBeenCalled();
                        fm.isConnected = false;
                        fm.errorMessage = '';
                    });
                });

                m.it(specParam.functions.setUpMpLinkConnection.failBinding.run, '/ Test setUpMpLinkConnection method where the MpLink binding over the virtual content fails', async function () {
                    spyOn(pageController, 'getCurrentPage').and.returnValue('MockedPage');
                    spyOn(pageController, 'getVisu4Page').and.returnValue('MockedVisu');

                    var content1, visu1, content2, visu2;
                    TestUtils.spyOnConsole('log', { startsWith: 'MpLink for FileHandler is not connecting' });
                    spyOn(bindingController, 'createBindings').and.callFake(function (c, v) {
                        // eslint-disable-next-line no-unused-vars
                        return new Promise(function (resolve, reject) {
                            content1 = c;
                            visu1 = v;
                            reject(specParam.functions.setUpMpLinkConnection.failBinding.message);
                        });
                    });

                    spyOn(bindingController, 'activateVirtualContent').and.callFake(function (c, v) {
                        return new Promise(function (resolve) {
                            content2 = c;
                            visu2 = v;
                            resolve();
                        });
                    });

                    await fm.setUpMpLinkConnection().finally(function () {
                        expect(fm.isConnected).toBe(specParam.functions.setUpMpLinkConnection.failBinding.expect.isConnected);
                        expect(fm.isError).toBe(specParam.functions.setUpMpLinkConnection.failBinding.expect.isError);
                        expect(fm.errorMessage.message).toEqual(specParam.functions.setUpMpLinkConnection.failBinding.expect.errorMessage.message);
                        expect(content1).toBe(specParam.functions.setUpMpLinkConnection.failBinding.expect.content1);
                        expect(visu1).toBe(specParam.functions.setUpMpLinkConnection.failBinding.expect.visu1);
                        expect(content2).toBe(specParam.functions.setUpMpLinkConnection.failBinding.expect.content2);
                        expect(visu2).toBe(specParam.functions.setUpMpLinkConnection.failBinding.expect.visu2);

                        expect(pageController.getCurrentPage).toHaveBeenCalled();
                        expect(pageController.getVisu4Page).toHaveBeenCalled();
                        expect(bindingController.createBindings).toHaveBeenCalled();
                        expect(bindingController.activateVirtualContent).toHaveBeenCalled();
                        fm.isConnected = false;
                        fm.errorMessage = '';
                    });
                });
                    
                m.describe(specParam.functions.setUpMpLinkConnection.run, '\u00BB setUpMpLinkConnection \u00AB', function () {
                    m.it(specParam.functions.setUpMpLinkConnection.default.run, '/ Test setUpMpLinkConnection method where both the virtual content and the bindings are set up properly', async function () {

                        spyOn(pageController, 'getCurrentPage').and.returnValue('MockedPage');
                        spyOn(pageController, 'getVisu4Page').and.returnValue('MockedVisu');

                        var content1, visu1, content2, visu2;
                        spyOn(bindingController, 'createBindings').and.callFake(function (c, v) {
                            return new Promise(function (resolve) {
                                content1 = c;
                                visu1 = v;
                                resolve();
                            });
                        });

                        spyOn(bindingController, 'activateVirtualContent').and.callFake(function (c, v) {
                            return new Promise(function (resolve) {
                                content2 = c;
                                visu2 = v;
                                resolve();
                            });
                        });

                        await fm.setUpMpLinkConnection().finally(function () {

                            expect(fm.isConnected).toBe(specParam.functions.setUpMpLinkConnection.default.expect.isConnected);
                            expect(fm.isError).toBe(specParam.functions.setUpMpLinkConnection.default.expect.isError);
                            expect(fm.errorMessage.message).toEqual(specParam.functions.setUpMpLinkConnection.default.expect.errorMessage.message);
                            expect(content1).toBe(specParam.functions.setUpMpLinkConnection.default.expect.content1);
                            expect(visu1).toBe(specParam.functions.setUpMpLinkConnection.default.expect.visu1);
                            expect(content2).toBe(specParam.functions.setUpMpLinkConnection.default.expect.content2);
                            expect(visu2).toBe(specParam.functions.setUpMpLinkConnection.default.expect.visu2);

                            expect(pageController.getCurrentPage).toHaveBeenCalled();
                            expect(pageController.getVisu4Page).toHaveBeenCalled();
                            expect(bindingController.createBindings).toHaveBeenCalled();
                            expect(bindingController.activateVirtualContent).toHaveBeenCalled();
                            fm.isConnected = false;
                            fm.errorMessage = '';
                        });
                    });
                });
                //Add methods before this line
            });
        }
    };
});
