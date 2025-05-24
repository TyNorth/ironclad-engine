# Class: EntityManager

The `EntityManager` is a foundational class within an Entity-Component-System (ECS) architecture. It's responsible for the full lifecycle and organization of **entities** and their associated **components**. This includes operations like creating and destroying entities, as well as adding, removing, querying, and retrieving components linked to those entities. An entity is typically a unique identifier (see `EntityId`), components hold data (see `ComponentData`), and component types are identified by name (see `ComponentTypeName`).

**Source:** [ecs/EntityManager.js, line 14](ecs_EntityManager.js.html#line14)

---

## Constructor

### `new EntityManager()`

Creates a new instance of the `EntityManager`. This initializes the internal structures required to store, track, and manage entities and their components effectively.

**Source:** [ecs/EntityManager.js, line 14](ecs_EntityManager.js.html#line14)

---

## Methods

### `addComponent(entityId, componentTypeName, data)`

Adds a component of a specific type with the given data to an entity. If the entity already possesses a component of the same type, the existing component's data will be overwritten with the new data.

**Parameters:**
| Name | Type | Description |
|---------------------|---------------------------------------------|-----------------------------------------------------------------------------|
| `entityId` | `EntityId` | The unique identifier of the entity to which the component will be added. |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the type of component (e.g., `"Position"`, `"Velocity"`). |
| `data` | `[ComponentData](global.html#ComponentData)` | The actual data or state for this component instance. |

**Returns:** `[ComponentData](global.html#ComponentData) | undefined`
The component data that was added, or `undefined` if the specified `entityId` does not correspond to an existing entity.

**Source:** [ecs/EntityManager.js, line 105](ecs_EntityManager.js.html#line105)

---

### `createEntity()`

Generates a new, unique entity and returns its identifier. This new entity initially has no components.

**Returns:** `EntityId`
The unique identifier (`EntityId`) for the newly created entity.

**Source:** [ecs/EntityManager.js, line 55](ecs_EntityManager.js.html#line55)

---

### `destroyEntity(entityId)`

Removes an entity and all components associated with it from the manager. After this operation, the entity ID is no longer considered alive.

**Parameters:**
| Name | Type | Description |
|------------|------------|-----------------------------------------------------|
| `entityId` | `EntityId` | The unique identifier of the entity to be destroyed. |

**Source:** [ecs/EntityManager.js, line 67](ecs_EntityManager.js.html#line67)

---

### `getAllComponents(entityId)`

Retrieves a collection of all components currently associated with a specific entity.

**Parameters:**
| Name | Type | Description |
|------------|------------|------------------------------------------------------|
| `entityId` | `EntityId` | The unique identifier of the entity to query. |

**Returns:** `Map<ComponentTypeName, [ComponentData](global.html#ComponentData)> | undefined`
A `Map` where keys are `ComponentTypeName` strings and values are the corresponding `ComponentData` objects for the entity. Returns `undefined` if the entity is not found.

**Source:** [ecs/EntityManager.js, line 192](ecs_EntityManager.js.html#line192)

---

### `getComponent(entityId, componentTypeName)`

Retrieves a specific component instance from an entity, identified by its type name.

**Parameters:**
| Name | Type | Description |
|---------------------|---------------------|-------------------------------------------------------------------------------|
| `entityId` | `EntityId` | The unique identifier of the entity. |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the type of component to retrieve. |

**Returns:** `[ComponentData](global.html#ComponentData) | undefined`
The data for the specified component if found on the entity; otherwise, `undefined`.

**Source:** [ecs/EntityManager.js, line 171](ecs_EntityManager.js.html#line171)

---

### `getEntitiesWithComponents(componentTypeNames)`

Finds and returns the IDs of all entities that possess _all_ of the component types specified in the input array. This is useful for systems that operate on entities with a specific set of capabilities.

**Parameters:**
| Name | Type | Description |
|------------------------|-----------------------------|-------------------------------------------------------------------------------|
| `componentTypeNames` | `Array<ComponentTypeName>` | An array of string names, each identifying a required component type. |

**Returns:** `Array<EntityId>`
An array containing the `EntityId`s of all entities that match the criteria. If no component types are specified in the input array or if no entities possess all the listed components, an empty array is returned.

**Source:** [ecs/EntityManager.js, line 202](ecs_EntityManager.js.html#line202)

---

### `hasComponent(entityId, componentTypeName)`

Checks whether a given entity currently has a component of a specific type.

**Parameters:**
| Name | Type | Description |
|---------------------|---------------------|------------------------------------------------------------------------------|
| `entityId` | `EntityId` | The unique identifier of the entity. |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the type of component to check for. |

**Returns:** `boolean`
`true` if the entity possesses the specified component type, `false` otherwise (including if the entity itself does not exist).

**Source:** [ecs/EntityManager.js, line 182](ecs_EntityManager.js.html#line182)

---

### `isEntityAlive(entityId)`

Determines if an entity with the given ID currently exists and is managed (i.e., has not been destroyed).

**Parameters:**
| Name | Type | Description |
|------------|------------|------------------------------------------------------------------|
| `entityId` | `EntityId` | The unique identifier of the entity whose existence is to be checked. |

**Returns:** `boolean`
`true` if an entity with the specified `entityId` exists within the manager, `false` otherwise.

**Source:** [ecs/EntityManager.js, line 94](ecs_EntityManager.js.html#line94)

---

### `removeComponent(entityId, componentTypeName)`

Removes a specific component type from an entity.

**Parameters:**
| Name | Type | Description |
|---------------------|---------------------|--------------------------------------------------------------------------------|
| `entityId` | `EntityId` | The unique identifier of the entity from which the component will be removed. |
| `componentTypeName` | `ComponentTypeName` | The string name identifying the type of component to remove. |

**Returns:** `boolean`
`true` if the component was successfully found and removed. `false` if the entity doesn't exist or if the entity did not possess a component of the specified type.

**Source:** [ecs/EntityManager.js, line 140](ecs_EntityManager.js.html#line140)
