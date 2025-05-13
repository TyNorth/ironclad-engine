// src/engine/core/SceneManager.js

/**
 * @file SceneManager.js
 * @description Manages game scenes, controlling which scene is active,
 * updating, and rendering.
 */

/**
 * @typedef {object} Scene
 * @description Interface for a game scene.
 * @property {function(CanvasRenderingContext2D, object=): void} initialize - Called when the scene is first entered or switched to.
 * Receives the canvas rendering context and optional data passed during the transition.
 * @property {function(number): void} update - Called every frame with deltaTime (time since last frame in seconds).
 * @property {function(CanvasRenderingContext2D): void} render - Called every frame to draw the scene. Receives the canvas rendering context.
 * @property {function(): void} unload - Called when the scene is exited or switched away from. Used for cleanup.
 */

/**
 * @class SceneManager
 * @description Manages the collection of scenes and the active scene.
 * It delegates update and render calls from the GameLoop to the current scene.
 */
class SceneManager {
  /**
   * Creates an instance of SceneManager.
   */
  constructor() {
    /**
     * @private
     * @type {Object.<string, Scene>}
     * @description A collection of all registered scenes, keyed by their name.
     */
    this.scenes = {}

    /**
     * @private
     * @type {Scene | null}
     * @description The currently active scene.
     */
    this.currentScene = null

    /**
     * @private
     * @type {string | null}
     * @description The name of the currently active scene.
     */
    this.currentSceneName = null

    /**
     * @private
     * @type {CanvasRenderingContext2D | null}
     * @description The canvas rendering context, passed to scenes.
     */
    this.context = null
  }

  /**
   * Sets the canvas rendering context to be used by scenes.
   * This should be called once during initialization.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
   */
  setContext(context) {
    if (!context) {
      console.error('SceneManager: Provided context is invalid.')
      return
    }
    this.context = context
    console.log('SceneManager: Canvas rendering context set.')
  }

  /**
   * Adds a scene to the manager.
   * The scene object should conform to the Scene interface.
   * @param {string} name - The unique name for the scene.
   * @param {Scene} scene - The scene object.
   */
  add(name, scene) {
    if (typeof name !== 'string' || !name) {
      console.error('SceneManager: Scene name must be a non-empty string.')
      return
    }
    if (typeof scene !== 'object' || scene === null) {
      console.error(`SceneManager: Scene object for "${name}" is invalid.`)
      return
    }
    if (
      typeof scene.initialize !== 'function' ||
      typeof scene.update !== 'function' ||
      typeof scene.render !== 'function' ||
      typeof scene.unload !== 'function'
    ) {
      console.error(
        `SceneManager: Scene "${name}" does not implement all required methods (initialize, update, render, unload).`,
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
   * This will call `unload` on the current scene (if any)
   * and `initialize` on the new scene.
   * @param {string} name - The name of the scene to switch to.
   * @param {object} [data={}] - Optional data to pass to the new scene's initialize method.
   */
  switchTo(name, data = {}) {
    if (!this.context) {
      console.error(
        'SceneManager: Cannot switch scene. Rendering context not set. Call setContext() first.',
      )
      return
    }
    if (!this.scenes[name]) {
      console.error(`SceneManager: Scene with name "${name}" not found.`)
      return
    }

    if (this.currentScene && typeof this.currentScene.unload === 'function') {
      console.log(`SceneManager: Unloading scene "${this.currentSceneName}".`)
      this.currentScene.unload()
    }

    this.currentScene = this.scenes[name]
    this.currentSceneName = name
    console.log(`SceneManager: Switching to scene "${name}".`)

    if (typeof this.currentScene.initialize === 'function') {
      this.currentScene.initialize(this.context, data)
    } else {
      // This case should ideally be caught by the add method check
      console.error(`SceneManager: Scene "${name}" is missing the initialize method.`)
    }
  }

  /**
   * Updates the current active scene. Called by the GameLoop.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   */
  update(deltaTime) {
    if (this.currentScene && typeof this.currentScene.update === 'function') {
      this.currentScene.update(deltaTime)
    }
  }

  /**
   * Renders the current active scene. Called by the GameLoop.
   * The SceneManager itself doesn't render; it delegates to the scene.
   * The context is passed during initialization and when switching scenes.
   */
  render() {
    if (this.currentScene && typeof this.currentScene.render === 'function' && this.context) {
      this.currentScene.render(this.context)
    } else if (this.currentScene && !this.context) {
      console.warn(
        `SceneManager: Cannot render scene "${this.currentSceneName}" because context is not set.`,
      )
    }
  }

  /**
   * Gets the currently active scene instance.
   * @returns {Scene | null} The current scene object or null if none is active.
   */
  getActiveScene() {
    return this.currentScene
  }

  /**
   * Gets the name of the currently active scene.
   * @returns {string | null} The name of the current scene or null.
   */
  getActiveSceneName() {
    return this.currentSceneName
  }
}

export default SceneManager
