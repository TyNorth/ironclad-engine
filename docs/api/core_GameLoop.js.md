# Class: GameLoop

Manages the main game loop, calling update and render functions at a consistent rate.

**Source:** [core/GameLoop.js, line 9](core/GameLoop.js.html#line9) (General class description)
**Source:** [core/GameLoop.js, line 21](core/GameLoop.js.html#line21) (Constructor with parameters)

---

## Constructor

### `new GameLoop(update, render)`

Creates an instance of GameLoop.

**Parameters:**

| Name     | Type       | Description                                                                      |
| -------- | ---------- | -------------------------------------------------------------------------------- |
| `update` | `function` | The function to call for game logic updates. It receives `deltaTime` in seconds. |
| `render` | `function` | The function to call for rendering the game.                                     |

**Source:** [core/GameLoop.js, line 21](core/GameLoop.js.html#line21)

_Note: The documentation also shows a parameter-less constructor `new GameLoop()` at line 9, which likely initializes default behavior or expects `setUpdate` and `setRender` to be called subsequently._

---

## Methods

### `setRender(newRenderFunction)`

Sets a new render function for the game loop.

**Parameters:**

| Name                | Type       | Description                                      |
| ------------------- | ---------- | ------------------------------------------------ |
| `newRenderFunction` | `function` | The new function to call for rendering the game. |

**Source:** [core/GameLoop.js, line 120](core/GameLoop.js.html#line120)

---

### `setUpdate(newUpdateFunction)`

Sets a new update function for the game loop.

**Parameters:**

| Name                | Type       | Description                                      |
| ------------------- | ---------- | ------------------------------------------------ |
| `newUpdateFunction` | `function` | The new function to call for game logic updates. |

**Source:** [core/GameLoop.js, line 108](core/GameLoop.js.html#line108)

---

### `start()`

Starts the game loop.
Logs a warning if the loop is already running.

**Source:** [core/GameLoop.js, line 77](core/GameLoop.js.html#line77)

---

### `stop()`

Stops the game loop.

**Source:** [core/GameLoop.js, line 91](core/GameLoop.js.html#line91)
