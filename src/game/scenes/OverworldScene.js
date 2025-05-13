// src/game/scenes/OverworldScene.js

/**
 * @file OverworldScene.js
 * @description The main overworld scene. Uses the engine instance passed to its methods.
 */

import Player from '../entities/Player.js'
import Camera from '../../engine/rendering/Camera.js'
import Sprite from '../../engine/rendering/Sprite.js'

class OverworldScene {
  constructor() {
    /** @private @type {import('../../engine/core/IroncladEngine.js').default | null} */
    this.engine = null
    /** @private @type {import('../../engine/core/AssetLoader.js').default | null} */
    this.assetLoader = null
    /** @private @type {import('../../engine/core/InputManager.js').default | null} */
    this.inputManager = null
    /** @private @type {HTMLCanvasElement | null} */
    this.canvas = null
    /** @private @type {import('../../engine/ecs/EntityManager.js').default | null} */
    this.entityManager = null
    /** @private @type {import('../../engine/ecs/PrefabManager.js').default | null} */
    this.prefabManager = null

    /** @private @type {HTMLImageElement | null} */
    this.mapBackgroundImage = null
    /** @private @type {object | null} */
    this.mapJsonData = null

    /** @private @type {Player | null} */
    this.player = null
    /** @private @type {Camera | null} */
    this.camera = null

    /** @private @type {Array<import('../../engine/ecs/EntityManager.js').EntityId>} */
    this.ecsTestEntities = []

    console.log('OverworldScene: Constructor called')
  }

  /**
   * Initializes the scene.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {object} [data={}] - Optional data passed during scene transition.
   */
  initialize(engine, context, data = {}) {
    console.log('OverworldScene: Initializing with engine. Received data:', data)
    this.engine = engine

    if (!this.engine) {
      console.error('OverworldScene: Engine instance not provided to initialize!')
      return
    }

    this.assetLoader = this.engine.getAssetLoader()
    this.inputManager = this.engine.getInputManager()
    this.canvas = this.engine.getCanvas()
    this.entityManager = this.engine.getEntityManager()
    this.prefabManager = this.engine.getPrefabManager()

    if (
      !this.assetLoader ||
      !this.inputManager ||
      !this.canvas ||
      !this.entityManager ||
      !this.prefabManager
    ) {
      console.error(
        'OverworldScene: One or more core engine systems are missing from engine instance!',
      )
      return
    }

    this.mapBackgroundImage = this.assetLoader.get('mainTilesetPNG')
    this.mapJsonData = this.assetLoader.get('testMapData')

    let worldWidth = this.canvas.width
    let worldHeight = this.canvas.height

    if (this.mapBackgroundImage) {
      worldWidth = this.mapBackgroundImage.naturalWidth
      worldHeight = this.mapBackgroundImage.naturalHeight
      console.log(`OverworldScene: mapBackgroundImage loaded: ${worldWidth}x${worldHeight}`)
    } else {
      console.error("OverworldScene: Asset 'mainTilesetPNG' not found!")
    }

    if (this.mapJsonData) console.log('OverworldScene: testMapData loaded.')

    // Instantiate non-ECS Player
    const playerStartX = worldWidth / 3
    const playerStartY = worldHeight / 3
    this.player = new Player({ x: playerStartX, y: playerStartY, assetLoader: this.assetLoader })

    // Instantiate Camera
    this.camera = new Camera({
      viewportWidth: this.canvas.width,
      viewportHeight: this.canvas.height,
      worldWidth: worldWidth,
      worldHeight: worldHeight,
    })
    if (this.player) this.camera.setTarget(this.player)

    // Spawn Test ECS Entities using PrefabManager
    this.ecsTestEntities = []
    const movingBlock1Id = this.prefabManager.spawnEntity('MovingBlock', {
      Position: { x: 150, y: 150 },
    })
    if (movingBlock1Id !== null) this.ecsTestEntities.push(movingBlock1Id)

    const movingBlock2Id = this.prefabManager.spawnEntity('MovingBlock', {
      Position: { x: 250, y: 100 },
      Velocity: { vx: -20, vy: 35 },
    })
    if (movingBlock2Id !== null) this.ecsTestEntities.push(movingBlock2Id)

    const staticTreeId = this.prefabManager.spawnEntity('StaticTree', {
      Position: { x: 50, y: 250 },
    })
    if (staticTreeId !== null) this.ecsTestEntities.push(staticTreeId)

    console.log(
      `OverworldScene: Spawned ${this.ecsTestEntities.length} ECS entities using PrefabManager.`,
    )
  }

  /**
   * Updates the scene's logic.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  update(deltaTime, engine) {
    // engine parameter is available
    if (!this.engine) this.engine = engine // Ensure engine is set if not from initialize data directly

    // Update non-ECS Player
    if (this.player && this.inputManager) {
      // this.inputManager is set from this.engine
      this.player.handleInput(this.inputManager)
      let worldBounds = {}
      if (this.mapBackgroundImage) {
        worldBounds = {
          minX: 0,
          minY: 0,
          maxX: this.mapBackgroundImage.naturalWidth,
          maxY: this.mapBackgroundImage.naturalHeight,
        }
      }
      this.player.update(deltaTime, worldBounds)
    }

    // Update Camera
    if (this.camera) {
      if (this.player) {
        this.camera.setWorldDimensions(
          this.mapBackgroundImage ? this.mapBackgroundImage.naturalWidth : 0,
          this.mapBackgroundImage ? this.mapBackgroundImage.naturalHeight : 0,
        )
        if (!this.camera.target && this.player) this.camera.setTarget(this.player)
      }
      this.camera.update()
    }
    // ECS Systems are updated by IroncladEngine's main loop.
  }

  /**
   * Renders the scene.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  render(context, engine) {
    // engine parameter is available
    if (!this.engine) this.engine = engine
    if (!this.canvas) this.canvas = this.engine.getCanvas()

    context.fillStyle = '#000000'
    context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const viewportX = this.camera ? this.camera.getViewportX() : 0
    const viewportY = this.camera ? this.camera.getViewportY() : 0

    if (
      this.mapBackgroundImage &&
      this.mapBackgroundImage.complete &&
      this.mapBackgroundImage.naturalWidth > 0
    ) {
      try {
        context.drawImage(this.mapBackgroundImage, -viewportX, -viewportY)
      } catch (e) {
        console.error('Error drawing mapBackgroundImage:', e)
      }
    } else {
      /* ... error text ... */
    }

    if (this.player) {
      this.player.render(context, viewportX, viewportY)
    }

    // Render ECS Entities (Temporary render logic)
    if (this.entityManager && this.assetLoader && this.ecsTestEntities.length > 0) {
      this.ecsTestEntities.forEach((entityId) => {
        if (!this.entityManager.isEntityAlive(entityId)) return
        const position = this.entityManager.getComponent(entityId, 'Position')
        const renderable = this.entityManager.getComponent(entityId, 'RenderableSprite')

        if (position && renderable) {
          if (!renderable.spriteInstance) {
            const image = this.assetLoader.get(renderable.spriteAssetKey)
            if (image instanceof HTMLImageElement) {
              renderable.spriteInstance = new Sprite(
                image,
                0,
                0,
                renderable.width,
                renderable.height,
              )
            } else {
              /* ... warning ... */ return
            }
          }
          if (renderable.spriteInstance) {
            const screenX = Math.floor(position.x - viewportX + (renderable.offsetX || 0))
            const screenY = Math.floor(position.y - viewportY + (renderable.offsetY || 0))
            renderable.spriteInstance.x = screenX
            renderable.spriteInstance.y = screenY
            renderable.spriteInstance.width = renderable.width
            renderable.spriteInstance.height = renderable.height
            renderable.spriteInstance.render(context)
          }
        }
      })
    }
    // ... (Debug text logic remains the same) ...
  }

  /**
   * Cleans up when the scene is exited.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  unload(engine) {
    // engine parameter is available
    console.log('OverworldScene: Unloaded.')
    if (!this.engine) this.engine = engine // Ensure engine ref if only passed here

    if (this.camera) this.camera.setTarget(null)
    if (this.entityManager) {
      // entityManager should be from this.engine
      this.ecsTestEntities.forEach((id) => this.entityManager.destroyEntity(id))
      this.ecsTestEntities = []
    }
    this.engine = null // Clear engine reference
  }
}

export default OverworldScene
