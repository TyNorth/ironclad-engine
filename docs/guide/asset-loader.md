# Asset Management in Ironclad Engine

The `AssetLoader.js` module is responsible for loading and caching all external game assets, such as images, JSON data files, and audio. It provides a robust system for asynchronous loading, batch processing, and event-driven feedback, which is crucial for features like loading screens.

## Core Concepts

1. **Asset Manifest (`asset-manifest.json`):**

   - This central JSON file defines all the assets your game needs. It typically lists assets by type (images, JSON files, audio), providing a unique name (key) and a path for each.
   - The `AssetLoader` first loads this manifest to know what other assets to fetch.

2. **Asset Types:**

   - **Images:** Loaded as `HTMLImageElement` objects (e.g., for sprites, tilesets, UI elements).
   - **JSON:** Loaded as parsed JavaScript objects (e.g., for map data, configuration, prefabs).
   - **Audio:** Loaded as `AudioBuffer` objects using the Web Audio API (e.g., for sound effects and music).

3. **Queuing and Batch Loading:**

   - Assets are first "queued" using methods like `assetLoader.queueImage()`, `queueJSON()`, or `queueAudio()`.
   - The actual loading begins when `assetLoader.loadAll(batchId)` is called. This processes all currently queued assets as a batch.
   - This batch system allows for structured loading, for example, loading a minimal set of assets for a loading screen first, then loading the main game assets.

4. **Caching:**

   - Once an asset is successfully loaded, it's stored in an internal cache (`this.cache`) using its unique name as the key.
   - Subsequent requests for the same asset name will retrieve it from the cache instantly, avoiding redundant network requests.

5. **Event-Driven Progress:**

   - The `AssetLoader` emits events through the global `EventManager` to report on the loading process:
     - `asset:batchStarted`: Fired when `loadAll()` begins a new batch. (Payload: `{ batchId, totalAssets }`)
     - `asset:progress`: Fired for each asset processed within a batch (loaded, cached, or errored). (Payload: `{ loaded, total, assetName, assetPath, group, status }`)
     - `asset:loaded`: Fired when an individual asset loads successfully. (Payload: `{ name, path, group, asset }`)
     - `asset:error`: Fired if an individual asset fails to load. (Payload: `{ name, path, group, error }`)
     - `asset:batchCompleted`: Fired when all assets in a batch have been processed. (Payload: `{ batchId, loadedAssets: Map, totalAssetsInBatch, actuallyLoadedCount, processedCount, success: boolean }`)
   - These events are essential for creating loading screens that display progress.

6. **Audio Context:**
   - For loading and decoding audio, `AssetLoader` manages an `AudioContext`. It creates one if not already present. This context is also made available to the `AudioManager`.

## Defining Assets: `asset-manifest.json`

This file is typically located in your `public/assets/data/` directory. It lists all assets the engine should know about.

**Example `asset-manifest.json`:**

```json
{
  "assets": [
    {
      "name": "mainTilesetPNG",
      "type": "image",
      "path": "/assets/images/tilesets/tileset.png",
      "group": "world_visuals"
    },
    {
      "name": "testPlayer",
      "type": "image",
      "path": "/assets/images/test_image.png",
      "group": "player_assets"
    },
    {
      "name": "testMapData",
      "type": "json",
      "path": "/assets/data/maps/test_map.json",
      "group": "level_data"
    },
    {
      "name": "entityPrefabs",
      "type": "json",
      "path": "/assets/data/prefabs/prefabs.json",
      "group": "game_config"
    },
    {
      "name": "sfx_ui_click",
      "type": "audio",
      "path": "/assets/audio/sfx/ui_click.wav",
      "group": "ui_sounds"
    },
    {
      "name": "music_overworld",
      "type": "audio",
      "path": "/assets/audio/music/overworld_theme.ogg",
      "group": "music_tracks"
    }
  ]
}
```

- name: A unique string key used to retrieve the asset later (e.g., assetLoader.get('testPlayer')).

- type: Specifies the asset type: "image", "json", or "audio".

- path: The URL path to the asset file, typically relative to the public directory.

- group (Optional): A string to categorize assets. Can be used by LoadingScene or other systems to load assets in logical chunks.

## Loading Process in `LoadingScene.js` (Example Flow)

Your `LoadingScene.js` typically orchestrates the multi-stage loading process:

1. **Stage 1: Load the Asset Manifest itself.**

   ```javascript
   // In LoadingScene.initialize()
   this.assetLoader.queueJSON('initialAssetManifest', this.assetManifestPath, 'manifest_group')
   this.assetLoader
     .loadAll(this.manifestBatchId)
     .then((manifestAssets) => {
       const manifest = manifestAssets.get('initialAssetManifest')
       // ... proceed to parse manifest and queue other assets ...
     })
     .catch((error) => this.handleError(error))
   ```

2. **Stage 2: Parse the Manifest and Queue Global Assets.**

   - Once the manifest is loaded (handled in `_handleBatchCompleted` for `manifestBatchId`), iterate through its contents (`manifest.images`, `manifest.jsonFiles`, `manifest.audio`).
   - For each asset definition, call the appropriate queuing method:
     - `this.assetLoader.queueImage(def.name, def.path, def.group);`
     - `this.assetLoader.queueJSON(def.name, def.path, def.group);`
     - `this.assetLoader.queueAudio(def.name, def.path, def.group);`
   - After queuing all global assets, call `this.assetLoader.loadAll(this.globalAssetsBatchId)`.

3. **Stage 3 (Optional): Dynamically Queue More Assets.**

   - For example, after loading map data (a JSON file), the `LoadingScene` might parse that map data to find paths to specific tileset images required by that map.
   - These newly discovered image paths are then queued using `this.assetLoader.queueImage()`.
   - Another `this.assetLoader.loadAll(this.tilesetImagesBatchId)` call is made.

4. **Event Handling:**
   - `LoadingScene` listens to `asset:batchStarted`, `asset:progress`, `asset:batchCompleted`, and `asset:error` events from the `EventManager` to update its visual loading status (e.g., progress bar, text messages).

## Accessing Loaded Assets

Once assets are loaded and a batch is completed, they can be retrieved from anywhere in the engine or game code using the `AssetLoader` instance (usually via `engine.assetLoader`):

- **`assetLoader.get(assetName: string): HTMLImageElement | object | AudioBuffer | undefined`**

**Example:**

```javascript
// In a scene or system, after assets are loaded:
const playerImage = this.engine.assetLoader.get('testPlayer'); // Returns HTMLImageElement
const mapData = this.engine.assetLoader.get('testMapData');     // Returns parsed JSON object
const clickSound = this.engine.assetLoader.get('sfx_ui_click'); // Returns AudioBuffer

if (playerImage) {
    // Use the image
}
if (clickSound && this.engine.audioManager) {
    this.engine.audioManager.playSoundEffect('sfx_ui_click');
}
Audio SpecificsWhen an audio asset is loaded, AssetLoader uses the Web Audio API to fetch it as an ArrayBuffer and then decodes it into an AudioBuffer.This AudioBuffer is what's stored in the cache and retrieved by assetLoader.get().The AudioManager then uses these AudioBuffers to create playable audio sources.The AssetLoader manages a single AudioContext. This context is created on the first demand (either by _loadAudio or if AudioManager requests it via assetLoader.audioContext).The AssetLoader.destroy() method will attempt to close this AudioContext to release audio system resources.LifecycleInitialization: The AssetLoader is instantiated by IroncladEngine.Destruction: AssetLoader.destroy() should be called when the engine shuts down to clear the cache and close the AudioContext.The AssetLoader provides a comprehensive solution for managing your game's assets
```
