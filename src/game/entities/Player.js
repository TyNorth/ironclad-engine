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
   * @param {object} options - Configuration object for the player.
   * @param {number} options.x - Initial x-coordinate in the world.
   * @param {number} options.y - Initial y-coordinate in the world.
   * @param {import('../../engine/core/AssetLoader.js').default} options.assetLoader - Reference to the asset loader.
   * @param {string} [options.spriteSheetName='testPlayer'] - The name of the image asset for the player's sprite.
   * @param {number} [options.width=48] - The width of the player.
   * @param {number} [options.height=48] - The height of the player.
   * @param {number} [options.speed=150] - Player movement speed in pixels per second.
   * @param {Array<object>} [options.inventory=[]] - Initial inventory for the player.
   * @param {string} [options.name='Hero'] - Player's name.
   * @param {number} [options.hp=100] - Player's current HP.
   * @param {number} [options.maxHp=100] - Player's maximum HP.
   * @param {number} [options.currentXp=0] - Player's current XP.
   * @param {number} [options.xpToNextLevel=100] - XP needed for next level.
   */
  constructor({
    x,
    y,
    assetLoader,
    spriteSheetName = 'testPlayer',
    width = 48,
    height = 48,
    speed = 150,
    inventory = [],
    name = 'Hero', // Added name
    hp = 100, // Added hp
    maxHp = 100, // Added maxHp
    currentXp = 0, // Added currentXp
    xpToNextLevel = 100, // Added xpToNextLevel
  }) {
    if (!assetLoader) {
      console.error('Player: AssetLoader not provided!')
      return
    }

    this.worldX = x
    this.worldY = y
    this.width = width
    this.height = height
    this.speed = speed
    this.inventory = inventory

    // Initialize stats for HUD
    this.name = name
    this.hp = hp
    this.maxHp = maxHp
    this.currentXp = currentXp
    this.xpToNextLevel = xpToNextLevel

    /** @type {Sprite | null} */
    this.sprite = null
    const playerImage = assetLoader.get(spriteSheetName)
    if (playerImage instanceof HTMLImageElement) {
      this.sprite = new Sprite(playerImage, this.worldX, this.worldY, this.width, this.height)
      // console.log(`Player: Sprite created with image "${spriteSheetName}".`);
    } else {
      console.error(`Player: Failed to get image asset "${spriteSheetName}". Sprite not created.`)
    }

    this.velocityX = 0
    this.velocityY = 0

    // console.log(
    //   `Player "${this.name}": Created at (${this.worldX}, ${this.worldY}), HP: ${this.hp}/${this.maxHp}`
    // );
  }

  handleInput(inputManager) {
    if (!inputManager) {
      this.velocityX = 0
      this.velocityY = 0
      return
    }

    // getActionValue should return a value between 0 and 1 for active positive actions,
    // and 0 if not active or if the negative counterpart is equally active.
    // InputManager's `highestActionValue` ensures this if bindings are set up for
    // distinct positive/negative actions (e.g., 'moveRight' vs 'moveLeft').
    const moveRightValue = inputManager.getActionValue('moveRight')
    const moveLeftValue = inputManager.getActionValue('moveLeft')
    const moveDownValue = inputManager.getActionValue('moveDown')
    const moveUpValue = inputManager.getActionValue('moveUp')

    // Calculate net velocity. If D-pad Up is pressed, moveUpValue should be 1.
    // If Left Stick Up is pushed halfway, moveUpValue might be 0.5.
    // The InputManager's `highestActionValue` should take the max if both are bound.
    this.velocityX = moveRightValue - moveLeftValue
    this.velocityY = moveDownValue - moveUpValue

    // Clamp the resulting velocity components to ensure they are within -1 to 1.
    // This is a safeguard, as the individual action values should be 0-1.
    this.velocityX = Math.max(-1, Math.min(1, this.velocityX))
    this.velocityY = Math.max(-1, Math.min(1, this.velocityY))

    // --- DEBUG LOG ---
    if (this.velocityX !== 0 || this.velocityY !== 0) {
      console.log(
        `[Player.handleInput V3] Vals(R:${moveRightValue.toFixed(2)}, L:${moveLeftValue.toFixed(2)}, D:${moveDownValue.toFixed(2)}, U:${moveUpValue.toFixed(2)}) -> Final Vel: vX=${this.velocityX.toFixed(2)}, vY=${this.velocityY.toFixed(2)}`,
      )
    }
    // --- END DEBUG LOG ---
  }

  update(deltaTime, scene, worldBounds = {}) {
    if (!scene || typeof scene.isTileSolidAtWorldXY !== 'function') {
      // console.warn('Player.update: Scene with isTileSolidAtWorldXY method not provided. Skipping collision checks.');
      this.worldX += this.velocityX * this.speed * deltaTime
      this.worldY += this.velocityY * this.speed * deltaTime
      this._clampToWorldBounds(worldBounds)
      return
    }

    let currentVelocityX = this.velocityX
    let currentVelocityY = this.velocityY

    // Normalize if moving diagonally (so diagonal isn't faster)
    // This uses the direct -1 to 1 values from handleInput
    if (currentVelocityX !== 0 && currentVelocityY !== 0) {
      const length = Math.sqrt(
        currentVelocityX * currentVelocityX + currentVelocityY * currentVelocityY,
      )
      currentVelocityX = currentVelocityX / length
      currentVelocityY = currentVelocityY / length
    }

    const moveStepX = currentVelocityX * this.speed * deltaTime
    const moveStepY = currentVelocityY * this.speed * deltaTime

    // --- Collision Detection ---
    if (moveStepX !== 0) {
      const potentialX = this.worldX + moveStepX
      let collisionX = false
      const checkXEdge = currentVelocityX > 0 ? potentialX + this.width - 1 : potentialX
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
        this.velocityX = 0 // Stop persistent velocity if collision
      }
    }

    if (moveStepY !== 0) {
      const potentialY = this.worldY + moveStepY
      let collisionY = false
      const checkYEdge = currentVelocityY > 0 ? potentialY + this.height - 1 : potentialY
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
        this.velocityY = 0 // Stop persistent velocity if collision
      }
    }

    this._clampToWorldBounds(worldBounds)
  }

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
