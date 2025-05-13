// src/engine/core/SceneManager.js

/**
 * @file SceneManager.js
 * @description Manages game scenes, controlling which scene is active,
 * updating, and rendering. Passes engine instance to scene methods.
 */

/**
 * @typedef {object} Scene
 * @description Interface for a game scene.
 * @property {function(import('./IroncladEngine.js').default, CanvasRenderingContext2D, object=): void} initialize - Called when the scene is first entered or switched to.
 * @property {function(number, import('./IroncladEngine.js').default): void} update - Called every frame with deltaTime and the engine instance.
 * @property {function(CanvasRenderingContext2D, import('./IroncladEngine.js').default): void} render - Called every frame to draw the scene.
 * @property {function(import('./IroncladEngine.js').default): void} unload - Called when the scene is exited or switched away from.
 */

/**
 * @class SceneManager
 * @description Manages the collection of scenes and the active scene.
 */
class SceneManager {
  constructor() {
    /** @private @type {Object.<string, Scene>} */
    this.scenes = {}
    /** @private @type {Scene | null} */
    this.currentScene = null
    /** @private @type {string | null} */
    this.currentSceneName = null
    /** @private @type {CanvasRenderingContext2D | null} */
    this.context = null
    /**
     * @private
     * @type {import('./IroncladEngine.js').default | null}
     */
    this.engine = null // To store the engine instance

    // console.log('SceneManager: Initialized.'); // Already logged by engine
  }

  /**
   * Sets the canvas rendering context and the engine instance.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {import('./IroncladEngine.js').default} engineInstance - The main engine instance.
   */
  setContextAndEngine(context, engineInstance) {
    if (!context) {
      console.error('SceneManager: Provided context is invalid.')
      // No return here, let engine also be set if context is somehow bad
    }
    this.context = context
    // console.log('SceneManager: Canvas rendering context set.'); // Logged by engine

    if (!engineInstance) {
      console.error('SceneManager: Provided engine instance is invalid.')
      return
    }
    this.engine = engineInstance
    console.log('SceneManager: Engine instance set.')
  }

  /**
   * Adds a scene instance to the manager.
   * @param {string} name - The unique name for the scene.
   * @param {Scene} scene - The scene object (already instantiated).
   */
  add(name, scene) {
    // ... (validation for name and scene object as before) ...
    if (typeof name !== 'string' || !name) {
      /* ... */ return
    }
    if (typeof scene !== 'object' || scene === null) {
      /* ... */ return
    }
    if (
      typeof scene.initialize !== 'function' ||
      typeof scene.update !== 'function' ||
      typeof scene.render !== 'function' ||
      typeof scene.unload !== 'function'
    ) {
      console.error(
        `SceneManager: Scene "${name}" does not correctly implement all required methods (initialize, update, render, unload). Check method signatures to include engine instance.`,
      )
      return
    }

    if (this.scenes[name]) {
      console.warn(
        `SceneManager: Scene with name "${name}" already exists. It will be overwritten.`,
      )
    }
    this.scenes[name] = scene
    console.log(`SceneManager: Scene "${name}" added.`)
  }

  /**
   * Switches to a different scene.
   * @param {string} name - The name of the scene to switch to.
   * @param {object} [data={}] - Optional data to pass to the new scene's initialize method.
   */
  switchTo(name, data = {}) {
    if (!this.context) {
      console.error('SceneManager: Cannot switch scene. Rendering context not set.')
      return
    }
    if (!this.engine) {
      console.error('SceneManager: Cannot switch scene. Engine instance not set.')
      return
    }
    if (!this.scenes[name]) {
      console.error(`SceneManager: Scene with name "${name}" not found.`)
      return
    }

    if (this.currentScene && typeof this.currentScene.unload === 'function') {
      console.log(`SceneManager: Unloading scene "${this.currentSceneName}".`)
      this.currentScene.unload(this.engine) // Pass engine to unload
    }

    this.currentScene = this.scenes[name]
    this.currentSceneName = name
    console.log(`SceneManager: Switching to scene "${name}".`)

    if (typeof this.currentScene.initialize === 'function') {
      this.currentScene.initialize(this.engine, this.context, data) // Pass engine to initialize
    } else {
      console.error(`SceneManager: Scene "${name}" is missing the initialize method.`)
    }
  }

  /**
   * Updates the current active scene.
   * @param {number} deltaTime - The time elapsed since the last frame.
   */
  update(deltaTime) {
    if (this.currentScene && typeof this.currentScene.update === 'function' && this.engine) {
      this.currentScene.update(deltaTime, this.engine) // Pass engine to update
    }
  }

  /**
   * Renders the current active scene.
   */
  render() {
    if (
      this.currentScene &&
      typeof this.currentScene.render === 'function' &&
      this.context &&
      this.engine
    ) {
      this.currentScene.render(this.context, this.engine) // Pass engine to render
    } else if (this.currentScene && (!this.context || !this.engine)) {
      console.warn(
        `SceneManager: Cannot render scene "${this.currentSceneName}" because context or engine is not set.`,
      )
    }
  }

  getActiveScene() {
    return this.currentScene
  }
  getActiveSceneName() {
    return this.currentSceneName
  }
}

export default SceneManager
