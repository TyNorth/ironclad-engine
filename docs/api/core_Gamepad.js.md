# Class: GamepadHandler

**Source:** `core/Gamepad.js`
**File Description:** Manages gamepad input, including connection/disconnection, button states (pressed, just pressed, just released), and axis values for multiple gamepads.

The `GamepadHandler` is a dedicated module within the Ironclad Engine responsible for interfacing with the browser's Gamepad API. It tracks connected gamepads, processes their input states frame-by-frame, and provides a clean interface for querying button presses, releases, holds, and analog axis values. It's typically instantiated and managed by the main `InputManager`.

Key features include:

- Automatic detection of gamepad connections and disconnections.
- Support for multiple gamepads, identified by an index.
- State tracking for buttons (current and previous frame) to detect "just pressed" and "just released" events.
- Analog stick dead zone processing to prevent unwanted input from slight stick drift.
- Emitting engine-wide events for gamepad connection status changes.

---

## Constructor

### `new GamepadHandler(inputManager)`

Creates a new `GamepadHandler` instance.

**Parameters:**

| Name           | Type           | Description                                                                 |
| :------------- | :------------- | :-------------------------------------------------------------------------- |
| `inputManager` | `InputManager` | A reference to the main `InputManager` for coordination and event emission. |

---

## Properties

### `connectedGamepads`

**Type:** `Map<number, Gamepad>`
A Map storing the raw Gamepad API objects for all currently connected gamepads, keyed by their `gamepad.index`.

### `gamepadStates`

**Type:** `Map<number, GamepadState>`
A Map storing the processed current state (buttons and axes) for each connected gamepad, keyed by `gamepad.index`.
A `GamepadState` object looks like: `{ buttons: Array<{pressed: boolean, value: number}>, axes: Array<number> }`.

### `prevGamepadStates`

**Type:** `Map<number, GamepadState>`
A Map storing the processed state from the _previous frame_ for each connected gamepad. This is used to determine "just pressed" and "just released" button states. Structure is the same as `gamepadStates`.

### `defaultDeadZone`

**Type:** `number` (Default: `0.15`)
The default dead zone value applied to analog stick axes. Axis values with an absolute magnitude less than this will be treated as `0`.

---

## Lifecycle Methods

### `initialize()`

Initializes the `GamepadHandler`. This method sets up global event listeners for gamepad connection (`gamepadconnected`) and disconnection (`gamepaddisconnected`) events. It also performs an initial scan for any gamepads that might already be connected when the engine starts.

---

### `update()`

Called once per game frame, typically by the `InputManager`. This method performs the following crucial tasks:

1. Scans for any newly connected or disconnected gamepads using `navigator.getGamepads()`.
2. For each connected gamepad:
   - Copies the current `gamepadStates` to `prevGamepadStates`.
   - Reads the latest raw data from the `Gamepad` API object.
   - Updates the `gamepadStates` with the new button pressed states and values.
   - Updates the `gamepadStates` with new axis values, applying the `defaultDeadZone`.

---

### `destroy()`

Cleans up resources used by the `GamepadHandler`. This involves removing the global event listeners for gamepad connections and disconnections and clearing all internal state maps. Should be called when the engine is shutting down.

---

## Public Methods

### `scanForGamepads()`

Manually triggers a scan for connected gamepads. While `update()` also calls this, `scanForGamepads()` can be used if an explicit check is needed outside the regular update cycle. It updates the internal list of `connectedGamepads` and initializes states for newly found ones.

---

### `getConnectedGamepadCount()`

**Returns:** `number` - The number of gamepads currently detected as connected.

---

### `getGamepadApiObject(gamepadIndex)`

Retrieves the raw `Gamepad` API object for a specific gamepad, which provides detailed information like ID, mapping, and raw button/axis arrays.

**Parameters:**

| Name           | Type     | Description                                     |
| :------------- | :------- | :---------------------------------------------- |
| `gamepadIndex` | `number` | The index of the desired gamepad (usually 0-3). |

**Returns:** `Gamepad | null` - The raw `Gamepad` object if found, otherwise `null`.

---

### `isButtonPressed(gamepadIndex, buttonIndex)`

Checks if a specific button on a given gamepad is currently being held down.

**Parameters:**

| Name           | Type     | Description                                                |
| :------------- | :------- | :--------------------------------------------------------- |
| `gamepadIndex` | `number` | The index of the gamepad.                                  |
| `buttonIndex`  | `number` | The index of the button (e.g., `GamepadHandler.BUTTON_A`). |

**Returns:** `boolean` - `true` if the button is pressed, `false` otherwise.

---

### `isButtonJustPressed(gamepadIndex, buttonIndex)`

Checks if a specific button on a given gamepad was pressed _in the current frame_ (i.e., it was not pressed in the previous frame but is pressed now).

**Parameters:**

| Name           | Type     | Description                                                |
| :------------- | :------- | :--------------------------------------------------------- |
| `gamepadIndex` | `number` | The index of the gamepad.                                  |
| `buttonIndex`  | `number` | The index of the button (e.g., `GamepadHandler.BUTTON_A`). |

**Returns:** `boolean` - `true` if the button was just pressed, `false` otherwise.

---

### `isButtonJustReleased(gamepadIndex, buttonIndex)`

Checks if a specific button on a given gamepad was released _in the current frame_ (i.e., it was pressed in the previous frame but is not pressed now).

**Parameters:**

| Name           | Type     | Description                                                |
| :------------- | :------- | :--------------------------------------------------------- |
| `gamepadIndex` | `number` | The index of the gamepad.                                  |
| `buttonIndex`  | `number` | The index of the button (e.g., `GamepadHandler.BUTTON_A`). |

**Returns:** `boolean` - `true` if the button was just released, `false` otherwise.

---

### `getButtonValue(gamepadIndex, buttonIndex)`

Gets the analog value of a button, which is useful for pressure-sensitive buttons like triggers. For standard digital buttons, this value is typically `0.0` when not pressed and `1.0` when fully pressed.

**Parameters:**

| Name           | Type     | Description                                                 |
| :------------- | :------- | :---------------------------------------------------------- |
| `gamepadIndex` | `number` | The index of the gamepad.                                   |
| `buttonIndex`  | `number` | The index of the button (e.g., `GamepadHandler.BUTTON_L2`). |

**Returns:** `number` - The button's value, typically between 0.0 and 1.0. Returns `0` if the gamepad or button is not found.

---

### `getAxisValue(gamepadIndex, axisIndex)`

Gets the current value of a specific analog axis on a given gamepad, after the dead zone has been applied. Values typically range from -1.0 to 1.0.

**Parameters:**

| Name           | Type     | Description                                                       |
| :------------- | :------- | :---------------------------------------------------------------- |
| `gamepadIndex` | `number` | The index of the gamepad.                                         |
| `axisIndex`    | `number` | The index of the axis (e.g., `GamepadHandler.AXIS_LEFT_STICK_X`). |

**Returns:** `number` - The axis value (between -1.0 and 1.0). Returns `0` if the gamepad or axis is not found.

---

## Static Constants (Button and Axis Indices)

These constants provide standard mappings for common gamepad buttons and axes, based on the Standard Gamepad layout.

- `GamepadHandler.BUTTON_A` (Index: `0`) - Typically A on Xbox, Cross on PlayStation.
- `GamepadHandler.BUTTON_B` (Index: `1`) - Typically B on Xbox, Circle on PlayStation.
- `GamepadHandler.BUTTON_X` (Index: `2`) - Typically X on Xbox, Square on PlayStation.
- `GamepadHandler.BUTTON_Y` (Index: `3`) - Typically Y on Xbox, Triangle on PlayStation.
- `GamepadHandler.BUTTON_L1` (Index: `4`) - Left bumper (LB).
- `GamepadHandler.BUTTON_R1` (Index: `5`) - Right bumper (RB).
- `GamepadHandler.BUTTON_L2` (Index: `6`) - Left trigger (LT).
- `GamepadHandler.BUTTON_R2` (Index: `7`) - Right trigger (RT).
- `GamepadHandler.BUTTON_SELECT` (Index: `8`) - Select/Back/View button.
- `GamepadHandler.BUTTON_START` (Index: `9`) - Start/Menu button.
- `GamepadHandler.BUTTON_L3` (Index: `10`) - Left stick press.
- `GamepadHandler.BUTTON_R3` (Index: `11`) - Right stick press.
- `GamepadHandler.BUTTON_DPAD_UP` (Index: `12`) - D-pad Up.
- `GamepadHandler.BUTTON_DPAD_DOWN` (Index: `13`) - D-pad Down.
- `GamepadHandler.BUTTON_DPAD_LEFT` (Index: `14`) - D-pad Left.
- `GamepadHandler.BUTTON_DPAD_RIGHT` (Index: `15`) - D-pad Right.
- `GamepadHandler.BUTTON_GUIDE` (Index: `16`) - Guide/Home/PS button (often system-reserved).

- `GamepadHandler.AXIS_LEFT_STICK_X` (Index: `0`) - Left analog stick, X-axis (-1 for left, 1 for right).
- `GamepadHandler.AXIS_LEFT_STICK_Y` (Index: `1`) - Left analog stick, Y-axis (-1 for up, 1 for down).
- `GamepadHandler.AXIS_RIGHT_STICK_X` (Index: `2`) - Right analog stick, X-axis (-1 for left, 1 for right).
- `GamepadHandler.AXIS_RIGHT_STICK_Y` (Index: `3`) - Right analog stick, Y-axis (-1 for up, 1 for down).

---

## Internal Event Handling (Private Methods)

These methods are used internally to manage gamepad connection events and initialize their state.

### `_onGamepadConnected(event)`

_Private method._ Event handler for the `gamepadconnected` window event. When a gamepad connects:

1. Logs the connection.
2. Adds the gamepad to `this.connectedGamepads`.
3. Initializes its state in `this.gamepadStates` and `this.prevGamepadStates`.
4. Emits a `gamepadConnected` event through the engine's `EventManager` with details about the connected gamepad.

### `_onGamepadDisconnected(event)`

_Private method._ Event handler for the `gamepaddisconnected` window event. When a gamepad disconnects:

1. Logs the disconnection.
2. Removes the gamepad from `this.connectedGamepads`, `this.gamepadStates`, and `this.prevGamepadStates`.
3. Emits a `gamepadDisconnected` event through the engine's `EventManager`.

### `_createEmptyGamepadState(gamepad)`

_Private method._ Creates a new, default state object for a gamepad, with all buttons unpressed and axes at zero.

**Parameters:**

| Name      | Type      | Description                                                               |
| :-------- | :-------- | :------------------------------------------------------------------------ |
| `gamepad` | `Gamepad` | The raw Gamepad API object to base the state on (for button/axis counts). |

**Returns:** `GamepadState` - An initialized gamepad state object.
