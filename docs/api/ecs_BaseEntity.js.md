# Class: BaseEntity

**Source:** [ecs/BaseEntity.js, line 22](ecs_BaseEntity.js.html#line22)

The `BaseEntity` class serves as a convenient **object-oriented wrapper** around an entity ID within the Ironclad Engine's Entity-Component-System (ECS). It provides an intuitive interface for interacting with a specific entity, allowing you to easily add, remove, retrieve components, and manage its lifecycle without directly calling the `EntityManager` for every operation. 🧐

It acts as a **handle** or **proxy** to an entity managed by the `EntityManager`.

---

## Constructor

### `new BaseEntity(options)`

Creates a `BaseEntity` instance. This involves either creating a _new_ entity ID through the `EntityManager` or wrapping an _existing_ entity ID. It requires access to the engine's `EntityManager` and `EventManager`, which it typically retrieves from the `IroncladEngine` singleton instance.

**Parameters:**

| Name         | Type     | Attributes | Description                                                                   |
| :----------- | :------- | :--------- | :---------------------------------------------------------------------------- |
| `options`    | `object` |            | An object containing configuration options.                                   |
| `options.id` | `number` | optional   | An _existing_ entity ID to wrap. If not provided, a new entity ID is created. |

**Source:** [ecs/BaseEntity.js, line 22](ecs_BaseEntity.js.html#line22)

---

## Members

### `id`

**Type:** `number`

The unique identifier (`EntityId`) for this entity within the `EntityManager`.

**Source:** [ecs/BaseEntity.js, line 9](ecs_BaseEntity.js.html#line9)

### `entityManager`

**Type:** `EntityManager | null`

A reference to the engine's `EntityManager`, used for all component and entity operations.

**Source:** [ecs/BaseEntity.js, line 11](ecs_BaseEntity.js.html#line11)

### `engine`

**Type:** `IroncladEngine | null`

A reference to the main `IroncladEngine` instance, providing access to other engine services like the `EventManager`.

**Source:** [ecs/BaseEntity.js, line 13](ecs_BaseEntity.js.html#line13)

---

## Methods

### `addComponent(componentTypeName, data)`

Adds a component to this entity via the `EntityManager`. If a component of the same type already exists, it will be overwritten.

**Parameters:**

| Name                | Type                | Description                                                             |
| :------------------ | :------------------ | :---------------------------------------------------------------------- |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the type of component (e.g., `"Position"`). |
| `data`              | `ComponentData`     | The data/state object for this component instance.                      |

**Returns:** `this` - Returns the `BaseEntity` instance, allowing for method chaining.

**Source:** [ecs/BaseEntity.js, line 44](ecs_BaseEntity.js.html#line44)

### `destroy()`

Requests the `EntityManager` to destroy this entity and remove all its associated components. After calling this, the `BaseEntity` instance should no longer be used. 💥

**Source:** [ecs/BaseEntity.js, line 86](ecs_BaseEntity.js.html#line86)

### `emitEvent(eventName, eventData = {})`

Emits an event using the engine's `EventManager`. This allows entities to communicate with systems or other parts of the game in a decoupled way.

**Parameters:**

| Name        | Type     | Attributes | Default | Description                            |
| :---------- | :------- | :--------- | :------ | :------------------------------------- |
| `eventName` | `string` |            |         | The unique name identifying the event. |
| `eventData` | `object` | optional   | `{}`    | Optional data payload for the event.   |

**Source:** [ecs/BaseEntity.js, line 99](ecs_BaseEntity.js.html#line99)

### `getAllComponents()`

Retrieves all components currently associated with this entity from the `EntityManager`.

**Returns:** `Map<ComponentTypeName, ComponentData> | undefined`
A `Map` containing all components, or `undefined` if the entity doesn't exist.

**Source:** [ecs/BaseEntity.js, line 79](ecs_BaseEntity.js.html#line79)

### `getComponent(componentTypeName)`

Retrieves a specific component's data from this entity via the `EntityManager`.

**Parameters:**

| Name                | Type                | Description                                            |
| :------------------ | :------------------ | :----------------------------------------------------- |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the component type to get. |

**Returns:** `ComponentData | undefined`
The component's data object if found; otherwise, `undefined`.

**Source:** [ecs/BaseEntity.js, line 53](ecs_BaseEntity.js.html#line53)

### `hasComponent(componentTypeName)`

Checks if this entity currently possesses a component of the specified type.

**Parameters:**

| Name                | Type                | Description                                                  |
| :------------------ | :------------------ | :----------------------------------------------------------- |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the component type to check for. |

**Returns:** `boolean`
`true` if the entity has the component, `false` otherwise.

**Source:** [ecs/BaseEntity.js, line 62](ecs_BaseEntity.js.html#line62)

### `removeComponent(componentTypeName)`

Removes a specific component type from this entity via the `EntityManager`.

**Parameters:**

| Name                | Type                | Description                                               |
| :------------------ | :------------------ | :-------------------------------------------------------- |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the component type to remove. |

**Returns:** `boolean`
`true` if the component was successfully removed, `false` otherwise (e.g., if the component didn't exist).

**Source:** [ecs/BaseEntity.js, line 71](ecs_BaseEntity.js.html#line71)
