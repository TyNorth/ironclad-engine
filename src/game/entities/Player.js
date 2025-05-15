// src/game/entities/Player.js

/**
 * @file Player.js
 * @description Defines the Player class, responsible for player state, movement, rendering,
 * and now basic tile-based collision detection.
 */

import Sprite from '../../engine/rendering/Sprite.js'

class Player {
  /**
   * Creates a new Player instance.
   * @param {object} config - Configuration object for the player.
   * @param {number} config.x - Initial x-coordinate in the world.
   * @param {number} config.y - Initial y-coordinate in the world.
   * @param {import('../../engine/core/AssetLoader.js').default} assetLoader - Reference to the asset loader.
   * @param {string} [config.spriteSheetName='testPlayer'] - The name of the image asset for the player's sprite.
   * @param {number} [config.width=48] - The width of the player.
   * @param {number} [config.height=48] - The height of the player.
   * @param {number} [config.speed=150] - Player movement speed in pixels per second.
   */
  constructor({
    x,
    y,
    assetLoader,
    spriteSheetName = 'testPlayer',
    width = 48,
    height = 48,
    speed = 150,
  }) {
    if (!assetLoader) {
      console.error('Player: AssetLoader not provided!')
      // Consider throwing an error or having a non-functional state
      return
    }

    this.worldX = x
    this.worldY = y
    this.width = width // Player's collision width
    this.height = height // Player's collision height
    this.speed = speed

    /** @type {Sprite | null} */
    this.sprite = null
    const playerImage = assetLoader.get(spriteSheetName)
    if (playerImage instanceof HTMLImageElement) {
      this.sprite = new Sprite(
        playerImage,
        this.worldX,
        this.worldY,
        this.width,
        this.height, // Sprite display dimensions match player dimensions
      )
      console.log(`Player: Sprite created with image "${spriteSheetName}".`)
    } else {
      console.error(`Player: Failed to get image asset "${spriteSheetName}". Sprite not created.`)
    }

    this.velocityX = 0
    this.velocityY = 0

    console.log(
      `Player: Created at (${this.worldX}, ${this.worldY}) with size ${this.width}x${this.height}`,
    )
  }

  handleInput(inputManager) {
    if (!inputManager) return
    this.velocityX = 0
    this.velocityY = 0

    // Using actions defined in main.js
    if (inputManager.isActionPressed('moveUp')) this.velocityY = -1
    if (inputManager.isActionPressed('moveDown')) this.velocityY = 1
    if (inputManager.isActionPressed('moveLeft')) this.velocityX = -1
    if (inputManager.isActionPressed('moveRight')) this.velocityX = 1

    if (this.velocityX !== 0 && this.velocityY !== 0) {
      const length = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY)
      this.velocityX = this.velocityX / length
      this.velocityY = this.velocityY / length
    }
  }

  /**
   * Updates the player's state, position, and handles collision.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   * @param {object} scene - The current scene, expected to have `isTileSolidAtWorldXY(x,y)` method
   * and map boundary information.
   * @param {object} [worldBounds] - Optional direct world boundaries for clamping.
   */
  update(deltaTime, scene, worldBounds = {}) {
    if (!scene || typeof scene.isTileSolidAtWorldXY !== 'function') {
      console.warn(
        'Player.update: Scene with isTileSolidAtWorldXY method not provided. Skipping collision checks.',
      )
      // Fallback to movement without collision for this frame
      this.worldX += this.velocityX * this.speed * deltaTime
      this.worldY += this.velocityY * this.speed * deltaTime
      this._clampToWorldBounds(worldBounds)
      return
    }

    const moveStepX = this.velocityX * this.speed * deltaTime
    const moveStepY = this.velocityY * this.speed * deltaTime

    // --- Collision Detection ---
    // Check X-axis collision
    if (moveStepX !== 0) {
      const potentialX = this.worldX + moveStepX
      let collisionX = false

      // Points to check on the leading edge for X movement
      const checkXEdge = this.velocityX > 0 ? potentialX + this.width - 1 : potentialX // -1 to be just inside

      // Check top, middle, and bottom of the player's vertical span
      const yPoints = [this.worldY, this.worldY + this.height / 2, this.worldY + this.height - 1]
      for (const yPos of yPoints) {
        if (scene.isTileSolidAtWorldXY(checkXEdge, yPos)) {
          collisionX = true
          break
        }
      }

      if (!collisionX) {
        this.worldX = potentialX
      } else {
        // Optional: Add "hugging" logic to align with wall if desired
        // For now, just stop.
        this.velocityX = 0 // Stop horizontal movement on collision
      }
    }

    // Check Y-axis collision
    if (moveStepY !== 0) {
      const potentialY = this.worldY + moveStepY
      let collisionY = false

      // Points to check on the leading edge for Y movement
      const checkYEdge = this.velocityY > 0 ? potentialY + this.height - 1 : potentialY // -1 to be just inside

      // Check left, middle, and right of the player's horizontal span
      const xPoints = [this.worldX, this.worldX + this.width / 2, this.worldX + this.width - 1]
      for (const xPos of xPoints) {
        if (scene.isTileSolidAtWorldXY(xPos, checkYEdge)) {
          collisionY = true
          break
        }
      }
      if (!collisionY) {
        this.worldY = potentialY
      } else {
        this.velocityY = 0 // Stop vertical movement on collision
      }
    }

    this._clampToWorldBounds(worldBounds) // Final clamping to overall map edges
  }

  /** @private */
  _clampToWorldBounds(worldBounds) {
    if (worldBounds.minX !== undefined) this.worldX = Math.max(worldBounds.minX, this.worldX)
    if (worldBounds.minY !== undefined) this.worldY = Math.max(worldBounds.minY, this.worldY)
    if (worldBounds.maxX !== undefined)
      this.worldX = Math.min(worldBounds.maxX - this.width, this.worldX)
    if (worldBounds.maxY !== undefined)
      this.worldY = Math.min(worldBounds.maxY - this.height, this.worldY)
  }

  render(context, viewportX, viewportY) {
    if (this.sprite && this.sprite.visible) {
      this.sprite.x = Math.floor(this.worldX - viewportX)
      this.sprite.y = Math.floor(this.worldY - viewportY)
      this.sprite.render(context)
    }
  }

  getPosition() {
    return { x: this.worldX, y: this.worldY }
  }
  getDimensions() {
    return { width: this.width, height: this.height }
  }
}

export default Player
