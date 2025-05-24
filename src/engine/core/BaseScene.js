// src/engine/core/BaseScene.js

/**
 * @file BaseScene.js
 * @description A base class for all game scenes, providing common lifecycle methods,
 * properties, and UI element management helpers.
 */

/**
 * @class BaseScene
 * @abstract
 * @description An abstract base class that game scenes can extend.
 * It provides a common structure for initialization, updates, rendering,
 * and managing a list of UI elements.
 */
class BaseScene {
  constructor() {
    /** * Reference to the game engine instance.
     * This is typically set by the SceneManager when the scene is initialized.
     * @type {import('./IroncladEngine.js').default | null}
     */
    this.engine = null

    /** * UI context data passed to this scene or managed by it.
     * Can be used for sharing state with UI elements or other scenes.
     * @type {object | null}
     */
    this.uiContext = null

    /** * Array to hold UI elements managed by this scene.
     * Use `addUIElement()` to add elements to this list.
     * @type {import('../ui/BaseUIElement.js').default[]}
     */
    this.uiElements = []

    /**
     * If true, this scene blocks updates to scenes below it in the SceneManager stack.
     * If false (e.g., for a HUD), scenes below it will also update.
     * @type {boolean}
     */
    this.isModal = true

    /**
     * Tracks if the scene has been successfully initialized.
     * @type {boolean}
     */
    this.isInitialized = false

    // console.log(`${this.constructor.name}: Constructed.`);
  }

  /**
   * Called by the SceneManager when the scene is first activated (pushed or switched to).
   * Override this for one-time setup, loading scene-specific assets, and initializing UI.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Optional data passed when the scene is activated (e.g., from `pushScene` or `switchTo`).
   * @returns {Promise<void> | void}
   */
  async initialize(engine, data = {}) {
    this.engine = engine
    // If data contains uiContext, assign it
    if (data && data.uiContext !== undefined) {
      this.uiContext = data.uiContext
    }
    this.isInitialized = true
    // console.log(`${this.constructor.name}: Initialized with data:`, data);
  }

  /**
   * Called every frame by the SceneManager if this scene is active.
   * Override for scene-specific game logic, input handling.
   * This base implementation updates managed UI elements.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async update(deltaTime, engine) {
    if (this.uiElements && this.uiElements.length > 0 && this.isInitialized) {
      this.updateUIElements(deltaTime, engine)
    }
  }

  /**
   * Called every frame by the SceneManager for visible scenes.
   * Override for scene-specific drawing operations (background, game world elements).
   * This base implementation renders managed UI elements.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async render(context, engine) {
    if (this.uiElements && this.uiElements.length > 0 && this.isInitialized) {
      this.renderUIElements(context, engine)
    }
  }

  /**
   * Called by SceneManager when another modal scene is pushed on top of this one.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async pause(engine) {
    // console.log(`${this.constructor.name}: Paused.`);
  }

  /**
   * Called by SceneManager when this scene becomes active again after a scene above it was popped.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @param {any} [data=null] - Optional data passed from the popped scene.
   * @returns {Promise<void> | void}
   */
  async resume(engine, data = null) {
    // console.log(`${this.constructor.name}: Resumed with data:`, data);
  }

  /**
   * Called by SceneManager when the scene is about to be permanently removed.
   * Override for final cleanup. Base implementation clears UI elements.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async unload(engine) {
    // console.log(`${this.constructor.name}: Unloading.`);
    this.uiElements.forEach((element) => {
      if (typeof element.destroy === 'function') {
        element.destroy()
      }
    })
    this.uiElements = []
    this.isInitialized = false
    this.engine = null // Nullify engine reference
    this.uiContext = null
  }

  /**
   * Adds a UI element to this scene's managed list and sets its engine reference.
   * @param {import('../ui/BaseUIElement.js').default} element - The UI element to add.
   */
  addUIElement(element) {
    if (element) {
      if (typeof element.setEngine === 'function' && this.engine) {
        element.setEngine(this.engine)
      }
      this.uiElements.push(element)
    } else {
      console.warn(`${this.constructor.name}: Attempted to add a null or undefined UI element.`)
    }
  }

  /**
   * Updates all enabled and visible UI elements managed by this scene.
   * Typically called by the scene's `update` method or `BaseScene.update`.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   */
  updateUIElements(deltaTime, engine) {
    if (!engine || !engine.inputManager) {
      // console.warn(`${this.constructor.name}: updateUIElements called without engine or inputManager.`);
      return
    }
    const mousePos = engine.inputManager.getCanvasMousePosition()
    for (const element of this.uiElements) {
      if (element.visible && element.enabled) {
        element.update(deltaTime, engine, mousePos)
      }
    }
  }

  /**
   * Renders all visible UI elements managed by this scene.
   * Typically called by the scene's `render` method or `BaseScene.render`.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   */
  renderUIElements(context, engine) {
    for (const element of this.uiElements) {
      if (element.visible) {
        element.render(context, engine)
      }
    }
  }
}
export default BaseScene
