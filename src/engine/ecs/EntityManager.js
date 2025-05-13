// src/engine/ecs/EntityManager.js

/**
 * @file EntityManager.js
 * @description Manages entities and their components in an Entity-Component-System architecture.
 */

/**
 * @typedef {number} EntityId - A unique identifier for an entity.
 * @typedef {string} ComponentTypeName - The string identifier for a component type (e.g., "Position", "Health").
 * @typedef {object} ComponentData - A plain JavaScript object representing the data for a component.
 */

/**
 * @class EntityManager
 * @description Handles creation, deletion, and querying of entities and their components.
 */
class EntityManager {
  constructor() {
    /**
     * @private
     * @type {number} The next available ID for a new entity.
     */
    this.nextEntityId = 0

    /**
     * @private
     * @type {Set<EntityId>} Stores all currently active entity IDs.
     */
    this.entities = new Set()

    /**
     * @private
     * @type {Map<EntityId, Map<ComponentTypeName, ComponentData>>}
     * @description Stores components for each entity.
     * Outer Map: entityId -> Inner Map: componentTypeName -> componentInstance
     */
    this.componentsByEntity = new Map()

    /**
     * @private
     * @type {Map<ComponentTypeName, Set<EntityId>>}
     * @description Stores entities grouped by their component types for efficient querying.
     * Outer Map: componentTypeName -> Inner Set: Set of entityIds
     */
    this.entitiesByComponentType = new Map()

    console.log('EntityManager: Initialized.')
  }

  /**
   * Creates a new entity and returns its ID.
   * @returns {EntityId} The ID of the newly created entity.
   */
  createEntity() {
    const entityId = this.nextEntityId++
    this.entities.add(entityId)
    this.componentsByEntity.set(entityId, new Map())
    // console.log(`EntityManager: Entity ${entityId} created.`);
    return entityId
  }

  /**
   * Destroys an entity and removes all its associated components.
   * @param {EntityId} entityId - The ID of the entity to destroy.
   */
  destroyEntity(entityId) {
    if (!this.entities.has(entityId)) {
      // console.warn(`EntityManager: Entity ${entityId} not found or already destroyed.`);
      return
    }

    // Remove entity from component-based lookups
    const entityComponents = this.componentsByEntity.get(entityId)
    if (entityComponents) {
      entityComponents.forEach((component, componentTypeName) => {
        const entitiesWithThisComponent = this.entitiesByComponentType.get(componentTypeName)
        if (entitiesWithThisComponent) {
          entitiesWithThisComponent.delete(entityId)
        }
      })
    }

    this.componentsByEntity.delete(entityId)
    this.entities.delete(entityId)
    // console.log(`EntityManager: Entity ${entityId} destroyed.`);
  }

  /**
   * Checks if an entity is still alive (exists).
   * @param {EntityId} entityId - The ID of the entity to check.
   * @returns {boolean} True if the entity exists, false otherwise.
   */
  isEntityAlive(entityId) {
    return this.entities.has(entityId)
  }

  /**
   * Adds a component to an entity. If a component of the same type already exists, it's overwritten.
   * @param {EntityId} entityId - The ID of the entity.
   * @param {ComponentTypeName} componentTypeName - The string type/name of the component (e.g., "Position").
   * @param {ComponentData} data - The data for the component.
   * @returns {ComponentData | undefined} The added component data, or undefined if the entity doesn't exist.
   */
  addComponent(entityId, componentTypeName, data) {
    if (!this.entities.has(entityId)) {
      console.warn(
        `EntityManager.addComponent: Entity ${entityId} not found. Cannot add component "${componentTypeName}".`,
      )
      return undefined
    }
    if (typeof componentTypeName !== 'string' || !componentTypeName) {
      console.error(`EntityManager.addComponent: componentTypeName must be a non-empty string.`)
      return undefined
    }
    if (typeof data !== 'object' || data === null) {
      console.error(
        `EntityManager.addComponent: Component data for "${componentTypeName}" must be an object.`,
      )
      return undefined
    }

    this.componentsByEntity.get(entityId).set(componentTypeName, data)

    if (!this.entitiesByComponentType.has(componentTypeName)) {
      this.entitiesByComponentType.set(componentTypeName, new Set())
    }
    this.entitiesByComponentType.get(componentTypeName).add(entityId)

    // console.log(`EntityManager: Component "${componentTypeName}" added to entity ${entityId}.`, data);
    return data
  }

  /**
   * Removes a component from an entity.
   * @param {EntityId} entityId - The ID of the entity.
   * @param {ComponentTypeName} componentTypeName - The type/name of the component to remove.
   * @returns {boolean} True if the component was removed, false otherwise (e.g., entity or component not found).
   */
  removeComponent(entityId, componentTypeName) {
    if (!this.entities.has(entityId)) {
      // console.warn(`EntityManager.removeComponent: Entity ${entityId} not found.`);
      return false
    }
    const entityComponents = this.componentsByEntity.get(entityId)
    if (!entityComponents || !entityComponents.has(componentTypeName)) {
      // console.warn(`EntityManager.removeComponent: Component "${componentTypeName}" not found on entity ${entityId}.`);
      return false
    }

    entityComponents.delete(componentTypeName)

    const entitiesWithThisComponent = this.entitiesByComponentType.get(componentTypeName)
    if (entitiesWithThisComponent) {
      entitiesWithThisComponent.delete(entityId)
      if (entitiesWithThisComponent.size === 0) {
        // Optional: clean up empty sets from entitiesByComponentType
        // this.entitiesByComponentType.delete(componentTypeName);
      }
    }
    // console.log(`EntityManager: Component "${componentTypeName}" removed from entity ${entityId}.`);
    return true
  }

  /**
   * Retrieves a component from an entity.
   * @param {EntityId} entityId - The ID of the entity.
   * @param {ComponentTypeName} componentTypeName - The type/name of the component to retrieve.
   * @returns {ComponentData | undefined} The component data, or undefined if not found.
   */
  getComponent(entityId, componentTypeName) {
    const entityComponents = this.componentsByEntity.get(entityId)
    return entityComponents ? entityComponents.get(componentTypeName) : undefined
  }

  /**
   * Checks if an entity has a specific component.
   * @param {EntityId} entityId - The ID of the entity.
   * @param {ComponentTypeName} componentTypeName - The type/name of the component to check for.
   * @returns {boolean} True if the entity has the component, false otherwise.
   */
  hasComponent(entityId, componentTypeName) {
    const entityComponents = this.componentsByEntity.get(entityId)
    return entityComponents ? entityComponents.has(componentTypeName) : false
  }

  /**
   * Retrieves all components for a given entity.
   * @param {EntityId} entityId - The ID of the entity.
   * @returns {Map<ComponentTypeName, ComponentData> | undefined} A map of component type names to component data, or undefined if entity not found.
   */
  getAllComponents(entityId) {
    return this.componentsByEntity.get(entityId)
  }

  /**
   * Retrieves all entity IDs that possess all of the specified component types.
   * @param {ComponentTypeName[]} componentTypeNames - An array of component type names.
   * @returns {EntityId[]} An array of entity IDs that have all the specified components.
   * Returns an empty array if no component types are specified or no entities match.
   */
  getEntitiesWithComponents(componentTypeNames) {
    if (!Array.isArray(componentTypeNames) || componentTypeNames.length === 0) {
      return []
    }

    // Find the smallest set of entities for the first component type to iterate over
    let smallestSet = null
    let smallestSetSize = Infinity

    for (const typeName of componentTypeNames) {
      const entitiesForType = this.entitiesByComponentType.get(typeName)
      if (!entitiesForType) {
        return [] // If any component type has no entities, then no entity can have all of them.
      }
      if (entitiesForType.size < smallestSetSize) {
        smallestSet = entitiesForType
        smallestSetSize = entitiesForType.size
      }
    }

    if (!smallestSet) {
      // Should only happen if componentTypeNames was empty, already handled.
      return []
    }

    const resultEntities = []
    smallestSet.forEach((entityId) => {
      // Ensure the entity still exists and has ALL other required components
      if (this.entities.has(entityId)) {
        let hasAll = true
        for (const typeName of componentTypeNames) {
          if (!this.hasComponent(entityId, typeName)) {
            hasAll = false
            break
          }
        }
        if (hasAll) {
          resultEntities.push(entityId)
        }
      }
    })
    return resultEntities
  }
}

export default EntityManager
