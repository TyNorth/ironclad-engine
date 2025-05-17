// src/engine/fx/BaseEffect.js

/**
 * @file BaseEffect.js
 * @description An abstract base class for visual effects.
 * Specific effects (Shake, Flash, etc.) should extend this class.
 */
// src/engine/fx/BaseEffect.js

class BaseEffect {
  constructor(options = {}) {
    this.engine = options.engine || null
    this.duration = options.duration !== undefined ? options.duration : 1000 // ms
    this.timer = 0 // Current time elapsed for this effect in ms
    this.isActive = options.startsActive !== undefined ? options.startsActive : true
    this.isFinished = false
    this.id = options.id || this.constructor.name // For logging

    // console.log(`[${this.id} Constructor] Duration: ${this.duration}ms, Active: ${this.isActive}`);
  }

  update(deltaTime) {
    if (!this.isActive || this.isFinished) {
      return
    }

    this.timer += deltaTime * 1000

    // --- DETAILED LOGGING FOR TIMER AND DURATION ---
    // console.log(`[${this.id} Update] Timer: ${this.timer.toFixed(0)}ms / ${this.duration}ms, IsActive: ${this.isActive}, IsFinished: ${this.isFinished}`);

    if (this.duration !== Infinity && this.timer >= this.duration) {
      this.isFinished = true
      this.isActive = false
      console.log(
        `%c[${this.id} Update] Effect FINISHED. Timer: ${this.timer.toFixed(0)}ms, Duration: ${this.duration}ms`,
        'color: red; font-weight: bold;',
      )
    }
  }

  apply(mainContext, sceneCanvas, effectPipelineData = {}) {
    if (!this.isActive || this.isFinished) {
      return effectPipelineData
    }
    console.warn(`BaseEffect (${this.id}): apply() method not implemented in subclass.`)
    return effectPipelineData
  }

  start() {
    this.timer = 0
    this.isActive = true
    this.isFinished = false
    // console.log(`[${this.id} Start] Effect started/restarted.`);
  }

  stop() {
    this.isActive = false
    this.isFinished = true
    // console.log(`[${this.id} Stop] Effect stopped.`);
  }

  reset() {
    this.timer = 0
    this.isActive = false
    this.isFinished = false
    // console.log(`[${this.id} Reset] Effect reset.`);
  }

  hasFinished() {
    return this.isFinished
  }

  setEngine(engine) {
    this.engine = engine
  }
}

export default BaseEffect
