# mappView-3dviewer

This repository contains the `ThreejsViewer` widget, a 3D viewer for mappView from B&R Automation. The widget is built on top of [Three.js](https://threejs.org/) and is designed to load and interact with 3D scenes created using the [Three.js Editor](https://threejs.org/editor/). It supports scripting, transformations, and interactive controls, making it a versatile tool for visualizing and manipulating 3D content.

This widget uses the `mpFileManager` to load the 3D scene files. Please make sur to declare in the configuration the `mpFileManager`. Also make sure to have libarries `MpFile` and `MpServer` for the `mpFileManager` to work.

## Minimum versions
- **Automation Studio**: `V6.3.3.14`
- **mappView**: `V6.4.0`
- **mappService**: `V6.4.0`

## Features

- **Load 3D Scenes**: Load 3D scenes exported from the Three.js Editor, including objects, cameras, lights, and animations.
- **Scripting Support**: Execute scripts embedded in the scene for custom behaviors and interactions.
- **Transformations**: Apply transformations (position, rotation, scale) to objects in the scene, with support for animations and easing.
- **Interactive Controls**: Enable or disable camera controls (OrbitControls) for navigating the scene.
- **Auto-Play Animations**: Automatically play animations defined in the scene.
- **Responsive Design**: Automatically adjusts to the widget's container size.
- **Bind Attribute**: Struct to bind attributes from the scene to opcua variable properties

## Configuration Options

The widget provides several configuration options that can be set via the mappView editor:

### Properties

| Property           | Type      | Default Value | Description                                                                |
|--------------------|-----------|---------------|----------------------------------------------------------------------------|
| `sceneFilePath`    | `String`  | `''`          | Path to the scene file to be loaded (default is app.json).                 |
| `enableScripts`    | `Boolean` | `true`        | Enable or disable the execution of scripts embedded in the scene.          |
| `enableControls`   | `Boolean` | `true`        | Enable or disable camera controls (OrbitControls).                         |
| `autoPlay`         | `Boolean` | `false`       | Automatically play animations in the scene.                                |
| `transform`        | `String`  | `'{}'`        | JSON configuration for object transformations with animation support.      |
| `sceneLoaded`      | `Boolean` | ``            | Read-only bindable property to know when the scene is loaded               |
| `bindAttribute`    | `Struct`  | `{}`          | Struct to bind attributes from the scene to opcua variable properties max 50 |

### bindAttribute Struct

The `bindAttribute` struct allows you to bind specific attributes of objects in the 3D scene to OPC UA variable properties. This enables real-time synchronization between the 3D scene and your OPC UA server.

| Field Name        | Type      | Description                                                                 |
|-------------------|-----------|-----------------------------------------------------------------------------|
| `componentName`   | `String`  | The name of the object in the 3D scene to bind.                             |
| `attributeName`   | `String`  | The attribute of the object to bind (posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, visible) |
| `value`           | `String`  | Bind the opcua variable property to the attribute of the object             |

### Transformations

Transformations allow you to modify the position, rotation, and scale of objects in the scene. These can be applied immediately or animated over time. The `transform` property accepts a JSON string with the following structure, you can use multiple transformations separated by a comma and with brackets:

```json
[
  {
    "target": "objectName",
    "position": { "x": 1, "y": 2, "z": 3 },
    "rotation": { "x": 1.57, "y": 0, "z": 3.14 },
    "scale": { "x": 1.5, "y": 1.5, "z": 1.5 },
    "duration": 2,
    "easing": "easeInOut",
    "immediate": false
  },
  {
    "target": "objectName",
    "visible": false,
    "immediate": true
  }
]
```

- `target`: The name of the object to be transformed (required).
- `position`: The target position of the object (optional).
- `rotation`: The target rotation of the object in radians (Euler angles) (optional).
- `scale`: The target scale of the object (optional).
- `duration`: The duration of the animation in seconds (optional, default is 0).
- `color`: The target color of the object in an array of 3 USINT (0-255) (optional), only works on target that already has a material.
- `easing`: Easing function for the animation (linear, easeIn, easeOut, easeInOut) (optional, default is linear).
- `immediate`: If true, the transformation is applied immediately without animation (optional, default is false).
- `visible` : Change visibility of the target (optional), only works if `immediate` is set to `true`

Example Transformation
```json
[
  {
    "target": "Cube",
    "position": { "x": 1, "y": 2, "z": 3 },
    "rotation": { "x": 0, "y": 0, "z": 0 },
    "scale": { "x": 1.5, "y": 1.5, "z": 1.5 },
    "duration": 2,
    "easing": "easeInOut",
    "immediate": false
  },
  {
    "target": "Cube",
    "color": [255, 0, 0],
    "visible": false,
    "immediate": true
  }
]
```

## Events

The widget emits several events that can be used to trigger actions in the mappView environment:
| Event Name         | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `TransformDone` | Emitted when a transformation is completed.                                    |
| `SceneLoaded`    | Emitted when the scene is fully loaded and ready for interaction.             |

## Actions

The widget provides several actions that can be triggered from the mappView environment:
| Action Name        | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `playScene`        | Start event handling for the scene and dispatch "start" event.              |
| `stopScene`        | Stop event handling for the scene and dispatch "stop" event.                |
 

 ## Read actions
| Action Name        | Type      | Description                                                                 |
|--------------------|-----------|-----------------------------------------------------------------------------|
| `GetSceneLoaded`   | `Boolean` | Returns the value of the `sceneLoaded` property.                            |
| `GetTransform`     | `String`  | Returns the current transformation configuration.                           |


## Notes
- Ensure the 3D scene file is exported from the [Three.js Editor](https://threejs.org/editor/).
- Scripts embedded in the scene must be compatible with the widget's scripting engine.
- The widget requires a modern browser with WebGL support.

For more information, refer to the [Three.js documentation](https://threejs.org/docs/). 
# mappView-3dviewer

This repository contains the `ThreejsViewer` widget, a 3D viewer for mappView from B&R Automation. The widget is built on top of [Three.js](https://threejs.org/) and is designed to load and interact with 3D scenes created using the [Three.js Editor](https://threejs.org/editor/). It supports scripting, transformations, and interactive controls, making it a versatile tool for visualizing and manipulating 3D content.

This widget uses the `mpFileManager` to load the 3D scene files. Please make sur to declare in the configuration the `mpFileManager`. Also make sure to have libarries `MpFile` and `MpServer` for the `mpFileManager` to work.

## Minimum versions
- **Automation Studio**: `V6.3.3.14`
- **mappView**: `V6.4.0`
- **mappService**: `V6.4.0`

## Features

- **Load 3D Scenes**: Load 3D scenes exported from the Three.js Editor, including objects, cameras, lights, and animations.
- **Scripting Support**: Execute scripts embedded in the scene for custom behaviors and interactions.
- **Transformations**: Apply transformations (position, rotation, scale) to objects in the scene, with support for animations and easing.
- **Interactive Controls**: Enable or disable camera controls (OrbitControls) for navigating the scene.
- **Auto-Play Animations**: Automatically play animations defined in the scene.
- **Responsive Design**: Automatically adjusts to the widget's container size.
- **Bind Attribute**: Struct to bind attributes from the scene to opcua variable properties

## Configuration Options

The widget provides several configuration options that can be set via the mappView editor:

### Properties

| Property           | Type      | Default Value | Description                                                                                          |
|--------------------|-----------|---------------|------------------------------------------------------------------------------------------------------|
| `sceneFilePath`    | `String`  | `''`          | Path to the scene file to be loaded (must be exported from ThreeJs editor using "File" then "Save"). |
| `enableScripts`    | `Boolean` | `true`        | Enable or disable the execution of scripts embedded in the scene.                                    |
| `enableControls`   | `Boolean` | `true`        | Enable or disable camera controls (OrbitControls).                                                   |
| `autoPlay`         | `Boolean` | `false`       | Automatically play animations in the scene.                                                          |
| `transform`        | `String`  | `'{}'`        | JSON configuration for object transformations with animation support.                                |
| `sceneLoaded`      | `Boolean` | ``            | Read-only bindable property to know when the scene is loaded                                         |
| `bindAttribute`    | `Struct`  | `{}`          | Struct to bind attributes from the scene to opcua variable properties max 50                         |

### bindAttribute Struct

The `bindAttribute` struct allows you to bind specific attributes of objects in the 3D scene to OPC UA variable properties. This enables real-time synchronization between the 3D scene and your OPC UA server.

| Field Name        | Type      | Description                                                                 |
|-------------------|-----------|-----------------------------------------------------------------------------|
| `componentName`   | `String`  | The name of the object in the 3D scene to bind.                             |
| `attributeName`   | `String`  | The attribute of the object to bind (posX, posY, posZ, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, visible) |
| `value`           | `String`  | Bind the opcua variable property to the attribute of the object             |

### Transformations

Transformations allow you to modify the position, rotation, and scale of objects in the scene. These can be applied immediately or animated over time. The `transform` property accepts a JSON string with the following structure, you can use multiple transformations separated by a comma and with brackets:

```json
[
  {
    "target": "objectName",
    "position": { "x": 1, "y": 2, "z": 3 },
    "rotation": { "x": 1.57, "y": 0, "z": 3.14 },
    "scale": { "x": 1.5, "y": 1.5, "z": 1.5 },
    "duration": 2,
    "easing": "easeInOut",
    "immediate": false
  },
  {
    "target": "objectName",
    "visible": false,
    "immediate": true
  }
]
```

- `target`: The name of the object to be transformed (required).
- `position`: The target position of the object (optional).
- `rotation`: The target rotation of the object in radians (Euler angles) (optional).
- `scale`: The target scale of the object (optional).
- `duration`: The duration of the animation in seconds (optional, default is 0).
- `color`: The target color of the object in an array of 3 USINT (0-255) (optional), only works on target that already has a material.
- `easing`: Easing function for the animation (linear, easeIn, easeOut, easeInOut) (optional, default is linear).
- `immediate`: If true, the transformation is applied immediately without animation (optional, default is false).
- `visible` : Change visibility of the target (optional), only works if `immediate` is set to `true`

Example Transformation
```json
[
  {
    "target": "Cube",
    "position": { "x": 1, "y": 2, "z": 3 },
    "rotation": { "x": 0, "y": 0, "z": 0 },
    "scale": { "x": 1.5, "y": 1.5, "z": 1.5 },
    "duration": 2,
    "easing": "easeInOut",
    "immediate": false
  },
  {
    "target": "Cube",
    "color": [255, 0, 0],
    "visible": false,
    "immediate": true
  }
]
```

## Events

The widget emits several events that can be used to trigger actions in the mappView environment:
| Event Name         | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `TransformDone` | Emitted when a transformation is completed.                                    |
| `SceneLoaded`    | Emitted when the scene is fully loaded and ready for interaction.             |

## Actions

The widget provides several actions that can be triggered from the mappView environment:
| Action Name        | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `playScene`        | Start event handling for the scene and dispatch "start" event.              |
| `stopScene`        | Stop event handling for the scene and dispatch "stop" event.                |
 

 ## Read actions
| Action Name        | Type      | Description                                                                 |
|--------------------|-----------|-----------------------------------------------------------------------------|
| `GetSceneLoaded`   | `Boolean` | Returns the value of the `sceneLoaded` property.                            |
| `GetTransform`     | `String`  | Returns the current transformation configuration.                           |


## Notes
- Ensure the 3D scene file is exported using "File" then "Save" from the [Three.js Editor](https://threejs.org/editor/).
- Scripts embedded in the scene must be compatible with the widget's scripting engine.
- The widget requires a modern browser with WebGL support.

For more information, refer to the [Three.js documentation](https://threejs.org/docs/). 
