// src/game/scenes/OverworldScene.js

/**
 * @file OverworldScene.js
 * @description The main overworld scene. Parses collision data, manages player,
 * and uses RenderSystem for ECS entities. Includes collision debug visualization.
 */

import Player from '../entities/Player.js'
// Camera class is managed by IroncladEngine, scene gets a reference.
import Sprite from '../../engine/rendering/Sprite.js' // Used by RenderSystem indirectly
import RenderSystem from '../../engine/ecs/systems/RenderSystem.js'
import TileLayerRenderer from '@/engine/rendering/TileLayerRenderer.js'

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
    /** @private @type {import('../../engine/rendering/Camera.js').default | null} */
    this.camera = null

    /** @private @type {HTMLImageElement | null} */
    this.mapBackgroundImage = null
    /** @private @type {object | null} */
    this.mapJsonData = null

    /** @private @type {Player | null} */
    this.player = null

    /** @private @type {Array<import('../../engine/ecs/EntityManager.js').EntityId>} */
    this.ecsTestEntities = []

    /** @private @type {TileLayerRenderer | null} */
    this.tileLayerRenderer = null

    // --- Collision Data Properties ---
    /** @private @type {number[] | null} */
    this.collisionLayerData = null
    /** @private @type {number} */
    this.collisionLayerWidth = 0
    /** @private @type {number} */
    this.collisionLayerHeight = 0
    /** @private @type {number} */
    this.tileWidth = 0
    /** @private @type {number} */
    this.tileHeight = 0

    /** @private @type {boolean} Toggle for debug drawing of map collision tiles */
    this.debugDrawMapCollision = true // Start with it off, toggle with 'toggleDebug' action
    /** @private @type {boolean} Toggle for debug drawing of player collision info */
    this.debugDrawPlayerCollision = true // Also toggled by 'toggleDebug'
    this.gameSettings = {
      volume: 80,
      difficulty: 'Normal',
      showHints: true,
      playerName: 'Hero', // Could come from player data
    }
    this.isPausedByManager = false

    console.log('OverworldScene: Constructor called')
  }

  initialize(engine, context, data = {}) {
    console.log('OverworldScene: Initializing with engine.', data)
    this.engine = engine

    if (!this.engine) {
      console.error('OverworldScene: Engine instance not provided!')
      return
    }
    this.assetLoader = this.engine.getAssetLoader()
    this.inputManager = this.engine.getInputManager()
    this.canvas = this.engine.getCanvas()
    this.entityManager = this.engine.getEntityManager()
    this.prefabManager = this.engine.getPrefabManager()
    this.camera = this.engine.getCamera()

    if (
      !this.assetLoader ||
      !this.inputManager ||
      !this.canvas ||
      !this.entityManager ||
      !this.prefabManager ||
      !this.camera
    ) {
      console.error('OverworldScene: One or more core engine systems are missing!')
      return
    }

    this.mapBackgroundImage = this.assetLoader.get('mainTilesetPNG')
    this.mapJsonData = this.assetLoader.get('testMapData')

    let worldWidth = this.canvas.width
    let worldHeight = this.canvas.height

    if (this.mapBackgroundImage) {
      worldWidth = this.mapBackgroundImage.naturalWidth
      worldHeight = this.mapBackgroundImage.naturalHeight
      this.camera.setWorldDimensions(worldWidth, worldHeight)
      console.log(
        `OverworldScene: mapBackgroundImage loaded: ${worldWidth}x${worldHeight}. Camera world dimensions set.`,
      )
    } else {
      console.error("OverworldScene: Asset 'mainTilesetPNG' not found!")
    }

    if (this.mapJsonData) {
      this.tileWidth = this.mapJsonData.tilewidth || 32
      this.tileHeight = this.mapJsonData.tileheight || 32
      this._parseCollisionLayer()
      console.log('OverworldScene: testMapData loaded and collision layer parsed (if found).')
    } else {
      console.warn('OverworldScene: testMapData not found. Collision/Encounter layers unavailable.')
    }

    if (this.mapJsonData && this.assetLoader) {
      // Prepare the map of loaded tileset images for TileLayerRenderer
      const loadedTilesetImagesMap = new Map()
      if (this.mapJsonData.tilesets && Array.isArray(this.mapJsonData.tilesets)) {
        this.mapJsonData.tilesets.forEach((tilesetDef) => {
          if (tilesetDef.image) {
            // Ensure the 'image' property exists
            const imageAsset = this.assetLoader.get(tilesetDef.image) // Use original path as key
            if (imageAsset instanceof HTMLImageElement) {
              loadedTilesetImagesMap.set(tilesetDef.image, imageAsset)
            } else {
              console.warn(
                `OverworldScene: Tileset image for key "${tilesetDef.image}" not found or not an image in AssetLoader cache.`,
              )
            }
          }
        })
      }

      if (
        loadedTilesetImagesMap.size > 0 ||
        (this.mapJsonData.tilesets && this.mapJsonData.tilesets.length === 0)
      ) {
        // Allow instantiation even if no external tilesets if map might have embedded ones (not supported yet by renderer)
        // or if only logical layers exist.
        this.tileLayerRenderer = new TileLayerRenderer(this.mapJsonData, loadedTilesetImagesMap)
        console.log('OverworldScene: TileLayerRenderer instantiated.')
      } else if (this.mapJsonData.tilesets && this.mapJsonData.tilesets.length > 0) {
        console.error(
          'OverworldScene: Could not instantiate TileLayerRenderer because some required tileset images were not loaded or map JSON is missing image paths in tileset definitions.',
        )
      }
    }

    const playerStartX = worldWidth / 3
    const playerStartY = worldHeight / 3
    this.player = new Player({
      x: playerStartX,
      y: playerStartY,
      assetLoader: this.assetLoader,
      width: 32, // Ensure this matches desired collision footprint
      height: 32,
    })

    if (this.player) {
      this.camera.setTarget(this.player)
      console.log('OverworldScene: Engine camera target set to player.')
    }

    this.ecsTestEntities = []
    const animatedBlock1Id = this.prefabManager.spawnEntity('AnimatedBlock', {
      Position: { x: 150, y: 150 },
    })
    if (animatedBlock1Id !== null) this.ecsTestEntities.push(animatedBlock1Id)
    // ... other ECS entities ...
    console.log(`OverworldScene: Spawned ${this.ecsTestEntities.length} ECS entities.`)

    if (!this.inputManager) {
      console.warn(
        "OverworldScene: InputManager not available for debug toggle key (action 'toggleDebug').",
      )
    } else {
      console.log(
        "OverworldScene: Press 'C' (if defined as 'toggleDebug' action) to toggle collision debug views.",
      )
    }

    console.log(
      'OverworldScene: Initialized. Current game settings:',
      JSON.stringify(this.gameSettings),
    )
  }

  /** @private */
  _parseCollisionLayer() {
    if (!this.mapJsonData || !this.mapJsonData.layers) {
      /* ... */ return
    }
    const collisionLayer = this.mapJsonData.layers.find(
      (layer) => layer.name === 'Collision' && layer.type === 'tilelayer',
    )
    if (collisionLayer && collisionLayer.data && collisionLayer.width > 0) {
      this.collisionLayerData = collisionLayer.data
      this.collisionLayerWidth = collisionLayer.width
      this.collisionLayerHeight =
        collisionLayer.height || collisionLayer.data.length / collisionLayer.width
      console.log(`OverworldScene: Collision layer "${collisionLayer.name}" parsed.`)
    } else {
      console.warn(
        'OverworldScene: "Collision" layer not found/invalid. Player collision will not work.',
      )
      this.collisionLayerData = null
    }
  }

  isTileSolidAtWorldXY(worldX, worldY) {
    if (!this.collisionLayerData || this.tileWidth <= 0 || this.tileHeight <= 0) return false
    const tileCol = Math.floor(worldX / this.tileWidth)
    const tileRow = Math.floor(worldY / this.tileHeight)
    if (
      tileCol < 0 ||
      tileCol >= this.collisionLayerWidth ||
      tileRow < 0 ||
      tileRow >= this.collisionLayerHeight
    )
      return true
    const tileIndex = tileRow * this.collisionLayerWidth + tileCol
    if (tileIndex < 0 || tileIndex >= this.collisionLayerData.length) return true
    return this.collisionLayerData[tileIndex] > 0
  }

  update(deltaTime, engine) {
    if (engine.inputManager.isActionJustPressed('togglePause')) {
      console.log("OverworldScene: 'togglePause' action detected.")

      // 1. Create the UI Context Object for this pause session
      const pauseSessionContext = {
        volume: this.gameSettings.volume,
        difficulty: this.gameSettings.difficulty,
        showHints: this.gameSettings.showHints,
        playerName: this.gameSettings.playerName, // Pass relevant info
        changesMade: false, // Flag for the UI scenes to set if they alter context
      }
      console.log(
        'OverworldScene: Pushing PauseScene with context:',
        JSON.stringify(pauseSessionContext),
      )

      // 2. Push PauseScene with the context
      engine.sceneManager.pushScene('PauseScene', { uiContext: pauseSessionContext })
      return // Stop further updates in this frame as we're pausing
    }

    // Toggle debug view with 'toggleDebug' action (e.g., 'C' key)
    if (this.inputManager && this.inputManager.isActionJustPressed('toggleDebug')) {
      this.debugDrawMapCollision = !this.debugDrawMapCollision
      this.debugDrawPlayerCollision = !this.debugDrawPlayerCollision // Toggle player debug too
      console.log(
        `Debug Views Toggled: MapCollision=${this.debugDrawMapCollision}, PlayerCollision=${this.debugDrawPlayerCollision}`,
      )
    }

    if (this.player && this.inputManager) {
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
      this.player.update(deltaTime, this, worldBounds) // Pass 'this' (scene) for collision checks
    }

    if (this.camera) {
      if (this.player && !this.camera.target) {
        this.camera.setTarget(this.player)
      }
      this.camera.update()
    }
  }

  render(context, engine) {
    if (!this.canvas || !this.camera || !engine) return

    context.fillStyle = '#000000'
    context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const viewportX = this.camera.getViewportX()
    const viewportY = this.camera.getViewportY()

    // 1. Draw map background
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
    }

    // --- Debug Draw Map Collision Layer (BEFORE Player for visibility) ---
    if (
      this.debugDrawMapCollision &&
      this.collisionLayerData &&
      this.tileWidth > 0 &&
      this.tileHeight > 0
    ) {
      const originalAlpha = context.globalAlpha
      context.globalAlpha = 0.4
      context.fillStyle = 'rgba(255, 0, 0, 0.4)'

      const startCol = Math.max(0, Math.floor(viewportX / this.tileWidth))
      const endCol = Math.min(
        this.collisionLayerWidth,
        Math.ceil((viewportX + this.canvas.width) / this.tileWidth),
      )
      const startRow = Math.max(0, Math.floor(viewportY / this.tileHeight))
      const endRow = Math.min(
        this.collisionLayerHeight,
        Math.ceil((viewportY + this.canvas.height) / this.tileHeight),
      )

      for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
          if (
            this.isTileSolidAtWorldXY(
              c * this.tileWidth + this.tileWidth / 2,
              r * this.tileHeight + this.tileHeight / 2,
            )
          ) {
            const drawX = Math.floor(c * this.tileWidth - viewportX)
            const drawY = Math.floor(r * this.tileHeight - viewportY)
            context.fillRect(drawX, drawY, this.tileWidth, this.tileHeight)
          }
        }
      }
      context.globalAlpha = originalAlpha
    }

    // 2. Render the non-ECS Player (will draw its own debug info if flag is true)
    if (this.player) {
      this.player.render(context, viewportX, viewportY, this.debugDrawPlayerCollision)
    }

    // 3. Render ECS Entities using the RenderSystem
    const renderSystem = engine.getSystem(RenderSystem)
    if (renderSystem && typeof renderSystem.executeRenderPass === 'function') {
      renderSystem.executeRenderPass(context, this.camera)
    } else if (renderSystem) {
      /* ... warning ... */
    } else {
      /* ... warning ... */
    }

    // Debug text
    const debugTextYStart = 20
    const debugTextLineHeight = 15
    let debugBoxHeight = 75
    if (this.debugDrawMapCollision || this.debugDrawPlayerCollision) {
      debugBoxHeight += debugTextLineHeight // Make box taller if collision debug on
    }

    context.fillStyle = 'rgba(0,0,0,0.7)'
    context.fillRect(5, 5, 290, debugBoxHeight)
    context.fillStyle = 'white'
    context.textAlign = 'left'
    context.font = '12px Arial'
    let line = 0
    context.fillText(
      `Cam X: ${viewportX.toFixed(0)}, Y: ${viewportY.toFixed(0)}`,
      10,
      debugTextYStart + line++ * debugTextLineHeight,
    )
    context.fillText(
      `Player: WASD/Actions. Cam follows.`,
      10,
      debugTextYStart + line++ * debugTextLineHeight,
    )
    if (this.player) {
      context.fillText(
        `Player X: ${this.player.worldX.toFixed(0)}, Y: ${this.player.worldY.toFixed(0)}`,
        10,
        debugTextYStart + line++ * debugTextLineHeight,
      )
    }
    if (this.mapBackgroundImage) {
      context.fillText(
        `Map Size: ${this.mapBackgroundImage.naturalWidth}x${this.mapBackgroundImage.naturalHeight}`,
        10,
        debugTextYStart + line++ * debugTextLineHeight,
      )
    }
    if (this.debugDrawMapCollision || this.debugDrawPlayerCollision) {
      context.fillText(
        `Debug Active (C): Map ${this.debugDrawMapCollision}, Player ${this.debugDrawPlayerCollision}`,
        10,
        debugTextYStart + line++ * debugTextLineHeight,
      )
    }
  }

  /**
   * Called by SceneManager when another scene is pushed on top of this one.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async pause(engine) {
    this.isPausedByManager = true
    console.log('OverworldScene: Paused by SceneManager.')
    // Example: Pause game music, stop character animations specifically controlled here
    // if (this.music) this.music.pause();
  }

  /**
   * Called by SceneManager when this scene becomes the top of the stack again
   * (e.g., after PauseScene is popped).
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Data passed from the popped scene (PauseScene).
   * Expected to be { uiContext: modifiedContextObject }
   */
  async resume(engine, data = {}) {
    // isPausedByManager flag (if you used it) should be set to false here.
    // this.isPausedByManager = false;
    console.log('OverworldScene: Resumed.')

    if (data && data.uiContext) {
      const returnedUiContext = data.uiContext
      console.log(
        'OverworldScene: Received UI Context from Pause Menu:',
        JSON.stringify(returnedUiContext),
      )

      if (returnedUiContext.changesMade) {
        console.log('OverworldScene: Applying changes from UI session...')
        this.gameSettings.volume = returnedUiContext.volume
        this.gameSettings.difficulty = returnedUiContext.difficulty
        this.gameSettings.showHints = returnedUiContext.showHints
        // playerName is usually not changed in options, but shown.

        // Here you would typically apply these settings, e.g.:
        // engine.audioManager.setVolume(this.gameSettings.volume / 100);
        // this.applyDifficulty(this.gameSettings.difficulty);
        console.log('OverworldScene: New game settings:', JSON.stringify(this.gameSettings))
      } else {
        console.log('OverworldScene: No changes made in UI session.')
      }
    } else {
      console.log(
        'OverworldScene: Resumed without UI context data from pause menu (or unexpected format).',
      )
    }
    // Resume game music, etc.
  }

  unload(engine) {
    console.log('OverworldScene: Unloaded.')
    if (this.camera) this.camera.setTarget(null)
    const entityManager = engine.getEntityManager()
    if (entityManager) {
      this.ecsTestEntities.forEach((id) => entityManager.destroyEntity(id))
      this.ecsTestEntities = []
    }
    this.engine = null
    this.tileLayerRenderer = null
  }
}

export default OverworldScene
