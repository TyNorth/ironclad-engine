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

class IroncladEngine {
  static instance = null

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
    // Pass both context and the engine instance (this) to SceneManager
    this.sceneManager.setContextAndEngine(this.context, this) // MODIFIED LINE

    /** @private @type {Array<{system: import('../ecs/System.js').default, priority: number}>} */
    this.systems = []
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
      window.gameEngine = this // Still useful for easy console access
      console.log('IroncladEngine: Instance created and assigned to window.gameEngine.')
    }

    this._registerScenes() // SceneManager now has engine reference before scenes are added
  }

  /** @private */
  _registerScenes() {
    console.log('IroncladEngine: Registering scenes...')
    for (const sceneName in this.sceneRegistry) {
      if (Object.hasOwnProperty.call(this.sceneRegistry, sceneName)) {
        const SceneClass = this.sceneRegistry[sceneName]
        if (typeof SceneClass === 'function') {
          try {
            // Scene constructor can be simple; engine ref is passed during initialize
            this.sceneManager.add(sceneName, new SceneClass())
          } catch (e) {
            console.error(`IroncladEngine: Error instantiating scene "${sceneName}":`, e)
          }
        } else {
          /* ... */
        }
      }
    }
  }

  _update(deltaTime) {
    // SceneManager's update will now pass the engine instance to the scene's update
    this.sceneManager.update(deltaTime)

    for (const systemWrapper of this.systems) {
      /* ... (system update logic as before) ... */
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

    this.inputManager.update()
    this.events.emit('engine:update:frameEnd', deltaTime)
  }

  _render() {
    // SceneManager's render will now pass the engine instance to the scene's render
    this.sceneManager.render()
  }

  start(initialSceneName, initialSceneData = {}) {
    if (!this.sceneManager.scenes[initialSceneName]) {
      /* ... error ... */
    }
    // `switchTo` in SceneManager will now pass the engine instance to the scene's initialize
    this.sceneManager.switchTo(initialSceneName, {
      ...initialSceneData,
      // No longer need to explicitly pass engine here if SceneManager handles it,
      // but assetManifestPath is still useful for LoadingScene's initial data.
      assetManifestPath: this.assetManifestPath,
      // data.engine is now set by SceneManager during initialize
    })
    this.gameLoop.start()
    console.log(`IroncladEngine: Started with initial scene "${initialSceneName}".`)
  }

  stop() {
    /* ... as before ... */
  }
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
  registerSystem(systemInstance, priority = 0) {
    /* ... as before ... */
  }
  unregisterSystem(systemInstance) {
    /* ... as before ... */
  }
}

export default IroncladEngine
