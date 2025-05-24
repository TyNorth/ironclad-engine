# Class: System (Base Class)

**Source:** [ecs/System.js, line 8](ecs_System.js.html#line8)

The `System` class serves as the **foundational base class** for all game-specific logic units within the Ironclad Engine's Entity-Component-System (ECS) architecture. Systems are responsible for iterating over entities that possess a specific set of components and applying updates or transformations to them.

Game-specific systems (e.g., `MovementSystem`, `CollisionSystem`, `RenderSystem`) **should extend this class**. They typically define a `static requiredComponents` array to specify which components an entity must have for the system to process it, and an `update` method containing the core logic that operates on these entities each frame.

---

## Constructor

### `new System()`

Creates an instance of a System. The actual game engine instance (`IroncladEngine`) is typically injected into the system via the `initialize` method when the system is registered with the engine, or can be passed if the system is instantiated directly by game code that already has an engine reference.

**Source:** [ecs/System.js, line 34](ecs_System.js.html#line34)

---

## Members

### `engine`

**Type:** `IroncladEngine | null`

A reference to the main `IroncladEngine` instance. This property is usually populated by the `initialize(engine)` method when the system is registered, providing the system with access to other engine managers and services.

**Source:** [ecs/System.js, line 38](ecs_System.js.html#line38)

---

## Static Members

### `static requiredComponents`

**Type:** `Array<string>`

An array of component type names (strings) that an entity **must possess** for this system to be interested in processing it. Derived systems should override this static property to define their component dependencies. The `IroncladEngine` will use this list to automatically provide the system's `update` method with only the relevant entities.

**Example in a derived system:**

```javascript
// In MyMovementSystem.js
import System from './System.js' // Adjust path as needed

class MyMovementSystem extends System {
  static requiredComponents = ['Position', 'Velocity']

  update(deltaTime, entities, engine) {
    for (const entityId of entities) {
      const position = engine.entityManager.getComponent(entityId, 'Position')
      const velocity = engine.entityManager.getComponent(entityId, 'Velocity')
      // ... apply movement logic ...
    }
  }
}
```
