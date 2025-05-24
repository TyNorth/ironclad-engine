# Class: BaseUIElement (Base Class)

**Source:** `src/engine/ui/BaseUIElement.js`

The `BaseUIElement` class serves as the **fundamental building block** for all user interface components within the Ironclad Engine. Concrete UI elements like buttons, labels, panels, and sliders should **extend this class**. It provides common properties for positioning, sizing, visibility, and interactivity, as well as a basic structure for updates, rendering, and handling click events.

---

## Constructor

### `new BaseUIElement(options?)`

Creates a new `BaseUIElement` instance.

**Parameters:**

- `options?: object` - An optional configuration object for the UI element.
  - `options.x?: number` - The initial x-coordinate of the element. (Default: `0`)
  - `options.y?: number` - The initial y-coordinate of the element. (Default: `0`)
  - `options.width?: number` - The initial width of the element. (Default: `0`)
  - `options.height?: number` - The initial height of the element. (Default: `0`)
  - `options.visible?: boolean` - Whether the element is initially visible. (Default: `true`)
  - `options.enabled?: boolean` - Whether the element is initially enabled for interaction. (Default: `true`)
  - `options.id?: string | null` - An optional unique identifier for the element. (Default: `null`)
  - `options.text?: string` - Optional text content associated with the element (e.g., for a button label), also used for logging. (Default: `''`)
  - `options.onClick?: function` - An optional callback function to be executed when the element is clicked.

---

## Properties

### `x`

**Type:** `number`
The x-coordinate of the top-left corner of the UI element, relative to its parent or the screen.

### `y`

**Type:** `number`
The y-coordinate of the top-left corner of the UI element, relative to its parent or the screen.

### `width`

**Type:** `number`
The width of the UI element.

### `height`

**Type:** `number`
The height of the UI element.

### `visible`

**Type:** `boolean`
Determines if the UI element is currently visible and should be rendered.

### `enabled`

**Type:** `boolean`
Determines if the UI element is currently enabled and can be interacted with (e.g., clicked).

### `id`

**Type:** `string | null`
An optional unique identifier for this UI element instance. Useful for finding specific elements.

### `text`

**Type:** `string`
Generic text content associated with the element. For elements like buttons or labels, this might be their displayed text. Also used for more descriptive logging.

### `engine`

**Type:** `IroncladEngine | null`
A reference to the main `IroncladEngine` instance. This is typically set via the `setEngine` method, often by the `BaseScene` when the element is added to it. Provides access to engine services.

### `_clickCallback` (Private)

**Type:** `Function | null`
The internal storage for the function to be called when the element is clicked.

---

## Methods

### `setEngine(engine)`

Sets the engine reference for this UI element. This allows the element to access engine services if needed (e.g., input manager, asset loader).

**Parameters:**

| Name     | Type             | Description               |
| :------- | :--------------- | :------------------------ |
| `engine` | `IroncladEngine` | The game engine instance. |

---

### `containsPoint(px, py)`

Checks if the given screen coordinates (`px`, `py`) are within the rectangular bounds of this UI element.

**Parameters:**

| Name | Type     | Description                    |
| :--- | :------- | :----------------------------- |
| `px` | `number` | The x-coordinate of the point. |
| `py` | `number` | The y-coordinate of the point. |

**Returns:** `boolean` - `true` if the point is within the element's bounds, `false` otherwise.

---

### `update(deltaTime, engine, mousePos)`

Called every frame to update the UI element's state. The base implementation is empty and is meant to be overridden by derived classes for custom update logic (e.g., handling hover states, animations).

**Parameters:**

| Name        | Type             | Description                                                                                         |
| :---------- | :--------------- | :-------------------------------------------------------------------------------------------------- |
| `deltaTime` | `number`         | The time elapsed since the last frame, in seconds.                                                  |
| `engine`    | `IroncladEngine` | The game engine instance.                                                                           |
| `mousePos`  | `object`         | An object containing the current mouse position (e.g., `{ x, y }`), usually relative to the canvas. |

---

### `render(context, engine)`

Called every frame to render the UI element. If the element is not `visible` or if `context` is invalid, it returns early. Otherwise, it calls the `_drawSelf` method.

**Parameters:**

| Name      | Type                       | Description                            |
| :-------- | :------------------------- | :------------------------------------- |
| `context` | `CanvasRenderingContext2D` | The 2D rendering context to draw onto. |
| `engine`  | `IroncladEngine`           | The game engine instance.              |

---

### `_drawSelf(context, engine)` (Protected/Private)

This method is intended to be **overridden by derived UI element classes** to implement their specific drawing logic (e.g., drawing a button's background and text, an image, etc.). The base implementation does nothing but may log a warning.

**Parameters:**

| Name      | Type                       | Description                            |
| :-------- | :------------------------- | :------------------------------------- |
| `context` | `CanvasRenderingContext2D` | The 2D rendering context to draw onto. |
| `engine`  | `IroncladEngine`           | The game engine instance.              |

---

### `onClick(callback)`

Assigns or updates the callback function that will be executed when this UI element is successfully clicked.

**Parameters:**

| Name       | Type       | Description                                       |
| :--------- | :--------- | :------------------------------------------------ |
| `callback` | `Function` | The function to call when the element is clicked. |

---

### `_triggerClick()` (Protected/Private)

Internally called to execute the `_clickCallback` if the element is `enabled`, `visible`, and a callback is assigned. Logs the click trigger or a warning if conditions for clicking aren't met.

---

### `setPosition(x, y)`

Sets the top-left position of the UI element.

**Parameters:**

| Name | Type     | Description           |
| :--- | :------- | :-------------------- |
| `x`  | `number` | The new x-coordinate. |
| `y`  | `number` | The new y-coordinate. |

---

### `setSize(width, height)`

Sets the dimensions of the UI element.

**Parameters:**

| Name     | Type     | Description     |
| :------- | :------- | :-------------- |
| `width`  | `number` | The new width.  |
| `height` | `number` | The new height. |

---

### `show()`

Makes the UI element visible by setting its `visible` property to `true`.

---

### `hide()`

Makes the UI element invisible by setting its `visible` property to `false`.

---

### `enable()`

Enables the UI element for interaction by setting its `enabled` property to `true`.

---

### `disable()`

Disables the UI element, preventing interaction, by setting its `enabled` property to `false`.
