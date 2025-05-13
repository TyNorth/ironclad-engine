// src/engine/core/AssetLoader.js

/**
 * @file AssetLoader.js
 * @description Manages asynchronous loading and caching of game assets like images and JSON files.
 */

/**
 * @class AssetLoader
 * @description Handles loading and storage of game assets.
 * Uses Promises for asynchronous operations.
 */
class AssetLoader {
  constructor() {
    /**
     * @private
     * @type {Map<string, any>}
     * @description Cache for storing loaded assets, keyed by their unique name.
     */
    this.cache = new Map()

    /**
     * @private
     * @type {Array<{type: string, name: string, path: string}>}
     * @description A queue of assets to be loaded. Each object contains type, name, and path.
     */
    this.loadQueue = []

    /**
     * @type {number}
     * @description The total number of assets successfully loaded.
     */
    this.loadedCount = 0

    /**
     * @type {number}
     * @description The total number of assets that were queued for loading in the last batch.
     */
    this.totalCount = 0
  }

  /**
   * Queues an image for loading.
   * @param {string} name - A unique name to identify the asset.
   * @param {string} path - The path to the image file.
   * @returns {this} The AssetLoader instance for chaining.
   */
  queueImage(name, path) {
    if (this.cache.has(name)) {
      console.warn(`AssetLoader: Image asset "${name}" is already cached or queued. Skipping.`)
      return this
    }
    if (this.loadQueue.find((asset) => asset.name === name)) {
      console.warn(`AssetLoader: Image asset "${name}" is already in the load queue. Skipping.`)
      return this
    }
    this.loadQueue.push({ type: 'image', name, path })
    return this
  }

  /**
   * Queues a JSON file for loading.
   * @param {string} name - A unique name to identify the asset.
   * @param {string} path - The path to the JSON file.
   * @returns {this} The AssetLoader instance for chaining.
   */
  queueJSON(name, path) {
    if (this.cache.has(name)) {
      console.warn(`AssetLoader: JSON asset "${name}" is already cached or queued. Skipping.`)
      return this
    }
    if (this.loadQueue.find((asset) => asset.name === name)) {
      console.warn(`AssetLoader: JSON asset "${name}" is already in the load queue. Skipping.`)
      return this
    }
    this.loadQueue.push({ type: 'json', name, path })
    return this
  }

  /**
   * @private
   * Loads a single image file.
   * @param {string} name - The unique name for the asset.
   * @param {string} path - The path to the image file.
   * @returns {Promise<HTMLImageElement>} A promise that resolves with the loaded HTMLImageElement.
   */
  _loadImage(name, path) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(name)) {
        resolve(this.cache.get(name))
        return
      }
      const image = new Image()
      image.onload = () => {
        this.cache.set(name, image)
        this.loadedCount++
        console.log(`AssetLoader: Image "${name}" loaded successfully from ${path}`)
        resolve(image)
      }
      image.onerror = (error) => {
        console.error(`AssetLoader: Failed to load image "${name}" from ${path}`, error)
        reject(new Error(`Failed to load image "${name}": ${path}`))
      }
      image.src = path
    })
  }

  /**
   * @private
   * Loads a single JSON file.
   * @param {string} name - The unique name for the asset.
   * @param {string} path - The path to the JSON file.
   * @returns {Promise<object>} A promise that resolves with the parsed JSON object.
   */
  _loadJSON(name, path) {
    return new Promise((resolve, reject) => {
      if (this.cache.has(name)) {
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
          console.log(`AssetLoader: JSON "${name}" loaded successfully from ${path}`)
          resolve(data)
        })
        .catch((error) => {
          console.error(`AssetLoader: Failed to load JSON "${name}" from ${path}`, error)
          reject(new Error(`Failed to load JSON "${name}": ${path}`))
        })
    })
  }

  /**
   * Starts loading all queued assets.
   * @returns {Promise<void>} A promise that resolves when all queued assets are loaded,
   * or rejects if any asset fails to load.
   */
  loadAll() {
    if (this.loadQueue.length === 0) {
      console.log('AssetLoader: No assets in queue to load.')
      return Promise.resolve()
    }

    console.log(`AssetLoader: Starting to load ${this.loadQueue.length} asset(s)...`)
    this.totalCount = this.loadQueue.length
    this.loadedCount = 0 // Reset for this batch

    const promises = this.loadQueue.map((assetToLoad) => {
      if (assetToLoad.type === 'image') {
        return this._loadImage(assetToLoad.name, assetToLoad.path)
      } else if (assetToLoad.type === 'json') {
        return this._loadJSON(assetToLoad.name, assetToLoad.path)
      }
      // Add other types like 'audio' here in the future
      console.warn(
        `AssetLoader: Unknown asset type "${assetToLoad.type}" for "${assetToLoad.name}". Skipping.`,
      )
      return Promise.resolve() // Resolve immediately for unknown types to not break Promise.all
    })

    // Clear the queue once we've created all the promises
    this.loadQueue = []

    return Promise.all(promises)
      .then(() => {
        console.log(`AssetLoader: All ${this.totalCount} assets loaded successfully.`)
      })
      .catch((error) => {
        console.error('AssetLoader: One or more assets failed to load.', error)
        // Even if some assets fail, others might have succeeded and are in cache.
        // The individual load errors are already logged.
        throw error // Re-throw to indicate failure of loadAll
      })
  }

  /**
   * Retrieves a loaded asset from the cache.
   * @param {string} name - The unique name of the asset.
   * @returns {any | undefined} The loaded asset, or undefined if not found.
   */
  get(name) {
    if (!this.cache.has(name)) {
      console.warn(`AssetLoader: Asset "${name}" not found in cache. Was it loaded?`)
      return undefined
    }
    return this.cache.get(name)
  }

  /**
   * Gets the current loading progress.
   * @returns {{loaded: number, total: number, progress: number}}
   * An object containing the number of loaded assets, total assets in the last batch,
   * and progress percentage (0-1).
   */
  getProgress() {
    if (this.totalCount === 0) {
      return { loaded: 0, total: 0, progress: 1 } // No assets, so 100% done.
    }
    return {
      loaded: this.loadedCount,
      total: this.totalCount,
      progress: this.totalCount > 0 ? this.loadedCount / this.totalCount : 0,
    }
  }

  /**
   * Clears the asset cache and resets counts.
   * Useful if you need to reload all assets, e.g., for a full game reset
   * or when switching to a completely different set of assets.
   */
  clearCache() {
    this.cache.clear()
    this.loadedCount = 0
    this.totalCount = 0
    this.loadQueue = [] // Also clear any pending queue
    console.log('AssetLoader: Cache and queue cleared.')
  }
}

export default AssetLoader
