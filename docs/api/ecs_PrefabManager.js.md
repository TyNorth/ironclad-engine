# Class: PrefabManager

**Source:** [ecs/PrefabManager.js, line 20](ecs_PrefabManager.js.html#line20)

The `PrefabManager` is a crucial part of the Entity-Component-System (ECS) architecture within the Ironclad Engine. It's responsible for managing **prefabs**, which are essentially **pre-configured entity templates**. Think of them as blueprints for commonly used game objects (like "Player", "EnemyTypeA", "HealthPotion").

This manager handles:

- Loading prefab definitions, typically from JSON files.
- Storing these definitions for quick access.
- Instantiating (spawning) new entities in the game world based on these prefab templates, allowing for easy creation of complex entities with predefined components and initial data.

---

## Constructor

### `new PrefabManager(entityManager, assetLoader)`

Creates an instance of the `PrefabManager`. It requires references to the `EntityManager` (to create actual entities and add components) and the `AssetLoader` (to retrieve prefab definition files).

**Parameters:**

| Name            | Type            | Description                                                       |
| :-------------- | :-------------- | :---------------------------------------------------------------- |
| `entityManager` | `EntityManager` | An instance of the `EntityManager`.                               |
| `assetLoader`   | `AssetLoader`   | An instance of the `AssetLoader` to load prefab definition files. |

_Initial JSDoc also shows a constructor `new PrefabManager()` at line 20; however, for proper operation, `entityManager` and `assetLoader` are essential dependencies usually provided during construction as shown here._

**Source:** [ecs/PrefabManager.js, line 31](ecs_PrefabManager.js.html#line31)

---

## Methods

### `loadPrefabsFromAsset(assetKey)`

Loads and parses prefab definitions from a JSON asset that has been previously loaded by the `AssetLoader`. The JSON file should contain an object where keys are prefab names and values are [`PrefabDefinition`](global.html#PrefabDefinition) objects.

**Parameters:**

| Name       | Type     | Description                                                                                           |
| :--------- | :------- | :---------------------------------------------------------------------------------------------------- |
| `assetKey` | `string` | The key (name) used to register the JSON asset with the `AssetLoader` (e.g., `"prefabs_characters"`). |

**Returns:** `boolean` - `true` if the prefab definitions were successfully loaded and parsed from the asset; `false` otherwise (e.g., asset not found or invalid format).

**Example JSON Structure (for `assetKey`):**

```json
{
  "Player": {
    "description": "The main player character.",
    "components": [
      { "type": "Position", "data": { "x": 0, "y": 0, "z": 1 } },
      { "type": "Velocity", "data": { "vx": 0, "vy": 0 } },
      { "type": "RenderableSprite", "data": { "spriteName": "player_idle", "layer": 10 } },
      { "type": "Health", "data": { "max": 100, "current": 100 } }
    ]
  },
  "Coin": {
    "description": "A collectible coin.",
    "components": [
      { "type": "Position", "data": { "x": 0, "y": 0, "z": 0 } },
      { "type": "RenderableSprite", "data": { "spriteName": "coin_spin", "layer": 5 } },
      { "type": "Collectible", "data": { "value": 10 } }
    ]
  }
}
```
