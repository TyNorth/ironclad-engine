// src/game/scenes/OverworldScene.js

/**
 * @file OverworldScene.js
 * @description The main overworld scene where the player explores the game map.
 * Features a camera that follows the player. Uses IroncladEngine API.
 */

import Player from '../entities/Player.js'
import Camera from '../../engine/rendering/Camera.js'

class OverworldScene {
  constructor() {
    /** @private @type {import('../../engine/core/AssetLoader.js').default | null} */
    this.assetLoader = null
    /** @private @type {import('../../engine/core/InputManager.js').default | null} */
    this.inputManager = null
    /** @private @type {HTMLCanvasElement | null} */
    this.canvas = null

    /** @private @type {HTMLImageElement | null} */
    this.mapBackgroundImage = null
    /** @private @type {object | null} */
    this.mapJsonData = null

    /** @private @type {Player | null} */
    this.player = null
    /** @private @type {Camera | null} */
    this.camera = null

    console.log('OverworldScene: Constructor called')
  }

  initialize(context, data = {}) {
    console.log('OverworldScene: Initialized.', data)

    // 1. Access core systems via the new IroncladEngine API
    if (window.gameEngine) {
      if (typeof window.gameEngine.getAssetLoader === 'function') {
        this.assetLoader = window.gameEngine.getAssetLoader()
      } else {
        console.error('OverworldScene: AssetLoader getter not found on gameEngine!')
        return
      }
      if (typeof window.gameEngine.getInputManager === 'function') {
        this.inputManager = window.gameEngine.getInputManager()
      } else {
        console.warn(
          'OverworldScene: InputManager getter not found on gameEngine. Player/Camera may not work.',
        )
      }
      if (typeof window.gameEngine.getCanvas === 'function') {
        this.canvas = window.gameEngine.getCanvas()
      } else {
        console.error('OverworldScene: Canvas getter not found on gameEngine!')
        return
      }
    } else {
      console.error('OverworldScene: window.gameEngine is not defined! Core systems unavailable.')
      return
    }

    // Load map assets
    this.mapBackgroundImage = this.assetLoader.get('mainTilesetPNG')
    this.mapJsonData = this.assetLoader.get('testMapData')

    let worldWidth = this.canvas ? this.canvas.width : 800
    let worldHeight = this.canvas ? this.canvas.height : 600

    if (!this.mapBackgroundImage) {
      console.error("OverworldScene: Asset 'mainTilesetPNG' not found!")
    } else {
      worldWidth = this.mapBackgroundImage.naturalWidth
      worldHeight = this.mapBackgroundImage.naturalHeight
      console.log(`OverworldScene: mapBackgroundImage loaded: ${worldWidth}x${worldHeight}`)
    }
    if (this.mapJsonData) {
      console.log('OverworldScene: testMapData loaded.')
    } else {
      console.warn('OverworldScene: testMapData not found. Logical layer data will be unavailable.')
    }

    // Instantiate Player
    const playerStartX = worldWidth / 2
    const playerStartY = worldHeight / 2

    this.player = new Player({
      x: playerStartX,
      y: playerStartY,
      assetLoader: this.assetLoader, // Correctly passing engine's AssetLoader
    })

    // Instantiate and setup Camera
    if (this.canvas) {
      this.camera = new Camera({
        viewportWidth: this.canvas.width,
        viewportHeight: this.canvas.height,
        worldWidth: worldWidth,
        worldHeight: worldHeight,
      })

      if (this.player && this.camera) {
        this.camera.setTarget(this.player)
        console.log('OverworldScene: Camera target set to player.')
      }
    } else {
      console.error('OverworldScene: Canvas reference missing, cannot initialize Camera.')
    }
  }

  update(deltaTime) {
    // Handle Player Input and Update
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
      this.player.update(deltaTime, worldBounds)
    }

    // Update Camera
    if (this.camera) {
      if (this.player) {
        this.camera.setWorldDimensions(
          this.mapBackgroundImage ? this.mapBackgroundImage.naturalWidth : 0,
          this.mapBackgroundImage ? this.mapBackgroundImage.naturalHeight : 0,
        )
        if (!this.camera.target && this.player) this.camera.setTarget(this.player) // Re-set target if lost
      }
      this.camera.update()
    }
  }

  render(context) {
    context.fillStyle = '#000000'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

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
      context.font = '16px Arial'
      context.fillStyle = 'orange'
      context.textAlign = 'center'
      context.fillText(
        'Map Background Image (mainTilesetPNG) not loaded or invalid.',
        context.canvas.width / 2,
        context.canvas.height / 2 - 20,
      )
    }

    if (this.player) {
      this.player.render(context, viewportX, viewportY)
    }

    // Debug text
    const debugTextYStart = 20
    const debugTextLineHeight = 15
    context.fillStyle = 'rgba(0,0,0,0.7)'
    context.fillRect(5, 5, 280, 75)
    context.fillStyle = 'white'
    context.textAlign = 'left'
    if (this.camera) {
      context.fillText(
        `Cam X: ${this.camera.getViewportX().toFixed(0)}, Y: ${this.camera.getViewportY().toFixed(0)}`,
        10,
        debugTextYStart,
      )
    }
    context.fillText(
      `Player: WASD. Camera follows player.`,
      10,
      debugTextYStart + debugTextLineHeight,
    )
    if (this.player) {
      context.fillText(
        `Player X: ${this.player.worldX.toFixed(0)}, Y: ${this.player.worldY.toFixed(0)}`,
        10,
        debugTextYStart + debugTextLineHeight * 2,
      )
    }
    if (this.mapBackgroundImage) {
      context.fillText(
        `Map Size: ${this.mapBackgroundImage.naturalWidth}x${this.mapBackgroundImage.naturalHeight}`,
        10,
        debugTextYStart + debugTextLineHeight * 3,
      )
    }
  }

  unload() {
    console.log('OverworldScene: Unloaded.')
    if (this.camera) this.camera.setTarget(null)
  }
}

export default OverworldScene
