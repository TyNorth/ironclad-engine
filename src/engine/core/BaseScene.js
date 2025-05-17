// src/engine/core/BaseScene.js

/**
 * @file BaseScene.js
 * @description A base class for all game scenes, providing common lifecycle methods and properties.
 */

class BaseScene {
  constructor() {
    /** @type {import('./IroncladEngine.js').default | null} Reference to the game engine. Set by SceneManager. */
    this.engine = null

    /** @type {object | null} UI context data passed to this scene or managed by it. */
    this.uiContext = null

    /** @type {import('../ui/BaseUIElement.js').default[]} Array to hold UI elements managed by this scene. */
    this.uiElements = []

    /**
     * @type {boolean}
     * @description If true, this scene blocks updates to scenes below it in the SceneManager stack.
     * If false (e.g., for a HUD), scenes below it will also update.
     */
    this.isModal = true

    /**
     * @type {boolean}
     * @description Tracks if the scene has been initialized. Prevents re-initialization if not desired.
     * Note: The current SceneManager (class-based) creates new instances, so initialize is called once per instance.
     * This flag is more useful if scenes were re-used.
     */
    this.isInitialized = false

    // console.log(`${this.constructor.name}: Constructed.`);
  }

  /**
   * Called by the SceneManager when the scene is first created and activated (pushed or switched to).
   * Ideal for one-time setup, loading scene-specific assets (if not preloaded), and initializing UI.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Optional data passed when the scene is activated.
   * @returns {Promise<void> | void}
   */
  async initialize(engine, data = {}) {
    this.engine = engine
    this.isInitialized = true
    // console.log(`${this.constructor.name}: Initialized with data:`, data);
  }

  /**
   * Called every frame by the SceneManager if this scene is active (or non-modal and further down the stack).
   * Contains the main game logic for the scene, input handling, and UI element updates.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async update(deltaTime, engine) {
    // Example: Update UI elements if the scene manages them directly
    // const mousePos = engine.inputManager.getCanvasMousePosition();
    // for (const element of this.uiElements) {
    //     if (element.visible && element.enabled) {
    //         element.update(deltaTime, engine, mousePos);
    //     }
    // }
  }

  /**
   * Called every frame by the SceneManager for each scene in the stack (bottom to top) that is visible.
   * Handles all drawing operations for this scene.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async render(context, engine) {
    // Example: Render UI elements if the scene manages them directly
    // for (const element of this.uiElements) {
    //     if (element.visible) {
    //         element.render(context, engine);
    //     }
    // }
  }

  /**
   * Called by the SceneManager when another scene is pushed on top of this one,
   * making this scene no longer the active (top) updating scene (if this scene is modal).
   * Good for pausing animations, saving temporary state, or stopping sounds specific to this scene.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async pause(engine) {
    // console.log(`${this.constructor.name}: Paused.`);
  }

  /**
   * Called by the SceneManager when this scene becomes the active (top) updating scene again
   * after a scene above it was popped.
   * Good for restoring state, resuming animations, or restarting sounds.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @param {any} [data=null] - Optional data passed from the popped scene.
   * @returns {Promise<void> | void}
   */
  async resume(engine, data = null) {
    // console.log(`${this.constructor.name}: Resumed with data:`, data);
  }

  /**
   * Called by the SceneManager when the scene is about to be permanently removed
   * from the stack (either by `popScene` or `switchTo`).
   * Ideal for final cleanup of resources specific to this instance of the scene.
   * @param {import('./IroncladEngine.js').default} engine - The engine instance.
   * @returns {Promise<void> | void}
   */
  async unload(engine) {
    // console.log(`${this.constructor.name}: Unloaded.`);
    this.uiElements = [] // Clear UI elements as a common cleanup
    this.isInitialized = false
    this.engine = null // Good practice to nullify
    this.uiContext = null
  }

  // --- Common UI Helper Methods (Optional - scenes can manage uiElements directly or use these) ---

  /**
   * Adds a UI element to the scene's managed list and sets its engine reference.
   * @param {import('../ui/BaseUIElement.js').default} element
   */
  addUIElement(element) {
    if (element && typeof element.setEngine === 'function') {
      element.setEngine(this.engine)
    }
    this.uiElements.push(element)
  }

  /**
   * Updates all enabled and visible UI elements managed by this scene.
   * Call this from the scene's `update` method if using these helpers.
   * @param {number} deltaTime
   * @param {import('./IroncladEngine.js').default} engine
   */
  updateUIElements(deltaTime, engine) {
    if (!engine || !engine.inputManager) return
    const mousePos = engine.inputManager.getCanvasMousePosition()
    for (const element of this.uiElements) {
      if (element.visible && element.enabled) {
        element.update(deltaTime, engine, mousePos)
      }
    }
  }

  /**
   * Renders all visible UI elements managed by this scene.
   * Call this from the scene's `render` method if using these helpers.
   * @param {CanvasRenderingContext2D} context
   * @param {import('./IroncladEngine.js').default} engine
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
