# Class: EffectsManager ✨

**Source:** [core/EffectsManager.js, line 19](core_EffectsManager.js.html#line19)

The `EffectsManager` is responsible for handling and applying **visual effects** to the game screen. It acts as a central hub for triggering, updating, and rendering effects like screen shake, flashes, and color tints. It typically operates as a **post-processing** step, taking the fully rendered scene (usually on an offscreen canvas) and applying its effects before drawing the final image to the visible canvas.

---

## Constructor

### `new EffectsManager(engine)`

Creates a new `EffectsManager` instance.

**Parameters:**

| Name     | Type             | Description                                                                                      |
| :------- | :--------------- | :----------------------------------------------------------------------------------------------- |
| `engine` | `IroncladEngine` | A reference to the main game engine instance, providing access to other services and the canvas. |

**Source:** [core/EffectsManager.js, line 19](core_EffectsManager.js.html#line19)

---

## Methods

### `addEffect(effectInstance)`

Adds a custom effect instance to the manager. The effect should conform to an expected interface, likely having `update(deltaTime)` and `apply(context, canvas)` methods.

**Parameters:**

| Name             | Type         | Description                                                                              |
| :--------------- | :----------- | :--------------------------------------------------------------------------------------- |
| `effectInstance` | `BaseEffect` | An instance of an effect class (e.g., `FlashEffect`, `ShakeEffect`, or a custom effect). |

**Source:** [core/EffectsManager.js, line 44](core_EffectsManager.js.html#line44)

---

### `clearAllEffects()`

Immediately removes and stops all currently active visual effects.

**Source:** [core/EffectsManager.js, line 262](core_EffectsManager.js.html#line262)

---

### `clearTint()`

Specifically removes any active persistent screen tint effect.

**Source:** [core/EffectsManager.js, line 154](core_EffectsManager.js.html#line154)

---

### `flash(color?, duration?, maxOpacity?, fadeOut?)`

Triggers a screen flash effect. This is a convenient shortcut that creates and adds a `FlashEffect` instance. 💥

**Parameters:**

| Name         | Type      | Attributes | Default                      | Description                                          |
| :----------- | :-------- | :--------- | :--------------------------- | :--------------------------------------------------- |
| `color`      | `string`  | optional   | `'rgba(255, 255, 255, 0.5)'` | The color of the flash (CSS color string).           |
| `duration`   | `number`  | optional   | `300`                        | The total duration of the flash in milliseconds.     |
| `maxOpacity` | `number`  | optional   | `0.7`                        | The peak opacity of the flash (0.0 to 1.0).          |
| `fadeOut`    | `boolean` | optional   | `true`                       | Whether the flash should fade out over its duration. |

**Source:** [core/EffectsManager.js, line 91](core_EffectsManager.js.html#line91)

---

### `postRender(mainContext, sceneCanvas)`

This is a key method called by the engine's main render loop _after_ the scene has been drawn to an offscreen canvas. It takes the scene canvas, applies all active effects (like shake and tint), and then draws the final, potentially modified, image onto the main visible canvas context.

**Parameters:**

| Name          | Type                       | Description                                                   |
| :------------ | :------------------------- | :------------------------------------------------------------ |
| `mainContext` | `CanvasRenderingContext2D` | The 2D rendering context of the _visible_ main canvas.        |
| `sceneCanvas` | `HTMLCanvasElement`        | The _offscreen_ canvas containing the already-rendered scene. |

**Source:** [core/EffectsManager.js, line 214](core_EffectsManager.js.html#line214)

---

### `shake(intensity?, duration?, decay?)`

Triggers a screen shake effect. This is a convenient shortcut that creates and adds a `ShakeEffect` instance. 地震

**Parameters:**

| Name        | Type      | Attributes | Default | Description                                                            |
| :---------- | :-------- | :--------- | :------ | :--------------------------------------------------------------------- |
| `intensity` | `number`  | optional   | `10`    | The maximum pixel offset (both X and Y) for the shake.                 |
| `duration`  | `number`  | optional   | `500`   | The duration of the shake effect in milliseconds.                      |
| `decay`     | `boolean` | optional   | `true`  | Whether the shake intensity should decrease (decay) over its duration. |

**Source:** [core/EffectsManager.js, line 70](core_EffectsManager.js.html#line70)

---

### `tint(color?, opacity?)`

Applies or updates a persistent screen tint effect. This creates or modifies a `TintEffect`. You can use this to color the whole screen (e.g., for nighttime scenes, damage indicators, or transitions). Call `clearTint()` or `tint('rgba(0,0,0,0)', 0)` to remove it.

**Parameters:**

| Name      | Type     | Attributes | Default           | Description                                           |
| :-------- | :------- | :--------- | :---------------- | :---------------------------------------------------- |
| `color`   | `string` | optional   | `'rgba(0,0,0,0)'` | The color to tint the screen with (CSS color string). |
| `opacity` | `number` | optional   | `0`               | The opacity of the tint (0.0 for none, 1.0 for full). |

**Source:** [core/EffectsManager.js, line 112](core_EffectsManager.js.html#line112)

---

### `update(deltaTime)`

Updates the state of all active effects. It calls the `update` method on each effect instance, allowing them to progress (e.g., fade out, decay). It also removes any effects that have finished their duration. This method is typically called once per frame by the main engine loop.

**Parameters:**

| Name        | Type     | Description                                        |
| :---------- | :------- | :------------------------------------------------- |
| `deltaTime` | `number` | The time elapsed since the last frame, in seconds. |

**Source:** [core/EffectsManager.js, line 176](core_EffectsManager.js.html#line176)
