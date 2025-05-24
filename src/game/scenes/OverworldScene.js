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
import TintEffect from '@/engine/fx/TintEffect.js'
import DialogueBox from '@/engine/ui/DialogueBox.js'

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
    this.debugDrawMapCollision = false // Start with it off, toggle with 'toggleDebug' action
    /** @private @type {boolean} Toggle for debug drawing of player collision info */
    this.debugDrawPlayerCollision = false // Also toggled by 'toggleDebug'
    this.gameSettings = {
      volume: 60,
      difficulty: 'Normal',
      showHints: true,
      playerName: 'Hero', // Could come from player data
      changesMade: false,
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

    // Register as a data provider for its gameSettings
    if (this.engine.saveLoadManager) {
      this.engine.saveLoadManager.registerDataProvider('overworldSettings', this)
      console.log("OverworldScene: Registered as data provider for 'overworldSettings'.")
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

    let worldWidth = 0
    let worldHeight = 0

    if (this.canvas && this.canvas.width > 0 && this.canvas.height > 0) {
      worldWidth = this.canvas.width
      worldHeight = this.canvas.height
      // console.log(`[OverworldScene Init] Using canvas dimensions: ${worldWidth}x${worldHeight}`);
    } else {
      console.warn('[OverworldScene Init] Canvas has no dimensions yet. Defaulting world size.')
      worldWidth = 800 // Fallback if canvas has no size
      worldHeight = 600
    }

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

    const playerStartX = Number(worldWidth / 3) || 100 // Ensure it's a number, provide hard fallback
    const playerStartY = Number(worldHeight / 3) || 100 // Ensure it's a number, provide hard fallback

    this.player = new Player({
      entityManager: this.entityManager, // Pass the EntityManager instance
      engine: this.engine, // Pass the Engine instance
      x: playerStartX,
      y: playerStartY,
      z: 0,
      assetLoader: this.assetLoader, // Player constructor still needs this for sprite info
      name: 'Ironclad Hero', // Example: pass other Player-specific options
      hp: 100,
      maxHp: 100,
      currentXp: 0,
      xpToNextLevel: 150,
      spriteSheetName: 'testPlayer', // Ensure this matches an asset
      width: 32, // For Collider and SpriteData
      height: 32, // For Collider and SpriteData
      jumpForce: 450, // From ECS Player constructor

      // Add any other custom properties defined in Player constructor options here
      inventory: [
        // Example initial inventory
        { id: 'start_potion', name: 'Starter Health Vial', quantity: 2 },
        { id: 'rusty_dagger', name: 'Rusty Dagger', quantity: 1 },
      ],
      physicsBody: {
        // Ensure you can pass component data overrides like this or set it in Player constructor
        entityType: 'dynamic',
        mass: 1,
        useGravity: false, // Explicitly false for overworld movement
        gravityScale: 1.0,
        friction: 0.1,
        restitution: 0.0,
      },
    })

    this.dialogueBoxUI = new DialogueBox({
      engine: this.engine, // DialogueBox needs the engine for AssetLoader (portraits) and InputManager (for choice clicks if needed)
      x: 50,
      y: this.canvas.height - 170, // Position at bottom
      width: this.canvas.width - 100,
      height: 150,
      visible: false, // Start hidden
    })

    // Link it to the DialogueManager
    if (this.engine.dialogueManager) {
      this.engine.dialogueManager.setDialogueBox(this.dialogueBoxUI)
      this.engine.dialogueManager.loadDialogueData('gameDialogues') // Load data
    }

    console.log('[OverworldScene] Player object created:', this.player)
    // Ensure these methods exist on the Player prototype or instance
    console.log('[OverworldScene] typeof player.getPosition:', typeof this.player?.getPosition)
    console.log('[OverworldScene] typeof player.getDimensions:', typeof this.player?.getDimensions)

    if (this.player && typeof this.player.getPosition === 'function') {
      const pos = this.player.getPosition()
      console.log('[OverworldScene] player.getPosition() returns:', pos) // Check if x or y are NaN here
      if (pos && (isNaN(pos.x) || isNaN(pos.y))) {
        console.error('CRITICAL: Player getPosition() returned NaN values!')
      }
    }
    if (this.player && typeof this.player.getDimensions === 'function') {
      console.log('[OverworldScene] player.getDimensions() returns:', this.player.getDimensions())
    }

    if (this.player && this.player.id !== undefined) {
      // Only set target if player seems valid and getPosition will return numbers
      if (
        this.player.getPosition &&
        !isNaN(this.player.getPosition().x) &&
        !isNaN(this.player.getPosition().y)
      ) {
        this.camera.setTarget(this.player)
      } else {
        console.error(
          '[OverworldScene] Cannot set camera target, player position is NaN or getPosition is missing.',
        )
      }
    }

    if (this.engine.sceneManager && this.player) {
      console.log('pushing HUD')
      this.engine.sceneManager.pushScene('HUDScene', { player: this.player })
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

  // Method for SaveLoadManager - Data Provider Interface
  getSaveData() {
    // This now returns the live, potentially modified gameSettings
    console.log(
      'OverworldScene: getSaveData() called, returning LIVE gameSettings:',
      JSON.stringify(this.gameSettings),
    )
    return { ...this.gameSettings } // Still good to return a copy for the actual save data structure
  }

  // Method for SaveLoadManager - Data Provider Interface
  loadSaveData(data) {
    if (data) {
      this.gameSettings = { ...this.gameSettings, ...data } // Merge loaded data
      console.log(
        'OverworldScene: loadSaveData() called, gameSettings updated to:',
        JSON.stringify(this.gameSettings),
      )
      // If other parts of OverworldScene depend on gameSettings, they might need to be refreshed here.
      // For example, if volume directly affected an audio player owned by OverworldScene.
    } else {
      console.log("OverworldScene: loadSaveData() called with no data for 'overworldSettings'.")
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
    if (!this.engine) this.engine = engine
    if (!this.inputManager && this.engine) this.inputManager = this.engine.getInputManager()

    if (this.inputManager.isKeyJustPressed('KeyL')) {
      // 'L' for 'Loud Sound'
      if (this.engine.audioManager) {
        console.log('Playing SFX: sfx_ui_click')
        this.engine.audioManager.playSoundEffect('sfx_ui_click')
      }
    }
    if (this.inputManager.isKeyJustPressed('KeyM')) {
      // 'M' for 'Music'
      if (this.engine.audioManager) {
        if (this.engine.audioManager.currentMusicName === 'music_overworld') {
          console.log('Stopping music')
          this.engine.audioManager.stopMusic(1) // Fade out over 1 second
        } else {
          console.log('Playing music: music_overworld')
          this.engine.audioManager.playMusic('music_overworld', true, 0.5, 1) // Loop, 50% vol, 1s fade-in
        }
      }
    }

    if (this.inputManager && this.inputManager.isKeyJustPressed('KeyT')) {
      // Example: 'T' key for Tint
      console.log('OverworldScene: Triggering screen tint.')
      if (this.engine.effectsManager) {
        // Toggle a blue tint
        if (
          this.engine.effectsManager.persistentTintEffect &&
          this.engine.effectsManager.persistentTintEffect.opacity > 0
        ) {
          this.engine.effectsManager.clearTint()
        } else {
          this.engine.effectsManager.tint('rgba(0, 0, 255, 0.3)', 0.3) // Blue tint at 30% opacity
        }
      }
    }

    if (this.inputManager && this.inputManager.isKeyJustPressed('KeyY')) {
      // Example: 'Y' key for Timed Red Tint
      console.log('OverworldScene: Triggering timed red screen tint.')
      if (this.engine.effectsManager) {
        // This will add a new TintEffect instance separate from the persistent one
        const timedRedTint = new TintEffect({
          engine: this.engine,
          color: 'rgba(255, 0, 0, 0.5)',
          opacity: 0.5,
          duration: 2000, // 2 seconds
        })
        this.engine.effectsManager.addEffect(timedRedTint)
      }
    }

    if (this.inputManager && this.inputManager.isKeyJustPressed('KeyF')) {
      // Example: 'F' key
      console.log('OverworldScene: Triggering screen flash.')
      if (this.engine.effectsManager) {
        // Test with default white flash
        // this.engine.effectsManager.flash();

        // Test with a red flash
        this.engine.effectsManager.flash('rgba(255, 0, 0, 0.6)', 500, 0.6, true)
      }
    }

    if (this.inputManager && this.inputManager.isActionJustPressed('testShake')) {
      console.log("OverworldScene: 'testShake' action (K key) detected. Triggering screen shake.")
      if (this.engine.effectsManager) {
        // Example 1: Default shake (intensity 10, duration 500ms, decay true)
        // this.engine.effectsManager.shake();

        // Example 2: Stronger, shorter shake with decay
        // this.engine.effectsManager.shake(25, 300, true);

        // Example 3: Mild, longer shake without decay (constant intensity until end)
        this.engine.effectsManager.shake(1, 1000, true)

        // Example 4: Very short, intense shake
        // this.engine.effectsManager.shake(30, 150);
      } else {
        console.warn('OverworldScene: effectsManager not found on engine instance.')
      }
    }
    if (engine.inputManager.isActionJustPressed('toggleInventory')) {
      console.log("OverworldScene: 'toggleInventory' action detected.")

      // Reset changesMade flag for the new UI session
      this.gameSettings.changesMade = false

      console.log('OverworldScene: Pushing InventoryScene.')
      const playerInventory = this.player && this.player.inventory ? this.player.inventory : []
      const dataForInventory = {
        inventoryItems: playerInventory,
      }
      console.log('[OverworldScene] Data for InventoryScene:', JSON.stringify(dataForInventory))

      // Pass the actual this.gameSettings object as the uiContext
      engine.sceneManager.pushScene('InventoryScene', dataForInventory)
      return
    }

    if (this.inputManager && this.inputManager.isActionJustPressed('togglePause')) {
      this.gameSettings.changesMade = false
      const uiContextForPause = {
        ...this.gameSettings,
        playerName: this.player ? this.player.name : this.gameSettings.playerName,
        isMuted: this.gameSettings.isMuted || false,
      }
      this.engine.sceneManager.pushScene('PauseScene', { uiContext: uiContextForPause })
      return
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
    }

    if (this.camera) {
      if (this.player && !this.camera.target) {
        this.camera.setTarget(this.player)
      }
      this.camera.update()
    }
  }

  render(context, engine) {
    if (!this.engine) this.engine = engine // Ensure engine reference
    if (!this.camera || !this.engine.canvas) return
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
    // --- Debug text ---
    const debugTextYStart = 20
    const debugTextLineHeight = 15
    let debugBoxHeight = 20 // Start with some base height for the box

    // Calculate how many lines of text we'll have to adjust box height
    let linesOfText = 0
    linesOfText++ // For Camera X, Y
    if (this.player && typeof this.player.getPosition === 'function') linesOfText++ // For Player X, Y, Z
    if (this.player && typeof this.player.getComponent === 'function') {
      if (this.player.getComponent('Velocity')) linesOfText++ // For Player Velocity
      if (this.player.getComponent('PhysicsBody')) linesOfText++ // For Player onGround status
    }
    if (this.mapBackgroundImage) linesOfText++ // For Map Size
    if (this.debugDrawMapCollision || this.debugDrawPlayerCollision) linesOfText++ // For Debug Active status

    debugBoxHeight = debugTextYStart + linesOfText * debugTextLineHeight

    context.fillStyle = 'rgba(0,0,0,0.7)'
    context.fillRect(5, 5, 290, debugBoxHeight) // Adjusted width if needed
    context.fillStyle = 'white'
    context.textAlign = 'left'
    context.font = '12px Arial'
    let line = 0

    context.fillText(
      `Cam X: ${viewportX.toFixed(0)}, Y: ${viewportY.toFixed(0)}`,
      10,
      debugTextYStart + line++ * debugTextLineHeight,
    )

    // Updated Player Debug Information
    if (this.player && typeof this.player.getPosition === 'function') {
      const playerPos = this.player.getPosition() // Get position from ECS Player
      const playerVel = this.player.getComponent('Velocity') // Get velocity component
      const playerPhys = this.player.getComponent('PhysicsBody') // Get physics body

      if (playerPos) {
        context.fillText(
          `Player (ECS) X: ${playerPos.x.toFixed(0)}, Y: ${playerPos.y.toFixed(0)}, Z: ${playerPos.z.toFixed(0)}`,
          10,
          debugTextYStart + line++ * debugTextLineHeight,
        )
      }
      if (playerVel) {
        context.fillText(
          `Player Vel VX: ${playerVel.vx.toFixed(1)}, VY: ${playerVel.vy.toFixed(1)}, VZ: ${playerVel.vz.toFixed(1)}`,
          10,
          debugTextYStart + line++ * debugTextLineHeight,
        )
      }
      if (playerPhys) {
        context.fillText(
          `Player Grounded: ${playerPhys.isOnGround}`,
          10,
          debugTextYStart + line++ * debugTextLineHeight,
        )
      }
      if (playerPhys) {
        context.fillText(
          `Toggle Collision Layer: C`,
          10,
          debugTextYStart + line++ * debugTextLineHeight,
        )
      }
    } else if (this.player) {
      // Fallback for older player structure if it was somehow still in use
      context.fillText(
        `Player (Old) X: ${this.player.worldX?.toFixed(0)}, Y: ${this.player.worldY?.toFixed(0)}`,
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
    this.isPausedByManager = false
    console.log('OverworldScene: Resumed.')

    // The 'data.uiContext' will be the same object as 'this.gameSettings'
    // if the shared reference pattern was used.
    // 'data.loadOccurred' is the key differentiator.

    if (data && data.loadOccurred) {
      console.log(
        'OverworldScene: Resuming after a game load. Game settings were updated by loadSaveData.',
      )
      // this.gameSettings is already authoritative from the load.
      // We might want to reset 'changesMade' if it was part of gameSettings.
      // However, 'changesMade' is more of a UI session flag.
      // For simplicity, we can assume a load means settings are "finalized".
    } else if (this.gameSettings.changesMade) {
      // Check the flag on the direct gameSettings object
      console.log(
        'OverworldScene: Changes were made during UI session (no load). Settings are already live updated.',
      )
      // Values are already up-to-date in this.gameSettings.
      // You might perform actions here if settings being changed requires them (e.g., apply audio volume).
      // this.engine.audioManager.setVolume(this.gameSettings.volume / 100); // Example
      // this.gameSettings.changesMade = false; // Reset flag after processing
    } else {
      console.log('OverworldScene: Resumed. No changes made or no load occurred.')
    }

    console.log(
      'OverworldScene: Final effective game settings on resume:',
      JSON.stringify(this.gameSettings),
    )
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
