// src/engine/ecs/PrefabManager.js

/**
 * @file PrefabManager.js
 * @description Manages entity prefab definitions and facilitates spawning entities from them.
 */

/**
 * @typedef {object} ComponentDefinition
 * @property {import('./EntityManager.js').ComponentTypeName} type - The type name of the component.
 * @property {object} data - The initial data for the component.
 */

/**
 * @typedef {object} PrefabDefinition
 * @property {string} [description] - An optional description of the prefab.
 * @property {Array<ComponentDefinition>} components - An array of component definitions.
 */

/**
 * @class PrefabManager
 * @description Loads, stores, and manages entity prefab definitions from JSON.
 * Provides functionality to spawn entities based on these prefabs.
 */
class PrefabManager {
  /**
   * Creates an instance of PrefabManager.
   * @param {import('./EntityManager.js').default} entityManager - Reference to the EntityManager.
   * @param {import('../core/AssetLoader.js').default} assetLoader - Reference to the AssetLoader.
   */
  constructor(entityManager, assetLoader) {
    if (!entityManager) {
      throw new Error('PrefabManager: EntityManager instance is required.')
    }
    if (!assetLoader) {
      throw new Error('PrefabManager: AssetLoader instance is required.')
    }
    /**
     * @private
     * @type {import('./EntityManager.js').default}
     */
    this.entityManager = entityManager
    /**
     * @private
     * @type {import('../core/AssetLoader.js').default}
     */
    this.assetLoader = assetLoader

    /**
     * @private
     * @type {Map<string, PrefabDefinition>}
     * @description Stores all loaded prefab definitions, keyed by prefab name.
     */
    this.prefabs = new Map()

    console.log('PrefabManager: Initialized.')
  }

  /**
   * Loads prefab definitions from a previously loaded JSON asset.
   * @param {string} assetKey - The key used in AssetLoader for the loaded JSON file containing prefab definitions.
   * @returns {boolean} True if prefabs were successfully parsed and added, false otherwise.
   */
  loadPrefabsFromAsset(assetKey) {
    const prefabData = this.assetLoader.get(assetKey)
    if (!prefabData || typeof prefabData !== 'object') {
      console.error(
        `PrefabManager: Prefab data asset "${assetKey}" not found or is not a valid object.`,
      )
      return false
    }

    let count = 0
    for (const prefabName in prefabData) {
      if (Object.hasOwnProperty.call(prefabData, prefabName)) {
        const definition = prefabData[prefabName]
        if (definition && Array.isArray(definition.components)) {
          this.prefabs.set(prefabName, definition)
          count++
        } else {
          console.warn(
            `PrefabManager: Invalid prefab definition for "${prefabName}" in asset "${assetKey}". Missing "components" array.`,
          )
        }
      }
    }
    console.log(`PrefabManager: Loaded ${count} prefabs from asset "${assetKey}".`)
    return count > 0
  }

  /**
   * Spawns an entity based on a prefab definition.
   * @param {string} prefabName - The name of the prefab to spawn.
   * @param {object} [overrideData={}] - An object containing data to override the prefab's defaults.
   * Keys are component type names, values are objects with properties to override.
   * Example: { "Position": { "x": 100, "y": 200 }, "Health": { "current": 50 } }
   * @returns {import('./EntityManager.js').EntityId | null} The ID of the spawned entity, or null if prefab not found or error.
   */
  spawnEntity(prefabName, overrideData = {}) {
    const prefab = this.prefabs.get(prefabName)
    if (!prefab) {
      console.error(`PrefabManager: Prefab "${prefabName}" not found.`)
      return null
    }

    const entityId = this.entityManager.createEntity()
    if (entityId === null || entityId === undefined) {
      // Check if entity creation failed (shouldn't with current EM)
      console.error(`PrefabManager: Failed to create entity for prefab "${prefabName}".`)
      return null
    }

    // console.log(`PrefabManager: Spawning entity ${entityId} from prefab "${prefabName}" with overrides:`, overrideData);

    prefab.components.forEach((compDef) => {
      // Deep clone the component data from the prefab to avoid shared references
      let finalComponentData = JSON.parse(JSON.stringify(compDef.data || {}))

      // Apply overrides if any exist for this component type
      if (overrideData[compDef.type]) {
        finalComponentData = { ...finalComponentData, ...overrideData[compDef.type] }
      }

      this.entityManager.addComponent(entityId, compDef.type, finalComponentData)
    })

    console.log(
      `PrefabManager: Entity ${entityId} spawned successfully from prefab "${prefabName}".`,
    )
    return entityId
  }

  /**
   * Gets a prefab definition.
   * @param {string} prefabName - The name of the prefab.
   * @returns {PrefabDefinition | undefined}
   */
  getPrefabDefinition(prefabName) {
    return this.prefabs.get(prefabName)
  }
}

export default PrefabManager
