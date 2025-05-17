// src/engine/fx/TintEffect.js
import BaseEffect from './BaseEffect.js'

/**
 * @class TintEffect
 * @extends BaseEffect
 * @description Applies a persistent or timed color tint to the screen.
 */
class TintEffect extends BaseEffect {
  /**
   * Creates an instance of TintEffect.
   * @param {object} options - Configuration options for the tint effect.
   * @param {string} [options.color='rgba(0, 0, 0, 0)'] - The color of the tint (CSS color string).
   * @param {number} [options.opacity=0.25] - The opacity of the tint (0 to 1).
   * @param {number} [options.duration=Infinity] - Duration of the tint in milliseconds. Infinity for a persistent tint.
   * @param {boolean} [options.startsActive=true] - Whether the effect starts active.
   * @param {import('../core/IroncladEngine.js').default} [options.engine=null] - Optional reference to the engine.
   * @param {string} [options.id] - Optional ID for logging/identification.
   */
  constructor(options = {}) {
    const effectId =
      options.id || `TintEffect(C:${options.color || 'transparent'},O:${options.opacity || 0})`
    // If duration is not explicitly set for a tint, make it Infinity by default
    const duration = options.duration !== undefined ? options.duration : Infinity
    super({ ...options, id: effectId, duration: duration }) // Handles startsActive, engine, id

    this.color = options.color || 'rgba(0, 0, 0, 0)' // Default to fully transparent
    this.opacity = Math.max(0, Math.min(options.opacity !== undefined ? options.opacity : 0.25, 1))

    // currentOpacity will be this.opacity when active, or 0 if not.
    // Unlike FlashEffect, a persistent tint doesn't usually fade internally unless duration is set.
    this.currentOpacity = this.isActive ? this.opacity : 0

    // console.log(`[${this.id} Constructor] Color: ${this.color}, Opacity: ${this.opacity}, Duration: ${this.duration}ms, Active: ${this.isActive}`);
  }

  /**
   * Updates the tint effect. Mainly handles timed tints.
   * For persistent tints (duration=Infinity), this mostly relies on BaseEffect.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   */
  update(deltaTime) {
    if (!this.isActive || this.isFinished) {
      // Ensure opacity is 0 if not active or finished,
      // especially if it was a timed tint that just ended.
      if (this.currentOpacity !== 0) this.currentOpacity = 0
      return
    }

    super.update(deltaTime) // Handles timer and sets isFinished, isActive for timed tints

    if (this.isFinished) {
      this.currentOpacity = 0
    } else {
      // For a tint, opacity is generally constant while active, unless it's a timed tint that fades.
      // For now, we assume a timed tint just disappears when finished.
      // If a fade-out for timed tints is desired, that logic would go here.
      this.currentOpacity = this.opacity
    }
    // console.log(`[${this.id} Update] Timer: ${this.timer.toFixed(0)}, CurrentOpacity: ${this.currentOpacity.toFixed(2)}, Active: ${this.isActive}, Finished: ${this.isFinished}`);
  }

  /**
   * Applies the screen tint by drawing a colored overlay.
   * @param {CanvasRenderingContext2D} mainContext - The context of the main (visible) canvas.
   * @param {HTMLCanvasElement} sceneCanvas - The offscreen canvas.
   * @param {object} [effectPipelineData={}] - Data from previous effects.
   * @returns {void}
   */
  apply(mainContext, sceneCanvas, effectPipelineData = {}) {
    if (
      !this.isActive ||
      this.isFinished ||
      this.currentOpacity <= 0 ||
      this.color === 'rgba(0, 0, 0, 0)'
    ) {
      // console.log(`[${this.id} Apply] Not active, zero opacity, or transparent color. Opacity: ${this.currentOpacity}, Active: ${this.isActive}`);
      return
    }

    const originalAlpha = mainContext.globalAlpha
    mainContext.globalAlpha = this.currentOpacity // Use the tint's current opacity
    mainContext.fillStyle = this.color
    mainContext.fillRect(0, 0, mainContext.canvas.width, mainContext.canvas.height)
    mainContext.globalAlpha = originalAlpha

    // console.log(`[${this.id} Apply] Applied tint. Color: ${this.color}, Opacity: ${this.currentOpacity.toFixed(2)}`);
  }

  /**
   * Starts or restarts the tint effect.
   */
  start() {
    super.start()
    this.currentOpacity = this.opacity // Set to defined opacity when started
    // console.log(`[${this.id} Start] Tint started/restarted. Opacity: ${this.currentOpacity}`);
  }

  /**
   * Stops the tint effect. For persistent tints, this effectively removes them.
   */
  stop() {
    super.stop()
    this.currentOpacity = 0 // Ensure visually gone
    // console.log(`[${this.id} Stop] Tint stopped. Opacity set to 0.`);
  }

  /**
   * Resets the tint effect.
   */
  reset() {
    super.reset()
    this.currentOpacity = 0 // Not active, so no opacity
    // console.log(`[${this.id} Reset] Tint reset.`);
  }

  /**
   * Sets the color of the tint.
   * @param {string} newColor
   */
  setColor(newColor) {
    this.color = newColor
  }

  /**
   * Sets the opacity of the tint.
   * @param {number} newOpacity - Value between 0 and 1.
   */
  setOpacity(newOpacity) {
    this.opacity = Math.max(0, Math.min(newOpacity, 1))
    if (this.isActive && !this.isFinished) {
      // Only update currentOpacity if active
      this.currentOpacity = this.opacity
    }
  }
}

export default TintEffect
