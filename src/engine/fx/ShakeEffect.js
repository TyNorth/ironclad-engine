// src/engine/fx/ShakeEffect.js
import BaseEffect from './BaseEffect.js'

/**
 * @class ShakeEffect
 * @extends BaseEffect
 * @description Creates a screen shake visual effect.
 */
class ShakeEffect extends BaseEffect {
  /**
   * Creates an instance of ShakeEffect.
   * @param {object} options - Configuration options for the shake effect.
   * @param {number} [options.intensity=10] - Maximum pixel offset for the shake.
   * @param {number} [options.duration=500] - Duration of the shake in milliseconds.
   * @param {boolean} [options.decay=true] - Whether the shake intensity should decay over its duration.
   * @param {import('../core/IroncladEngine.js').default} [options.engine=null] - Optional reference to the engine.
   */
  constructor(options = {}) {
    super(options) // Handles duration, startsActive, engine

    this.baseIntensity = Math.abs(options.intensity || 10)
    this.currentIntensity = this.isActive ? this.baseIntensity : 0
    this.decay = options.decay !== undefined ? options.decay : true

    // Ensure timer is 0 if effect starts active, as super.start() would do this.
    // BaseEffect constructor sets isActive based on options.startsActive (defaults to true).
    // BaseEffect.start() resets timer to 0.
    if (this.isActive) {
      this.timer = 0
      this.isFinished = false
    }
    // console.log(`[ShakeEffect Constructor] Initialized. Intensity: ${this.baseIntensity}, Duration: ${this.duration}ms, Decay: ${this.decay}, Active: ${this.isActive}, Timer: ${this.timer}`);
  }

  /**
   * Updates the shake effect's intensity over time if decay is enabled.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   */
  update(deltaTime) {
    const effectName = this.id || `ShakeEffect(Dur:${this.duration},Decay:${this.decay})`
    // console.log(`[${effectName}] Pre-Update. Active: ${this.isActive}, Finished: ${this.isFinished}, Timer: ${this.timer.toFixed(0)}, CurrentIntensity: ${this.currentIntensity.toFixed(2)}, BaseIntensity: ${this.baseIntensity}`);

    if (!this.isActive || this.isFinished) {
      if (this.currentIntensity !== 0) {
        // console.log(`[${effectName}] Update: Inactive/Finished, ensuring intensity is 0.`);
        this.currentIntensity = 0
      }
      return
    }

    super.update(deltaTime) // This updates this.timer and potentially sets this.isFinished and this.isActive = false

    // console.log(`[${effectName}] Post super.update. Active: ${this.isActive}, Finished: ${this.isFinished}, Timer: ${this.timer.toFixed(0)}`);

    if (this.decay && this.duration > 0) {
      // console.log(`[${effectName}] Update: Applying decay. BaseIntensity: ${this.baseIntensity}`);
      if (this.isFinished) {
        // If super.update() marked it as finished
        this.currentIntensity = 0
      } else {
        // Linear decay: intensity decreases as timer approaches duration
        this.currentIntensity =
          this.baseIntensity * Math.max(0, (this.duration - this.timer) / this.duration)
      }
      // console.log(`[${effectName}] Update: Decayed Intensity: ${this.currentIntensity.toFixed(2)}`);
    } else if (!this.decay) {
      // No decay
      // console.log(`[${effectName}] Update: No decay. BaseIntensity: ${this.baseIntensity}`);
      // Intensity should remain baseIntensity until it's finished
      this.currentIntensity = this.isFinished ? 0 : this.baseIntensity
      // console.log(`[${effectName}] Update: Non-decayed Intensity: ${this.currentIntensity.toFixed(2)} (isFinished: ${this.isFinished})`);
    }

    this.currentIntensity = Math.max(0, this.currentIntensity) // Ensure intensity doesn't go negative
  }

  /**
   * Applies the screen shake by modifying the drawing offset.
   * @param {CanvasRenderingContext2D} mainContext - The context of the main (visible) canvas.
   * @param {HTMLCanvasElement} sceneCanvas - The offscreen canvas containing the rendered scene content.
   * @param {object} [effectPipelineData={drawX: 0, drawY: 0}] - Data from previous effects.
   * @returns {{drawX: number, drawY: number}} The modified draw offsets.
   */
  apply(mainContext, sceneCanvas, effectPipelineData = {}) {
    // isFinished is checked by super.update() which sets isActive = false.
    // BaseEffect.apply also checks isActive.
    // We also need to check currentIntensity because it might be 0 even if not "finished" by timer (e.g. decay completed)
    if (!this.isActive || this.currentIntensity <= 0) {
      // Simplified check
      // console.log(`[ShakeEffect Apply] Not active or zero intensity. Intensity: ${this.currentIntensity}, Active: ${this.isActive}, Finished: ${this.isFinished}`);
      return effectPipelineData
    }

    const currentDrawX = effectPipelineData.drawX || 0
    const currentDrawY = effectPipelineData.drawY || 0

    const offsetX = (Math.random() - 0.5) * 2 * this.currentIntensity
    const offsetY = (Math.random() - 0.5) * 2 * this.currentIntensity

    // console.log(`[ShakeEffect Apply] Active. Intensity=${this.currentIntensity.toFixed(2)}, OffsetX=${offsetX.toFixed(2)}, OffsetY=${offsetY.toFixed(2)}`);

    return {
      drawX: currentDrawX + offsetX,
      drawY: currentDrawY + offsetY,
    }
  }

  start() {
    super.start() // Resets timer, sets isActive=true, isFinished=false
    this.currentIntensity = this.baseIntensity
    // console.log(`[ShakeEffect Start] Started/Restarted. Intensity: ${this.currentIntensity}, Duration: ${this.duration}`);
  }

  reset() {
    super.reset() // Resets timer, isActive, isFinished
    this.currentIntensity = 0
    // console.log(`[ShakeEffect Reset] Reset.`);
  }
}

export default ShakeEffect
