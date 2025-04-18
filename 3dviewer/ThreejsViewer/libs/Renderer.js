define([
    "brease",
    "widgets/3dviewer/common/libs/three.amd.min",
    "widgets/3dviewer/common/libs/OrbitControls.amd.min"
], function (brease, THREE, OrbitControls) {

    "use strict";

    /**
     * @class widgets.3dviewer.ThreejsViewer.libs.Renderer
     * @extends brease.core.Class
     * Handles all rendering-related functionality for the ThreejsViewer widget
     */
    const Renderer = brease.core.Class.extend(function Renderer(widget) {
        this.widget = widget;
        this._renderer = null;
        this._controls = null;
    });

    const p = Renderer.prototype;

    /**
     * @method init
     * Initialize Three.js renderer
     */
    p.init = function() {
        this._renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(
            this.widget._container.width(),
            this.widget._container.height()
        );
        this.widget._container.append(this._renderer.domElement);

        if (this.widget.settings.enableControls && !brease.config.editMode) {
            this._initControls();
        }
    };

    /**
     * @method _initControls
     * Initialize OrbitControls for camera interaction

     */
    p._initControls = function() {
        this._controls = new OrbitControls.OrbitControls(
            this.widget._model._camera,
            this._renderer.domElement
        );
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.05;
        this._controls.screenSpacePanning = false;
        this._controls.minDistance = 0.1;
        this._controls.maxDistance = 100;
        this._controls.maxPolarAngle = Math.PI / 2;
    };

    /**
     * @method onWindowResize
     * Handle window resize events
     */
    p.onWindowResize = function() {
        if (this.widget._model._camera) {
            this.widget._model._camera.aspect =
                this.widget._container.width() / this.widget._container.height();
            this.widget._model._camera.updateProjectionMatrix();
        }
        this._renderer.setSize(
            this.widget._container.width(),
            this.widget._container.height()
        );
    };

    /**
     * @method render
     * Render the scene
     */
    p.render = function() {
        if (this.widget._model._scene && this.widget._model._camera) {
            this._renderer.render(this.widget._model._scene, this.widget._model._camera);
        }
    };

    /**
     * @method updateControls
     * Update controls
     * @private
     */
    p.updateControls = function() {
        if (this._controls) {
            this._controls.update();
        }
    };

    return Renderer;
});