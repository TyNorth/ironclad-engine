// src/game/scenes/TilemapTestScene.js

/**
 * @file TilemapTestScene.js
 * @description Scene for testing map background rendering and player character integration.
 */

import Player from '@/game/entities/player.js' // 1. Import Player

class TilemapTestScene {
  constructor() {
    /** @private @type {import('../../engine/core/AssetLoader.js').default | null} */
    this.assetLoader = null
    /** @private @type {import('../../engine/core/InputManager.js').default | null} */
    this.inputManager = null

    /** @private @type {HTMLImageElement | null} */
    this.mapBackgroundImage = null
    /** @private @type {object | null} */
    this.mapJsonData = null

    /** @private @type {Player | null} */
    this.player = null // 2. Add player property

    /** @private @type {number} */
    this.viewportX = 0
    /** @private @type {number} */
    this.viewportY = 0
    /** @private @type {number} */
    this.scrollSpeed = 300

    console.log('TilemapTestScene (Player Integration): Constructor called')
  }

  initialize(context, data = {}) {
    console.log('TilemapTestScene (Player Integration): Initialized.', data)
    this.viewportX = 0
    this.viewportY = 0

    if (window.game && window.game.assetLoader) {
      this.assetLoader = window.game.assetLoader
    } else {
      console.error('TilemapTestScene (Player Integration): AssetLoader not found!')
      return
    }

    if (window.game && window.game.inputManager) {
      this.inputManager = window.game.inputManager
    } else {
      console.warn(
        'TilemapTestScene (Player Integration): InputManager not found. Player/Scrolling may not work.',
      )
    }

    this.mapBackgroundImage = this.assetLoader.get('mainTilesetPNG')
    this.mapJsonData = this.assetLoader.get('testMapData') // Still useful for map dimensions

    if (!this.mapBackgroundImage) {
      console.error("TilemapTestScene (Player Integration): Asset 'mainTilesetPNG' not found!")
    } else {
      console.log(
        `TilemapTestScene (Player Integration): mapBackgroundImage loaded: ${this.mapBackgroundImage.width}x${this.mapBackgroundImage.height}`,
      )
    }
    if (this.mapJsonData) {
      console.log('TilemapTestScene (Player Integration): testMapData loaded.')
    }

    // 3. Instantiate Player
    if (this.assetLoader) {
      // Place player somewhere initially visible, e.g., near top-left or center of initial view
      const playerStartX = (window.game?.canvas?.width || 800) / 2
      const playerStartY = (window.game?.canvas?.height || 600) / 2

      this.player = new Player({
        x: playerStartX, // Initial world X
        y: playerStartY, // Initial world Y
        assetLoader: this.assetLoader,
        // spriteSheetName: 'testPlayer', // Default
        // width: 48, // Default
        // height: 48, // Default
        // speed: 150 // Default
      })
    } else {
      console.error('Cannot initialize Player: AssetLoader is missing.')
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

    // Viewport Scrolling (independent for now, will be camera target later)
    if (this.inputManager) {
      const moveAmount = this.scrollSpeed * deltaTime
      if (this.inputManager.isKeyPressed('ArrowLeft')) this.viewportX -= moveAmount
      if (this.inputManager.isKeyPressed('ArrowRight')) this.viewportX += moveAmount
      if (this.inputManager.isKeyPressed('ArrowUp')) this.viewportY -= moveAmount
      if (this.inputManager.isKeyPressed('ArrowDown')) this.viewportY += moveAmount

      // Clamp viewport (can be combined with player position for camera follow later)
      if (this.mapBackgroundImage && this.mapBackgroundImage.naturalWidth > 0) {
        const canvasWidth = window.game?.canvas?.width || 0
        const canvasHeight = window.game?.canvas?.height || 0

        if (this.mapBackgroundImage.naturalWidth > canvasWidth) {
          this.viewportX = Math.max(
            0,
            Math.min(this.viewportX, this.mapBackgroundImage.naturalWidth - canvasWidth),
          )
        } else {
          this.viewportX = 0
        }
        if (this.mapBackgroundImage.naturalHeight > canvasHeight) {
          this.viewportY = Math.max(
            0,
            Math.min(this.viewportY, this.mapBackgroundImage.naturalHeight - canvasHeight),
          )
        } else {
          this.viewportY = 0
        }
      } else {
        this.viewportX = 0
        this.viewportY = 0
      }
    }
  }

  render(context) {
    context.fillStyle = '#000000'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    // 1. Draw the main map image as a background
    if (
      this.mapBackgroundImage &&
      this.mapBackgroundImage.complete &&
      this.mapBackgroundImage.naturalWidth > 0
    ) {
      try {
        context.drawImage(this.mapBackgroundImage, -this.viewportX, -this.viewportY)
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

    // 2. Render the Player
    if (this.player) {
      this.player.render(context, this.viewportX, this.viewportY)
    }

    // NO OTHER TILE LAYERS RENDERED FROM JSON IN THIS VERSION FOR DIAGNOSTICS

    // Debug text
    const debugTextYStart = 20
    const debugTextLineHeight = 15
    context.fillStyle = 'rgba(0,0,0,0.7)'
    context.fillRect(5, 5, 280, 60) // Adjusted background size for more text
    context.fillStyle = 'white'
    context.textAlign = 'left'
    context.fillText(
      `Viewport X: ${this.viewportX.toFixed(0)}, Y: ${this.viewportY.toFixed(0)}`,
      10,
      debugTextYStart,
    )
    context.fillText(`Scroll: Arrows. Player: WASD.`, 10, debugTextYStart + debugTextLineHeight)
    if (this.player) {
      context.fillText(
        `Player X: ${this.player.worldX.toFixed(0)}, Y: ${this.player.worldY.toFixed(0)}`,
        10,
        debugTextYStart + debugTextLineHeight * 2,
      )
    }
    if (this.mapBackgroundImage) {
      context.fillText(
        `BG Img: ${this.mapBackgroundImage.width}x${this.mapBackgroundImage.height}`,
        10,
        debugTextYStart + debugTextLineHeight * 3,
      )
    }
  }

  unload() {
    console.log('TilemapTestScene (Player Integration): Unloaded.')
    // If player had any specific cleanup, call it here
  }
}

export default TilemapTestScene
