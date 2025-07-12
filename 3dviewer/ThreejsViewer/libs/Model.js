define([
    "brease",
    "widgets/3dviewer/common/libs/three.amd.min",
    "widgets/3dviewer/FileManager/FileManager",
], function (brease, THREE, FileManager) {

    "use strict";
    
    /**
     * @class widgets.3dviewer.ThreejsViewer.libs.Model
     * @extends brease.core.Class
     * Handles all model and scene management for the ThreejsViewer widget
     */
    const Model = brease.core.Class.extend(function Model(widget) {
        this.widget = widget;
        this._scene = null;
        this._camera = null;
        this._loader = null;
        this.fileManager = null;
        this.fileSize = 0;
        this.fileTotalReaded = 0;
        this.maxSizeFileChunk = 100 * 1024; // In KB
    });

    const p = Model.prototype;

    /**
     * @method init
     * Initialize the model and scene
     * @private
     */
    p.init = function () {
        this._loader = new THREE.ObjectLoader();
        this._scene = new THREE.Scene();
        this.widget._startTime = this.widget._prevTime = performance.now();

        // Create camera
        this._camera = new THREE.PerspectiveCamera(
            75,
            this.widget._container.width() / this.widget._container.height(),
            0.1,
            1000
        );
        this._camera.position.z = 5;
    };

    /**
     * @method initThreeJs
     * Initialize Three.js scene and camera
     */
    p.initThreeJs = function () {
        this.init();

        this.fileManager = FileManager.createWidget(this.widget.elem.id);
        this.fileManager.onChunk(this.widget.elem.id, (chunk) => {
            this.fileTotalReaded += chunk.bytesRead;
            this.widget._utils.updateLoadingScreen(
                this.fileTotalReaded / this.fileSize
            );
        });

        this.widget._renderer.init();

        // Load initial scene if path is provided
        if (this.widget.settings.sceneFilePath) {
            this.loadSceneFromPath(this.widget.settings.sceneFilePath)
                .catch((error) => {
                    console.error("Error loading initial scene:", error);
                })
                .then(() => {
                    // Start animation loop
                    if (this.widget.settings.autoPlay) {
                        this.widget._controller.play();
                    } else {
                        this.widget._controller.animate();
                    }
                });
        }
    };

    /**
     * @method loadSceneFromPath
     * Load scene from file path
     * @param {String} filePath - Path to the scene file
     * @return {Promise} Promise that resolves when scene is loaded
     */
    p.loadSceneFromPath = function (filePath) {
        if (this.widget._loading) {
            return Promise.reject("Another scene is currently loading");
        }

        this.widget._loading = true;
        const self = this;

        return new Promise((resolve, reject) => {
            self._startLoadingSequence(filePath)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    };

    /**
     * @method _startLoadingSequence
     * Internal: Handles initial loading sequence
     * @param {String} filePath - Path to the scene file
     * @return {Promise}
     */
    p._startLoadingSequence = function (filePath) {
        const self = this;
        self.widget._utils.showLoadingScreen();
        self.widget._utils.updateLoadingScreen(0, "Browse for file...");
        const folderPath = filePath.substring(0, filePath.lastIndexOf("/") + 1);

        return self.fileManager
            .browse(self.widget.elem.id, folderPath, "FILES")
            .then((browseInfo) => self._handleFileInfo(browseInfo, filePath))
            .then((fileInfo) => self._processSceneFile(fileInfo, filePath))
            .finally(() => {
                self.widget._utils.hideLoadingScreen();
                self.widget._loading = false;
            });
    };

    /**
     * @method _handleFileInfo
     * Internal: Verifies file info from browser
     * @param {Array} browseInfo - List of files
     * @param {String} filePath - Path to the desired file
     * @return {Object} fileInfo
     */
    p._handleFileInfo = function (browseInfo, filePath) {
        const self = this;
        const fileInfo = browseInfo.find((file) => file.Path === filePath);
        if (!fileInfo) {
            throw new Error(`File not found: ${filePath}`);
        }

        self.fileSize = fileInfo.Size;
        self.fileTotalReaded = 0;

        return fileInfo;
    };

    /**
     * @method _processSceneFile
     * Internal: Loads, parses, and loads scene into widget
     * @param {Object} fileInfo - File metadata
     * @param {String} filePath - File path to load
     * @return {Promise}
     */
    p._processSceneFile = function (fileInfo, filePath) {
        const self = this;
        self.widget._utils.updateLoadingScreen(0, "Reading scene file...");

        return self
            ._loadSceneFile(filePath, "LOCK", "TEXT")
            .then((fileData) => {
                self._unlockSceneFile();
                self.widget._utils.updateLoadingScreen(
                    0,
                    "Parsing scene file..."
                );
                const sceneData = JSON.parse(fileData);
                self.widget._utils.updateLoadingScreen(0, "Load scene file...");
                self.load(sceneData);
            })
            .catch((err) => {
                self._unlockSceneFile();
                throw err;
            });
    };

    /**
     * @method _loadSceneFile
     * Load scene file using FileManager
     * @param {String} filePath - Path to the file
     * @param {String} flags - File access flags
     * @param {String} encoding - File encoding
     * @return {Promise} Promise with file data
     * @private
     */
    p._loadSceneFile = function (filePath, flags, encoding) {
        return this.fileManager.load(
            this.widget.elem.id,
            filePath,
            flags,
            encoding || "",
            this.maxSizeFileChunk,
            0
        );
    };

    /**
     * @method _unlockSceneFile
     * Unlock the scene file
     * @private
     */
    p._unlockSceneFile = function () {
        if (
            this.widget.settings.sceneFilePath !== undefined &&
            this.widget.settings.sceneFilePath !== ""
        ) {
            this.fileManager
                .clearFlags(
                    this.widget.elem.id,
                    this.widget.settings.sceneFilePath
                )
                ?.catch(() => {});
        }
    };

    /**
     * @method _lockSceneFile
     * Lock the scene file
     * @private
     */
    p._lockSceneFile = function () {
        if (
            this.widget.settings.sceneFilePath !== undefined &&
            this.widget.settings.sceneFilePath !== ""
        ) {
            this.fileManager.lock(
                this.widget.elem.id,
                this.widget.settings.sceneFilePath
            );
        }
    };

    /**
     * @method load
     * Load scene from JSON data
     * @param {Object} json - Scene data in JSON format
     */
    p.load = function (json) {
        if (!json) return;

        const project = json.project || {};

        // Apply project settings to renderer
        if (project.shadows !== undefined)
            this.widget._renderer._renderer.shadowMap.enabled = project.shadows;
        if (project.shadowType !== undefined)
            this.widget._renderer._renderer.shadowMap.type = project.shadowType;
        if (project.toneMapping !== undefined)
            this.widget._renderer._renderer.toneMapping = project.toneMapping;
        if (project.toneMappingExposure !== undefined)
            this.widget._renderer._renderer.toneMappingExposure =
                project.toneMappingExposure;

        this.setScene(this._loader.parse(json.scene));
        this.setCamera(this._loader.parse(json.camera));

        // Process scripts if enabled
        if (this.widget.settings.enableScripts && json.scripts) {
            this.widget._controller.processScripts(json.scripts);
        }

        this.widget._controller._dispatchEvent("init", arguments);
        this.widget.setSceneLoaded(true);
        this.widget._fireSceneLoaded();
    };

    /**
     * @method setCamera
     * Set camera for the scene
     * @param {Object} camera - Three.js camera (THREE.Camera)
     */
    p.setCamera = function (camera) {
        this._camera = camera;
        if (this._camera) {
            this._camera.aspect =
                this.widget._container.width() /
                this.widget._container.height();
            this._camera.updateProjectionMatrix();

            if (this.widget.settings.enableControls) {
                this.widget._renderer._initControls();
            }
        }
    };

    /**
     * @method setScene
     * Set scene
     * @param {Object} scene - Three.js scene (THREE.Scene)
     */
    p.setScene = function (scene) {
        this._scene = scene;
        this._fitSceneToView();
    };

    /**
     * @method _fitSceneToView
     * Fit scene to view by adjusting camera position
     * @private
     */
    p._fitSceneToView = function () {
        if (!this._scene) return;

        const box = new THREE.Box3().setFromObject(this._scene);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());

        this._camera.position.copy(center);
        this._camera.position.x += size * 0.5;
        this._camera.position.y += size * 0.5;
        this._camera.position.z += size * 1.5;
        this._camera.lookAt(center);

        if (this.widget._renderer._controls) {
            this.widget._renderer._controls.target.copy(center);
            this.widget._renderer._controls.update();
        }
    };

    return Model;
});
