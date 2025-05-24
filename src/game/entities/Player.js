// src/game/entities/Player.js

/**
 * @file Player.js
 * @description Defines the Player class, now extending BaseEntity.
 * It creates the player entity and its necessary components within the ECS.
 * Most logic (movement, rendering, physics) will be handled by Systems.
 */

import BaseEntity from '../../engine/ecs/BaseEntity.js' // Adjust path if necessary

class Player extends BaseEntity {
  /**
   * Creates a new Player instance, setting up its ECS entity and components.
   * @param {object} options - Configuration object for the player.
   * @param {import('../../engine/ecs/EntityManager.js').default} options.entityManager - REQUIRED.
   * @param {import('../../engine/core/IroncladEngine.js').default} [options.engine] - Optional, for BaseEntity event emitting.
   * @param {number} options.x - Initial x-coordinate for the Position component.
   * @param {number} options.y - Initial y-coordinate for the Position component (vertical screen axis).
   * @param {number} [options.z=0] - Initial z-coordinate for the Position component (depth).
   * @param {string} [options.name='Hero'] - Player's name (for PlayerStats component).
   * @param {number} [options.speed=150] - Base movement speed (for PlayerStats component).
   * @param {number} [options.hp=100] - Current health points (for Health component).
   * @param {number} [options.maxHp=100] - Maximum health points (for Health component).
   * @param {number} [options.currentXp=0] - Current experience points (for Experience component).
   * @param {number} [options.xpToNextLevel=100] - XP for next level (for Experience component).
   * @param {string} [options.spriteSheetName='testPlayer'] - Asset name for the RenderableSprite component.
   * @param {number} [options.width=32] - Width for Collider and RenderableSprite components.
   * @param {number} [options.height=32] - Height for Collider and RenderableSprite components.
   * @param {number} [options.depth=32] - Depth for 3D Collider component.
   * @param {import('../../engine/core/AssetLoader.js').default} [options.assetLoader] - Optional: Used for a one-time sprite validation in constructor.
   * @param {Array<object>} [options.inventory=[]] - Initial inventory (for Inventory component).
   * @param {number} [options.jumpForce=450] - Force for jumping (used in handleInput).
   * @param {object} [options.customProps={}] - Other custom properties.
   */
  constructor(options = {}) {
    super(options) // Handles this.id, this.entityManager, this.engine

    const {
      x,
      y,
      z = 0,
      assetLoader, // assetLoader is primarily for the initial console warning here
      name = 'Hero',
      speed = 150,
      hp = 100,
      maxHp = 100,
      currentXp = 0,
      xpToNextLevel = 100,
      spriteSheetName = 'testPlayer',
      width = 32,
      height = 32,
      depth = 32,
      inventory = [],
      jumpForce = 450, // Store jumpForce for handleInput
      ...customPlayerData
    } = options

    if (x === undefined || y === undefined) {
      const errorMsg = `Player (Entity ID: ${this.id}): x and y coordinates are required. Received x=${x}, y=${y}`
      console.error(errorMsg, options)
      throw new Error(errorMsg)
    }

    this.jumpForce = jumpForce // Store for use in handleInput

    // --- Add Core Components ---
    this.addComponent('Position', { x: Number(x), y: Number(y), z: Number(z) })
    this.addComponent('Velocity', { vx: 0, vy: 0, vz: 0 })
    this.addComponent('Acceleration', { ax: 0, ay: 0, az: 0 })
    this.addComponent('Health', { current: hp, max: maxHp })
    this.addComponent('Experience', { current: currentXp, nextLevel: xpToNextLevel })
    this.addComponent('PlayerStats', { name, speed, level: 1 })
    this.addComponent('Inventory', { items: inventory })

    this.addComponent('RenderableSprite', {
      assetName: spriteSheetName,
      width: width,
      height: height,
      offsetX: 0,
      offsetY: 0,
      visible: true,
      // frameX: 0, frameY: 0, sWidth: width, sHeight: height // if AnimationSystem doesn't set initial frame
    })

    this.addComponent('Collider', {
      shape: 'aabb',
      width: width,
      height: height,
      depth: depth,
      offsetX: 0,
      offsetY: 0,
      offsetZ: 0,
      isTrigger: false,
      collidesWithTiles: true,
      type: 'player',
    })

    this.addComponent('PhysicsBody', {
      entityType: 'dynamic',
      mass: 1,
      useGravity: true,
      gravityScale: 1.0,
      friction: 0.1,
      restitution: 0.0,
      isOnGround: false,
    })

    this.addComponent('PlayerControllable', {}) // Marker for input processing

    if (Object.keys(customPlayerData).length > 0) {
      this.addComponent('CustomPlayerData', { ...customPlayerData })
    }

    if (assetLoader) {
      // Optional check if assetLoader is passed
      const playerImage = assetLoader.get(spriteSheetName)
      if (!(playerImage instanceof HTMLImageElement)) {
        console.warn(
          `Player (Entity ID: ${this.id}): Sprite asset "${spriteSheetName}" not found or not an image. RenderSystem may fail to render.`,
        )
      }
    }
    // console.log(`Player "${name}" (Entity ID: ${this.id}) ECS entity fully configured.`);
  }

  // --- Convenience Methods to Interact with Player Components ---
  // These methods now get/set data on components associated with this.id

  getName() {
    const stats = this.getComponent('PlayerStats')
    return stats ? stats.name : 'Player'
  }

  // getPosition() is inherited from BaseEntity if it calls this.entityManager.getComponent(this.id, 'Position')
  // Or define it specifically if BaseEntity doesn't have it.
  // For camera following, the camera system might directly use the Position component of this.id
  // For HUD, we'll provide specific getters like getHealth, getExperience.

  getHealth() {
    const health = this.getComponent('Health')
    return health ? { current: health.current, max: health.max } : { current: 0, max: 0 }
  }

  getExperience() {
    const exp = this.getComponent('Experience')
    return exp ? { current: exp.current, nextLevel: exp.nextLevel } : { current: 0, nextLevel: 0 }
  }

  getInventory() {
    const inv = this.getComponent('Inventory')
    return inv ? inv.items : []
  }

  // Example: The Player class instance might still have methods that trigger actions by modifying components
  // or emitting events, but the core physics and rendering logic is handled by systems.

  takeDamage(amount) {
    const health = this.getComponent('Health')
    if (health) {
      health.current = Math.max(0, health.current - amount)
      this.emitEvent('playerDamaged', {
        damage: amount,
        currentHp: health.current,
        maxHp: health.max,
      })
      if (health.current <= 0) this.die()
    }
  }

  heal(amount) {
    const health = this.getComponent('Health')
    if (health) {
      health.current = Math.min(health.max, health.current + amount)
      this.emitEvent('playerHealed', {
        amount: amount,
        currentHp: health.current,
        maxHp: health.max,
      })
    }
  }

  gainXP(amount) {
    const exp = this.getComponent('Experience')
    if (exp) {
      exp.current += amount
      this.emitEvent('playerGainedXP', {
        amount: amount,
        currentXp: exp.current,
        xpToNextLevel: exp.nextLevel,
      })
      if (exp.current >= exp.nextLevel) this.levelUp()
    }
  }

  levelUp() {
    const health = this.getComponent('Health')
    const exp = this.getComponent('Experience')
    const stats = this.getComponent('PlayerStats')
    if (health && exp && stats) {
      stats.level = (stats.level || 1) + 1
      exp.current -= exp.nextLevel
      exp.nextLevel = Math.floor(exp.nextLevel * 1.5)
      health.max += 10
      health.current = health.max
      this.emitEvent('playerLeveledUp', {
        newLevel: stats.level,
        newMaxHp: health.max,
        newXpToNext: exp.nextLevel,
      })
    }
  }

  die() {
    // console.log(`${this.getName()} (Entity ID: ${this.id}) has been defeated!`);
    this.emitEvent('playerDied')
    this.addComponent('IsDead', { timestamp: Date.now() })
    // A DeathSystem would then handle the consequences.
  }

  /**
   * Processes input actions and updates the entity's Velocity component.
   * This method is typically called by a PlayerControlSystem or InputSystem.
   * For platformer: sets horizontal velocity based on moveLeft/Right actions,
   * and applies an upward velocity impulse for the 'jump' action.
   * @param {import('../../engine/core/InputManager.js').default} inputManager
   */
  handleInput(inputManager) {
    if (!inputManager || !this.hasComponent('PlayerControllable')) return

    const velocity = this.getComponent('Velocity')
    const stats = this.getComponent('PlayerStats')
    const physicsBody = this.getComponent('PhysicsBody')

    if (!velocity || !stats || !physicsBody) {
      console.warn(
        `Player (ID: ${this.id}): Missing Velocity, PlayerStats, or PhysicsBody component for input handling.`,
      )
      return
    }

    const speed = stats.speed || 150

    const moveDownValue = inputManager.getActionValue('moveDown')
    const moveUpValue = inputManager.getActionValue('moveUp')
    let targetVerticalFactor = moveDownValue - moveUpValue

    // If you want vertical movement to also be scaled by speed:
    velocity.vy = Math.max(-1, Math.min(1, targetVerticalFactor)) * speed

    // Horizontal Movement
    const moveRightValue = inputManager.getActionValue('moveRight')
    const moveLeftValue = inputManager.getActionValue('moveLeft')
    let targetHorizontalFactor = moveRightValue - moveLeftValue
    targetHorizontalFactor = Math.max(-1, Math.min(1, targetHorizontalFactor)) // Clamp factor

    velocity.vx = targetHorizontalFactor * speed

    // Jump Action
    if (inputManager.isActionJustPressed('jump') && physicsBody.isOnGround) {
      velocity.vy = -(this.jumpForce + 50) // Use stored jumpForce
      physicsBody.isOnGround = false // Player is now in the air
      // console.log(`[Player ID: ${this.id}] JUMP! velocityY set to: ${velocity.vy}`);
    }

    // Vertical velocity (vy) is primarily handled by PhysicsSystem (gravity, landing).
    // We don't use moveUp/moveDown actions for continuous vertical flight here for a platformer.
  }

  _clampToWorldBounds(worldBounds) {
    if (worldBounds.minX !== undefined) this.worldX = Math.max(worldBounds.minX, this.worldX)
    if (worldBounds.minY !== undefined) this.worldY = Math.max(worldBounds.minY, this.worldY)
    if (worldBounds.maxX !== undefined)
      this.worldX = Math.min(worldBounds.maxX - this.width, this.worldX)
    if (worldBounds.maxY !== undefined)
      this.worldY = Math.min(worldBounds.maxY - this.height, this.worldY)
  }

  /**
   * Gets the position of the player from its Position component.
   * @returns {{x: number, y: number, z: number}}
   */
  getPosition() {
    const pos = this.getComponent('Position')
    if (!pos) {
      console.warn(
        `Player (ID: ${this.id}): getPosition() called but Position component not found.`,
      )
      return { x: 0, y: 0, z: 0 } // Default fallback
    }
    // console.log(`[Player getPosition - ID: ${this.id}] Returning:`, pos);
    return { x: pos.x, y: pos.y, z: pos.z } // Return a copy
  }
  /**
   * Gets the dimensions of the player, typically from its Collider or RenderableSprite component.
   * @returns {{width: number, height: number}}
   */
  getDimensions() {
    const collider = this.getComponent('Collider')
    if (collider && collider.width !== undefined && collider.height !== undefined) {
      return { width: collider.width, height: collider.height }
    }
    const renderable = this.getComponent('RenderableSprite')
    if (renderable && renderable.width !== undefined && renderable.height !== undefined) {
      return { width: renderable.width, height: renderable.height }
    }
    // Fallback or error if dimensions cannot be determined
    console.warn(
      `Player (ID: ${this.id}): Could not determine dimensions from Collider or RenderableSprite.`,
    )
    return { width: 32, height: 32 } // Default fallback
  }
}

export default Player
