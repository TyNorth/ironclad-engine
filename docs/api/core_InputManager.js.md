# Class: InputManager ⌨️🖱️

**Source:** [core/InputManager.js, line 44](core_InputManager.js.html#line44)

The `InputManager` serves as the central hub for handling all player input within the Ironclad Engine. It orchestrates underlying input modules (like keyboard and mouse, and potentially gamepad) and provides a powerful **action mapping system**. This allows you to define abstract game actions (e.g., "jump", "fire", "moveLeft") and map them to specific physical inputs (e.g., the 'Space' key, the 'W' key, the left mouse button).

This abstraction makes your game code cleaner (you check for "jump" instead of 'Space') and makes it easier to implement features like remappable controls.

**Lifecycle:**

1.  **Initialize:** Call `initialize(canvasElement, engine)` once when the engine starts.
2.  **Update:** Call `update()` once per frame, usually from the main engine loop.
3.  **Destroy:** Call `destroy()` when shutting down to clean up listeners.

---

## Constructor

### `new InputManager()`

Creates a new instance of the InputManager. It initializes internal states for tracking inputs and actions but requires `initialize()` to be called before it becomes fully operational.

**Source:** [core/InputManager.js, line 44](core_InputManager.js.html#line44)

---

## Methods

### `defineAction(actionName, bindings)`

Defines a game action and maps it to one or more physical input bindings. An **InputBinding** is an object that specifies the _type_ of input (e.g., 'key', 'mouseButton') and the _specific code_ (e.g., 'KeyW', 'MouseButton0').

**Parameters:**

| Name         | Type                  | Description                                                                                   |
| :----------- | :-------------------- | :-------------------------------------------------------------------------------------------- |
| `actionName` | `string`              | The unique name for the action (e.g., `"moveUp"`, `"fire"`).                                  |
| `bindings`   | `Array<InputBinding>` | An array of [`InputBinding`](global.html#InputBinding) objects that will trigger this action. |

**Example:**

```javascript
inputManager.defineAction('jump', [
  { type: 'key', code: 'Space' },
  { type: 'gamepadButton', code: 0 }, // Example gamepad binding
])
inputManager.defineAction('moveRight', [
  { type: 'key', code: 'KeyD', value: 1.0 }, // Can provide value for axis-like actions
  { type: 'key', code: 'ArrowRight', value: 1.0 },
])
```
