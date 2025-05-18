# Save/Load Management in Ironclad Engine

A robust Save/Load system is critical for most games, especially RPGs. The Ironclad Engine provides a `SaveLoadManager.js` module designed to be flexible and extensible, allowing developers to save and restore various aspects of their game state.

## Core Concepts

1.  **`SaveLoadManager.js`**:

    - This is the central module responsible for orchestrating the saving and loading processes.
    - It interacts with registered "data providers" to gather data for saving and to distribute data upon loading.
    - It handles the actual writing to and reading from a storage medium (currently `localStorage`).
    - It emits events to signal the status of save/load operations.

2.  **Data Provider Pattern**:

    - To make the system flexible, the `SaveLoadManager` doesn't have hardcoded knowledge of all game-specific data. Instead, different parts of the engine or game (e.g., a player manager, quest system, scene state manager) can register themselves as **data providers**.
    - Each data provider must implement two methods:
      - `getSaveData()`: Returns a JSON-serializable object representing the current state of that provider.
      - `loadSaveData(data)`: Takes the previously saved data object and uses it to restore the provider's state.
    - Providers are registered with a unique string key: `engine.saveLoadManager.registerDataProvider('mySystemKey', mySystemInstance);`

3.  **Storage Medium & Format**:

    - **Format:** Game state is aggregated into a single JavaScript object, which is then serialized to a **JSON** string.
    - **Storage:** Currently, `localStorage` is used. This is simple for development but has size limitations (typically 5-10MB). Future enhancements might include `IndexedDB` for larger storage.

4.  **Save Slots**:

    - The system is designed to support multiple save slots. Each slot is identified by a unique ID (e.g., "slot1", "autosave").
    - Each save file includes:
      - `saveFileVersion`: For handling future data structure changes.
      - `timestamp`: When the save was made.
      - `metadata`: User-provided information (e.g., player name, level, current location) useful for display in a load game menu.
      - `gameData`: An object containing the data from all registered providers, keyed by their unique registration keys.

5.  **Event Emission**:
    - The `SaveLoadManager` (via the engine's `EventManager`) emits events like:
      - `saveGameStarted`, `saveGameCompleted`, `saveGameFailed`
      - `loadGameStarted`, `loadGameCompleted`, `loadGameFailed`
      - `saveSlotDeleted`, `allSaveSlotsDeleted`
    - These can be used by UI scenes to provide feedback to the player.

## The Save Process ("Gather")

1.  The game (e.g., through a UI button) calls `engine.saveLoadManager.saveGame(slotId, userMetadata)`.
2.  The `SaveLoadManager` creates a root save object, including the current `saveFileVersion`, `timestamp`, and the provided `userMetadata`.
3.  It iterates through all registered data providers.
4.  For each provider, it calls `provider.getSaveData()`.
5.  The data returned by each provider is stored in the `rootSaveObject.gameData` under the provider's unique key.
    ```javascript
    // Conceptual structure of saved JSON data
    {
        "saveFileVersion": "1.0.0",
        "timestamp": 1678886400000,
        "metadata": { "playerName": "Hero", "level": 5, "location": "Forest Glade" },
        "gameData": {
            "overworldState": { /* data from OverworldScene's provider */ },
            "playerCharacter": { /* data from a player character provider */ },
            "questSystem": { /* data from a quest system provider */ }
            // ... other providers
        }
    }
    ```
6.  The complete `rootSaveObject` is converted to a JSON string.
7.  The JSON string is written to `localStorage` using a key derived from `slotId`.

## The Load Process ("Scatter & Restore")

Loading is generally more complex due to the need to reset and correctly re-initialize game state.

1.  The game calls `engine.saveLoadManager.loadGame(slotId)`.
2.  The `SaveLoadManager` reads the JSON string from `localStorage` for the given `slotId` and parses it into an object (`loadedRootObject`).
3.  It checks the `saveFileVersion` (future: potential data migration).
4.  **Crucially, the `SaveLoadManager` then calls `provider.loadSaveData(dataPart)` for each registered data provider**, passing the relevant chunk of data from `loadedRootObject.gameData[providerKey]`.
5.  **Game-Specific Orchestration (Very Important):**
    - After `loadSaveData` has been called on all providers, the game state is _logically_ loaded into those providers. However, the visual scene and active game objects might not yet reflect this.
    - The `loadGame` method typically returns the `loadedRootObject` or signals completion via an event (`loadGameCompleted`).
    - The game logic (often in the scene that initiated the load, or a dedicated loading coordinator) is then responsible for:
      - **Transitioning to the correct scene:** Based on data like `loadedRootObject.gameData.sceneState.currentSceneName`. This usually involves `engine.sceneManager.switchTo()`.
      - **Player Placement:** When the new scene initializes, it needs to place the player at the loaded coordinates. This might involve passing player position data to the scene's `initialize` method.
      - **Entity Re-creation/State Restoration:** For persistent ECS entities, they might need to be re-spawned or have their components updated based on the loaded data.
      - **Refreshing UI:** HUDs and other UI elements need to be updated to reflect the newly loaded player stats, inventory, etc.

## Making Your Systems Saveable

To integrate your game systems with the `SaveLoadManager`:

1.  **Identify Data:** Determine what state within your system needs to persist.
2.  **Implement `getSaveData()`:**
    - This method in your system/class should collect all persistent state into a plain, JSON-serializable object.
    - Avoid saving references to live objects directly; use IDs or other serializable representations.
    - Do not save derived or easily re-calculable data.
    ```javascript
    // Example in a hypothetical QuestManager
    class QuestManager {
      // ...
      getSaveData() {
        return {
          activeQuests: this.activeQuests.map((q) => q.serialize()), // Assuming quests have a serialize method
          completedQuests: [...this.completedQuestIds],
          questFlags: { ...this.globalQuestFlags },
        }
      }
      // ...
    }
    ```
3.  **Implement `loadSaveData(data)`:**
    - This method receives the data object previously returned by `getSaveData()`.
    - It should clear any existing dynamic state and restore the system based on the provided `data`.
    - This might involve re-instantiating objects, re-populating arrays/maps, and setting flags.
    ```javascript
    // Example in a hypothetical QuestManager
    class QuestManager {
      // ...
      loadSaveData(data) {
        if (!data) {
          this.resetToDefaultState() // Or handle as appropriate
          return
        }
        this.activeQuests = data.activeQuests.map((qData) => Quest.deserialize(qData, this.engine)) // Example
        this.completedQuestIds = new Set(data.completedQuests)
        this.globalQuestFlags = { ...data.questFlags }
        // Potentially update UI or emit events that quests have been updated
      }
      // ...
    }
    ```
4.  **Register the Provider:**
    - During your system's initialization, register it with the `SaveLoadManager`:
    ```javascript
    // In QuestManager.initialize(engine)
    // this.engine = engine;
    // if (this.engine.saveLoadManager) {
    //     this.engine.saveLoadManager.registerDataProvider('questSystem', this);
    // }
    ```

## Current Status & Future Work

- **Framework Established:** The `SaveLoadManager` with its provider pattern and `localStorage` backend is implemented and tested for basic settings.
- **Pending:**
  - **Comprehensive Data Providers:** Implementing `getSaveData`/`loadSaveData` for all critical game systems (player, inventory, quests, world state, ECS entities).
  - **Robust Load Orchestration:** Developing a clean process for scene transitions and full game state restoration after `loadGame()` completes.
  - **UI for Save/Load Slots:** Creating menu screens for managing saves.
  - **Data Versioning & Migration:** For handling changes to save data structure over time.
  - **Alternative Storage:** Exploring `IndexedDB` for larger save files.

The `SaveLoadManager` provides a flexible foundation. The main work for a game developer using Ironclad is to ensure their game's systems correctly provide and restore their state through this API.
