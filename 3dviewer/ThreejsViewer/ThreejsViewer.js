"use strict";
define([
    "brease",
    "widgets/3dviewer/common/libs/three.amd.min",
    "widgets/3dviewer/common/libs/OrbitControls.amd.min",
    "widgets/3dviewer/ThreejsViewer/libs/config/EditorHandles",
    "widgets/3dviewer/FileManager/FileManager",
    "./libs/Renderer",
    "./libs/Model",
    "./libs/Controller",
    "./libs/Editor",
    "./libs/Utils",
    "./libs/StructProperties/BindAttribute",
], function (
    {
        bodyEl,
        config: breaseConfig,
        core: { BaseWidget: SuperClass, Utils },
        events: { BreaseEvent },
        decorators: { ContentActivatedDependency },
        services: { logger },
        enum: { Enum },
    },
    THREE,
    OrbitControls,
    EditorHandles,
    FileManager,
    Renderer,
    Model,
    Controller,
    Editor,
    WidgetUtils,
    BindAttribute
) {
    // ========================================================================
    // CLASS DEFINITION AND CONFIGURATION
    // ========================================================================

    /**
     * @class widgets.3dviewer.ThreejsViewer
     * This widget is a 3d viewer based on three.js.
     * It can be used to visualize 3D models and interact with them.
     * @extends brease.core.BaseWidget
     * @requires widgets.3dviewer.FileManager
     *
     * @iatMeta category:Category
     * Numeric
     * @iatMeta description:de
     * 3D-Viewer
     * @iatMeta description:en
     * 3D-Viewer
     */

    /**
     * @cfg {String} sceneFilePath=''
     * @iatStudioExposed
     * @iatCategory Behavior
     * @bindable
     * Path to the scene file to be loaded.
     */

    /**
     * @cfg {Boolean} enableScripts=true
     * @iatStudioExposed
     * @iatCategory Behavior
     * Boolean value to enable or disable script execution.
     */

    /**
     * @cfg {Boolean} enableControls=true
     * @iatStudioExposed
     * @iatCategory Behavior
     * Boolean value to enable or disable camera controls.
     */

    /**
     * @cfg {Boolean} autoPlay=false
     * @iatStudioExposed
     * @iatCategory Behavior
     * Boolean value to enable or disable auto-play of the animation.
     */

    /**
     * @cfg {String} transform='{}'
     * @iatStudioExposed
     * @iatCategory Behavior
     * @bindable
     * JSON configuration for object transformations with animation
     */

    /**
     * @cfg {Boolean} sceneLoaded=false
     * @iatStudioExposed
     * @iatCategory Behavior
     * @not_projectable
     * @bindable
     * @readonly
     * Boolean value to indicate if the scene is loaded.
     * This is a read-only property.
     */

    /**
     * @cfg {widgets.3dviewer.StructProp.BindAttribute} bindAttribute={}
     * @iatStudioExposed
     * @iatCategory Collections
     * Defines the binding properties for the scene object transformations.
     * @iatMeta StructuredProperty:true
     * @iatMeta minSize:0
     * @iatMeta maxSize:50
     */

    const defaults_properties = {
        sceneFilePath: "",
        enableScripts: true,
        enableControls: true,
        autoPlay: false,
        transform: "{}",
        sceneLoaded: false,
        bindAttribute: {},
    };

    const WidgetClass = SuperClass.extend(function ThreejsViewer() {
        SuperClass.apply(this, arguments);
    }, defaults_properties);

    const p = WidgetClass.prototype;

    // ========================================================================
    // INITIALIZATION AND SETUP
    // ========================================================================

    /**
     * Initialize the widget
     */
    p.init = function () {
        SuperClass.prototype.init.call(this);
        this.bindAttribute = {};

        // Initialize components
        if (!this._renderer) this._renderer = new Renderer(this);
        if (!this._model) this._model = new Model(this);
        if (!this._controller) this._controller = new Controller(this);
        if (!this._editor) this._editor = new Editor(this);
        this._utils = new WidgetUtils(this);

        // Initialize binding properties
        for (let rowId in this.settings.bindAttribute) {
            this._addBindAttribute(rowId, this.settings.bindAttribute[rowId]);
        }

        // Create container for Three.js renderer
        this._container = $("<div></div>");
        this._container.addClass("threejs-viewer-container");
        this._container.css({
            width: "100%",
            height: "100%",
        });
        this.el.append(this._container);

        // Initialize either mock content (in edit mode) or real Three.js scene
        if (breaseConfig.editMode) {
            this._editor.initMockThreeJs();
        } else {
            this._model.initThreeJs();
        }
    };

    /**
     * @method _initEditor
     * Internal method to initialize the editor handles for the widget.
     * This is call by the content editor.
     */
    p._initEditor = function () {
        if (!this._editor) this._editor = new Editor(this);
        this._editor.initEditor();
    };

    // ========================================================================
    // PUBLIC API METHODS
    // ========================================================================

    /**
     * @method setTransform
     * @iatStudioExposed
     * Set transformations for the scene.
     * @param {String} value
     */
    p.setTransform = function (value) {
        if (!this.getSceneLoaded() && value !== "{}" && value !== "") {
            brease.services.logger.log(
                6000,
                Enum.EventLoggerCustomer.CUSTOMER,
                Enum.EventLoggerVerboseLevel.OFF,
                Enum.EventLoggerSeverity.ERROR,
                [],
                "Scene not loaded. Cannot set transform. WidgetId: " +
                    this.elem.id
            );
            return;
        }
        if (!this._controller) this._controller = new Controller(this);
        this._controller.setTransform(value);
    };

    /**
     * @method getTransform
     * @iatStudioExposed
     * Get current transformations for the scene.
     * @return {String}
     */
    p.getTransform = function () {
        if (!this._controller) this._controller = new Controller(this);
        return this._controller.getTransform();
    };

    /**
     * @method setSceneLoaded
     * Set the scene loaded state.
     * @param {Boolean} value - The new state of the scene loaded property.
     */
    p.setSceneLoaded = function (value) {
        this.settings.sceneLoaded = value;
        this.sendValueChange({ sceneLoaded: this.getSceneLoaded() });
    };

    /**
     * @method getSceneLoaded
     * @iatStudioExposed
     * Get the current state of the scene loaded property.
     * @return {Boolean} - The current state of the scene loaded property.
     */
    p.getSceneLoaded = function () {
        return this.settings.sceneLoaded;
    };

    /**
     * @method _onWindowResize
     * @private
     * This method is called by the content editor to handle window resize events.
     * It updates the renderer size and camera aspect ratio.
     */
    p._onWindowResize = function () {
        if (!this._renderer) this._renderer = new Renderer(this);
        this._renderer.onWindowResize();
    };

    /**
     * @method _fireTransformDone
     * @private
     * This method is called when the transformation is done.
     * It triggers the TransformDone event.
     * @param {String} id - The ID of the transformed object.
     */
    p._fireTransformDone = function (id) {
        /**
         * @event TransformDone
         * @iatStudioExposed
         * Triggered when the transformation is done.
         * @param {String} id - The ID of the transformed object.
         */
        this.dispatchServerEvent("TransformDone", {
            id: id,
        });
    };

    /**
     * @method _fireSceneLoaded
     * @private
     * This method is called when the scene is loaded.
     * It triggers the SceneLoaded event.
     **/
    p._fireSceneLoaded = function () {
        /**
         * @event SceneLoaded
         * @iatStudioExposed
         * Triggered when the scene is loaded.
         */
        this.dispatchServerEvent("SceneLoaded", {});
    };

    /**
     * @method playScene
     * Start event handling for the scene and dispatch "start" event.
     * @iatStudioExposed
     */
    p.playScene = function () {
        this._controller.play();
    };

    /**
     * @method stopScene
     * Stop event handling for the scene and dispatch "stop" event.
     * @iatStudioExposed
     */
    p.stopScene = function () {
        this._controller.stop();
    };

    /**
     * @method playScript
     * Play a specific script by name from the Three.js editor scene.
     * @iatStudioExposed
     * @param {String} scriptName - Name of the script to play
     */
    p.playScript = function (scriptName) {
        if (!this._controller) this._controller = new Controller(this);
        this._controller.playScript(scriptName);
    };

    /**
     * @method stopScript
     * Stop a specific script by name from the Three.js editor scene.
     * @iatStudioExposed
     * @param {String} scriptName - Name of the script to stop
     */
    p.stopScript = function (scriptName) {
        if (!this._controller) this._controller = new Controller(this);
        this._controller.stopScript(scriptName);
    };

    /**
     * @method setBindAttribute
     * Set property value of single bind attribute
     * @param {String} path
     * @param {String} attribute
     * @param {Object} value
     */
    p.setBindAttribute = function (path, attribute, value) {
        if (this.bindAttribute[path]) {
            this.bindAttribute[path][Utils.setter(attribute)](value);
        }
    };

    /**
     * @method getBindAttribute
     * Get property value of single bind attribute
     */
    p.getBindAttribute = function (path, attribute) {
        if (this.bindAttribute[path]) {
            return this.bindAttribute[path][Utils.getter(attribute)]();
        } else {
            return null;
        }
    };

    /**
     * @method addBindAttribute
     * Add a new bind attribute
     */
    p.addBindAttribute = function (rowId, options) {
        this._addBindAttribute(rowId, options);
    };

    p._addBindAttribute = function (rowId, options) {
        if (!this.settings.bindAttribute[rowId]) {
            this.settings.bindAttribute[rowId] = options;
        }
        this.bindAttribute[rowId] = new BindAttribute(rowId, options, this.elem.id, 'bindAttribute', this);
    };

    /**
     * @method deleteBindAttribute
     * Delete a bind attribute
     */
    p.deleteBindAttribute = function (rowId) {
        this.bindAttribute[rowId].dispose();
        delete this.bindAttribute[rowId];
        delete this.settings.bindAttribute[rowId];
    };

    p.renameBindAttribute = function (id, newId) {
        this._renameStructProp("bindAttribute", id, newId);
    };

    p._renameStructProp = function (prop, id, newId) {
        this[prop][id].setId(newId);
        this[prop][newId] = this[prop][id];
        delete this[prop][id];
        this.settings[prop][newId] = this.settings[prop][id];
        delete this.settings[prop][id];
    };

    // ========================================================================
    // WIDGET STATES
    // ========================================================================

    /**
     * @method onBeforeSuspend
     * @private
     * This method is called before the widget is suspended.
     * It stops the animation and removes the event listeners.
     */
    p.onBeforeSuspend = function () {
        this._controller.onBeforeSuspend();
        SuperClass.prototype.onBeforeSuspend.call(this, arguments);
    };

    /**
     * @method suspend
     * @private
     * This method is called to suspend the widget.
     * It stops the request animation frame loop.
     */
    p.suspend = function () {
        this._controller.suspend();
        SuperClass.prototype.suspend.call(this, arguments);
    };

    /**
     * @method wake
     * @private
     * This method is called to wake the widget.
     * It starts the request animation frame loop and add eventlisteners.
     */
    p.wake = function () {
        this._controller.wake();
        SuperClass.prototype.wake.apply(this, arguments);
    };

    /**
     * @method dispose
     * @private
     * This method is called to dispose the widget.
     * It removes the event listeners and disposes the components.
     */
    p.dispose = function () {
        this._controller.dispose();
        this._model = null;
        this._renderer = null;
        this._controller = null;
        this._editor = null;
        this._utils = null;
        this._container = null;
        this.setSceneLoaded(false);

        SuperClass.prototype.dispose.apply(this, arguments);
    };

    return WidgetClass;
});
