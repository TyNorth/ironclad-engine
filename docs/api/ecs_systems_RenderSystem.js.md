# Class: RenderSystem

**Source:** [ecs/systems/RenderSystem.js, line 6](ecs_systems_RenderSystem.js.html#line6)

The `RenderSystem` is responsible for drawing entities that have a visual representation, specifically those possessing `Position` and `RenderableSprite` components. Unlike some systems that perform their main logic during the engine's `update` loop, this system's core drawing operations occur when its `executeRenderPass` method is explicitly called, typically by the active game scene during its own render phase.

---

## Extends

- [`System`](System.html)

---

## Constructor

### `new RenderSystem()`

Creates an instance of the RenderSystem.

**Source:** [ecs/systems/RenderSystem.js, line 6](ecs_systems_RenderSystem.js.html#line6)

---

## Members

### `engine`

A reference to the main `IroncladEngine` instance. This is typically set when the system is registered with the engine.

- **Inherited From:** [`System#engine`](System.html#engine)
- **Source:** [ecs/System.js, line 38](ecs_System.js.html#line38)

### `requiredComponents`

Specifies that this system is interested in entities that have both a `"Position"` and a `"RenderableSprite"` component. The engine uses this array to provide the system with relevant entities during its `update` method.

- **Overrides:** [`System#requiredComponents`](System.html#requiredComponents)
- **Source:** [ecs/systems/RenderSystem.js, line 18](ecs_systems_RenderSystem.js.html#line18)
- **Value:** `['Position', 'RenderableSprite']` (inferred from description)

---

## Methods

### `executeRenderPass(context, camera)`

Executes the rendering pass for all entities that meet the system's component requirements (i.e., have `Position` and `RenderableSprite`). This method iterates through the relevant entities and draws their sprites to the provided canvas context, taking into account camera transformations. It is designed to be called by the active scene's `render` method at the appropriate stage in the rendering pipeline.

**Parameters:**

| Name      | Type                       | Description                                                                  |
| :-------- | :------------------------- | :--------------------------------------------------------------------------- |
| `context` | `CanvasRenderingContext2D` | The 2D drawing context of the canvas onto which entities should be rendered. |
| `camera`  | `Camera`                   | The game camera instance, used to apply viewport and world transformations.  |

**Source:** [ecs/systems/RenderSystem.js, line 68](ecs_systems_RenderSystem.js.html#line68)

### `initialize(engine)`

Initializes the `RenderSystem`. This method is called when the system is registered with the `IroncladEngine`. It can be used to obtain references to engine services or perform one-time setup.

**Parameters:**

| Name     | Type             | Description                      |
| :------- | :--------------- | :------------------------------- |
| `engine` | `IroncladEngine` | The instance of the game engine. |

- **Overrides:** [`System#initialize`](System.html#initialize)
- **Source:** [ecs/systems/RenderSystem.js, line 35](ecs_systems_RenderSystem.js.html#line35)

### `shutdown()`

Called when the system is unregistered from the `IroncladEngine` or when the engine is shutting down. This method is useful for any cleanup tasks the system might need to perform, such as releasing resources.

- **Inherited From:** [`System#shutdown`](System.html#shutdown)
- **Source:** [ecs/System.js, line 72](ecs_System.js.html#line72)

### `update(deltaTime, entities, engine)`

The per-frame update logic for the `RenderSystem`, called by the `IroncladEngine`'s main system loop. For this particular `RenderSystem`, the primary drawing logic is encapsulated within the `executeRenderPass` method, which is called by the scene. Therefore, this `update` method might be used for tasks like:

- Preparing data for rendering (e.g., culling entities outside the viewport).
- Updating sprite animations if animation logic is part of this system and not handled by a separate `AnimationSystem`.
- Other pre-rendering calculations.

Currently, its role might be minimal if all drawing is deferred to `executeRenderPass`.

**Parameters:**

| Name        | Type              | Description                                                                                       |
| :---------- | :---------------- | :------------------------------------------------------------------------------------------------ |
| `deltaTime` | `number`          | The time elapsed, in seconds, since the last frame.                                               |
| `entities`  | `Array<EntityId>` | An array of entity IDs that possess the `requiredComponents` (`Position` and `RenderableSprite`). |
| `engine`    | `IroncladEngine`  | The instance of the game engine, providing access to other managers and services.                 |

- **Overrides:** [`System#update`](System.html#update)
- **Source:** [ecs/systems/RenderSystem.js, line 55](ecs_systems_RenderSystem.js.html#line55)
