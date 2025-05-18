# Asset Management: `AssetLoader.js`

The `AssetLoader.js` module in the Ironclad Engine is your central utility for loading and managing all external game assets. It handles images, JSON data, and audio files, providing an asynchronous, queue-based system with progress tracking and event notifications.

## Core Functionality

- **Asset Queuing:** Before loading, assets are added to a queue. This allows you to define all necessary assets for a particular game state or loading phase at once.
- **Batch Loading:** The `loadAll(batchId)` method processes all assets currently in the queue as a single batch. This is useful for creating loading screens and managing asset loading in stages.
- **Caching:** Successfully loaded assets are stored in an internal cache (`this.cache`) using their unique name. Subsequent requests for the same asset will be served instantly from the cache.
- **Supported Types:**
  - **Images:** Loaded as `HTMLImageElement` objects (for sprites, textures, UI graphics).
  - **JSON:** Loaded as parsed JavaScript objects (for configurations, map data, prefabs, game data).
  - **Audio:** Loaded as `AudioBuffer` objects using the Web Audio API (for sound effects and music tracks).
- **Event-Driven Progress:** `AssetLoader` emits events through the engine's `EventManager` to track the loading process:
  - `asset:batchStarted`: When `loadAll()` begins.
  - `asset:progress`: For each asset processed (loaded, cached, or errored).
  - `asset:loaded`: When an individual asset loads successfully.
  - `asset:error`: If an individual asset fails to load.
  - `asset:batchCompleted`: When all assets in a batch are processed.
- **Audio Context Management:** `AssetLoader` internally creates and manages the `AudioContext` required for Web Audio API operations. It also provides a `destroy()` method to close this context.

## Using the `AssetLoader`

### 1. Defining Assets (`asset-manifest.json`)

All game assets are typically defined in an `asset-manifest.json` file. This file lists each asset with its unique `name`, `type` (`image`, `json`, `audio`), and `path`. An optional `group` can be specified for logical organization.

**Example `asset-manifest.json`:**

```json
{
  "assets": [
    { "name": "playerSprite", "type": "image", "path": "/assets/images/player.png", "group": "player_assets" },
    { "name": "level1Data", "type": "json", "path": "/assets/data/level1.json", "group": "level_data" },
    { "name": "sfx_jump", "type": "audio", "path": "/assets/audio/sfx/jump.wav", "group": "game_sfx" },
    { "name": "music_mainTheme", "type": "audio", "path": "/assets/audio/music/theme.mp3", "group": "music" }
  ]
}
2. Queuing AssetsBefore loading, assets must be added to the AssetLoader's queue. Your LoadingScene typically handles this by first loading the asset-manifest.json, then parsing it and queuing the listed assets.assetLoader.queueImage(name, path, group = 'global')assetLoader.queueJSON(name, path, group = 'global')assetLoader.queueAudio(name, path, group = 'global')Example (in LoadingScene after manifest is loaded):// manifest is the parsed asset-manifest.json
if (manifest.images) {
    manifest.images.forEach(asset =>
        this.assetLoader.queueImage(asset.name, asset.path, asset.group)
    );
}
if (manifest.jsonFiles) {
    manifest.jsonFiles.forEach(asset =>
        this.assetLoader.queueJSON(asset.name, asset.path, asset.group)
    );
}
if (manifest.audio) {
    manifest.audio.forEach(asset =>
        this.assetLoader.queueAudio(asset.name, asset.path, asset.group)
    );
}
3. Loading a Batch of AssetsOnce assets are queued, call loadAll() to begin the loading process. This method returns a Promise that resolves when all assets in the batch have been processed (either successfully loaded/cached or errored).assetLoader.loadAll(batchId = \batch_${Date.now()}`): Promise<Map<string, any>>`Example (in LoadingScene):this.assetLoader.loadAll('mainGameAssets')
    .then((loadedAssetsMap) => {
        console.log("Main game assets batch loaded successfully!", loadedAssetsMap.size, "assets loaded.");
        // Proceed to next game state or scene
        this.engine.sceneManager.switchTo('OverworldScene');
    })
    .catch(error => {
        console.error("Asset batch loading failed:", error);
        // Handle loading errors (e.g., display error message)
    });
The LoadingScene will also listen to the events emitted by AssetLoader (like asset:progress and asset:batchCompleted) to update any visual loading indicators.4. Accessing Loaded AssetsAfter loadAll() has successfully completed for a batch containing a specific asset, you can retrieve the asset from the cache using its unique name:assetLoader.get(assetName: string): HTMLImageElement | object | AudioBuffer | undefinedExample:// In a game scene or system, after ensuring assets are loaded:
const engine = this.engine; // Assuming 'this.engine' is available

const playerImage = engine.assetLoader.get('playerSprite');
const levelConfig = engine.assetLoader.get('level1Data');
const jumpSoundBuffer = engine.assetLoader.get('sfx_jump');

if (playerImage) { /* Use playerImage */ }
if (levelConfig) { /* Use levelConfig */ }
if (jumpSoundBuffer && engine.audioManager) {
    engine.audioManager.playSoundEffect('sfx_jump');
}
5. Progress and StatusassetLoader.getProgress(): Returns an object { loaded, total, progress } for the current batch.assetLoader.getLoadingCount(): Returns the number of assets remaining to be processed in the current batch.assetLoader.isDoneLoading(): Indicates if the current batch processing is complete (may need careful interpretation alongside loadAll() promise).6. CleanupassetLoader.clearCache(): Empties the asset cache and resets loading counters.assetLoader.destroy(): Clears the cache and also closes the AudioContext if it was initialized. This should be called when the engine shuts down.By using
```
