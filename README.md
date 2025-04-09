# mappView-3dviewer

This repository contains the `ThreejsViewer` widget, a 3D viewer for mappView from B&R Automation. The widget is built on top of [Three.js](https://threejs.org/) and is designed to load and interact with 3D scenes created using the [Three.js Editor](https://threejs.org/editor/). It supports scripting, transformations, and interactive controls, making it a versatile tool for visualizing and manipulating 3D content.

This widget uses the `mpFileManager` to load the 3D scene files. Please make sur to declare in the configuration the `mpFileManager`. Also make sure to have libarries `MpFile` and `MpServer` for the `mpFileManager` to work.

## Tested versions
- **Automation Studio**: `V6.1.1.14`
- **mappView**: `V6.1.1`
- **mappService**: `V6.1.0`
- **OPC UA C/S**: `V6.0.0`
- **Automation Runtime**: `V6.1.0`

## Features

- **Load 3D Scenes**: Load 3D scenes exported from the Three.js Editor, including objects, cameras, lights, and animations.
- **Scripting Support**: Execute scripts embedded in the scene for custom behaviors and interactions.
- **Transformations**: Apply transformations (position, rotation, scale) to objects in the scene, with support for animations and easing.
- **Interactive Controls**: Enable or disable camera controls (OrbitControls) for navigating the scene.
- **Auto-Play Animations**: Automatically play animations defined in the scene.
- **Responsive Design**: Automatically adjusts to the widget's container size.

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

### Transformations

Transformations allow you to modify the position, rotation, and scale of objects in the scene. These can be applied immediately or animated over time. The `transform` property accepts a JSON string with the following structure, you can use multiple transformations separated by a comma and with brackets:

```json
[
  {
    "target": "objectName",
    "position": { "x": 1, "y": 2, "z": 3 },
    "rotation": { "x": 45, "y": 0, "z": 90 },
    "scale": { "x": 1.5, "y": 1.5, "z": 1.5 },
    "duration": 2,
    "easing": "easeInOut",
    "immediate": false
  },
  {
    // Another transformation object
  }
]
```

- `target`: The name of the object to be transformed (required).
- `position`: The target position of the object (optional).
- `rotation`: The target rotation of the object in degrees (optional).
- `scale`: The target scale of the object (optional).
- `duration`: The duration of the animation in seconds (optional, default is 0).
- `easing`: Easing function for the animation (linear, easeIn, easeOut, easeInOut) (optional, default is linear).
- `immediate`: If true, the transformation is applied immediately without animation (optional, default is false).

Example Transformation
```json
{
  "target": "Cube",
  "position": { "x": 1, "y": 2, "z": 3 },
  "rotation": { "x": 45, "y": 0, "z": 90 },
  "scale": { "x": 1.5, "y": 1.5, "z": 1.5 },
  "duration": 2,
  "easing": "easeInOut",
  "immediate": false
}
```

## Events

The widget emits several events that can be used to trigger actions in the mappView environment:
| Event Name         | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| `TransformDone` | Emitted when a transformation is completed.                                 |


## Notes
- Ensure the 3D scene file is exported from the [Three.js Editor](https://threejs.org/editor/).
- Scripts embedded in the scene must be compatible with the widget's scripting engine.
- The widget requires a modern browser with WebGL support.

For more information, refer to the [Three.js documentation](https://threejs.org/docs/). 
