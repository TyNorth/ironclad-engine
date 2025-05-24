# Global Scope 🌍

This section outlines globally accessible constants and type definitions used throughout the Ironclad Engine. These provide foundational values for physics, input handling, and core ECS (Entity-Component-System) structures.

---

## Members (Constants)

These constants are primarily used by the physics system but can be accessed globally.

### `EPSILON`

**Type:** `number`

A small numerical value used to prevent division-by-zero errors or to handle floating-point inaccuracies in calculations.

- **Source:** [physics/PhysicsConstants.js, line 33](physics_PhysicsConstants.js.html#line33)

---

### `GRAVITY_X`

**Type:** `number`

Defines the gravitational acceleration along the X-axis. For most 2D or 2.5D games, this is typically set to `0`.

- **Source:** [physics/PhysicsConstants.js, line 19](physics_PhysicsConstants.js.html#line19)

---

### `GRAVITY_Y`

**Type:** `number`

Defines the gravitational acceleration along the Y-axis, measured in pixels per second squared. A positive value conventionally signifies downward acceleration.

- **Source:** [physics/PhysicsConstants.js, line 13](physics_PhysicsConstants.js.html#line13)

---

### `GRAVITY_Z`

**Type:** `number`

Defines the gravitational acceleration along the Z-axis. This is usually `0` if the Z-axis represents depth rather than vertical height. If Z were the primary vertical axis for movement (like jumps), this would be non-zero. For the common convention where X is horizontal, Y is screen vertical (for jumps/falls), and Z is depth, Z-axis gravity is `0`.

- **Source:** [physics/PhysicsConstants.js, line 27](physics_PhysicsConstants.js.html#line27)

---

## Type Definitions

These are custom data structures used by various engine systems.

### `ColliderComponent`

**Type:** `object`

Defines the properties for a collider component, primarily for AABB (Axis-Aligned Bounding Box) shapes used in physics and collision detection.

**Properties:**

| Name                | Type      | Attributes | Default | Description                                                                      |
| :------------------ | :-------- | :--------- | :------ | :------------------------------------------------------------------------------- |
| `shape`             | `'aabb'`  |            |         | The shape of the collider, currently supporting 'aabb'.                          |
| `width`             | `number`  |            |         | Width of the AABB (along the X-axis).                                            |
| `height`            | `number`  |            |         | Height of the AABB (along the Y-axis).                                           |
| `depth`             | `number`  | optional   | `1`     | Depth of the AABB (along the Z-axis, can be minimal for 2D plane collision).     |
| `offsetX`           | `number`  | optional   | `0`     | Offset of the collider's center from the entity's X position.                    |
| `offsetY`           | `number`  | optional   | `0`     | Offset of the collider's center from the entity's Y position.                    |
| `offsetZ`           | `number`  | optional   | `0`     | Offset of the collider's center from the entity's Z position.                    |
| `isTrigger`         | `boolean` | optional   | `false` | If `true`, this collider detects overlaps but doesn't cause physical responses.  |
| `collisionLayer`    | `number`  | optional   | `1`     | A bitmask representing the layer(s) this collider belongs to.                    |
| `collisionMask`     | `number`  | optional   | `1`     | A bitmask representing the layer(s) this collider can interact with.             |
| `collidesWithTiles` | `boolean` | optional   | `true`  | Whether this collider should check for collisions with tilemap collision layers. |

- **Source:** [physics/PhysicsSystem.js, line 33](physics_PhysicsSystem.js.html#line33)

---

### `ComponentData`

**Type:** `number`

A unique identifier for an entity.

_Engine Clarification:_ While named `ComponentData` in this global typedef, the description and type (`number`) strongly suggest this refers to what is commonly known as an `EntityId`. Actual component data structures are typically objects with various properties.

- **Source:** [ecs/EntityManager.js, line 8](ecs_EntityManager.js.html#line8)

---

### `ComponentDefinition`

**Type:** `object`

Used by the `PrefabManager` to define a component and its initial data when creating entities from prefabs.

**Properties:**

| Name   | Type     | Description                                  |
| :----- | :------- | :------------------------------------------- |
| `type` | `string` | _(Inferred)_ The type/name of the component. |
| `data` | `object` | The initial data for the component.          |

- **Source:** [ecs/PrefabManager.js, line 8](ecs_PrefabManager.js.html#line8)

---

### `GamepadAxisBinding`

**Type:** `object`

Defines a binding for a gamepad axis input to an action.

**Properties:**

| Name        | Type            | Attributes | Default | Description                                                                    |
| :---------- | :-------------- | :--------- | :------ | :----------------------------------------------------------------------------- |
| `type`      | `'gamepadAxis'` |            |         | Identifies this as a gamepad axis binding.                                     |
| `axisIndex` | `number`        |            |         | The index of the gamepad axis (e.g., 0 for left stick X, 1 for left stick Y).  |
| `direction` | `number`        |            |         | The direction to check for: `1` for positive values, `-1` for negative values. |
| `threshold` | `number`        | optional   | `0.5`   | The absolute value the axis must exceed to be considered active.               |
| `padIndex`  | `number`        | optional   | `0`     | The index of the gamepad (controller) if multiple are connected.               |

- **Source:** [core/InputManager.js, line 31](core_InputManager.js.html#line31)

---

### `GamepadButtonBinding`

**Type:** `object`

Defines a binding for a gamepad button input to an action.

**Properties:**

| Name          | Type              | Attributes | Default | Description                                                            |
| :------------ | :---------------- | :--------- | :------ | :--------------------------------------------------------------------- |
| `type`        | `'gamepadButton'` |            |         | Identifies this as a gamepad button binding.                           |
| `buttonIndex` | `number`          |            |         | The index of the gamepad button (e.g., 0 for A/Cross, 1 for B/Circle). |
| `padIndex`    | `number`          | optional   | `0`     | The index of the gamepad (controller) if multiple are connected.       |

- **Source:** [core/InputManager.js, line 24](core_InputManager.js.html#line24)

---

### `InputBinding`

**Type:** [`KeyBinding`](#KeyBinding) | [`MouseBinding`](#MouseBinding) | [`GamepadButtonBinding`](#GamepadButtonBinding) | [`GamepadAxisBinding`](#GamepadAxisBinding)

A union type representing any of the possible input binding configurations used by the `InputManager` to map physical inputs to game actions.

- **Source:** [core/InputManager.js, line 40](core_InputManager.js.html#line40)

---

### `KeyBinding`

**Type:** `object`

Defines a binding for a keyboard key input to an action.

**Properties:**

| Name   | Type     | Description                                                                           |
| :----- | :------- | :------------------------------------------------------------------------------------ |
| `type` | `'key'`  | Identifies this as a keyboard key binding.                                            |
| `code` | `string` | The `event.code` value for the keyboard key (e.g., `"KeyW"`, `"Space"`, `"ArrowUp"`). |

- **Source:** [core/InputManager.js, line 12](core_InputManager.js.html#line12)

---

### `MouseBinding`

**Type:** `object`

Defines a binding for a mouse button input to an action.

**Properties:**

| Name     | Type      | Description                                                                                                                              |
| :------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `type`   | `'mouse'` | Identifies this as a mouse button binding.                                                                                               |
| `button` | `number`  | The mouse button code (e.g., `0` for left, `1` for middle, `2` for right). Refer to `InputManager.MOUSE_BUTTON_LEFT` etc. for constants. |

- **Source:** [core/InputManager.js, line 18](core_InputManager.js.html#line18)

---

### `PhysicsBodyComponent`

**Type:** `object`

Defines the properties for a physics body, determining how an entity interacts with the physics simulation.

**Properties:**

| Name           | Type                    | Attributes | Default | Description                                                                           |
| :------------- | :---------------------- | :--------- | :------ | :------------------------------------------------------------------------------------ |
| `entityType`   | `'dynamic'`\|`'static'` |            |         | `'dynamic'` entities are affected by forces and collisions; `'static'` are immovable. |
| `useGravity`   | `boolean`               | optional   | `false` | If `true`, the entity is affected by global gravity.                                  |
| `gravityScale` | `number`                | optional   | `1.0`   | Multiplier for the global gravity's effect on this specific entity.                   |
| `isOnGround`   | `boolean`               | optional   | `true`  | Indicates if the entity is currently resting on a surface.                            |

- **Source:** [physics/PhysicsSystem.js, line 25](physics_PhysicsSystem.js.html#line25)

---

### `PositionComponent`

**Type:** `object`

Represents an entity's position in the game world, typically using 2D or 3D coordinates.

**Properties:**

| Name | Type     | Attributes | Default | Description                                                      |
| :--- | :------- | :--------- | :------ | :--------------------------------------------------------------- |
| `x`  | `number` |            |         | The entity's world x-coordinate.                                 |
| `y`  | `number` |            |         | The entity's world y-coordinate.                                 |
| `z`  | `number` | optional   | `0`     | The entity's world z-coordinate (used for layering or 3D depth). |

- **Source:** [physics/PhysicsSystem.js, line 13](physics_PhysicsSystem.js.html#line13)

---

### `PrefabDefinition`

**Type:** `object`

Defines the structure of a "prefab" (prefabricated entity template), used by the `PrefabManager` to instantiate complex entities with a predefined set of components and initial data.

**Properties:**

| Name          | Type                         | Attributes | Description                                                 |
| :------------ | :--------------------------- | :--------- | :---------------------------------------------------------- |
| `description` | `string`                     | optional   | An optional human-readable description of the prefab.       |
| `components`  | `Array<ComponentDefinition>` |            | An array of component definitions that make up this prefab. |

- **Source:** [ecs/PrefabManager.js, line 14](ecs_PrefabManager.js.html#line14)

---

### `ProcessedTileset`

**Type:** `object`

Represents a tileset after it has been processed and its image asset loaded, ready for use by the `TileLayerRenderer`.

**Properties:**

| Name          | Type               | Description                                                  |
| :------------ | :----------------- | :----------------------------------------------------------- |
| `firstgid`    | `number`           | The first global tile ID in this tileset.                    |
| `image`       | `HTMLImageElement` | The loaded image element for the tileset.                    |
| `name`        | `string`           | The name of the tileset.                                     |
| `tileWidth`   | `number`           | The width of a single tile in pixels.                        |
| `tileHeight`  | `number`           | The height of a single tile in pixels.                       |
| `columns`     | `number`           | The number of tile columns in the tileset image.             |
| `imageWidth`  | `number`           | The total width of the tileset image in pixels.              |
| `imageHeight` | `number`           | The total height of the tileset image in pixels.             |
| `spacing`     | `number`           | The spacing (in pixels) between adjacent tiles in the image. |
| `margin`      | `number`           | The margin (in pixels) around the tiles in the image.        |

- **Source:** [rendering/TileLayerRenderer.js, line 9](rendering_TileLayerRenderer.js.html#line9)

---

### `VelocityComponent`

**Type:** `object`

Represents an entity's velocity, indicating its speed and direction of movement along the X, Y, and optionally Z axes.

**Properties:**

| Name | Type     | Attributes | Default | Description                                                        |
| :--- | :------- | :--------- | :------ | :----------------------------------------------------------------- |
| `vx` | `number` |            |         | Velocity on the x-axis, typically in pixels per second.            |
| `vy` | `number` |            |         | Velocity on the y-axis, typically in pixels per second.            |
| `vz` | `number` | optional   | `0`     | Velocity on the z-axis (if used for 3D movement or depth changes). |

- **Source:** [physics/PhysicsSystem.js, line 19](physics_PhysicsSystem.js.html#line19)
