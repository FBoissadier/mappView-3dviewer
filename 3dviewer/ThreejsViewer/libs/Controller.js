define(["brease", "widgets/3dviewer/common/libs/three.amd.min"], function (
    brease,
    THREE
) {
    "use strict";

    /**
     * @class widgets.3dviewer.ThreejsViewer.libs.Controller
     * @extends brease.core.Class
     * Handles all event and animation control for the ThreejsViewer widget
     */
    const Controller = brease.core.Class.extend(function Controller(widget) {
        this.widget = widget;
        this._transformValue = widget.settings.transform;
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
        this._namedScripts = {}; // Store scripts by name for selective playback
        this._activeScripts = {}; // Track which scripts are currently active (have registered handlers)
    });

    const p = Controller.prototype;

    /**
     * @method processScripts
     * Process scripts attached to objects in the scene
     * @param {Object} scripts - Scripts data
     */
    p.processScripts = function (scripts) {
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

        // Clear previous named scripts and active scripts
        this._namedScripts = {};
        this._activeScripts = {};

        for (var uuid in scripts) {
            var object = this.widget._model._scene.getObjectByProperty(
                "uuid",
                uuid,
                true
            );

            if (object === undefined) {
                console.iatWarn("ThreejsViewer: Script without object.", uuid);
                continue;
            }

            var objectScripts = scripts[uuid];

            for (let i = 0; i < objectScripts.length; i++) {
                var script = objectScripts[i];

                try {
                    var scriptFunction = new Function(
                        scriptWrapParams,
                        `with(this) { ${script.source} \nreturn ${scriptWrapResult}; }`
                    );

                    var functions = scriptFunction.call(
                        object,
                        this.widget._model,
                        this.widget._renderer._renderer,
                        this.widget._model._scene,
                        this.widget._model._camera
                    );

                    // Store script by name if it has one (but don't register handlers automatically)
                    if (script.name) {
                        this._namedScripts[script.name] = {
                            object: object,
                            functions: functions,
                            script: script
                        };
                    }
                    // Note: Scripts are NOT automatically registered to event handlers
                    // They must be explicitly activated via playScript()
                } catch (e) {
                    console.iatWarn("Error processing script:", e);
                }
            }
        }
    };

    /**
     * @method _dispatchEvent
     * Dispatch event to registered handlers
     * @param {String} type - Event type
     * @param {Array} args - Event arguments
     * @private
     */
    p._dispatchEvent = function (type, args) {
        if (!this.widget.settings.enableScripts) {
            // console.warn("Scripts are disabled. Event not dispatched:", type);
            return;
        }
        const handlers = this._events[type] || [];
        for (let i = 0; i < handlers.length; i++) {
            try {
                handlers[i](args);
            } catch (e) {
                console.iatWarn(`Error in ${type} event handler:`, e);
            }
        }
    };

    /**
     * @method play
     * Start animation playback
     */
    p.play = function () {
        if (this.widget._playing) return;

        this.widget._startTime = this.widget._prevTime = performance.now();

        // Add event listeners
        const container = this.widget._container;
        container.on("keydown", this._onKeyDown.bind(this));
        container.on("keyup", this._onKeyUp.bind(this));
        container.on("pointerdown", this._onPointerDown.bind(this));
        container.on("pointerup", this._onPointerUp.bind(this));
        container.on("pointermove", this._onPointerMove.bind(this));

        this._dispatchEvent("start", arguments);

        this.widget._playing = true;
        this.animate();
    };

    /**
     * @method stop
     * Stop animation playback
     */
    p.stop = function () {
        if (!this.widget._playing) return;

        // Remove event listeners
        const container = this.widget._container;
        container.off("keydown", this._onKeyDown.bind(this));
        container.off("keyup", this._onKeyUp.bind(this));
        container.off("pointerdown", this._onPointerDown.bind(this));
        container.off("pointerup", this._onPointerUp.bind(this));
        container.off("pointermove", this._onPointerMove.bind(this));

        this._dispatchEvent("stop", arguments);

        this.widget._playing = false;
        cancelAnimationFrame(this.widget._animationFrameId);
    };

    /**
     * @method _onKeyDown
     * Handle keydown event
     * @param {Object} event - Key event
     * @private
     */
    p._onKeyDown = function (event) {
        this._dispatchEvent("keydown", event);
    };

    /**
     * @method _onKeyUp
     * Handle keyup event
     * @param {Object} event - Key event
     * @private
     */
    p._onKeyUp = function (event) {
        this._dispatchEvent("keyup", event);
    };

    /**
     * @method _onPointerDown
     * Handle pointerdown event
     * @param {Object} event - Pointer event
     * @private
     */
    p._onPointerDown = function (event) {
        this._dispatchEvent("pointerdown", event);
    };

    /**
     * @method _onPointerUp
     * Handle pointerup event
     * @param {Object} event - Pointer event
     * @private
     */
    p._onPointerUp = function (event) {
        this._dispatchEvent("pointerup", event);
    };

    /**
     * @method _onPointerMove
     * Handle pointermove event
     * @param {Object} event - Pointer event
     * @private
     */
    p._onPointerMove = function (event) {
        this._dispatchEvent("pointermove", event);
    };

    /**
     * @method animate
     * Animation loop
     */
    p.animate = function () {
        this._animationFrameId = requestAnimationFrame(this.animate.bind(this));
        const time = performance.now();

        try {
            this._dispatchEvent("update", {
                time: time - this.widget._startTime,
                delta: time - this.widget._prevTime,
            });
        } catch (e) {
            console.iatWarn("Error in animation loop:", e);
            brease.services.logger.log(
                6004,
                brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                brease.enum.Enum.EventLoggerSeverity.WARNING,
                [],
                "Error in animation loop: \"" + e + "\". WidgetId: " + this.widget.elem.id
            );
        }

        if (brease.config.editMode) this.widget._editor.rotateCube();

        if (this.widget._renderer._controls) {
            this.widget._renderer.updateControls();
        }

        this._animateAnimation();
        this.widget._renderer.render();
        this.widget._prevTime = time;
    };

    /**
     * @method setTransform
     * Set transformations for the scene
     * @param {String} value - Transform value
     */
    p.setTransform = function (value) {
        this._transformValue = value;
        if (
            this.widget._model._scene &&
            Object.keys(this._activeAnimations).length === 0
        ) {
            this.applyTransformations();
        }
    };

    /**
     * @method getTransform
     * Get current transformations for the scene
     * @return {String} Current transform value
     */
    p.getTransform = function () {
        return this._transformValue;
    };

    /**
     * @method applyTransformations
     * Apply transformations to scene objects
     */
    p.applyTransformations = function () {
        if (!this._transformValue || this._transformValue === "{}") return;

        try {
            const transforms = JSON.parse(this._transformValue);
            this._queueTransforms(transforms);
            this._processTransformQueue();
        } catch (e) {
            brease.services.logger.log(
                6001,
                brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                brease.enum.Enum.EventLoggerSeverity.ERROR,
                [],
                "Error parsing transform JSON: " +
                    e +
                    ". WidgetId: " +
                    this.widget.elem.id
            );
            // console.iatWarn("Error parsing transform JSON:", e);
        }
    };

    /**
     * @method _queueTransforms
     * Queue transformations for processing
     * @param {Object|Array} transforms - Transformations to queue
     * @private
     */
    p._queueTransforms = function (transforms) {
        this._transformQueue = [];
        if (Array.isArray(transforms)) {
            this._transformQueue.push(...transforms);
        } else {
            this._transformQueue.push(transforms);
        }
    };

    /**
     * @method _processTransformQueue
     * Process queued transformations
     * @private
     */
    p._processTransformQueue = function () {
        this._transformQueue.forEach((transform) => {
            const targets = this._getTransformTargets(transform.target);

            if (!targets || targets.length === 0) {
                brease.services.logger.log(
                    6003,
                    brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                    brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                    brease.enum.Enum.EventLoggerSeverity.WARNING,
                    [],
                    "Transform target(s) not found: \"" + transform.target + "\". WidgetId: " + this.widget.elem.id
                );
                return;
            }

            targets.forEach((target) => {
                if (transform.immediate) {
                    this._applyImmediateTransform(target, transform);
                } else if (transform.duration > 0) {
                    this._queueAnimation(target, transform);
                }
            });
        });

        this._transformQueue = [];
    };

    /**
     * @method _getTransformTargets
     * Resolve transform targets by name
     * @param {String} targetNames - One or more target names
     * @return {Array} Array of target objects
     * @private
     */
    p._getTransformTargets = function (targetNames) {
        if (!targetNames) return [];

        // Single name
        return (
            this.widget._model._scene.getObjectsByProperty(
                "name",
                targetNames
            ) || []
        );
    };

    /**
     * @method _applyImmediateTransform
     * Apply immediate transformation to target object
     * @param {Object} target - Target object (THREE.Object3D)
     * @param {Object} transform - Transformation data
     * @private
     */
    p._applyImmediateTransform = function (target, transform) {
        if (transform.position) {
            target.position.set(
                transform.position.x ?? target.position.x,
                transform.position.y ?? target.position.y,
                transform.position.z ?? target.position.z
            );
        }

        if (transform.rotation) {
            target.rotation.set(
                transform.rotation.x ?? target.rotation.x,
                transform.rotation.y ?? target.rotation.y,
                transform.rotation.z ?? target.rotation.z
            );
        }

        if (transform.scale) {
            target.scale.set(
                transform.scale.x ?? target.scale.x,
                transform.scale.y ?? target.scale.y,
                transform.scale.z ?? target.scale.z
            );
        }

        if (transform.visible !== undefined) {
            target.visible = transform.visible;
        }

        if (transform.color && target.material) {
            if (Array.isArray(target.material)) {
                target.material.forEach((mat) => {
                    if (mat.color && transform.color) {
                        mat.color.set(transform.color[0], transform.color[1], transform.color[2]);
                    }
                });
            } else if (target.material.color && transform.color) {
                target.material.color.set(transform.color[0], transform.color[1], transform.color[2]);
            }
        } else if (target.material === undefined && transform.color) {
            brease.services.logger.log(
                6002,
                brease.enum.Enum.EventLoggerCustomer.CUSTOMER,
                brease.enum.Enum.EventLoggerVerboseLevel.OFF,
                brease.enum.Enum.EventLoggerSeverity.WARNING,
                [],
                "Target material is undefined. Color transform ignored. WidgetId: " +
                    this.widget.elem.id
            );
        }
    };

    /**
     * @method _queueAnimation
     * Queue animation for target object
     * @param {Object} target - Target object (THREE.Object3D)
     * @param {Object} transform - Transformation data
     * @private
     */
    p._queueAnimation = function (target, transform) {
        const animationId = `transform_${target.name}_${target.uuid}`;
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

        const animation = {
            target: target,
            startTime: Date.now(),
            duration: transform.duration * 1000,
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

        this._activeAnimations[animationId] = animation;
    };

    /**
     * @method _animateAnimation
     * Animate queued animations
     * @private
     */
    p._animateAnimation = function () {
        Object.entries(this._activeAnimations).forEach(([id, anim]) => {
            const elapsed = Date.now() - anim.startTime;
            const progress = Math.min(elapsed / anim.duration, 1);
            const t = this._applyEasing(progress, anim.easing);

            anim.target.position.lerpVectors(
                anim.startPosition,
                anim.endPosition,
                t
            );

            anim.target.rotation.x =
                anim.startRotation.x +
                (anim.endRotation.x - anim.startRotation.x) * t;
            anim.target.rotation.y =
                anim.startRotation.y +
                (anim.endRotation.y - anim.startRotation.y) * t;
            anim.target.rotation.z =
                anim.startRotation.z +
                (anim.endRotation.z - anim.startRotation.z) * t;

            anim.target.scale.lerpVectors(anim.startScale, anim.endScale, t);

            if (progress === 1) {
                delete this._activeAnimations[id];
                if (Object.keys(this._activeAnimations).length === 0) {
                    this.widget._fireTransformDone(id);
                }
            }
        });
    };

    /**
     * @method _applyEasing
     * Apply easing function to animation progress
     * @param {Number} t - Progress (0-1)
     * @param {String} easingType - Easing type (linear, easeIn, easeOut, easeInOut)
     * @return {Number} Eased progress
     * @private
     */
    p._applyEasing = function (t, easingType) {
        switch (easingType) {
            case "easeIn":
                return t * t;
            case "easeOut":
                return t * (2 - t);
            case "easeInOut":
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default:
                return t;
        }
    };

    /**
     * @method onBeforeSuspend
     * Handle suspend event
     * @private
     */
    p.onBeforeSuspend = function () {
        this.stop();
    };

    /**
     * @method suspend
     * Suspend event handling
     * @private
     */
    p.suspend = function () {
        cancelAnimationFrame(this._animationFrameId);
    };

    /**
     * @method wake
     * Wake up event handling
     * @private
     */
    p.wake = function () {
        this.play();
    };

    /**
     * @method playScript
     * Play a specific script by name
     * @param {String} scriptName - Name of the script to play
     */
    p.playScript = function (scriptName) {
        if (!this.widget.settings.enableScripts) {
            console.iatWarn("ThreejsViewer: Scripts are disabled. Cannot play script:", scriptName);
            return;
        }

        if (!scriptName || typeof scriptName !== 'string') {
            console.iatWarn("ThreejsViewer: Invalid script name provided:", scriptName);
            return;
        }

        const namedScript = this._namedScripts[scriptName];
        if (!namedScript) {
            console.iatWarn("ThreejsViewer: Script not found:", scriptName);
            return;
        }

        // Check if script is already active
        if (this._activeScripts[scriptName]) {
            // Script is already active, just execute start handler again
            const functions = namedScript.functions;
            const boundObject = namedScript.object;
            
            if (functions.start && typeof functions.start === 'function') {
                try {
                    functions.start.call(boundObject);
                } catch (e) {
                    console.iatWarn(`Error executing start handler for script "${scriptName}":`, e);
                }
            }
            return;
        }

        // Register the script's event handlers
        const functions = namedScript.functions;
        const boundObject = namedScript.object;
        const registeredHandlers = {};

        // Register all event handlers for this script
        for (var eventName in functions) {
            if (functions[eventName] === undefined) continue;

            if (this._events[eventName] === undefined) {
                console.iatWarn(
                    "ThreejsViewer: Event type not supported (",
                    eventName,
                    ") for script:",
                    scriptName
                );
                continue;
            }

            const boundHandler = functions[eventName].bind(boundObject);
            this._events[eventName].push(boundHandler);
            registeredHandlers[eventName] = boundHandler;
        }

        // Track this script as active
        this._activeScripts[scriptName] = {
            handlers: registeredHandlers
        };

        // Ensure scene is playing
        if (!this.widget._playing) {
            this.play();
        }

        // Execute init handler if present
        if (functions.init && typeof functions.init === 'function') {
            try {
                functions.init.call(boundObject);
            } catch (e) {
                console.iatWarn(`Error executing init handler for script "${scriptName}":`, e);
            }
        }

        // Execute start handler if present
        if (functions.start && typeof functions.start === 'function') {
            try {
                functions.start.call(boundObject);
            } catch (e) {
                console.iatWarn(`Error executing start handler for script "${scriptName}":`, e);
            }
        }
    };

    /**
     * @method stopScript
     * Stop a specific script by name
     * @param {String} scriptName - Name of the script to stop
     */
    p.stopScript = function (scriptName) {
        if (!scriptName || typeof scriptName !== 'string') {
            console.iatWarn("ThreejsViewer: Invalid script name provided:", scriptName);
            return;
        }

        const activeScript = this._activeScripts[scriptName];
        if (!activeScript) {
            console.iatWarn("ThreejsViewer: Script is not active:", scriptName);
            return;
        }

        const namedScript = this._namedScripts[scriptName];
        if (!namedScript) {
            console.iatWarn("ThreejsViewer: Script not found:", scriptName);
            return;
        }

        // Execute stop handler if present
        const functions = namedScript.functions;
        const boundObject = namedScript.object;
        
        if (functions.stop && typeof functions.stop === 'function') {
            try {
                functions.stop.call(boundObject);
            } catch (e) {
                console.iatWarn(`Error executing stop handler for script "${scriptName}":`, e);
            }
        }

        // Remove all registered handlers from event arrays
        const registeredHandlers = activeScript.handlers;
        for (var eventName in registeredHandlers) {
            const handler = registeredHandlers[eventName];
            const eventArray = this._events[eventName];
            if (eventArray) {
                const index = eventArray.indexOf(handler);
                if (index !== -1) {
                    eventArray.splice(index, 1);
                }
            }
        }

        // Remove from active scripts
        delete this._activeScripts[scriptName];
    };

    p.dispose = function () {
        this.stop();
        this._events = null;
        this._namedScripts = null;
        this._activeScripts = null;
        this.widget = null;
    };

    return Controller;
});
