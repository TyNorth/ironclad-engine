# Scene Management with SceneManager.js

The `SceneManager` is a vital component of the Ironclad Engine, designed to manage the different states or screens of your game, such as menus, game levels, UI overlays, and cutscenes. It controls which scene is currently active, how scenes are transitioned, and the overall flow of your application.

## Core Concepts

1. **Scene:**
   A scene represents a distinct part or state of your game. Each scene encapsulates its own logic for initialization, per-frame updates, rendering, and cleanup when it's no longer needed. Examples include a `MainMenuScene`, `OverworldScene`, `PauseScene`, or `InventoryScene`.

2. **Scene Stack:**
   The `SceneManager` maintains a stack of active scene instances.

   - The scene at the top of the stack is generally considered the primary active scene.
   - This stack structure naturally allows for overlaying scenes. For example, a `PauseScene` can be pushed on top of an `OverworldScene` without the `OverworldScene` being destroyed.

3. **Modal vs. Non-Modal Scenes:**
   - Scenes can define an `isModal` boolean property (defaulting to `true` if not specified).
   - **Modal scenes** (`isModal = true`): When a modal scene is at the top of the stack (or is the highest modal scene in the stack if overlays are above it), it blocks the `update` loop from propagating to scenes below it. This is typical for pause menus, options screens, or any UI that should halt the underlying game.
   - **Non-modal scenes** (`isModal = false`): These are typically overlays like a HUD. If a non-modal scene is at the top, the `SceneManager` will update it and then continue to update the scene(s) below it until a modal scene is encountered or the bottom of the stack is reached.
   - Rendering always happens from the bottom of the stack to the top, so overlays are drawn correctly.

## SceneManager Setup and Scene Registration

The `SceneManager` instance is created by the `IroncladEngine`. For it to function, two steps are crucial during engine initialization:

1. **`engine.sceneManager.setContextAndEngine(context, engine)`:**

   - This method must be called by the `IroncladEngine` to provide the `SceneManager` with:
     - The primary rendering `context` it will pass to scenes' `render` methods (this is usually the engine's _offscreen context_ if you're using the `EffectsManager`).
     - A reference to the `engine` instance, which the `SceneManager` then passes to scene lifecycle methods.

2. **`engine.sceneManager.add(sceneName, sceneInstance)`:**
   - The `IroncladEngine` typically iterates through a `sceneRegistry` (provided in its configuration) and, for each entry, instantiates the scene class (`new SceneClass()`) and then adds this _instance_ to the `SceneManager` using this method.
   - `sceneName` (string): A unique key to identify the scene (e.g., "overworld", "PauseScene").
   - `sceneInstance` (object): The actual pre-instantiated scene object.

## Scene Lifecycle Methods

Every scene managed by `SceneManager` should implement the following lifecycle methods. Using a `BaseScene` class that provides default implementations for these is highly recommended.

- **`async initialize(engine, data = {})`**:

  - Called by `SceneManager` when the scene is first activated (either by `switchTo` or `pushScene`).
  - `engine`: The `IroncladEngine` instance.
  - `data`: An optional object containing data passed from the previous scene or the `switchTo`/`pushScene` call.
  - Use this for one-time setup for this activation of the scene (e.g., creating UI elements, loading scene-specific assets if not preloaded).

- **`async update(deltaTime, engine)`**:

  - Called every frame by `SceneManager` if the scene is eligible for updates (see Modal vs. Non-Modal).
  - `deltaTime`: Time elapsed since the last frame (in seconds).
  - `engine`: The `IroncladEngine` instance.
  - Place your scene's game logic, input handling, and UI element updates here.

- **`async render(context, engine)`**:

  - Called every frame by `SceneManager` for visible scenes in the stack.
  - `context`: The rendering context (e.g., the engine's offscreen context).
  - `engine`: The `IroncladEngine` instance.
  - Perform all drawing operations for the scene here.

- **`async unload(engine)`**:

  - Called when the scene instance is being permanently removed from the stack (by `popScene` or `switchTo`).
  - Use this for cleanup: remove event listeners specific to this scene instance, nullify large objects, etc.

- **`async pause(engine)`** (Optional):

  - Called on the current top scene when a new modal scene is pushed on top of it.
  - Use this to pause animations, sounds, or any ongoing processes in the scene that should halt when it's no longer in the foreground.

- **`async resume(engine, data = {})`** (Optional):
  - Called on a scene when it becomes the top-most active modal scene again after a scene above it in the stack was popped.
  - `data`: The data object optionally passed by the `popScene` call of the scene that was just removed.
  - Use this to resume activities paused in `pause()` or to process results from the popped scene.

## Core `SceneManager` Operations

These are typically called from your game logic (e.g., within a scene's `update` method in response to input or game events).

### 1. `engine.sceneManager.switchTo(sceneName, data = {})`

- Clears the entire current scene stack (calling `unload` on all scenes in the stack).
- Retrieves the pre-instantiated scene (identified by `sceneName` from its internal `this.scenes` map).
- Pushes this scene instance onto the stack as the new base scene.
- Calls `newScene.initialize(engine, data)` on the new scene.

**Example:**

```javascript
// Typically called by the engine to start the first scene
this.engine.sceneManager.switchTo('MainMenuScene', { difficulty: 'normal' });
2. engine.sceneManager.pushScene(sceneName, data = {})Calls pause() on the current top-most scene (if it exists and has a pause method).Retrieves the pre-instantiated scene (identified by sceneName).Adds this scene instance to the top of the stack, making it the new active scene.Calls newScene.initialize(engine, data) on the new scene.Example:// In OverworldScene, when the pause button is pressed
const currentContext = { gameTime: this.worldTime, playerLocation: this.player.getPosition() };
this.engine.sceneManager.pushScene('PauseScene', { uiContext: currentContext });
3. engine.sceneManager.popScene(dataToPassDown = {})Removes the current top-most scene from the stack.Calls unload() on the popped scene.If there's a new scene now at the top of the stack, its resume(engine, dataToPassDown) method is called, passing along any dataToPassDown.Example:// In PauseScene, when the "Resume" button is clicked
this.engine.sceneManager.popScene({ from: 'PauseScene' });
4. Other Useful MethodsgetActiveSceneInstance(): Returns the instance of the scene currently at the top of the stack.getActiveSceneName(): Returns the name (string key) of the scene currently at the top of the stack.Data Passing Between ScenesTo a new scene: Use the data parameter in pushScene or switchTo. The new scene receives this in its initialize(engine, data) method. A common pattern is to pass a shared uiContext object:// Pushing scene
let myUIContext = { score: 100, itemsToDisplay: [...] };
this.engine.sceneManager.pushScene('InventoryScreen', { uiContext: myUIContext });

// InventoryScreen.initialize(engine, data)
// this.uiContext = data.uiContext;
From a popped scene back to the resuming scene: Use the dataToPassDown parameter in popScene. The resuming scene receives this in its resume(engine, data) method.// In OptionsMenuScene, when closing and applying settings
const settingsResult = { volume: this.uiContext.volume, applied: true };
this.engine.sceneManager.popScene({ settingsResult: settingsResult });

// In PauseMenuScene.resume(engine, data)
// if (data && data.settingsResult && data.settingsResult.applied) {
//   this.applyVolume(data.settingsResult.volume);
// }
By effectively using the SceneManager and adhering to the scene lifecycle, you can create a well-organized game with complex UIs and smooth transitions between different game states.
```
