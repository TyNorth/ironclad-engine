// src/game/systems/MovementSystem.js

import System from '../../engine/ecs/System.js'

/**
 * @class MovementSystem
 * @extends System
 * @description Updates entity positions based on velocity and handles tile-based collision.
 */
class MovementSystem extends System {
  /**
   * Requires "Position", "Velocity", and now "Collider" components.
   * @static
   * @type {Array<import('../../engine/ecs/EntityManager.js').ComponentTypeName>}
   */
  static requiredComponents = ['Position', 'Velocity', 'Collider']

  constructor() {
    super()
    // console.log("MovementSystem: Constructor called");
  }

  /**
   * Updates entities.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {Array<import('../../engine/ecs/EntityManager.js').EntityId>} entities - Entities matching requiredComponents.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  update(deltaTime, entities, engine) {
    // UPDATED: Check for engine.sceneManager directly
    if (!engine || !engine.entityManager || !engine.sceneManager) {
      console.error(
        'MovementSystem: Required engine services (EntityManager, SceneManager) not available!',
      )
      return
    }

    // UPDATED: Access sceneManager directly and call getActiveSceneInstance()
    const sceneManager = engine.sceneManager
    const currentScene = sceneManager.getActiveSceneInstance() // Corrected method name

    if (!currentScene || typeof currentScene.isTileSolidAtWorldXY !== 'function') {
      // console.warn("MovementSystem: Active scene does not support isTileSolidAtWorldXY. Skipping collision checks for all entities in this system's update.");
      // Fallback to movement without collision for these entities
      for (const entityId of entities) {
        const position = engine.entityManager.getComponent(entityId, 'Position')
        const velocity = engine.entityManager.getComponent(entityId, 'Velocity')
        if (position && velocity) {
          position.x += velocity.vx * deltaTime
          position.y += velocity.vy * deltaTime
        }
      }
      return
    }

    for (const entityId of entities) {
      const position = engine.entityManager.getComponent(entityId, 'Position')
      const velocity = engine.entityManager.getComponent(entityId, 'Velocity')
      const collider = engine.entityManager.getComponent(entityId, 'Collider')

      if (!position || !velocity || !collider || !collider.collidesWithTiles) {
        if (position && velocity) {
          position.x += velocity.vx * deltaTime
          position.y += velocity.vy * deltaTime
        }
        continue
      }

      const colliderWidth = collider.width
      const colliderHeight = collider.height
      const offsetX = collider.offsetX || 0
      const offsetY = collider.offsetY || 0

      let dx = velocity.vx * deltaTime
      let dy = velocity.vy * deltaTime

      let currentBoxX = position.x + offsetX
      let currentBoxY = position.y + offsetY

      // Check X-axis movement
      if (dx !== 0) {
        const potentialNextBoxX = currentBoxX + dx
        // Use Math.floor for tile checks if positions can be fractional
        const checkX =
          dx > 0 ? Math.floor(potentialNextBoxX + colliderWidth - 1) : Math.floor(potentialNextBoxX)

        let collisionX = false
        const yPoints = [
          Math.floor(currentBoxY),
          Math.floor(currentBoxY + colliderHeight / 2),
          Math.floor(currentBoxY + colliderHeight - 1),
        ]
        for (const y of yPoints) {
          if (currentScene.isTileSolidAtWorldXY(checkX, y)) {
            collisionX = true
            break
          }
        }
        if (!collisionX) {
          position.x += dx
        } else {
          velocity.vx = 0
        }
      }

      currentBoxX = position.x + offsetX // Re-evaluate currentBoxX for Y-axis check

      // Check Y-axis movement
      if (dy !== 0) {
        const potentialNextBoxY = currentBoxY + dy
        // Use Math.floor for tile checks if positions can be fractional
        const checkY =
          dy > 0
            ? Math.floor(potentialNextBoxY + colliderHeight - 1)
            : Math.floor(potentialNextBoxY)

        let collisionY = false
        const xPoints = [
          Math.floor(currentBoxX),
          Math.floor(currentBoxX + colliderWidth / 2),
          Math.floor(currentBoxX + colliderWidth - 1),
        ]
        for (const x of xPoints) {
          if (currentScene.isTileSolidAtWorldXY(x, checkY)) {
            collisionY = true
            break
          }
        }
        if (!collisionY) {
          position.y += dy
        } else {
          velocity.vy = 0
        }
      }
    }
  }
}

export default MovementSystem
