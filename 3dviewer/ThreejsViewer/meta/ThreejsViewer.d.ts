interface widgets_3dviewer_ThreejsViewer{
        
        /**
        * Sets focus on the widget element, if it can be focused and keyboardOperation=true
        */
        focus(): void;

        /**
        * Get the current state of the scene loaded property.
        */
        getSceneLoaded(): boolean;

        /**
        * Get current transformations for the scene.
        */
        getTransform(): string;

        /**
        * Start event handling for the scene and dispatch "start" event.
        */
        playScene(): void;

        /**
        * Play a specific script by name from the Three.js editor scene.
        */
        playScript(scriptName: string): void;

        /**
        * Sets the state of property "enable"
        */
        setEnable(value: boolean): void;

        /**
        * 
        */
        setStyle(value: StyleReference): void;

        /**
        * Set transformations for the scene.
        */
        setTransform(value: string): void;

        /**
        * Sets the state of property "visible"
        */
        setVisible(value: boolean): void;

        /**
        * 
        */
        showTooltip(): void;

        /**
        * Stop event handling for the scene and dispatch "stop" event.
        */
        stopScene(): void;

        /**
        * Stop a specific script by name from the Three.js editor scene.
        */
        stopScript(scriptName: string): void; 
        
        /**
        * Fired when element is clicked on.
        */
        click(handler: (e: { detail: { origin: string, horizontalPos: string, verticalPos: string } }) => void):void;

        /**
        * Fired when disabled element is clicked on.
        */
        disabledClick(handler: (e: { detail: { origin: string, hasPermission: boolean, horizontalPos: string, verticalPos: string } }) => void):void;

        /**
        * Fired when operability of the widget changes.
        */
        enableChanged(handler: (e: { detail: { value: boolean } }) => void):void;

        /**
        * Fired when the widgets gets focus
        */
        focusIn(handler: () => void):void;

        /**
        * Fired when the widgets lost focus
        */
        focusOut(handler: () => void):void;

        /**
        * Triggered when the scene is loaded.
        */
        sceneLoaded(handler: () => void):void;

        /**
        * Triggered when the transformation is done.
        */
        transformDone(handler: (e: { detail: { id: string } }) => void):void;

        /**
        * Fired when the visibility of the widget changes.
        */
        visibleChanged(handler: (e: { detail: { value: boolean } }) => void):void;       
}
interface widgets_3dviewer_ThreejsViewer_private extends widgets_3dviewer_ThreejsViewer{
         
               
}