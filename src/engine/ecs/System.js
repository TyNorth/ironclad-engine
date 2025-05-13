// src/engine/ecs/System.js

/**
 * @file System.js
 * @description Base class for all systems in the Entity-Component-System architecture.
 */

/**
 * @class System
 * @description Game-specific systems should extend this class.
 * They typically define a static `requiredComponents` array specifying which
 * components an entity must have for the system to process it, and an `update` method
 * containing the system's logic.
 *
 * @property {import('../core/IroncladEngine.js').default | null} engine - A reference to the main engine instance.
 * This is typically set by the IroncladEngine when the system is registered.
 */
class System {
  /**
   * An array of component type names (strings) that an entity must possess
   * for this system to be interested in processing it.
   * Derived systems should override this static property.
   * Example: `static requiredComponents = ["Position", "Velocity"];`
   * @type {Array<import('./EntityManager.js').ComponentTypeName>}
   * @static
   */
  static requiredComponents = []

  /**
   * Creates an instance of a System.
   * The engine instance can be injected later via the `initialize` method
   * or directly if the system is created by game code that has an engine reference.
   */
  constructor() {
    /**
     * @type {import('../core/IroncladEngine.js').default | null}
     */
    this.engine = null
    // console.log(`${this.constructor.name} system constructor called.`);
  }

  /**
   * Called when the system is registered with the IroncladEngine.
   * This is a good place for one-time setup or to store the engine reference.
   * @param {import('../core/IroncladEngine.js').default} engine - The IroncladEngine instance.
   */
  initialize(engine) {
    this.engine = engine
    // console.log(`System "${this.constructor.name}": Initialized.`);
  }

  /**
   * The main update method for the system, called every frame by the IroncladEngine.
   * Derived systems MUST override this method with their specific logic.
   *
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   * @param {Array<import('./EntityManager.js').EntityId>} entities - An array of entity IDs that match
   * this system's `requiredComponents`. The engine pre-filters these.
   * @param {import('../core/IroncladEngine.js').default} engine - The IroncladEngine instance, providing access
   * to services like EntityManager, InputManager, EventManager, etc.
   * (This is passed for convenience, same as `this.engine` if `initialize` was called).
   */
  update(deltaTime, entities, engine) {
    // Default implementation does nothing. Derived systems should override this.
    // console.warn(`System "${this.constructor.name}" must implement the update() method.`);
  }

  /**
   * Called when the system is unregistered from the IroncladEngine or when the engine is shutting down.
   * Useful for any cleanup tasks the system might need to perform.
   */
  shutdown() {
    // console.log(`System "${this.constructor.name}": Shutdown.`);
  }
}

export default System
