// src/engine/core/IroncladEngine.js

/**
 * @file IroncladEngine.js
 * @description Main class for the Ironclad Engine, an HTML5 Canvas game engine.
 * It initializes and manages core engine systems including an EventManager.
 */

import GameLoop from './GameLoop.js'
import SceneManager from './SceneManager.js'
import AssetLoader from './AssetLoader.js'
import InputManager from './InputManager.js'
import EventManager from './EventManager.js' // 1. Import EventManager

class IroncladEngine {
  /**
   * The singleton instance of the engine.
   * @private
   * @type {IroncladEngine | null}
   */
  static instance = null

  /**
   * Creates or retrieves the singleton instance of the IroncladEngine.
   * @param {object} [config={}] - Configuration object for the engine.
   * @param {string | HTMLCanvasElement} config.canvas - The ID of the canvas element or the canvas element itself.
   * @param {number} [config.width=800] - Desired canvas width.
   * @param {number} [config.height=600] - Desired canvas height.
   * @param {string} config.assetManifestPath - Path to the initial asset manifest JSON.
   * @param {object} config.sceneRegistry - Object like { sceneName: SceneClass, ... }.
   * @returns {IroncladEngine} The singleton instance.
   */
  constructor({ canvas, width = 800, height = 600, assetManifestPath, sceneRegistry } = {}) {
    if (IroncladEngine.instance) {
      console.warn('IroncladEngine: Instance already created. Returning existing instance.')
      return IroncladEngine.instance
    }

    if (!canvas) throw new Error('IroncladEngine: Canvas element or ID must be provided in config.')
    if (!assetManifestPath)
      throw new Error('IroncladEngine: assetManifestPath must be provided in config.')
    if (!sceneRegistry || Object.keys(sceneRegistry).length === 0) {
      throw new Error('IroncladEngine: sceneRegistry must be provided and be non-empty in config.')
    }

    if (typeof canvas === 'string') {
      /** @type {HTMLCanvasElement | null} */
      this.canvas = document.getElementById(canvas)
      if (!this.canvas)
        throw new Error(`IroncladEngine: Canvas element with ID "${canvas}" not found.`)
    } else if (canvas instanceof HTMLCanvasElement) {
      this.canvas = canvas
    } else {
      throw new Error('IroncladEngine: Invalid canvas parameter.')
    }

    this.canvas.width = width
    this.canvas.height = height

    /** @type {CanvasRenderingContext2D | null} */
    this.context = this.canvas.getContext('2d')
    if (!this.context) throw new Error('IroncladEngine: Failed to get 2D rendering context.')

    /** @type {AssetLoader} */
    this.assetLoader = new AssetLoader()
    /** @type {InputManager} */
    this.inputManager = new InputManager()
    /** @type {SceneManager} */
    this.sceneManager = new SceneManager()
    this.sceneManager.setContext(this.context)
    /** @type {EventManager} */
    this.events = new EventManager() // 2. Instantiate EventManager

    /** @private @type {string} */
    this.assetManifestPath = assetManifestPath
    /** @private @type {object} */
    this.sceneRegistry = sceneRegistry

    /** @private @type {GameLoop} */
    this.gameLoop = new GameLoop(
      (deltaTime) => this._update(deltaTime),
      () => this._render(),
    )

    IroncladEngine.instance = this
    if (window) {
      window.gameEngine = this
      console.log('IroncladEngine: Instance created and assigned to window.gameEngine.')
    }

    this._registerScenes()
  }

  /** @private */
  _registerScenes() {
    console.log('IroncladEngine: Registering scenes...')
    for (const sceneName in this.sceneRegistry) {
      if (Object.hasOwnProperty.call(this.sceneRegistry, sceneName)) {
        const SceneClass = this.sceneRegistry[sceneName]
        if (typeof SceneClass === 'function') {
          try {
            this.sceneManager.add(sceneName, new SceneClass())
          } catch (e) {
            console.error(`IroncladEngine: Error instantiating scene "${sceneName}":`, e)
          }
        } else {
          console.warn(
            `IroncladEngine: Item in sceneRegistry for "${sceneName}" is not a class/constructor.`,
          )
        }
      }
    }
  }

  /** @private */
  _update(deltaTime) {
    this.sceneManager.update(deltaTime)
    this.inputManager.update()
    // this.events.emit('engine:update', deltaTime); // Example of an engine event
  }

  /** @private */
  _render() {
    this.sceneManager.render()
    // this.events.emit('engine:render'); // Example of an engine event
  }

  /**
   * Starts the game engine.
   * @param {string} initialSceneName - The name of the scene to start with.
   * @param {object} [initialSceneData={}] - Data for the first scene.
   */
  start(initialSceneName, initialSceneData = {}) {
    if (!this.sceneManager.scenes[initialSceneName]) {
      const errorMsg = `IroncladEngine: Cannot start. Initial scene "${initialSceneName}" not found. Available: ${Object.keys(this.sceneManager.scenes).join(', ')}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    // Pass the engine itself to the initial scene data, so LoadingScene can get manifestPath
    // This also makes the engine directly available to the first scene if needed beyond window.gameEngine
    this.sceneManager.switchTo(initialSceneName, {
      ...initialSceneData,
      assetManifestPath: this.assetManifestPath, // Specifically for LoadingScene
      engine: this, // Optionally pass the engine instance itself
    })
    this.gameLoop.start()
    console.log(`IroncladEngine: Started with initial scene "${initialSceneName}".`)
  }

  stop() {
    this.gameLoop.stop()
    console.log('IroncladEngine: Stopped.')
  }

  // --- Public API Getters ---
  /** @returns {AssetLoader} */
  getAssetLoader() {
    return this.assetLoader
  }
  /** @returns {InputManager} */
  getInputManager() {
    return this.inputManager
  }
  /** @returns {SceneManager} */
  getSceneManager() {
    return this.sceneManager
  }
  /** @returns {EventManager} */
  getEventManager() {
    return this.events
  } // 3. Add getter for EventManager
  /** @returns {HTMLCanvasElement} */
  getCanvas() {
    return this.canvas
  }
  /** @returns {CanvasRenderingContext2D} */
  getContext() {
    return this.context
  }
  /** @returns {GameLoop} */
  getGameLoop() {
    return this.gameLoop
  }
  /** @returns {string} */
  getAssetManifestPath() {
    return this.assetManifestPath
  } // Kept for LoadingScene
}

export default IroncladEngine
