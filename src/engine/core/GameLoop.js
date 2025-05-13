// src/engine/core/GameLoop.js

/**
 * @file GameLoop.js
 * @description Defines the core game loop using requestAnimationFrame.
 * Manages update and render cycles and calculates delta time.
 */

/**
 * @class GameLoop
 * @description Manages the main game loop, calling update and render functions
 * at a consistent rate.
 */
class GameLoop {
  /**
   * Creates an instance of GameLoop.
   * @param {function(number): void} update - The function to call for game logic updates.
   * It receives deltaTime in seconds.
   * @param {function(): void} render - The function to call for rendering the game.
   */
  constructor(update, render) {
    /** @private {boolean} Indicates if the game loop is currently running. */
    this.isRunning = false
    /** @private {number} The timestamp of the last frame. Used to calculate deltaTime. */
    this.lastTime = 0
    /** @private {number} The accumulated time for fixed updates, if we were to implement them. Not used in basic loop. */
    // this.accumulator = 0;
    /** @private {number} The ID returned by requestAnimationFrame. Used to cancel the loop. */
    this.rafId = null

    /** @private {function(number): void} The game's main update function. */
    this.update =
      update ||
      ((deltaTime) => {
        console.warn('GameLoop: Update function not provided.', deltaTime)
      })
    /** @private {function(): void} The game's main render function. */
    this.render =
      render ||
      (() => {
        console.warn('GameLoop: Render function not provided.')
      })

    // Bind the loop method to this instance to maintain context in requestAnimationFrame
    this.loop = this.loop.bind(this)
  }

  /**
   * The main loop method that gets called by requestAnimationFrame.
   * @param {number} currentTime - The current time in milliseconds, provided by requestAnimationFrame.
   * @private
   */
  loop(currentTime) {
    if (!this.isRunning) {
      return
    }

    // Convert time to seconds
    const currentInSeconds = currentTime * 0.001
    const deltaTime = currentInSeconds - this.lastTime * 0.001
    this.lastTime = currentTime

    // Call the provided update function with deltaTime
    this.update(deltaTime)

    // Call the provided render function
    this.render()

    // Request the next frame
    this.rafId = requestAnimationFrame(this.loop)
  }

  /**
   * Starts the game loop.
   * Logs a warning if the loop is already running.
   */
  start() {
    if (this.isRunning) {
      console.warn('GameLoop is already running.')
      return
    }
    this.isRunning = true
    this.lastTime = performance.now() // Initialize lastTime before the first loop call
    console.log('GameLoop started.')
    this.rafId = requestAnimationFrame(this.loop)
  }

  /**
   * Stops the game loop.
   */
  stop() {
    if (!this.isRunning) {
      console.warn('GameLoop is not running.')
      return
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
    this.isRunning = false
    this.rafId = null
    console.log('GameLoop stopped.')
  }

  /**
   * Sets a new update function for the game loop.
   * @param {function(number): void} newUpdateFunction - The new function to call for game logic updates.
   */
  setUpdate(newUpdateFunction) {
    if (typeof newUpdateFunction === 'function') {
      this.update = newUpdateFunction
    } else {
      console.error('Failed to set update function: provided argument is not a function.')
    }
  }

  /**
   * Sets a new render function for the game loop.
   * @param {function(): void} newRenderFunction - The new function to call for rendering the game.
   */
  setRender(newRenderFunction) {
    if (typeof newRenderFunction === 'function') {
      this.render = newRenderFunction
    } else {
      console.error('Failed to set render function: provided argument is not a function.')
    }
  }
}

export default GameLoop
