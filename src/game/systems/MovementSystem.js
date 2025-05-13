// src/game/systems/MovementSystem.js

import System from '../../engine/ecs/System.js'

/**
 * @class MovementSystem
 * @extends System
 * @description Updates the position of entities based on their velocity.
 */
class MovementSystem extends System {
  /**
   * Specifies that this system requires entities to have both "Position" and "Velocity" components.
   * @static
   * @type {Array<import('../../engine/ecs/EntityManager.js').ComponentTypeName>}
   */
  static requiredComponents = ['Position', 'Velocity']

  constructor() {
    super()
    // console.log("MovementSystem: Constructor called");
  }

  /**
   * Updates entities with Position and Velocity components.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {Array<import('../../engine/ecs/EntityManager.js').EntityId>} entities - Entities matching requiredComponents.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  update(deltaTime, entities, engine) {
    if (!engine || !engine.entityManager) {
      console.error('MovementSystem: EntityManager not available via engine instance!')
      return
    }

    // console.log(`MovementSystem: Updating ${entities.length} entities.`);
    for (const entityId of entities) {
      const position = engine.entityManager.getComponent(entityId, 'Position')
      const velocity = engine.entityManager.getComponent(entityId, 'Velocity')

      // It's good practice to ensure components exist, though the system's query should guarantee it.
      if (position && velocity) {
        position.x += velocity.vx * deltaTime
        position.y += velocity.vy * deltaTime
        // console.log(`Entity ${entityId} moved to ${position.x.toFixed(2)}, ${position.y.toFixed(2)}`);
      }
    }
  }
}

export default MovementSystem
