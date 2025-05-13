// src/game/entities/Player.js

/**
 * @file Player.js
 * @description Defines the Player class, responsible for player state, movement, and rendering.
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
   * @param {number} [config.width=48] - The width of the player sprite on canvas.
   * @param {number} [config.height=48] - The height of the player sprite on canvas.
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
      return // Or throw error
    }

    this.worldX = x
    this.worldY = y
    this.width = width
    this.height = height
    this.speed = speed // Pixels per second

    /** @type {Sprite | null} */
    this.sprite = null

    const playerImage = assetLoader.get(spriteSheetName)
    if (playerImage instanceof HTMLImageElement) {
      // Create the sprite. For now, it uses the whole image.
      // sx, sy, sWidth, sHeight could be used later for animation frames.
      this.sprite = new Sprite(
        playerImage,
        this.worldX, // Initial sprite x (will be updated relative to viewport)
        this.worldY, // Initial sprite y (will be updated relative to viewport)
        this.width, // Destination width on canvas
        this.height, // Destination height on canvas
        // sx, sy, sWidth, sHeight could be image.naturalWidth/Height if not a spritesheet part
      )
      console.log(`Player: Sprite created with image "${spriteSheetName}".`)
    } else {
      console.error(
        `Player: Failed to get image asset "${spriteSheetName}" for player sprite. Is it loaded?`,
      )
    }

    // Movement state
    this.velocityX = 0
    this.velocityY = 0

    console.log(`Player: Created at (${this.worldX}, ${this.worldY})`)
  }

  /**
   * Handles input for player movement.
   * @param {import('../../engine/core/InputManager.js').default} inputManager - The input manager instance.
   */
  handleInput(inputManager) {
    if (!inputManager) return

    this.velocityX = 0
    this.velocityY = 0

    if (inputManager.isKeyPressed('KeyW') || inputManager.isKeyPressed('ArrowUp')) {
      this.velocityY = -1
    }
    if (inputManager.isKeyPressed('KeyS') || inputManager.isKeyPressed('ArrowDown')) {
      this.velocityY = 1
    }
    if (inputManager.isKeyPressed('KeyA') || inputManager.isKeyPressed('ArrowLeft')) {
      this.velocityX = -1
    }
    if (inputManager.isKeyPressed('KeyD') || inputManager.isKeyPressed('ArrowRight')) {
      this.velocityX = 1
    }

    // Normalize diagonal movement (optional, but common)
    if (this.velocityX !== 0 && this.velocityY !== 0) {
      const length = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY)
      this.velocityX = this.velocityX / length
      this.velocityY = this.velocityY / length
    }
  }

  /**
   * Updates the player's state and position.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   * @param {object} [worldBounds] - Optional world boundaries for basic clamping.
   * @param {number} [worldBounds.minX=0]
   * @param {number} [worldBounds.minY=0]
   * @param {number} [worldBounds.maxX]
   * @param {number} [worldBounds.maxY]
   */
  update(deltaTime, worldBounds = {}) {
    // Calculate new position
    this.worldX += this.velocityX * this.speed * deltaTime
    this.worldY += this.velocityY * this.speed * deltaTime

    // Basic world boundary clamping (can be replaced by tile-based collision later)
    if (worldBounds.minX !== undefined) this.worldX = Math.max(worldBounds.minX, this.worldX)
    if (worldBounds.minY !== undefined) this.worldY = Math.max(worldBounds.minY, this.worldY)
    if (worldBounds.maxX !== undefined)
      this.worldX = Math.min(worldBounds.maxX - this.width, this.worldX) // Assumes width is player width
    if (worldBounds.maxY !== undefined)
      this.worldY = Math.min(worldBounds.maxY - this.height, this.worldY) // Assumes height is player height

    if (this.sprite) {
      // The sprite's x and y will be updated in the scene's render method relative to the viewport
      // Here, we could update sprite frame for animation if we had an animation system.
      // For now, the Player class itself doesn't directly set sprite.x/y to screen coords.
      // The Scene will do that by considering the viewport.
    }
  }

  /**
   * Renders the player's sprite.
   * The scene is responsible for setting the sprite's screen x,y based on worldX, worldY and viewport.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {number} viewportX - The x-coordinate of the viewport's top-left corner in world pixels.
   * @param {number} viewportY - The y-coordinate of the viewport's top-left corner in world pixels.
   */
  render(context, viewportX, viewportY) {
    if (this.sprite && this.sprite.visible) {
      // Update sprite's screen position based on player's world position and viewport
      this.sprite.x = Math.floor(this.worldX - viewportX)
      this.sprite.y = Math.floor(this.worldY - viewportY)
      this.sprite.render(context)
    }
  }

  /**
   * Gets the player's current world position.
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    return { x: this.worldX, y: this.worldY }
  }

  /**
   * Gets the player's dimensions.
   * @returns {{width: number, height: number}}
   */
  getDimensions() {
    return { width: this.width, height: this.height }
  }
}

export default Player
