// src/engine/ecs/BaseEntity.js (New File)

/**
 * @file BaseEntity.js
 * @description A base class for game entities that interact with the EntityManager.
 */
class BaseEntity {
  /** @type {number} Unique ID for this entity within the EntityManager. */
  id
  /** @type {import('./EntityManager.js').default} Reference to the EntityManager. */
  entityManager
  /** @type {import('../core/IroncladEngine.js').default | null} Optional reference to the engine. */
  engine

  /**
   * Creates a BaseEntity instance.
   * @param {object} options
   * @param {import('./EntityManager.js').default} options.entityManager - The EntityManager instance.
   * @param {import('../core/IroncladEngine.js').default} [options.engine] - Optional engine instance for global access.
   * @param {number} [options.id] - Optional existing entity ID to wrap. If not provided, a new one is created.
   */
  constructor(options = {}) {
    if (!options.entityManager) {
      throw new Error('BaseEntity: EntityManager instance is required in options.')
    }
    this.entityManager = options.entityManager
    this.engine = options.engine || null

    if (options.id !== undefined && this.entityManager.isEntityAlive(options.id)) {
      this.id = options.id
      // console.log(`BaseEntity: Wrapping existing entity ID ${this.id}`);
    } else {
      this.id = this.entityManager.createEntity()
      // console.log(`BaseEntity: Created new entity ID ${this.id}`);
    }
  }

  /**
   * Adds a component to this entity.
   * @param {import('./EntityManager.js').ComponentTypeName} componentTypeName
   * @param {import('./EntityManager.js').ComponentData} data
   * @returns {import('./EntityManager.js').ComponentData | undefined}
   */
  addComponent(componentTypeName, data) {
    return this.entityManager.addComponent(this.id, componentTypeName, data)
  }

  /**
   * Retrieves a component from this entity.
   * @param {import('./EntityManager.js').ComponentTypeName} componentTypeName
   * @returns {import('./EntityManager.js').ComponentData | undefined}
   */
  getComponent(componentTypeName) {
    return this.entityManager.getComponent(this.id, componentTypeName)
  }

  /**
   * Checks if this entity has a specific component.
   * @param {import('./EntityManager.js').ComponentTypeName} componentTypeName
   * @returns {boolean}
   */
  hasComponent(componentTypeName) {
    return this.entityManager.hasComponent(this.id, componentTypeName)
  }

  /**
   * Removes a component from this entity.
   * @param {import('./EntityManager.js').ComponentTypeName} componentTypeName
   * @returns {boolean}
   */
  removeComponent(componentTypeName) {
    return this.entityManager.removeComponent(this.id, componentTypeName)
  }

  /**
   * Retrieves all components for this entity.
   * @returns {Map<import('./EntityManager.js').ComponentTypeName, import('./EntityManager.js').ComponentData> | undefined}
   */
  getAllComponents() {
    return this.entityManager.getAllComponents(this.id)
  }

  /**
   * Destroys this entity and all its components from the EntityManager.
   */
  destroy() {
    if (this.entityManager.isEntityAlive(this.id)) {
      this.entityManager.destroyEntity(this.id)
    }
    // Further cleanup of this instance's references could go here if needed
    // e.g., this.entityManager = null; this.engine = null;
  }

  /**
   * Emits an event through the engine's EventManager, if available.
   * @param {string} eventName - The name of the event.
   * @param {object} [eventData={}] - Additional data for the event.
   */
  emitEvent(eventName, eventData = {}) {
    if (this.engine && this.engine.events && typeof this.engine.events.emit === 'function') {
      this.engine.events.emit(eventName, { entityId: this.id, ...eventData })
    } else {
      // console.warn(`BaseEntity (ID: ${this.id}): Cannot emit event "${eventName}", engine or EventManager not available/functional.`);
    }
  }
}

export default BaseEntity
