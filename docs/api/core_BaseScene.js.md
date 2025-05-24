# Class: BaseScene (Base Class) 🎬

**Source:** `core/BaseScene.js`
**File Description:** A base class for all game scenes, providing common lifecycle methods and properties.

The `BaseScene` class is the cornerstone for creating different states or screens in your game, such as main menus, game levels, pause screens, or cutscenes. It defines a standard set of **lifecycle methods** that are called by the `SceneManager` at appropriate times, allowing you to manage resources, game logic, rendering, and UI specific to that scene.

Game-specific scenes should **extend** this `BaseScene` class and override its methods to implement their unique behavior.

---

## Constructor

### `new BaseScene()`

Initializes a new `BaseScene` instance. When a scene is created:

- Its `engine` reference is initially `null` (it will be set by the `SceneManager` during activation).
- `uiContext` is `null`.
- `uiElements` array is empty.
- `isModal` defaults to `true`.
- `isInitialized` defaults to `false`.

---

## Properties

### `engine`

**Type:** `IroncladEngine | null`

A reference to the main `IroncladEngine` instance. This is set by the `SceneManager` when the scene is initialized or becomes active, providing access to all engine subsystems like `AssetLoader`, `InputManager`, `EntityManager`, etc.

---

### `uiContext`

**Type:** `object | null`

An object intended to hold UI-specific context data that might be passed to this scene when it's activated or that the scene manages internally for its UI elements.

---

### `uiElements`

**Type:** `Array<BaseUIElement>`

An array to hold instances of UI elements (e.g., buttons, labels, panels) that are part of this scene and managed by it. Scenes can use helper methods like `addUIElement`, `updateUIElements`, and `renderUIElements` to manage these, or implement their own UI handling.

---

### `isModal`

**Type:** `boolean` (Default: `true`)

Determines the scene's behavior in the `SceneManager`'s stack:

- If `true` (default): This scene, when active (top of the stack), **blocks updates** to scenes below it. Only this scene's `update` method will be called.
- If `false` (e.g., for a transparent HUD or overlay): Scenes below this one in the stack **will also have their `update` methods called**, allowing for concurrent scene logic.
  Rendering typically proceeds from the bottom of the stack upwards for all visible scenes.

---

### `isInitialized`

**Type:** `boolean` (Default: `false`)

Tracks whether the scene's `initialize` method has been called. This can be useful to prevent re-initialization if scenes were designed to be reused (though the typical `SceneManager` flow creates new instances, making `initialize` a one-time call per instance).

---

## Lifecycle Methods

These methods define the lifecycle of a scene and are called by the `SceneManager`. Game-specific scenes should override these to implement their logic. They can be `async` if they need to perform asynchronous operations (e.g., loading assets).

### `async initialize(engine, data?)`

Called by the `SceneManager` when the scene is first created and made active (e.g., when pushed onto the scene stack or switched to). This is the ideal place for:

- One-time setup tasks.
- Loading assets specific to this scene (if not preloaded globally).
- Creating and initializing UI elements.
- Setting up game objects or state.

The base implementation sets `this.engine = engine` and `this.isInitialized = true`.

**Parameters:**

| Name     | Type             | Attributes | Default | Description                                                                                     |
| :------- | :--------------- | :--------- | :------ | :---------------------------------------------------------------------------------------------- |
| `engine` | `IroncladEngine` |            |         | The main `IroncladEngine` instance.                                                             |
| `data`   | `object`         | optional   | `{}`    | Optional data object that can be passed to the scene when it's activated by the `SceneManager`. |

**Returns:** `Promise<void> | void`

---

### `async update(deltaTime, engine)`

Called every frame by the `SceneManager` if this scene is the active updating scene (i.e., it's at the top of the stack, or it's not modal and scenes above it are also not modal). This is where the main game logic for the scene should reside, including:

- Handling player input.
- Updating entity states and game objects.
- Running scene-specific AI or simulations.
- Updating UI elements (e.g., calling `this.updateUIElements(deltaTime, engine)`).

**Parameters:**

| Name        | Type             | Description                                        |
| :---------- | :--------------- | :------------------------------------------------- |
| `deltaTime` | `number`         | The time elapsed since the last frame, in seconds. |
| `engine`    | `IroncladEngine` | The main `IroncladEngine` instance.                |

**Returns:** `Promise<void> | void`

---

### `async render(context, engine)`

Called every frame by the `SceneManager` for each scene in the stack that is considered visible (typically, scenes are rendered from the bottom of the stack upwards). This method is responsible for all drawing operations for this scene.

- Drawing game entities, tilemaps, backgrounds.
- Rendering UI elements (e.g., calling `this.renderUIElements(context, engine)`).

**Parameters:**

| Name      | Type                       | Description                                                            |
| :-------- | :------------------------- | :--------------------------------------------------------------------- |
| `context` | `CanvasRenderingContext2D` | The 2D rendering context to draw onto (usually the offscreen context). |
| `engine`  | `IroncladEngine`           | The main `IroncladEngine` instance.                                    |

**Returns:** `Promise<void> | void`

---

### `async pause(engine)`

Called by the `SceneManager` when another scene is pushed on top of this one, and this scene is no longer the primary scene for updates (especially if `this.isModal` is true). This is a good place to:

- Pause animations or ongoing processes.
- Stop scene-specific sounds or music.
- Save any temporary state that might be needed if the scene is resumed.

**Parameters:**

| Name     | Type             | Description                         |
| :------- | :--------------- | :---------------------------------- |
| `engine` | `IroncladEngine` | The main `IroncladEngine` instance. |

**Returns:** `Promise<void> | void`

---

### `async resume(engine, data?)`

Called by the `SceneManager` when this scene becomes the active (top) updating scene again, typically after a scene that was on top of it has been popped from the stack. This is where you would:

- Restore any state saved in `pause`.
- Resume animations or processes.
- Restart scene-specific sounds or music.

**Parameters:**

| Name     | Type             | Attributes | Default | Description                                                               |
| :------- | :--------------- | :--------- | :------ | :------------------------------------------------------------------------ |
| `engine` | `IroncladEngine` |            |         | The main `IroncladEngine` instance.                                       |
| `data`   | `any`            | optional   | `null`  | Optional data that might have been passed from the scene that was popped. |

**Returns:** `Promise<void> | void`

---

### `async unload(engine)`

Called by the `SceneManager` when this scene instance is about to be permanently removed from the scene stack (e.g., due to `popScene` or `switchTo` another scene). This is the final cleanup opportunity for this specific instance of the scene. Implement this to:

- Release any resources exclusively loaded or created by this scene.
- Remove event listeners specific to this scene.
- Nullify references to prevent memory leaks.

The base implementation clears `this.uiElements`, sets `this.isInitialized` to `false`, and nullifies `this.engine` and `this.uiContext`.

**Parameters:**

| Name     | Type             | Description                         |
| :------- | :--------------- | :---------------------------------- |
| `engine` | `IroncladEngine` | The main `IroncladEngine` instance. |

**Returns:** `Promise<void> | void`

---

## UI Helper Methods

These are optional helper methods provided by `BaseScene` for managing a list of UI elements. Scenes can choose to use these or implement their own UI management.

### `addUIElement(element)`

Adds a `BaseUIElement` instance to the scene's internal `uiElements` array. If the element has a `setEngine` method, this helper will also call it, passing the scene's `engine` reference.

**Parameters:**

| Name      | Type            | Description                                  |
| :-------- | :-------------- | :------------------------------------------- |
| `element` | `BaseUIElement` | The UI element instance to add to the scene. |

---

### `updateUIElements(deltaTime, engine)`

Iterates through all `uiElements` managed by the scene and calls their `update` method if they are `visible` and `enabled`. This should typically be called from within the scene's own `update` method.

**Parameters:**

| Name        | Type             | Description                                           |
| :---------- | :--------------- | :---------------------------------------------------- |
| `deltaTime` | `number`         | The time elapsed since the last frame, in seconds.    |
| `engine`    | `IroncladEngine` | The main `IroncladEngine` instance (for input, etc.). |

---

### `renderUIElements(context, engine)`

Iterates through all `visible` `uiElements` managed by the scene and calls their `render` method. This should typically be called from within the scene's own `render` method.

**Parameters:**

| Name      | Type                       | Description                                            |
| :-------- | :------------------------- | :----------------------------------------------------- |
| `context` | `CanvasRenderingContext2D` | The 2D rendering context to draw the UI elements onto. |
| `engine`  | `IroncladEngine`           | The main `IroncladEngine` instance.                    |
