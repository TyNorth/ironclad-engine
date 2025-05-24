# Class: BaseEffect (Base Class)

**Source:** `fx/BaseEffect.js`
**File Description:** An abstract base class for visual effects. Specific effects (e.g., `ShakeEffect`, `FlashEffect`, `TintEffect`) should extend this class.

The `BaseEffect` class provides a common structure and lifecycle for all visual effects managed by the `EffectsManager`. It handles core functionalities such as duration timing, active state management, and provides a standard interface for updating and applying the effect.

**Derived classes are expected to override the `apply()` method** to implement the specific visual transformation.

---

## Constructor

### `new BaseEffect(options?)`

Creates a new `BaseEffect` instance.

**Parameters:**

- `options?: object` - An optional configuration object for the effect.
  - `options.engine?: IroncladEngine | null` - A reference to the game engine instance. (Default: `null`)
  - `options.duration?: number` - The total duration of the effect in **milliseconds**. (Default: `1000`ms) Set to `Infinity` for effects that don't auto-finish.
  - `options.startsActive?: boolean` - Whether the effect should be active immediately upon creation. (Default: `true`)
  - `options.id?: string` - An optional identifier for the effect, useful for logging. (Default: The constructor name of the derived class, e.g., `"ShakeEffect"`)

---

## Properties

### `engine`

**Type:** `IroncladEngine | null`
A reference to the main `IroncladEngine` instance. Can be set via constructor option or `setEngine()` method.

### `duration`

**Type:** `number`
The total duration this effect should last, in **milliseconds**. Can be `Infinity` for effects that need to be stopped manually or have other completion conditions.

### `timer`

**Type:** `number`
The internal timer tracking the elapsed time for this effect since it was started or last reset, in **milliseconds**.

### `isActive`

**Type:** `boolean`
Indicates whether the effect is currently active and should be updated and applied.

### `isFinished`

**Type:** `boolean`
Indicates whether the effect has completed its duration or has been manually stopped. Finished effects are typically removed by the `EffectsManager`.

### `id`

**Type:** `string`
An identifier for the effect instance, primarily used for logging and debugging.

---

## Lifecycle and Control Methods

### `update(deltaTime)`

Updates the effect's internal timer based on `deltaTime`. If the `duration` is not `Infinity` and the `timer` exceeds or equals the `duration`, the effect sets `isFinished` to `true` and `isActive` to `false`.

**Parameters:**

| Name        | Type     | Description                                            |
| :---------- | :------- | :----------------------------------------------------- |
| `deltaTime` | `number` | The time elapsed since the last frame, in **seconds**. |

---

### `apply(mainContext, sceneCanvas, effectPipelineData?)`

This method is intended to be **overridden by derived effect classes**. It's where the actual visual modification of the `sceneCanvas` (or `mainContext`) occurs. The base implementation issues a warning if not overridden.

The `effectPipelineData` can be used to pass information or modified canvas content from one effect to another if multiple effects are chained in a pipeline by the `EffectsManager`.

**Parameters:**

| Name                 | Type                       | Attributes | Default | Description                                                                                                              |
| :------------------- | :------------------------- | :--------- | :------ | :----------------------------------------------------------------------------------------------------------------------- |
| `mainContext`        | `CanvasRenderingContext2D` |            |         | The 2D rendering context of the _visible_ main canvas. Effects might draw directly here or use it for final composition. |
| `sceneCanvas`        | `HTMLCanvasElement`        |            |         | The offscreen canvas containing the rendered scene content, which the effect will typically read from or modify.         |
| `effectPipelineData` | `object`                   | optional   | `{}`    | An object that can carry data through a chain of effects, or the result of a previous effect in a pipeline.              |

**Returns:** `object` - The `effectPipelineData`, potentially modified by this effect, to be passed to the next effect in a chain.

---

### `start()`

Activates the effect and resets its timer. Sets `isActive` to `true` and `isFinished` to `false`. This can be used to restart an effect.

---

### `stop()`

Deactivates the effect and marks it as finished. Sets `isActive` to `false` and `isFinished` to `true`.

---

### `reset()`

Resets the effect's state to its initial, inactive, and unfinished condition. `timer` is set to `0`, `isActive` to `false`, and `isFinished` to `false`.

---

### `hasFinished()`

Checks if the effect has completed its lifecycle.

**Returns:** `boolean` - `true` if `this.isFinished` is true, `false` otherwise.

---

### `setEngine(engine)`

Assigns a reference to the `IroncladEngine` instance to this effect.

**Parameters:**

| Name     | Type             | Description                    |
| :------- | :--------------- | :----------------------------- |
| `engine` | `IroncladEngine` | The main game engine instance. |
