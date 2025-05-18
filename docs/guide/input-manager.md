# Scene Management in Ironclad Engine

The `SceneManager` is a crucial component of the Ironclad Engine, responsible for controlling the flow of your game by managing different game states or screens, known as "scenes." This guide explains how to use the `SceneManager` and structure your scenes.

## Core Concepts

- **Scene:** A scene represents a distinct part of your game, such as a main menu, the overworld, a battle screen, a pause menu, or an inventory screen. Each scene typically has its own logic for initialization, updates, rendering, and cleanup.
- **Scene Manager (`SceneManager.js`):** This engine module keeps track of all available scenes and manages a "scene stack."
- **Scene Stack:** An array of active scenes. The scene at the top of the stack is generally the one that is primarily active (receiving updates, handling input). This stack allows for overlaying scenes, like a pause menu appearing on top of the game world.
- **Modal vs. Non-Modal Scenes:**
  - **Modal scenes** (e.g., pause menu, options menu) typically block updates to scenes below them in the stack. This is the default behavior for scenes.
  - **Non-modal scenes** (e.g., a HUD) are overlays that allow scenes below them to continue updating.

## Scene Lifecycle

Each scene you create should implement a set of lifecycle methods that the `SceneManager` will call at appropriate times. Your scenes should at least have:

- `initialize(engine, context, data)`: Called when the scene is first activated (either by `switchTo` or `pushScene`).
  - `engine`: The main `IroncladEngine` instance.
  - `context`: The rendering context for the scene (typically the engine's offscreen context if using an effects pipeline, or the main canvas context).
  - `data`: An optional object containing data passed from the previous scene or the `switchTo`/`pushScene` call.
- `update(deltaTime, engine)`: Called every frame by the `SceneManager` if the scene is active (top of the stack, or a non-modal scene lower in the stack that's allowed to update). Game logic, input handling, and UI element updates typically go here.
- `render(context, engine)`: Called every frame by the `SceneManager` for each visible scene in the stack (rendered from bottom to top). All drawing operations for the scene occur here.
- `unload(engine)`: Called when the scene is being permanently removed from the stack (e.g., by `popScene` or when `switchTo` clears the stack). Use this to clean up resources, remove event listeners, etc.

Optional lifecycle methods include:

- `pause(engine)`: Called on a scene when a new modal scene is pushed on top of it.
- `resume(engine, data)`: Called on a scene when it becomes the top-most active scene again after a scene above it was popped. `data` is any data passed back by the popped scene.

**Note on `BaseScene`:** While not mandatory, creating a `BaseScene` class that your game scenes can extend is highly recommended. `BaseScene` can provide default implementations for these lifecycle methods and common properties like `this.engine`, `this.isModal`, and helpers for managing UI elements (`this.uiElements`, `addUIElement`, `updateUIElements`, `renderUIElements`).

## SceneManager Operations

The `SceneManager` instance is typically accessed via `engine.sceneManager`.

### 1. Registering Scenes

In the current engine setup, scenes are usually instantiated by `IroncladEngine.js` during its initialization phase and then added to the `SceneManager`.

- **`engine._registerScenes()` (in `IroncladEngine.js`):**
  This method iterates through the `sceneRegistry` (provided in the engine config) and calls:
  ```javascript
  this.sceneManager.add(sceneName, new SceneClass())
  ```
  - `sceneName`: The string key for the scene (e.g., "overworld", "PauseScene").
  - `new SceneClass()`: An instance of your scene class.
- **`sceneManager.setContextAndEngine(context, engine)` (in `IroncladEngine.js`):**
  This method must be called to provide the `SceneManager` with the necessary rendering context (usually the offscreen context if using the `EffectsManager`) and a reference to the engine.

### 2. Switching Scenes (`switchTo`)

`engine.sceneManager.switchTo(sceneName, data = {})`

- Clears the entire current scene stack (calling `unload` on all existing scenes).
- Pushes the new scene (identified by `sceneName`) onto the stack as the base scene.
- Calls the `initialize(engine, context, data)` method of the new scene. (Note: Your current `SceneManager` passes `context` as the second argument here, while `pushScene` passes `data` as the second argument to `initialize`. For consistency with `BaseScene` expecting `(engine, data)`, you might update `switchTo` to match `pushScene`'s `initialize` call signature).

**Example:**

```javascript
// In IroncladEngine.start()
this.sceneManager.switchTo('loading', { gameName: "Tartu Legends" });
3. Pushing Scenes (pushScene)engine.sceneManager.pushScene(sceneName, data = {})Pauses the current top-most scene (if it has a pause() method).Adds the new scene (identified by sceneName) to the top of the stack, making it the new active scene.Calls the initialize(engine, data) method of the new scene. (Note: Your current SceneManager passes data as the second argument here, which aligns with BaseScene expecting (engine, data)).Example:// In OverworldScene.update(), when 'P' is pressed:
const uiContextData = { /* ... current game settings ... */ };
this.engine.sceneManager.pushScene('PauseScene', { uiContext: uiContextData });
4. Popping Scenes (popScene)engine.sceneManager.popScene(dataToPassDown = {})Removes the current top-most scene from the stack.Calls the unload() method of the popped scene.Resumes the new top-most scene (if it has a resume(engine, dataToPassDown) method), passing any dataToPassDown.Example:// In PauseScene, when "Close" button is clicked:
this.engine.sceneManager.popScene({ settingsChanged: true });
Modal vs. Non-Modal Scene Updatesscene.isModal Property: Each scene instance can have an isModal property (boolean).If isModal is true (or undefined, as it defaults to true in the SceneManager.update logic), when this scene is active and being updated, the SceneManager will not update any scenes below it in the stack. This is typical for menus that should pause the game.If isModal is false (e.g., for a HUD scene), the SceneManager will update this scene and then continue to update the scene below it (and so on, until a modal scene is encountered or the bottom of the stack is reached).Example (HUDScene.js):class HUDScene { // Or extends BaseScene
    constructor() {
        // super(); // If extending BaseScene
        this.isModal = false; // This allows scenes below to update
        // ...
    }
    // ... initialize, update, render, unload ...
}
Data Passing Between ScenesPushing Data: When calling pushScene(sceneName, data) or switchTo(sceneName, data), the data object is passed to the new scene's initialize method. This is useful for providing initial context or parameters.A common pattern is to pass a uiContext object: pushScene('OptionsMenu', { uiContext: this.gameSettings }).Returning Data: When calling popScene(dataToPassDown), the dataToPassDown object is passed to the resume method of the scene that is being uncovered. This allows a popped scene (like an options menu) to return results or signal changes to the scene it's returning to.Example Scene Structure (Standalone)// src/game/scenes/MyExampleScene.js

class MyExampleScene {
    constructor() {
        this.engine = null;
        this.isModal = true; // Default for most scenes
        this.message = "Hello!";
        // Initialize other scene-specific properties
    }

    // SceneManager calls initialize(engine, data) for pushScene
    // or initialize(engine, context, data) for switchTo (based on your current SceneManager)
    // Adjust signature based on how it's loaded or if using BaseScene
    async initialize(engine, initDataOrContext, optionalDataIfSwitch) {
        this.engine = engine;
        const data = optionalDataIfSwitch || initDataOrContext; // Adapt based on SceneManager version

        if (data && data.initialMessage) {
            this.message = data.initialMessage;
        }
        console.log(`${this.constructor.name}: Initialized. Message: ${this.message}`);
        // Setup UI elements, load scene-specific assets if not preloaded, etc.
    }

    async update(deltaTime, engine) {
        // Handle input for this scene
        if (engine.inputManager.isActionJustPressed('menuCancel')) {
            engine.sceneManager.popScene({ reason: "Cancelled by user" });
            return;
        }
        // Update scene logic, animations, UI elements
        // e.g., this.myButton.update(deltaTime, engine, engine.inputManager.getCanvasMousePosition());
    }

    async render(context, engine) {
        // Clear scene background (if this scene is responsible for it)
        context.fillStyle = 'blue';
        context.fillRect(0, 0, engine.canvas.width, engine.canvas.height);

        // Render scene elements
        context.fillStyle = 'white';
        context.font = '30px Arial';
        context.textAlign = 'center';
        context.fillText(this.message, engine.canvas.width / 2, engine.canvas.height / 2);

        // e.g., this.myButton.render(context, engine);
    }

    async pause(engine) {
        // console.log(`${this.constructor.name}: Paused.`);
    }

    async resume(engine, dataFromPoppedScene) {
        // console.log(`${this.constructor.name}: Resumed with data:`, dataFromPoppedScene);
        if (dataFromPoppedScene && dataFromPoppedScene.settingsUpdated) {
            // React to settings changes
        }
    }

    async unload(engine) {
        // console.log(`${this.constructor.name}: Unloaded. Clean up resources.`);
        // Remove event listeners, nullify large objects, etc.
    }
}

export default MyExampleScene;
By understanding and utilizing these SceneManager features and scene lifecycle methods, you can create well-structured and interactive game flows for Tartu Legends
```
