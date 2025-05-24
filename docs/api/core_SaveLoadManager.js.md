# Class: SaveLoadManager

**Source:** [core/SaveLoadManager.js, line 15](core_SaveLoadManager.js.html#line15)

The `SaveLoadManager` is responsible for **persisting and retrieving game state**, allowing players to save their progress and resume later. It works by coordinating with various parts of the game through a **data provider** system. Different managers or systems (e.g., `SceneManager` for current scene, `EntityManager` for player state, `InventoryManager`) can register as data providers to contribute their specific data to a save file and to restore their state when a game is loaded.

It typically abstracts the underlying storage mechanism (like browser `localStorage` or `IndexedDB`) and manages save "slots."

---

## Constructor

### `new SaveLoadManager(engine)`

Creates a new `SaveLoadManager` instance.

**Parameters:**

| Name     | Type             | Description                                                                  |
| :------- | :--------------- | :--------------------------------------------------------------------------- |
| `engine` | `IroncladEngine` | A reference to the main game engine instance, used to access other services. |

**Source:** [core/SaveLoadManager.js, line 15](core_SaveLoadManager.js.html#line15)

---

## Methods

### `registerDataProvider(uniqueKey, provider)`

Registers an object (a "data provider") that can supply data to be saved and can restore its state from loaded data. Each provider is associated with a `uniqueKey` to namespace its data within the save file.

A **data provider** object should typically implement two methods:

- `getSaveData(): object` - Called during a save operation. Should return a serializable object representing the provider's current state.
- `loadSaveData(data: object): void` - Called during a load operation. Receives the data previously saved under its `uniqueKey` and should restore its state accordingly.

**Parameters:**

| Name        | Type     | Description                                                                                      |
| :---------- | :------- | :----------------------------------------------------------------------------------------------- |
| `uniqueKey` | `string` | A unique string key to identify this provider's data (e.g., `"playerStats"`, `"worldState"`).    |
| `provider`  | `object` | The data provider object, which must implement `getSaveData()` and `loadSaveData(data)` methods. |

**Example:**

```javascript
// Example PlayerStats provider
const playerStatsProvider = {
  currentHealth: 100,
  currentScore: 0,
  getSaveData() {
    return { health: this.currentHealth, score: this.currentScore }
  },
  loadSaveData(data) {
    this.currentHealth = data.health || 100
    this.currentScore = data.score || 0
  },
}
saveLoadManager.registerDataProvider('player', playerStatsProvider)
```
