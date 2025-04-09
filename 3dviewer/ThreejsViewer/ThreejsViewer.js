"use strict";
define([
    "brease",
    "widgets/3dviewer/common/libs/three.amd.min",
    "widgets/3dviewer/common/libs/OrbitControls.amd.min",
    "widgets/3dviewer/ThreejsViewer/libs/config/EditorHandles",
    "widgets/3dviewer/common/libs/BreaseResizeObserver",
    "widgets/3dviewer/FileManager/FileManager",
], function (
    {
        bodyEl,
        config: breaseConfig,
        core: { BaseWidget: SuperClass },
        events: { BreaseEvent },
        decorators: { ContentActivatedDependency },
    },
    THREE,
    OrbitControls,
    EditorHandles,
    BreaseResizeObserver,
    FileManager
) {
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

    const defaults_properties = {
        sceneFilePath: "",
        enableScripts: true,
        enableControls: true,
        autoPlay: false,
        transform: "{}",
    };

    const WidgetClass = SuperClass.extend(function ThreejsViewer() {
        SuperClass.apply(this, arguments);
    }, defaults_properties);

    const p = WidgetClass.prototype;

    p.init = function () {
        SuperClass.prototype.init.call(this);
        this._container = $("<div></div>");
        this._container.addClass("threejs-viewer-container");
        this._container.css({
            width: "100%",
            height: "100%",
        });
        this.el.append(this._container);

        // Initialize transform tracking
        this._transformValue = this.settings.transform;
        this._activeAnimations = {};
        this._transformQueue = [];

        this._events = {
            init: [],
            start: [],
            stop: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
            update: [],
        };

        if (breaseConfig.editMode) {
            this._initMockThreeJs();
        } else {
            this.fileManager = FileManager.createWidget(this.elem.id);
            this._initThreeJs();

            // Load initial scene if path is provided
            if (this.settings.sceneFilePath) {
                this.loadSceneFromPath(this.settings.sceneFilePath).catch(
                    (error) => {
                        console.error("Error loading initial scene:", error);
                    }
                );
            }
        }
    };

    p._initThreeJs = function () {
        this._loader = new THREE.ObjectLoader();
        this._scene = new THREE.Scene();

        this._startTime = this._prevTime = performance.now();

        // Create camera
        this._camera = new THREE.PerspectiveCamera(
            75,
            this._container.width() / this._container.height(),
            0.1,
            1000
        );
        this._camera.position.z = 5;

        // Create renderer with additional settings
        this._renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(
            this._container.width(),
            this._container.height()
        );
        this._container.append(this._renderer.domElement);

        // Add OrbitControls if enabled
        if (this.settings.enableControls) {
            this._initControls();
        }

        // Start animation loop
        if (this.settings.autoPlay) {
            this.play();
        } else {
            this._animate();
        }
    };

    p._initControls = function () {
        this._controls = new OrbitControls.OrbitControls(
            this._camera,
            this._renderer.domElement
        );
        this._controls.enableDamping = true;
        this._controls.dampingFactor = 0.05;
        this._controls.screenSpacePanning = false;
        this._controls.minDistance = 0.1;
        this._controls.maxDistance = 100;
        this._controls.maxPolarAngle = Math.PI / 2;
    };

    p._showLoadingScreen = function () {
        // Create loading screen with spinner and progress info
        this._loadingScreen = $(`
            <div class="threejs-loading-screen">
                <div class="loading-spinner"></div>
            </div>
        `);

        // Add CSS styling
        this._loadingScreen.css({
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            color: "white",
            fontFamily: "Arial, sans-serif",
        });

        // Spinner animation
        this._loadingScreen.find(".loading-spinner").css({
            width: "50px",
            height: "50px",
            border: "5px solid rgba(255, 255, 255, 0.3)",
            borderTopColor: "#3498db",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px",
        });

        // Add to container
        this._container.css("position", "relative").append(this._loadingScreen);

        // Add spin animation keyframes
        if (!$("#spin-keyframes").length) {
            $('<style id="spin-keyframes">')
                .text("@keyframes spin { to { transform: rotate(360deg); } }")
                .appendTo("head");
        }
    };

    p._hideLoadingScreen = function () {
        if (this._loadingScreen) {
            // Add fade-out animation before removal
            this._loadingScreen.css({
                transition: "opacity 0.5s ease",
                opacity: 0,
            });

            // Remove after animation completes
            setTimeout(() => {
                this._loadingScreen.remove();
                this._loadingScreen = null;
            }, 500);
        }
    };

    p.loadSceneFromPath = function (filePath) {
        if (this._loading) {
            return Promise.reject("Another scene is currently loading");
        }

        this._loading = true;
        const self = this;

        return new Promise((resolve, reject) => {
            self._showLoadingScreen();
            self._loadSceneFile(filePath, "")
                .then((fileData) => {
                    try {
                        const sceneData = JSON.parse(fileData);
                        self.load(sceneData);
                        // Apply any transforms that were set before scene loaded
                        if (
                            this._transformValue &&
                            this._transformValue !== "{}"
                        ) {
                            this.applyTransformations();
                        }
                        resolve();
                    } catch (jsonError) {
                        self._loadSceneFile(filePath, "BINARY")
                            .then((binaryData) => {
                                try {
                                    const sceneData = JSON.parse(binaryData);
                                    self.load(sceneData);
                                    // Apply any transforms that were set before scene loaded
                                    if (
                                        this._transformValue &&
                                        this._transformValue !== "{}"
                                    ) {
                                        this.applyTransformations();
                                    }
                                    resolve();
                                } catch (binaryError) {
                                    reject(
                                        new Error(
                                            `Failed to parse scene file: ${binaryError.message}`
                                        )
                                    );
                                }
                            })
                            .catch((binaryLoadError) => {
                                reject(binaryLoadError);
                            });
                    }
                })
                .catch((loadError) => {
                    reject(loadError);
                })
                .finally(() => {
                    self._hideLoadingScreen();
                    self._loading = false;
                });
        });
    };

    p._loadSceneFile = function (filePath, encoding) {
        return this.fileManager.load(
            this.elem.id,
            filePath,
            "",
            encoding || ""
        );
    };

    p.load = function (json) {
        if (!json) return;

        const project = json.project || {};

        // Apply project settings to renderer
        if (project.shadows !== undefined)
            this._renderer.shadowMap.enabled = project.shadows;
        if (project.shadowType !== undefined)
            this._renderer.shadowMap.type = project.shadowType;
        if (project.toneMapping !== undefined)
            this._renderer.toneMapping = project.toneMapping;
        if (project.toneMappingExposure !== undefined)
            this._renderer.toneMappingExposure = project.toneMappingExposure;

        this.setScene(this._loader.parse(json.scene));
        this.setCamera(this._loader.parse(json.camera));

        // Clear previous event handlers
        this._events = {
            init: [],
            start: [],
            stop: [],
            keydown: [],
            keyup: [],
            pointerdown: [],
            pointerup: [],
            pointermove: [],
            update: [],
        };

        // Process scripts if enabled
        if (this.settings.enableScripts && json.scripts) {
            this._processScripts(json.scripts);
        }

        this._dispatchEvent("init", arguments);
    };

    p._processScripts = function (scripts) {
        var scriptWrapParams = "player,renderer,scene,camera";
        var scriptWrapResultObj = {};

        for (var eventKey in this._events) {
            scriptWrapParams += "," + eventKey;
            scriptWrapResultObj[eventKey] = eventKey;
        }

        var scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(
            /\"/g,
            ""
        );

        for (var uuid in scripts) {
            var object = this._scene.getObjectByProperty("uuid", uuid, true);

            if (object === undefined) {
                console.warn("ThreejsViewer: Script without object.", uuid);
                continue;
            }

            var objectScripts = scripts[uuid];

            for (let i = 0; i < objectScripts.length; i++) {
                var script = objectScripts[i];

                try {
                    // Create a function that preserves the object context
                    var scriptFunction = new Function(
                        scriptWrapParams,
                        `with(this) { ${script.source} \nreturn ${scriptWrapResult}; }`
                    );

                    // Call the function with object as 'this' context
                    var functions = scriptFunction.call(
                        object,
                        this,
                        this._renderer,
                        this._scene,
                        this._camera
                    );

                    for (var name in functions) {
                        if (functions[name] === undefined) continue;

                        if (this._events[name] === undefined) {
                            console.warn(
                                "ThreejsViewer: Event type not supported (",
                                name,
                                ")"
                            );
                            continue;
                        }

                        // Bind the function to the object context
                        this._events[name].push(functions[name].bind(object));
                    }
                } catch (e) {
                    console.error("Error processing script:", e);
                }
            }
        }
    };

    p.setCamera = function (camera) {
        this._camera = camera;
        if (this._camera) {
            this._camera.aspect =
                this._container.width() / this._container.height();
            this._camera.updateProjectionMatrix();

            if (this.settings.enableControls) {
                this._controls = new OrbitControls.OrbitControls(
                    this._camera,
                    this._renderer.domElement
                );
                this._controls.update();
            }
        }
    };

    p.setScene = function (scene) {
        this._scene = scene;
        this._fitSceneToView();
    };

    p.setPixelRatio = function (pixelRatio) {
        this._renderer.setPixelRatio(pixelRatio);
    };

    p.setSize = function (width, height) {
        this.width = width;
        this.height = height;

        if (this._camera) {
            this._camera.aspect = width / height;
            this._camera.updateProjectionMatrix();
        }

        this._renderer.setSize(width, height);
    };

    p._dispatchEvent = function (type, args) {
        if (!this.settings.enableScripts) {
            console.warn("Scripts are disabled. Event not dispatched:", type);
            return;
        }
        const handlers = this._events[type] || [];
        for (let i = 0; i < handlers.length; i++) {
            try {
                handlers[i](args);
            } catch (e) {
                console.error(`Error in ${type} event handler:`, e);
            }
        }
    };

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

        if (this._controls) {
            this._controls.target.copy(center);
            this._controls.update();
        }
    };
    // Animation and playback control
    p.play = function () {
        if (this._playing) return;

        this._startTime = this._prevTime = performance.now();

        // Add event listeners
        this._container.on("keydown", this._onKeyDown.bind(this));
        this._container.on("keyup", this._onKeyUp.bind(this));
        this._container.on("pointerdown", this._onPointerDown.bind(this));
        this._container.on("pointerup", this._onPointerUp.bind(this));
        this._container.on("pointermove", this._onPointerMove.bind(this));

        this._dispatchEvent("start", arguments);

        this._playing = true;
        this._animate();
    };

    p.stop = function () {
        if (!this._playing) return;

        // Remove event listeners
        this._container.off("keydown", this._onKeyDown.bind(this));
        this._container.off("keyup", this._onKeyUp.bind(this));
        this._container.off("pointerdown", this._onPointerDown.bind(this));
        this._container.off("pointerup", this._onPointerUp.bind(this));
        this._container.off("pointermove", this._onPointerMove.bind(this));

        this._dispatchEvent("stop", arguments);

        this._playing = false;
        cancelAnimationFrame(this._animationFrameId);
    };

    p._animate = function () {
        this._animationFrameId = requestAnimationFrame(
            this._animate.bind(this)
        );

        const time = performance.now();

        try {
            if (this._playing) {
                this._dispatchEvent("update", {
                    time: time - this._startTime,
                    delta: time - this._prevTime,
                });
            }
        } catch (e) {
            console.error("Error in animation loop:", e);
        }

        if (breaseConfig.editMode && this._cube) {
            this._cube.rotation.x += 0.01;
            this._cube.rotation.y += 0.01;
        }

        if (this._controls) {
            this._controls.update();
        }

        this._animateAnimation();

        this._renderer.render(this._scene, this._camera);
        this._prevTime = time;
    };

    // Event handlers
    p._onKeyDown = function (event) {
        this._dispatchEvent("keydown", event);
    };

    p._onKeyUp = function (event) {
        this._dispatchEvent("keyup", event);
    };

    p._onPointerDown = function (event) {
        this._dispatchEvent("pointerdown", event);
    };

    p._onPointerUp = function (event) {
        this._dispatchEvent("pointerup", event);
    };

    p._onPointerMove = function (event) {
        this._dispatchEvent("pointermove", event);
    };

    p._initMockThreeJs = function () {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x777777);

        this._camera = new THREE.PerspectiveCamera(
            75,
            this._container.width() / this._container.height(),
            0.1,
            1000
        );
        this._camera.position.z = 5;

        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(
            this._container.width(),
            this._container.height()
        );
        this._container.append(this._renderer.domElement);

        this._addEditorDemoContent();
        this._animate();
    };

    p._addEditorDemoContent = function () {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this._scene.add(ambientLight);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.5,
            roughness: 0.5,
        });
        this._cube = new THREE.Mesh(geometry, material);
        this._scene.add(this._cube);

        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(1, 3, 1);
        spotLight.castShadow = true;
        spotLight.target = this._cube;
        this._scene.add(spotLight);
        this._scene.add(spotLight.target);
    };

    p._initEditor = function () {
        var editorHandles = new EditorHandles(this);
        this.getHandles = function () {
            return editorHandles.getHandles();
        };
        this.designer.getSelectionDecoratables = function () {
            return editorHandles.getSelectionDecoratables();
        };
        this.dispatchEvent(
            new CustomEvent(BreaseEvent.WIDGET_EDITOR_IF_READY, {
                bubbles: true,
            })
        );
    };

    p._onWindowResize = function () {
        this._camera.aspect =
            this._container.width() / this._container.height();
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(
            this._container.width(),
            this._container.height()
        );
    };

    p.applyTransformations = function () {
        if (!this._transformValue || this._transformValue === "{}") return;

        try {
            const transforms = JSON.parse(this._transformValue);
            this._queueTransforms(transforms);
            this._processTransformQueue();
        } catch (e) {
            console.error("Error parsing transform JSON:", e);
        }
    };

    p._queueTransforms = function (transforms) {
        // Clear any pending transforms
        this._transformQueue = [];

        // Handle array or single transform
        if (Array.isArray(transforms)) {
            this._transformQueue.push(...transforms);
        } else {
            this._transformQueue.push(transforms);
        }
    };

    p._processTransformQueue = function () {
        this._transformQueue.forEach((transform) => {
            // Skip if target not found
            const target = this._scene.getObjectByName(transform.target);
            if (!target) {
                console.warn(`Transform target not found: ${transform.target}`);
                return;
            }

            // Apply immediate transformations
            if (transform.immediate) {
                this._applyImmediateTransform(target, transform);
            }

            // Queue animation if duration specified
            if (transform.duration > 0) {
                this._queueAnimation(target, transform);
            }
        });

        // Clear queue after processing
        this._transformQueue = [];
    };

    p._applyImmediateTransform = function (target, transform) {
        if (transform.position) {
            target.position.set(
                transform.position.x !== undefined
                    ? transform.position.x
                    : target.position.x,
                transform.position.y !== undefined
                    ? transform.position.y
                    : target.position.y,
                transform.position.z !== undefined
                    ? transform.position.z
                    : target.position.z
            );
        }

        if (transform.rotation) {
            target.rotation.set(
                transform.rotation.x !== undefined
                    ? transform.rotation.x
                    : target.rotation.x,
                transform.rotation.y !== undefined
                    ? transform.rotation.y
                    : target.rotation.y,
                transform.rotation.z !== undefined
                    ? transform.rotation.z
                    : target.rotation.z
            );
        }

        if (transform.scale) {
            target.scale.set(
                transform.scale.x !== undefined
                    ? transform.scale.x
                    : target.scale.x,
                transform.scale.y !== undefined
                    ? transform.scale.y
                    : target.scale.y,
                transform.scale.z !== undefined
                    ? transform.scale.z
                    : target.scale.z
            );
        }
    };

    p._queueAnimation = function (target, transform) {
        const animationId = `transform_${transform.target}_${Date.now()}`;
        // Convert rotation degrees to radians for animation
        const endRotation = new THREE.Euler(
            transform.rotation?.x !== undefined
                ? THREE.MathUtils.degToRad(transform.rotation.x)
                : target.rotation.x,
            transform.rotation?.y !== undefined
                ? THREE.MathUtils.degToRad(transform.rotation.y)
                : target.rotation.y,
            transform.rotation?.z !== undefined
                ? THREE.MathUtils.degToRad(transform.rotation.z)
                : target.rotation.z
        );
        // Set up animation data
        const animation = {
            target: target,
            startTime: Date.now(),
            duration: transform.duration * 1000, // Convert to ms
            easing: transform.easing || "linear",
            startPosition: target.position.clone(),
            startRotation: target.rotation.clone(),
            startScale: target.scale.clone(),
            endPosition: new THREE.Vector3(
                transform.position?.x ?? target.position.x,
                transform.position?.y ?? target.position.y,
                transform.position?.z ?? target.position.z
            ),
            endRotation: endRotation,
            endScale: new THREE.Vector3(
                transform.scale?.x ?? target.scale.x,
                transform.scale?.y ?? target.scale.y,
                transform.scale?.z ?? target.scale.z
            ),
        };

        // Add to active animations
        this._activeAnimations[animationId] = animation;
    };

    p._animateAnimation = function () {
        // Update all active animations
        Object.entries(this._activeAnimations).forEach(([id, anim]) => {
            const elapsed = Date.now() - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            const t = this._applyEasing(progress, anim.easing);

            // Interpolate position
            anim.target.position.lerpVectors(
                anim.startPosition,
                anim.endPosition,
                t
            );

            // Interpolate rotation
            anim.target.rotation.x =
                anim.startRotation.x +
                (anim.endRotation.x - anim.startRotation.x) * t;
            anim.target.rotation.y =
                anim.startRotation.y +
                (anim.endRotation.y - anim.startRotation.y) * t;
            anim.target.rotation.z =
                anim.startRotation.z +
                (anim.endRotation.z - anim.startRotation.z) * t;

            // Interpolate scale
            anim.target.scale.lerpVectors(anim.startScale, anim.endScale, t);

            // Handle completion
            if (progress === 1) {
                delete this._activeAnimations[id];
                if (Object.keys(this._activeAnimations).length === 0) {
                    /**
                     * @event TransformDone
                     * @iatStudioExposed
                     * Fired when an animation is finished.
                     *
                     * @param {String} id Identifier of the animation
                     */
                    this.dispatchServerEvent("TransformDone", {
                        id: id,
                    });
                }
            }
        });
    };

    p._applyEasing = function (t, easingType) {
        switch (easingType) {
            case "easeIn":
                return t * t;
            case "easeOut":
                return t * (2 - t);
            case "easeInOut":
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t; // linear
        }
    };

    /**
     * @method setTransform
     * @iatStudioExposed
     * Set transformations for the scene.
     * @param {String} value
     */
    p.setTransform = function (value) {
        this._transformValue = value;
        if (this._scene && Object.keys(this._activeAnimations).length === 0) {
            this.applyTransformations();
        }
    };

    /**
     * @method getTransform
     * @iatStudioExposed
     * Get current transformations for the scene.
     * @return {String}
     */
    p.getTransform = function () {
        return this._transformValue;
    };

    // Widget registration
    if (window.lib_br?.controller?.widgetRegistry) {
        lib_br.controller.widgetRegistry.define(
            "widgets.3dviewer.ThreejsViewer",
            WidgetClass
        );
    }

    return WidgetClass;
});
