// src/engine/core/IroncladEngine.js

/**
 * @file IroncladEngine.js
 * @description Main class for the Ironclad Engine.
 */

import GameLoop from './GameLoop.js'
import SceneManager from './SceneManager.js'
import AssetLoader from './AssetLoader.js'
import InputManager from './InputManager.js'
import EventManager from './EventManager.js'
import EntityManager from '../ecs/EntityManager.js'
import PrefabManager from '../ecs/PrefabManager.js'
import Camera from '../rendering/Camera.js' // 1. Import Camera
// import System from '../ecs/System.js'; // For type hint in getSystem if using TS/JSDoc extensively

class IroncladEngine {
  static instance = null

  /**
   * @type {HTMLCanvasElement | null}
   */
  canvas = null
  /**
   * @type {CanvasRenderingContext2D | null}
   */
  context = null
  /**
   * @type {AssetLoader | null}
   */
  assetLoader = null
  /**
   * @type {InputManager | null}
   */
  inputManager = null
  /**
   * @type {SceneManager | null}
   */
  sceneManager = null
  /**
   * @type {EventManager | null}
   */
  events = null
  /**
   * @type {EntityManager | null}
   */
  entityManager = null
  /**
   * @type {PrefabManager | null}
   */
  prefabManager = null
  /**
   * @type {Camera | null} // 2. Add Camera property
   */
  camera = null

  /**
   * @private
   * @type {Array<{system: import('../ecs/System.js').default, priority: number}>}
   */
  systems = []
  /** @private @type {string | null} */
  assetManifestPath = null
  /** @private @type {object | null} */
  sceneRegistry = null
  /** @private @type {GameLoop | null} */
  gameLoop = null

  constructor({
    canvas,
    width = 800,
    height = 600,
    assetManifestPath,
    sceneRegistry,
    defaultWorldWidth, // Optional: for initial camera world bounds
    defaultWorldHeight, // Optional: for initial camera world bounds
  } = {}) {
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
    this.context = this.canvas.getContext('2d')
    if (!this.context) throw new Error('IroncladEngine: Failed to get 2D rendering context.')

    // Instantiate core managers
    this.assetLoader = new AssetLoader()
    this.inputManager = new InputManager()
    this.events = new EventManager()
    this.entityManager = new EntityManager()
    this.prefabManager = new PrefabManager(this.entityManager, this.assetLoader)

    this.sceneManager = new SceneManager()
    this.sceneManager.setContextAndEngine(this.context, this)

    // 2. Instantiate Camera
    this.camera = new Camera({
      viewportWidth: this.canvas.width,
      viewportHeight: this.canvas.height,
      worldWidth: defaultWorldWidth || this.canvas.width, // Initial world size
      worldHeight: defaultWorldHeight || this.canvas.height, // Can be updated by scenes
    })
    console.log('IroncladEngine: Main Camera instantiated.')

    this.systems = []
    this.assetManifestPath = assetManifestPath
    this.sceneRegistry = sceneRegistry
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

  // ... _registerScenes, _update, _render, start, stop methods remain the same ...
  // (Make sure _update calls system updates, _render calls sceneManager.render)
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
    this.sceneManager.update(deltaTime) // Scene logic first
    for (const systemWrapper of this.systems) {
      // Then ECS systems
      const system = systemWrapper.system
      const requiredComponents = system.constructor.requiredComponents || []
      let relevantEntities = []
      if (requiredComponents.length > 0) {
        relevantEntities = this.entityManager.getEntitiesWithComponents(requiredComponents)
      }
      try {
        system.update(deltaTime, relevantEntities, this)
      } catch (error) {
        console.error(`Error in system ${system.constructor.name}.update():`, error, system)
      }
    }
    this.inputManager.update() // Input manager state clear at the end
    this.events.emit('engine:update:frameEnd', deltaTime)
  }

  /** @private */
  _render() {
    // The active scene is responsible for all drawing, including clearing the canvas,
    // drawing its background, and potentially calling specific render systems.
    this.sceneManager.render()
  }

  start(initialSceneName, initialSceneData = {}) {
    if (!this.sceneManager.scenes[initialSceneName]) {
      const errorMsg = `IroncladEngine: Cannot start. Initial scene "${initialSceneName}" not found. Available: ${Object.keys(this.sceneManager.scenes).join(', ')}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    this.sceneManager.switchTo(initialSceneName, { ...initialSceneData, engine: this }) // Ensure engine is passed to initial scene's initialize
    this.gameLoop.start()
    console.log(`IroncladEngine: Started with initial scene "${initialSceneName}".`)
  }

  stop() {
    this.gameLoop.stop()
    console.log('IroncladEngine: Stopped.')
  }

  // --- Public API Getters ---
  getAssetLoader() {
    return this.assetLoader
  }
  getInputManager() {
    return this.inputManager
  }
  getSceneManager() {
    return this.sceneManager
  }
  getEventManager() {
    return this.events
  }
  getEntityManager() {
    return this.entityManager
  }
  getPrefabManager() {
    return this.prefabManager
  }
  getCanvas() {
    return this.canvas
  }
  getContext() {
    return this.context
  }
  getGameLoop() {
    return this.gameLoop
  }
  getAssetManifestPath() {
    return this.assetManifestPath
  }
  getCamera() {
    return this.camera
  } // 3. Add getter for Camera

  // --- System Management API ---
  registerSystem(systemInstance, priority = 0) {
    /* ... as before ... */
    if (!systemInstance || typeof systemInstance.update !== 'function') {
      console.error('IroncladEngine.registerSystem: Invalid system instance.', systemInstance)
      return
    }
    if (this.systems.some((sWrapper) => sWrapper.system === systemInstance)) {
      console.warn(
        `IroncladEngine: System "${systemInstance.constructor.name}" is already registered.`,
      )
      return
    }
    if (typeof systemInstance.initialize === 'function') {
      systemInstance.initialize(this)
    }
    this.systems.push({ system: systemInstance, priority: priority })
    this.systems.sort((a, b) => a.priority - b.priority)
    console.log(
      `IroncladEngine: System "${systemInstance.constructor.name}" registered with priority ${priority}.`,
    )
  }

  unregisterSystem(systemInstance) {
    /* ... as before ... */
    const initialLength = this.systems.length
    this.systems = this.systems.filter((sWrapper) => sWrapper.system !== systemInstance)
    if (this.systems.length < initialLength) {
      if (typeof systemInstance.shutdown === 'function') {
        systemInstance.shutdown()
      }
      console.log(`IroncladEngine: System "${systemInstance.constructor.name}" unregistered.`)
    } else {
      console.warn(
        `IroncladEngine.unregisterSystem: System "${systemInstance.constructor.name}" not found.`,
      )
    }
  }

  /**
   * Retrieves a registered system instance by its class.
   * @param {Function} SystemClass - The class of the system to retrieve.
   * @returns {System | null} The system instance, or null if not found.
   */
  getSystem(SystemClass) {
    // 4. Add getSystem method
    const wrapper = this.systems.find((sw) => sw.system instanceof SystemClass)
    return wrapper ? wrapper.system : null
  }
}

export default IroncladEngine
