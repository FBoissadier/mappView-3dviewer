define([
    "brease",
    "widgets/3dviewer/common/libs/three.amd.min",
    "widgets/3dviewer/ThreejsViewer/libs/config/EditorHandles"
], function (brease, THREE, EditorHandles) {

    /**
     * @class widgets.3dviewer.ThreejsViewer.libs.Editor
     * @extends brease.core.Class
     * Handles editor-specific functionality for the ThreejsViewer widget
     */
    const Editor = brease.core.Class.extend(function Editor(widget) {
        this.widget = widget;
    });

    const p = Editor.prototype;

    /**
     * @method initMockThreeJs
     * Initialize mock Three.js content for editor mode
     */
    p.initMockThreeJs = function() {
        this.widget._model._scene = new THREE.Scene();
        this.widget._model._scene.background = new THREE.Color(0x777777);

        this.widget._model._camera = new THREE.PerspectiveCamera(
            75,
            this.widget._container.width() / this.widget._container.height(),
            0.1,
            1000
        );
        this.widget._model._camera.position.z = 5;
        this._addEditorDemoContent();
        this.widget._renderer.init();
        if (this.widget.settings.autoPlay === true) {
            this.widget._controller.play();
        }else{
            this.widget._controller.animate();
        }
    };

    /**
     * @method _addEditorDemoContent
     * Add demo content for editor mode
     * @private
     */
    p._addEditorDemoContent = function() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.widget._model._scene.add(ambientLight);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            metalness: 0.5,
            roughness: 0.5,
        });
        this.widget._cube = new THREE.Mesh(geometry, material);
        this.widget._model._scene.add(this.widget._cube);

        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(1, 3, 1);
        spotLight.castShadow = true;
        spotLight.target = this.widget._cube;
        this.widget._model._scene.add(spotLight);
        this.widget._model._scene.add(spotLight.target);
    };

    /**
     * @method initEditor
     * Initialize editor handles for widget customization
     */
    p.initEditor = function() {
        var editorHandles = new EditorHandles(this.widget);
        this.widget.getHandles = function() {
            return editorHandles.getHandles();
        };
        this.widget.designer.getSelectionDecoratables = function() {
            return editorHandles.getSelectionDecoratables();
        };
        this.widget.dispatchEvent(
            new CustomEvent(brease.events.BreaseEvent.WIDGET_EDITOR_IF_READY, {
                bubbles: true,
            })
        );
    };

    /**
     * @method rotateCube
     * Rotate the cube in the scene
     */
    p.rotateCube = function() {
        if (this.widget._cube) {
            this.widget._cube.rotation.x += 0.01;
            this.widget._cube.rotation.y += 0.01;
        }
    };

    return Editor;
});