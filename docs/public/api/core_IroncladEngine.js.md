# The IroncladEngine Class

The `IroncladEngine` class is the heart of the Ironclad Engine. It's the central orchestrator responsible for initializing all core systems, managing the main game loop, and providing access to various engine modules.

## Core Responsibilities

The `IroncladEngine` handles several critical tasks:

1.  **Initialization & Setup:**
    - Sets up the main game canvas and its 2D rendering context.
    - Creates and initializes an offscreen canvas for the rendering pipeline (used by the `EffectsManager`).
    - Instantiates and configures all core engine managers (AssetLoader, InputManager, SceneManager, EntityManager, etc.).
2.  **Game Loop Management:**
    - Utilizes `GameLoop.js` to drive the main `update` and `render` cycles at a consistent frame rate using `requestAnimationFrame`.
3.  **Update Orchestration:**
    - In its `_update(deltaTime)` method, it coordinates the update sequence for various parts of the engine:
      - Scene updates (via `SceneManager`).
      - Entity-Component-System (ECS) updates (iterating registered systems).
      - Effects updates (via `EffectsManager`).
      - Input manager state finalization.
4.  **Render Orchestration:**
    - Its `_render()` method manages the drawing process:
      - Clears the offscreen canvas.
      - Instructs the `SceneManager` to render the current scene(s) to the offscreen canvas.
      - Calls the `EffectsManager` to apply any active screen effects and draw the final composited image from the offscreen canvas to the main (visible) canvas.
5.  **Module Access:**
    - Provides getter methods (e.g., `getAssetLoader()`, `getInputManager()`) for other parts of the game and engine to access core managers.
6.  **Scene Registration & Startup:**
    - Registers all game scenes provided in the configuration.
    - Starts the game by switching to an initial scene.
7.  **ECS System Management:**
    - Allows for registration, unregistration, and retrieval of ECS systems.

## Singleton Instance

The `IroncladEngine` is designed as a singleton. The first time it's instantiated, it stores its instance. Subsequent attempts to create a new `IroncladEngine` will return the existing instance. For debugging purposes, the engine instance is also typically assigned to `window.gameEngine`.

## Key Managed Systems

The `IroncladEngine` instance holds references to and manages the lifecycle of several key systems:

- **`AssetLoader`**: Loads and caches images, JSON, and audio files. (See [Asset Management Guide](./asset-loader.md))
- **`InputManager`**: Handles keyboard, mouse, and gamepad input, and provides an action mapping system. (See [Input System Guide](./input-manager.md))
- **`SceneManager`**: Manages the scene stack, scene transitions, and scene lifecycle. (See [Scene Management Guide](./scene-management.md))
- **`EventManager` (`this.events`)**: A global publish/subscribe system for events.
- **`EntityManager`**: Core of the ECS for managing entities and components.
- **`PrefabManager`**: Handles creating entities from predefined JSON templates.
- **`Camera`**: Manages the game's 2D viewport, including scrolling and target following.
- **`SaveLoadManager`**: Manages saving and loading game state using a provider pattern. (See [Save/Load Management Guide](./save-load.md))
- **`EffectsManager`**: Applies screen-level visual effects like shake, flash, and tint. (See [Effects Management Guide](./effects-manager.md))
- **`AudioManager`**: Manages playback of sound effects and music.

## Constructor & Configuration

The engine is created with a configuration object:

```javascript
const engine = new IroncladEngine({
    canvas: 'game-canvas', // ID of the HTMLCanvasElement or the element itself
    width: 800,
    height: 600,
    assetManifestPath: '/assets/data/asset-manifest.json',
    sceneRegistry: { /* ... your scene classes ... */ },
    defaultWorldWidth: 1600, // Optional: For Camera
    defaultWorldHeight: 1200 // Optional: For Camera
});
canvas: The HTML canvas element (or its ID string) where the game will be rendered.width, height: The desired dimensions of the game canvas.assetManifestPath: Path to your main asset manifest JSON file.sceneRegistry: An object mapping scene names (strings) to scene classes (constructors).defaultWorldWidth, defaultWorldHeight (Optional): Initial dimensions for the game world, used by the Camera.Initialization Sequence (Simplified)Canvas and offscreen canvas are set up.Core managers (AssetLoader, InputManager, EventManager, EntityManager, PrefabManager, Camera, EffectsManager, AudioManager, SaveLoadManager) are instantiated.InputManager.initialize(this.canvas, this) is called.SceneManager.setContextAndEngine(this.offscreenContext, this) is called (for the version of SceneManager you are currently using).Scenes from sceneRegistry are instantiated and added to SceneManager via sceneManager.add().The GameLoop is created.Starting the GameOnce initialized, the game is started by calling:engine.start('initialSceneName', { /* optional initial data for the scene */ });
This loads the specified initial scene (using sceneManager.switchTo) and starts the GameLoop.Update Cycle (_update)The engine's private _update(deltaTime) method is called by the GameLoop every frame. It typically performs operations in this order:SceneManager.update(deltaTime): Updates the active scene(s).Updates all registered ECS systems (system.update(deltaTime, entities, engine)).EffectsManager.update(deltaTime): Updates active visual effects.InputManager.update(): Finalizes input states for the next frame (e.g., clearing "just pressed/released" flags).Emits an 'engine:update:frameEnd' event.Render Cycle (_render)The engine's private _render() method is called by the GameLoop every frame:Clears the offscreenContext.Calls SceneManager.render(). The SceneManager then iterates through its active scenes and calls their render(offscreenContext, engine) methods, causing them to draw to the offscreen canvas.Calls EffectsManager.postRender(this.context, this.offscreenCanvas). The EffectsManager takes the image from the offscreenCanvas, applies any active effects, and draws the final result to the main visible context.(Optionally, any UI or overlays that should not be affected by screen effects can be drawn directly to this.context after the postRender call).The IroncladEngine class thus serves as the central nervous system of your game, tying all the individual modules and systems together.
```
