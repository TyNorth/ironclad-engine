/* eslint-disable no-prototype-builtins */
// src/engine/physics/PhysicsSystem.js
import System from '../ecs/System.js'
import { GRAVITY_Y, EPSILON } from './PhysicsConstants.js' // Assuming GRAVITY_X and GRAVITY_Z are 0

// --- Component Structure Definitions (JSDoc Typedefs) ---
/** @typedef {object} PositionComponent {x,y,z} */
/** @typedef {object} VelocityComponent {vx,vy,vz} */
/** @typedef {object} AccelerationComponent {ax,ay,az} */
/** @typedef {object} PhysicsBodyComponent {entityType, mass, useGravity, gravityScale, friction, restitution, isOnGround} */
/** @typedef {object} ColliderComponent {shape, width, height, depth, offsetX,Y,Z, isTrigger, collisionLayer, collisionMask, collidesWithTiles} */

class PhysicsSystem extends System {
  static requiredComponents = ['Position', 'Velocity', 'PhysicsBody', 'Collider']

  constructor() {
    super()
  }
  initialize(engine) {
    super.initialize(engine)
  }

  _getAABB(position, collider) {
    // Assuming position x,y,z is the CENTER of the entity
    const centerX = position.x + (collider.offsetX || 0)
    const centerY = position.y + (collider.offsetY || 0)
    const centerZ = position.z + (collider.offsetZ || 0) // Keep Z for 3D AABB definition
    const halfWidth = collider.width / 2
    const halfHeight = collider.height / 2
    const halfDepth = (collider.depth || 1) / 2 // Default depth if not specified for Z

    return {
      minX: centerX - halfWidth,
      maxX: centerX + halfWidth,
      minY: centerY - halfHeight,
      maxY: centerY + halfHeight,
      minZ: centerZ - halfDepth,
      maxZ: centerZ + halfDepth, // Full 3D AABB
      centerX,
      centerY,
      centerZ,
    }
  }

  _checkAABBOverlap(aabb1, aabb2) {
    // Full 3D AABB Check
    return (
      aabb1.minX < aabb2.maxX &&
      aabb1.maxX > aabb2.minX &&
      aabb1.minY < aabb2.maxY &&
      aabb1.maxY > aabb2.minY &&
      aabb1.minZ < aabb2.maxZ &&
      aabb1.maxZ > aabb2.minZ
    )
  }

  _checkEntityTileCollision(entityId, position, collider, scene) {
    /* ... as previously refined for 8-point check ... */
  }

  update(deltaTime, entities, engineRef) {
    if (!this.entityManager || !this.engine) return

    const activeScene = this.engine.sceneManager
      ? this.engine.sceneManager.getActiveSceneInstance()
      : null
    const canCheckTileCollisions =
      activeScene &&
      typeof activeScene.isTileSolidAtWorldXY === 'function' &&
      activeScene.tileWidth > 0 &&
      activeScene.tileHeight > 0

    // --- I. Update Positions based on Velocity and Forces (Integration) ---
    for (const entityId of entities) {
      // ... (Integration logic for position, velocity, acceleration, gravity as before) ...
      // This calculates the "desired" or "potential" new position for this frame.
      const position = this.entityManager.getComponent(entityId, 'Position')
      const velocity = this.entityManager.getComponent(entityId, 'Velocity')
      const physicsBody = this.entityManager.getComponent(entityId, 'PhysicsBody')
      let acceleration = this.entityManager.getComponent(entityId, 'Acceleration')
      if (!acceleration) acceleration = { ax: 0, ay: 0, az: 0 }

      if (physicsBody.entityType === 'static') {
        velocity.vx = 0
        velocity.vy = 0
        velocity.vz = 0
        acceleration.ax = 0
        acceleration.ay = 0
        acceleration.az = 0
        continue
      }

      let frameAx = acceleration.ax
      let frameAy = acceleration.ay
      let frameAz = acceleration.az
      if (physicsBody.useGravity) {
        frameAy += GRAVITY_Y * (physicsBody.gravityScale || 1.0)
      }
      velocity.vx += frameAx * deltaTime
      velocity.vy += frameAy * deltaTime
      velocity.vz += frameAz * deltaTime
      position.x += velocity.vx * deltaTime
      position.y += velocity.vy * deltaTime
      position.z += velocity.vz * deltaTime
      acceleration.ax = 0
      acceleration.ay = physicsBody.useGravity
        ? frameAy - GRAVITY_Y * (physicsBody.gravityScale || 1.0)
        : 0
      acceleration.az = 0 // Reset non-persistent parts
    }

    // --- II. Collision Detection & Response ---
    // Iterate multiple times for better stability (e.g., 2-5 iterations)
    const collisionIterations = 3 // Configurable
    for (let iter = 0; iter < collisionIterations; iter++) {
      for (let i = 0; i < entities.length; i++) {
        const entityIdA = entities[i]
        const positionA = this.entityManager.getComponent(entityIdA, 'Position')
        const velocityA = this.entityManager.getComponent(entityIdA, 'Velocity')
        const physicsBodyA = this.entityManager.getComponent(entityIdA, 'PhysicsBody')
        const colliderA = this.entityManager.getComponent(entityIdA, 'Collider')

        if (
          !positionA ||
          !velocityA ||
          !physicsBodyA ||
          !colliderA ||
          physicsBodyA.entityType === 'static'
        ) {
          continue
        }
        if (physicsBodyA.hasOwnProperty('isOnGround')) physicsBodyA.isOnGround = false // Reset for this iteration pass

        // A. Tile Collision Response (Axis-separated, simplified for now)
        // This needs careful reintegration of precise snapping logic.
        // For Octopath-style, this would be the primary collision for environment.
        if (canCheckTileCollisions && colliderA.collidesWithTiles) {
          const prevX = positionA.x - velocityA.vx * deltaTime // Approximate position before this iteration's X move
          const prevY = positionA.y - velocityA.vy * deltaTime // Approximate position before this iteration's Y move

          // Check X
          if (
            velocityA.vx !== 0 &&
            this._checkEntityTileCollision(entityIdA, positionA, colliderA, activeScene)
          ) {
            positionA.x = prevX // Simple revert for X
            velocityA.vx = 0
          }
          // Check Y (using current, potentially X-reverted positionA.x)
          if (
            velocityA.vy !== 0 &&
            this._checkEntityTileCollision(entityIdA, positionA, colliderA, activeScene)
          ) {
            if (velocityA.vy > 0) {
              // Moving Down (landing)
              if (physicsBodyA.hasOwnProperty('isOnGround')) physicsBodyA.isOnGround = true
            }
            positionA.y = prevY // Simple revert for Y
            velocityA.vy = 0
          }
        }

        // B. Entity-to-Entity AABB Collision
        const aabbA = this._getAABB(positionA, colliderA)

        for (let j = i + 1; j < entities.length; j++) {
          const entityIdB = entities[j]
          const positionB = this.entityManager.getComponent(entityIdB, 'Position')
          const velocityB = this.entityManager.getComponent(entityIdB, 'Velocity')
          const physicsBodyB = this.entityManager.getComponent(entityIdB, 'PhysicsBody')
          const colliderB = this.entityManager.getComponent(entityIdB, 'Collider')

          if (!positionB || !colliderB || !physicsBodyB) continue

          const canACollideB = (colliderA.collisionLayer & colliderB.collisionMask) !== 0
          const canBCollideA = (colliderB.collisionLayer & colliderA.collisionMask) !== 0
          if (!(canACollideB && canBCollideA)) continue

          const aabbB = this._getAABB(positionB, colliderB)

          if (this._checkAABBOverlap(aabbA, aabbB)) {
            if (colliderA.isTrigger || colliderB.isTrigger) {
              if (this.engine.events)
                this.engine.events.emit('triggerEnter', { entityA: entityIdA, entityB: entityIdB })
            } else {
              // --- SOLID AABB COLLISION RESPONSE ---
              // console.log(`%c[PhysicsSystem] SOLID AABB Collision: ${entityIdA} vs ${entityIdB}`, "color: #FF8C00;");

              // Calculate penetration depths on X and Y (focus on 2D plane for now)
              const overlapX = Math.min(aabbA.maxX, aabbB.maxX) - Math.max(aabbA.minX, aabbB.minX)
              const overlapY = Math.min(aabbA.maxY, aabbB.maxY) - Math.max(aabbA.minY, aabbB.minY)

              // Determine minimum penetration axis
              if (overlapX < overlapY) {
                // Resolve X collision
                const penetration = overlapX
                const direction = Math.sign(aabbA.centerX - aabbB.centerX) // Direction to push A

                if (physicsBodyA.entityType === 'dynamic' && physicsBodyB.entityType === 'static') {
                  positionA.x += direction * (penetration + EPSILON)
                  velocityA.vx = 0
                } else if (
                  physicsBodyA.entityType === 'dynamic' &&
                  physicsBodyB.entityType === 'dynamic'
                ) {
                  positionA.x += direction * (penetration / 2 + EPSILON)
                  positionB.x -= direction * (penetration / 2 + EPSILON)
                  // Simple velocity response: dampening or reflect based on mass/restitution later
                  const vxa = velocityA.vx
                  const vxb = velocityB.vx // Store before zeroing for potential reflection
                  velocityA.vx = 0 // Simplistic stop
                  velocityB.vx = 0 // Simplistic stop
                }
                // Update aabbA if further checks needed in this iteration for entity A
                // aabbA = this._getAABB(positionA, colliderA);
              } else {
                // Resolve Y collision
                const penetration = overlapY
                const direction = Math.sign(aabbA.centerY - aabbB.centerY)

                if (physicsBodyA.entityType === 'dynamic' && physicsBodyB.entityType === 'static') {
                  positionA.y += direction * (penetration + EPSILON)
                  if (velocityA.vy > 0 && direction < 0) {
                    // A was moving down, hit static B from top
                    if (physicsBodyA.hasOwnProperty('isOnGround')) physicsBodyA.isOnGround = true
                  }
                  velocityA.vy = 0
                } else if (
                  physicsBodyA.entityType === 'dynamic' &&
                  physicsBodyB.entityType === 'dynamic'
                ) {
                  positionA.y += direction * (penetration / 2 + EPSILON)
                  positionB.y -= direction * (penetration / 2 + EPSILON)
                  const vya = velocityA.vy
                  const vyb = velocityB.vy
                  velocityA.vy = 0
                  velocityB.vy = 0
                  if (physicsBodyA.hasOwnProperty('isOnGround') && vya > 0 && direction < 0)
                    physicsBodyA.isOnGround = true
                  if (physicsBodyB.hasOwnProperty('isOnGround') && vyb > 0 && direction > 0)
                    physicsBodyB.isOnGround = true
                }
                // aabbA = this._getAABB(positionA, colliderA);
              }
            } // end solid AABB collision
          } // end overlap check
        } // end inner entity loop (B)
      } // end outer entity loop (A) for Collision Phase
    } // end collisionIterations loop
  } // End update method
}

export default PhysicsSystem
