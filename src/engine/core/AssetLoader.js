// src/engine/core/AssetLoader.js

/**
 * @file AssetLoader.js
 * @description Manages asynchronous loading and caching of game assets.
 * Emits events for loading progress, completion, and errors.
 */

/**
 * @class AssetLoader
 * @description Handles loading and storage of game assets.
 */
class AssetLoader {
  constructor() {
    /** @private @type {Map<string, any>} */
    this.cache = new Map()
    /** @private @type {Array<{type: string, name: string, path: string, group?: string}>} */
    this.loadQueue = []
    /** @type {number} */
    this.loadedCount = 0
    /** @type {number} */
    this.totalCountInCurrentBatch = 0 // Renamed for clarity
    /** @private @type {string | null} */
    this.currentBatchId = null // To identify ongoing batch loadAll operations

    console.log('AssetLoader: Initialized.')
  }

  /** @private */
  _getEventManager() {
    if (window.gameEngine && typeof window.gameEngine.getEventManager === 'function') {
      return window.gameEngine.getEventManager()
    }
    // console.warn("AssetLoader: EventManager not found via window.gameEngine. Events will not be emitted.");
    return null
  }

  /**
   * Queues an image for loading.
   * @param {string} name - A unique name to identify the asset.
   * @param {string} path - The path to the image file.
   * @param {string} [group='global'] - An optional group name for the asset.
   * @returns {this}
   */
  queueImage(name, path, group = 'global') {
    if (this.cache.has(name) || this.loadQueue.find((asset) => asset.name === name)) {
      // console.warn(`AssetLoader: Image asset "${name}" already cached or queued. Skipping.`);
      return this
    }
    this.loadQueue.push({ type: 'image', name, path, group })
    return this
  }

  /**
   * Queues a JSON file for loading.
   * @param {string} name - A unique name to identify the asset.
   * @param {string} path - The path to the JSON file.
   * @param {string} [group='global'] - An optional group name for the asset.
   * @returns {this}
   */
  queueJSON(name, path, group = 'global') {
    if (this.cache.has(name) || this.loadQueue.find((asset) => asset.name === name)) {
      // console.warn(`AssetLoader: JSON asset "${name}" already cached or queued. Skipping.`);
      return this
    }
    this.loadQueue.push({ type: 'json', name, path, group })
    return this
  }

  /** @private */
  _loadImage(name, path, group) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(name)) {
        // console.log(`AssetLoader: Image "${name}" already in cache.`);
        this.loadedCount++ // Still count it towards progress if re-queued for a batch
        const eventManager = this._getEventManager()
        if (eventManager) {
          eventManager.emit('asset:progress', {
            loaded: this.loadedCount,
            total: this.totalCountInCurrentBatch,
            assetName: name,
            assetPath: path,
            group: group,
            status: 'cached',
          })
        }
        resolve(this.cache.get(name))
        return
      }
      const image = new Image()
      image.onload = () => {
        this.cache.set(name, image)
        this.loadedCount++
        // console.log(`AssetLoader: Image "${name}" loaded from ${path}`);
        const eventManager = this._getEventManager()
        if (eventManager) {
          eventManager.emit('asset:loaded', { name, path, group, asset: image })
          eventManager.emit('asset:progress', {
            loaded: this.loadedCount,
            total: this.totalCountInCurrentBatch,
            assetName: name,
            assetPath: path,
            group: group,
            status: 'loaded',
          })
        }
        resolve(image)
      }
      image.onerror = (errorEvent) => {
        const error = new Error(`Failed to load image "${name}": ${path}`)
        console.error(`AssetLoader: ${error.message}`, errorEvent)
        const eventManager = this._getEventManager()
        if (eventManager) {
          eventManager.emit('asset:error', { name, path, group, error })
          eventManager.emit('asset:progress', {
            // Still emit progress for error to count it as "processed"
            loaded: this.loadedCount, // loadedCount doesn't increment on error
            total: this.totalCountInCurrentBatch,
            assetName: name,
            assetPath: path,
            group: group,
            status: 'error',
          })
        }
        reject(error)
      }
      image.src = path
    })
  }

  /** @private */
  _loadJSON(name, path, group) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(name)) {
        // console.log(`AssetLoader: JSON "${name}" already in cache.`);
        this.loadedCount++
        const eventManager = this._getEventManager()
        if (eventManager) {
          eventManager.emit('asset:progress', {
            loaded: this.loadedCount,
            total: this.totalCountInCurrentBatch,
            assetName: name,
            assetPath: path,
            group: group,
            status: 'cached',
          })
        }
        resolve(this.cache.get(name))
        return
      }
      fetch(path)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${path}`)
          }
          return response.json()
        })
        .then((data) => {
          this.cache.set(name, data)
          this.loadedCount++
          // console.log(`AssetLoader: JSON "${name}" loaded from ${path}`);
          const eventManager = this._getEventManager()
          if (eventManager) {
            eventManager.emit('asset:loaded', { name, path, group, asset: data })
            eventManager.emit('asset:progress', {
              loaded: this.loadedCount,
              total: this.totalCountInCurrentBatch,
              assetName: name,
              assetPath: path,
              group: group,
              status: 'loaded',
            })
          }
          resolve(data)
        })
        .catch((error) => {
          console.error(`AssetLoader: Failed to load JSON "${name}" from ${path}`, error)
          const eventManager = this._getEventManager()
          if (eventManager) {
            eventManager.emit('asset:error', { name, path, group, error })
            eventManager.emit('asset:progress', {
              loaded: this.loadedCount,
              total: this.totalCountInCurrentBatch,
              assetName: name,
              assetPath: path,
              group: group,
              status: 'error',
            })
          }
          reject(new Error(`Failed to load JSON "${name}": ${path}`))
        })
    })
  }

  /**
   * Starts loading all queued assets.
   * @param {string} [batchId='defaultBatch'] - An optional identifier for this loading batch.
   * @returns {Promise<Map<string, any>>} A promise that resolves with a map of successfully loaded assets in this batch,
   * or rejects if any critical asset fails (though individual errors are also emitted).
   */
  loadAll(batchId = `batch_${Date.now()}`) {
    if (this.loadQueue.length === 0) {
      // console.log('AssetLoader: No assets in queue to load.');
      const eventManager = this._getEventManager()
      if (eventManager)
        eventManager.emit('asset:batchCompleted', {
          batchId,
          loadedAssets: new Map(),
          totalAssetsInBatch: 0,
          success: true,
        })
      return Promise.resolve(new Map())
    }

    const currentQueue = [...this.loadQueue] // Process a copy of the queue
    this.loadQueue = [] // Clear the main queue for next batch

    this.totalCountInCurrentBatch = currentQueue.length
    this.loadedCount = 0 // Reset for this batch
    this.currentBatchId = batchId

    console.log(
      `AssetLoader: Starting to load batch "${batchId}" with ${this.totalCountInCurrentBatch} asset(s)...`,
    )
    const eventManager = this._getEventManager()
    if (eventManager) {
      eventManager.emit('asset:batchStarted', {
        batchId,
        totalAssets: this.totalCountInCurrentBatch,
      })
    }

    const promises = currentQueue.map((assetToLoad) => {
      let loadPromise
      if (assetToLoad.type === 'image') {
        loadPromise = this._loadImage(assetToLoad.name, assetToLoad.path, assetToLoad.group)
      } else if (assetToLoad.type === 'json') {
        loadPromise = this._loadJSON(assetToLoad.name, assetToLoad.path, assetToLoad.group)
      } else {
        console.warn(
          `AssetLoader: Unknown asset type "${assetToLoad.type}" for "${assetToLoad.name}". Skipping.`,
        )
        const err = new Error(`Unknown asset type: ${assetToLoad.type}`)
        if (eventManager)
          eventManager.emit('asset:error', {
            name: assetToLoad.name,
            path: assetToLoad.path,
            group: assetToLoad.group,
            error: err,
          })
        loadPromise = Promise.reject(err) // Make it fail for Promise.allSettled
      }
      // Return an object to identify asset name on settlement
      return loadPromise
        .then((asset) => ({ name: assetToLoad.name, status: 'fulfilled', value: asset }))
        .catch((error) => ({ name: assetToLoad.name, status: 'rejected', reason: error }))
    })

    return Promise.allSettled(promises).then((results) => {
      const successfullyLoadedAssets = new Map()
      let allSucceeded = true
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          successfullyLoadedAssets.set(result.name, result.value)
        } else {
          allSucceeded = false
          // Individual errors already emitted by _loadImage/_loadJSON
          console.warn(
            `AssetLoader: Asset "${result.name}" failed to load in batch "${batchId}". Reason:`,
            result.reason.message,
          )
        }
      })

      if (eventManager) {
        eventManager.emit('asset:batchCompleted', {
          batchId,
          loadedAssets: successfullyLoadedAssets,
          totalAssetsInBatch: this.totalCountInCurrentBatch,
          success: allSucceeded,
        })
      }

      if (allSucceeded) {
        console.log(
          `AssetLoader: Batch "${batchId}" (${this.loadedCount}/${this.totalCountInCurrentBatch}) loaded successfully.`,
        )
        return successfullyLoadedAssets
      } else {
        console.warn(`AssetLoader: Batch "${batchId}" completed with some errors.`)
        // Resolve with successfully loaded assets, but let handler know via event or a flag if needed
        return Promise.reject(new Error(`Batch "${batchId}" had loading errors.`))
      }
    })
  }

  get(name) {
    /* ... (no changes) ... */
    if (!this.cache.has(name)) {
      console.warn(`AssetLoader: Asset "${name}" not found in cache. Was it loaded?`)
      return undefined
    }
    return this.cache.get(name)
  }

  getProgress() {
    /* ... (no changes, but now reflects totalCountInCurrentBatch) ... */
    if (this.totalCountInCurrentBatch === 0 && this.loadQueue.length === 0) {
      return { loaded: this.loadedCount, total: this.totalCountInCurrentBatch, progress: 1 }
    }
    return {
      loaded: this.loadedCount,
      total: this.totalCountInCurrentBatch,
      progress:
        this.totalCountInCurrentBatch > 0 ? this.loadedCount / this.totalCountInCurrentBatch : 0,
    }
  }

  clearCache() {
    /* ... (no changes) ... */
    this.cache.clear()
    this.loadedCount = 0
    this.totalCountInCurrentBatch = 0
    this.loadQueue = []
    console.log('AssetLoader: Cache and queue cleared.')
  }
}

export default AssetLoader
