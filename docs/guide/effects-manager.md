# Effects Management in Ironclad Engine

The Ironclad Engine includes an `EffectsManager` to handle screen-level visual effects like screen shake, color flashes, and persistent tints. These effects can add significant impact and polish to your game's presentation and player feedback.

## Core Concepts

### 1. Offscreen Rendering Pipeline

To apply effects to the entire rendered scene, the Ironclad Engine uses an offscreen rendering pipeline:

1.  **Scene Rendering:** In each frame, all visible game scenes (e.g., `OverworldScene`, `HUDScene`) are first rendered to a hidden, offscreen canvas by the `SceneManager`.
2.  **Effect Application:** The `EffectsManager.postRender(mainContext, offscreenCanvas)` method is then called. It takes the content of this `offscreenCanvas`.
3.  **Final Draw:** The `EffectsManager` draws the `offscreenCanvas` to the main, visible canvas (`mainContext`), applying any active visual effects (like shake offsets or color overlays) during this transfer.

This ensures that effects like screen shake affect everything rendered by the game scenes, and color overlays like flash or tint cover the entire game view.

### 2. Modular Effect System

The FX system is designed to be modular and extensible:

- **`BaseEffect.js`**: This is an abstract base class that defines the common interface and lifecycle for all individual effect types. Each effect typically has a `duration`, an `isActive` state, and an `update(deltaTime)` method to manage its lifecycle, and an `apply(mainContext, sceneCanvas, effectPipelineData)` method to implement its visual logic.
- **Concrete Effect Classes (e.g., `ShakeEffect.js`, `FlashEffect.js`, `TintEffect.js`):** These classes extend `BaseEffect` and implement specific visual effects.
- **`EffectsManager.js`**:
  - Manages a list of currently active effect instances.
  - Provides methods to trigger effects (e.g., `effectsManager.shake(...)`), which typically create and add new instances of specific effect classes to the active list.
  - Calls `update(deltaTime)` on all active effects each frame.
  - Calls `apply(...)` on all active effects during the `postRender` phase.
  - Automatically removes effects from the active list once they report `hasFinished()`.

## Using the EffectsManager

The `EffectsManager` is instantiated by the `IroncladEngine` and is typically accessible via `engine.effectsManager`.

### Initialization

The `EffectsManager` is initialized by the `IroncladEngine` and doesn't require manual setup by the game developer, other than ensuring the engine itself is properly configured with an offscreen canvas.

### Triggering Effects

You can trigger effects from your game scenes or systems:

#### 1. Screen Shake (`ShakeEffect.js`)

Causes the screen to rapidly offset its position for a short duration.

- **Method:** `engine.effectsManager.shake(intensity, duration, decay)`
- **Parameters:**
  - `intensity` (number, optional, default: 10): Maximum pixel offset for the shake.
  - `duration` (number, optional, default: 500): Duration of the shake in milliseconds.
  - `decay` (boolean, optional, default: true): If `true`, the shake intensity will decrease linearly over its duration. If `false`, the intensity remains constant until the effect ends.

**Example:**

```javascript
// In a scene's update method, e.g., after a large impact
if (explosionHappened && this.engine.effectsManager) {
    this.engine.effectsManager.shake(20, 700, true); // Intensity 20, for 700ms, with decay
}
2. Screen Flash (FlashEffect.js)Overlays the screen with a color that typically fades out.Method: engine.effectsManager.flash(color, duration, maxOpacity, fadeOut)Parameters:color (string, optional, default: 'rgba(255, 255, 255, 0.5)'): CSS color string for the flash.duration (number, optional, default: 300): Duration of the flash in milliseconds.maxOpacity (number, optional, default: 0.7): Peak opacity of the flash (0 to 1).fadeOut (boolean, optional, default: true): If true, the flash opacity will fade from maxOpacity to 0 over the duration. If false, it stays at maxOpacity for the duration then disappears.Example:// When player takes damage
if (playerTookDamage && this.engine.effectsManager) {
    this.engine.effectsManager.flash('rgba(255, 0, 0, 0.5)', 250, 0.5, true); // Red flash
}
3. Screen Tint (TintEffect.js)Applies a persistent or timed color overlay to the screen, often used for mood or special states.Method to Apply/Update Tint: engine.effectsManager.tint(color, opacity)color (string, optional, default: 'rgba(0,0,0,0)'): CSS color string for the tint.opacity (number, optional, default: 0): Opacity of the tint (0 to 1).Calling tint() with new parameters will update the existing persistent tint or create one if it doesn't exist. This manages a single "persistent" tint layer.Method to Clear Tint: engine.effectsManager.clearTint()This is equivalent to calling tint('rgba(0,0,0,0)', 0).Timed Tints: You can also create a TintEffect instance directly and add it via effectsManager.addEffect() if you want a tint that lasts for a specific duration and then automatically removes itself (as TintEffect extends BaseEffect which handles duration).// Example for a timed sepia tint for 5 seconds
// const timedTint = new TintEffect({
//     engine: this.engine,
//     color: 'sepia', // Note: CSS named colors might not work directly for fillStyle opacity.
//                      // Better to use 'rgba(112, 66, 20, 0.3)' for a sepia-like effect with opacity.
//     opacity: 0.3,
//     duration: 5000 // 5 seconds
// });
// this.engine.effectsManager.addEffect(timedTint);
Example:// To set a night-time tint
if (isNightTime && this.engine.effectsManager) {
    this.engine.effectsManager.tint('rgba(0, 0, 50, 0.2)', 0.2);
}

// To clear the tint when it becomes day
if (isDayTime && this.engine.effectsManager) {
    this.engine.effectsManager.clearTint();
}
Engine Integration DetailsEffectsManager.update(deltaTime): Called by IroncladEngine._update() every frame to update the internal state of all active effects (e.g., decrementing timers, decaying intensity/opacity).EffectsManager.postRender(mainContext, offscreenCanvas): Called by IroncladEngine._render() after all scenes have been drawn to the offscreenCanvas. This method applies the visual effects and draws the final result to the mainContext (the visible canvas).Creating Custom EffectsThe system is designed to be extensible. You can create new visual effects by:Creating a new class that extends BaseEffect.js.Implementing the constructor, update(deltaTime), and apply(mainContext, sceneCanvas, effectPipelineData) methods for your specific effect logic.The EffectsManager can then manage instances of your custom effect class via its addEffect(instance) method.This FX system provides a powerful way to add visual polish and dynamic feedback to your Iron
```
