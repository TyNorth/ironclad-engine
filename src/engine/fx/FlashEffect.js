// src/engine/fx/FlashEffect.js
import BaseEffect from './BaseEffect.js'

/**
 * @class FlashEffect
 * @extends BaseEffect
 * @description Creates a screen flash visual effect with a specified color and opacity.
 */
class FlashEffect extends BaseEffect {
  /**
   * Creates an instance of FlashEffect.
   * @param {object} options - Configuration options for the flash effect.
   * @param {string} [options.color='rgba(255, 255, 255, 0.5)'] - The color of the flash (CSS color string).
   * @param {number} [options.duration=300] - Duration of the flash in milliseconds.
   * @param {number} [options.maxOpacity=0.7] - The peak opacity of the flash (0 to 1).
   * @param {boolean} [options.fadeOut=true] - Whether the flash opacity should fade out over its duration.
   * @param {boolean} [options.startsActive=true] - Whether the effect starts active.
   * @param {import('../core/IroncladEngine.js').default} [options.engine=null] - Optional reference to the engine.
   * @param {string} [options.id] - Optional ID for logging/identification.
   */
  constructor(options = {}) {
    const effectId =
      options.id || `FlashEffect(C:${options.color || 'white'},D:${options.duration || 300})`
    super({ ...options, id: effectId }) // Handles duration, startsActive, engine, id

    this.color = options.color || 'rgba(255, 255, 255, 0.5)' // Default to semi-transparent white
    this.maxOpacity = Math.max(
      0,
      Math.min(options.maxOpacity !== undefined ? options.maxOpacity : 0.7, 1),
    )
    this.fadeOut = options.fadeOut !== undefined ? options.fadeOut : true

    this.currentOpacity = 0 // Will be set by start() or if startsActive

    if (this.isActive) {
      // If startsActive was true in BaseEffect
      this.currentOpacity = this.maxOpacity
      // Timer and isFinished are handled by BaseEffect's constructor or start()
    }
    // console.log(`[${this.id} Constructor] Color: ${this.color}, MaxOpacity: ${this.maxOpacity}, FadeOut: ${this.fadeOut}, Active: ${this.isActive}`);
  }

  /**
   * Updates the flash effect's opacity over time if fadeOut is enabled.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   */
  update(deltaTime) {
    if (!this.isActive || this.isFinished) {
      if (this.currentOpacity !== 0) this.currentOpacity = 0
      return
    }

    super.update(deltaTime) // Handles timer and sets isFinished, isActive

    if (this.isFinished) {
      // If super.update() just marked it as finished
      this.currentOpacity = 0
    } else if (this.fadeOut && this.duration > 0) {
      // Linear fade out
      this.currentOpacity =
        this.maxOpacity * Math.max(0, (this.duration - this.timer) / this.duration)
    } else if (!this.fadeOut) {
      // If no fadeOut, opacity remains maxOpacity until finished, then drops to 0
      this.currentOpacity = this.isFinished ? 0 : this.maxOpacity
    }
    this.currentOpacity = Math.max(0, Math.min(this.currentOpacity, this.maxOpacity)) // Clamp

    // console.log(`[${this.id} Update] Timer: ${this.timer.toFixed(0)}, CurrentOpacity: ${this.currentOpacity.toFixed(2)}, Active: ${this.isActive}, Finished: ${this.isFinished}`);
  }

  /**
   * Applies the screen flash by drawing a colored overlay.
   * This method is called by the EffectsManager during its postRender phase,
   * typically after the scene and any positional effects have been drawn.
   * @param {CanvasRenderingContext2D} mainContext - The context of the main (visible) canvas.
   * @param {HTMLCanvasElement} sceneCanvas - The offscreen canvas (not directly used by flash, but passed by manager).
   * @param {object} [effectPipelineData={}] - Data from previous effects (not typically used by flash).
   * @returns {void}
   */
  apply(mainContext, sceneCanvas, effectPipelineData = {}) {
    if (!this.isActive || this.isFinished || this.currentOpacity <= 0) {
      // console.log(`[${this.id} Apply] Not active or zero opacity. Opacity: ${this.currentOpacity}, Active: ${this.isActive}`);
      return
    }

    const originalAlpha = mainContext.globalAlpha
    mainContext.globalAlpha = this.currentOpacity
    mainContext.fillStyle = this.color
    mainContext.fillRect(0, 0, mainContext.canvas.width, mainContext.canvas.height)
    mainContext.globalAlpha = originalAlpha // Restore globalAlpha

    // console.log(`[${this.id} Apply] Applied flash. Color: ${this.color}, Opacity: ${this.currentOpacity.toFixed(2)}`);
  }

  /**
   * Starts or restarts the flash effect.
   */
  start() {
    super.start() // Resets timer, sets isActive=true, isFinished=false
    this.currentOpacity = this.maxOpacity
    // console.log(`[${this.id} Start] Flash started/restarted. Opacity: ${this.currentOpacity}`);
  }

  /**
   * Resets the flash effect to its initial state.
   */
  reset() {
    super.reset() // Resets timer, isActive, isFinished
    this.currentOpacity = 0 // Opacity is 0 until started
    // console.log(`[${this.id} Reset] Flash reset.`);
  }
}

export default FlashEffect
