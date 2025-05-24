# Class: Camera

**Source:** [rendering/Camera.js, line 9](rendering_Camera.js.html#line9)

The `Camera` class is essential for 2D game rendering. It defines the **visible portion** (viewport) of the game world and manages its position and dimensions. It handles tasks like:

- Determining which part of the larger game world is currently visible on screen.
- Following a target entity (like the player). 🧍‍♂️➡️ 🎥
- Ensuring the view stays within the defined world boundaries (clamping).
- Providing the necessary offsets (`x`, `y`) for rendering systems to translate world coordinates into screen coordinates.

---

## Constructor

### `new Camera(config)`

Creates a new Camera instance, configuring its initial viewport and world dimensions.

**Parameters:**

- `config: object` - Configuration object for the camera.
  - `viewportWidth: number` - The width of the camera's viewport (typically the width of the canvas in pixels).
  - `viewportHeight: number` - The height of the camera's viewport (typically the height of the canvas in pixels).
  - `worldWidth: number` - The total width of the game world in world units.
  - `worldHeight: number` - The total height of the game world in world units.

**Source:** [rendering/Camera.js, line 22](rendering_Camera.js.html#line22)

---

## Members

### `x`

**Type:** `number`

The **x-coordinate** of the camera's top-left corner in world space. This value represents the horizontal offset used to translate world coordinates for rendering.

**Source:** [rendering/Camera.js, line 28](rendering_Camera.js.html#line28)

### `y`

**Type:** `number`

The **y-coordinate** of the camera's top-left corner in world space. This value represents the vertical offset used to translate world coordinates for rendering.

**Source:** [rendering/Camera.js, line 35](rendering_Camera.js.html#line35)

---

## Methods

### `getViewportX()`

Gets the current x-coordinate of the camera's top-left corner (its position in world space).

**Returns:** `number` - The camera's current X position.

**Source:** [rendering/Camera.js, line 211](rendering_Camera.js.html#line211)

### `getViewportY()`

Gets the current y-coordinate of the camera's top-left corner (its position in world space).

**Returns:** `number` - The camera's current Y position.

**Source:** [rendering/Camera.js, line 219](rendering_Camera.js.html#line219)

### `setTarget(targetEntity, screenFocusX?, screenFocusY?)`

Sets an entity for the camera to follow. The camera will attempt to keep this entity centered (or at the specified focus point) within the viewport during updates. The target object needs to provide its position and dimensions, either via `worldX`, `worldY`, `width`, `height` properties or through `getPosition()` and `getDimensions()` methods.

**Parameters:**

| Name           | Type               | Attributes | Description                                                                                                        |
| :------------- | :----------------- | :--------- | :----------------------------------------------------------------------------------------------------------------- |
| `targetEntity` | `object` \| `null` |            | The entity or object to follow. Pass `null` to stop following any target.                                          |
| `screenFocusX` | `number`           | optional   | The x-coordinate (in screen space) where the target should ideally be positioned. Defaults to the viewport center. |
| `screenFocusY` | `number`           | optional   | The y-coordinate (in screen space) where the target should ideally be positioned. Defaults to the viewport center. |

**Source:** [rendering/Camera.js, line 85](rendering_Camera.js.html#line85)

### `setViewportDimensions(viewportWidth, viewportHeight)`

Updates the dimensions of the camera's viewport. This is useful if the game canvas is resized.

**Parameters:**

| Name             | Type     | Description                              |
| :--------------- | :------- | :--------------------------------------- |
| `viewportWidth`  | `number` | The new width of the viewport (canvas).  |
| `viewportHeight` | `number` | The new height of the viewport (canvas). |

**Source:** [rendering/Camera.js, line 240](rendering_Camera.js.html#line240)

### `setWorldDimensions(worldWidth, worldHeight)`

Updates the total dimensions of the game world. This affects how the camera clamps its position to stay within bounds.

**Parameters:**

| Name          | Type     | Description                             |
| :------------ | :------- | :-------------------------------------- |
| `worldWidth`  | `number` | The new total width of the game world.  |
| `worldHeight` | `number` | The new total height of the game world. |

**Source:** [rendering/Camera.js, line 228](rendering_Camera.js.html#line228)

### `update()`

Updates the camera's position based on its target (if any) and ensures it remains within the defined world boundaries. This method should typically be called once per game loop frame, often by the `SceneManager` or a dedicated camera system.

**Source:** [rendering/Camera.js, line 119](rendering_Camera.js.html#line119)

### `applyTransform(context)`

_(Common Pattern - Not in provided JSDoc, but important for context)_

While not explicitly listed in the provided JSDoc, a `Camera` typically has, or is used to implement, a method like `applyTransform`. This method applies the necessary `translate` operation to the `CanvasRenderingContext2D` _before_ drawing game objects. It effectively moves the world "under" the camera so that objects appear in the correct position on the screen.

```javascript
// Example Usage (inside a RenderSystem or Scene.render):
context.save()
context.translate(-camera.getViewportX(), -camera.getViewportY())

// ... Draw all world objects here ...

context.restore()
```
