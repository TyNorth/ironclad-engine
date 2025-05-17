// src/game/scenes/LoadingScene.js

/**
 * @file LoadingScene.js
 * @description Loads the asset manifest, then all assets listed including the main map data.
 * After the map data is loaded, it parses it to find and load all necessary tileset images.
 * Finally, it processes prefabs and transitions to the next scene.
 * Uses event-driven progress updates from AssetLoader.
 */

class LoadingScene {
  constructor() {
    /** @private @type {import('../../engine/core/IroncladEngine.js').default | null} */
    this.engine = null
    /** @private @type {import('../../engine/core/AssetLoader.js').default | null} */
    this.assetLoader = null
    /** @private @type {import('../../engine/core/EventManager.js').default | null} */
    this.eventManager = null
    /** @private @type {import('../../engine/ecs/PrefabManager.js').default | null} */
    this.prefabManager = null

    /** @private @type {string | null} */
    this.assetManifestPath = null
    /** * @private
     * @description Path to the main map JSON file, relative to public root (e.g., /assets/data/maps/test_map.json).
     * This is determined from the asset manifest.
     */
    this.mapJsonActualPath = ''

    /** @private @type {string} */
    this.loadingStatusText = 'Initializing...'
    /** @private @type {string} */
    this.currentBatchProgressText = ''

    /** @private @type {string} */
    this.manifestBatchId = `manifest_load_${Date.now()}`
    /** @private @type {string} */
    this.globalAssetsBatchId = `global_assets_load_${Date.now()}`
    /** @private @type {string} */
    this.tilesetImagesBatchId = `tileset_images_load_${Date.now()}`
    /** @private @type {string} */ // Key for map data in AssetLoader, as defined in manifest
    this.mapDataAssetKey = 'testMapData'
    /** @private @type {string} */ // Key for prefabs JSON in AssetLoader, as defined in manifest
    this.prefabsAssetKey = 'entityPrefabs'

    /** @private @type {boolean} */
    this.allAssetsAndPrefabsReady = false
    /** @private @type {string | null} */
    this.loadingError = null
    /** @private @type {HTMLImageElement | null} */
    this.displayImage = null

    // Bind event handlers to ensure 'this' context is correct
    this._handleAssetProgress = this._handleAssetProgress.bind(this)
    this._handleBatchStarted = this._handleBatchStarted.bind(this)
    this._handleBatchCompleted = this._handleBatchCompleted.bind(this)
    this._handleAssetError = this._handleAssetError.bind(this)

    console.log('LoadingScene: Constructor called')
  }

  /**
   * Initializes the scene.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {object} [data={}] - Optional data, expected to contain `assetManifestPath`.
   */
  initialize(engine, context, data = {}) {
    console.log(`LoadingScene: Initializing with engine and data:`, data)
    this.engine = engine
    this.allAssetsAndPrefabsReady = false
    this.loadingError = null
    this.displayImage = null
    this.loadingStatusText = 'Preparing asset manifest...'
    this.currentBatchProgressText = ''

    if (!this.engine) {
      this.handleError('Engine instance not provided!')
      return
    }

    this.assetLoader = this.engine.getAssetLoader()
    this.eventManager = this.engine.getEventManager()
    this.prefabManager = this.engine.getPrefabManager()

    if (!this.assetLoader || !this.eventManager || !this.prefabManager) {
      this.handleError('Core engine systems (AssetLoader, EventManager, PrefabManager) missing!')
      return
    }

    // Get assetManifestPath from data (passed by IroncladEngine.start) or directly from engine
    this.assetManifestPath = data.assetManifestPath || this.engine.getAssetManifestPath()
    if (!this.assetManifestPath) {
      this.handleError('Asset Manifest Path not available to LoadingScene!')
      return
    }

    // Register event listeners
    this.eventManager.on('asset:progress', this._handleAssetProgress, this)
    this.eventManager.on('asset:batchStarted', this._handleBatchStarted, this)
    this.eventManager.on('asset:batchCompleted', this._handleBatchCompleted, this)
    this.eventManager.on('asset:error', this._handleAssetError, this)

    // --- Stage 1: Load the Asset Manifest ---
    console.log(`LoadingScene: Queuing asset manifest from: ${this.assetManifestPath}`)
    this.assetLoader.queueJSON('initialAssetManifest', this.assetManifestPath, 'manifest_group')
    this.assetLoader.loadAll(this.manifestBatchId).catch((error) => {
      // This catch is for if loadAll itself throws an error (e.g., network issue before any individual loads)
      this.handleError(`Failed to initiate manifest loading: ${error.message || error}`)
    })
  }

  /** @private */
  _handleBatchStarted(data) {
    // data = { batchId, totalAssets }
    console.log(`LoadingScene: Batch "${data.batchId}" started, ${data.totalAssets} assets total.`)
    if (data.batchId === this.manifestBatchId) this.loadingStatusText = `Loading manifest...`
    else if (data.batchId === this.globalAssetsBatchId)
      this.loadingStatusText = `Loading game assets...`
    else if (data.batchId === this.tilesetImagesBatchId)
      this.loadingStatusText = `Loading tileset images...`
    this.currentBatchProgressText = `(0/${data.totalAssets}) 0%`
  }

  /** @private */
  _handleAssetProgress(data) {
    // data = { loaded, total, assetName, assetPath, group, status, batchId }
    // Update status text based on current active batch if needed
    if (data.batchId === this.manifestBatchId && !this.allAssetsAndPrefabsReady) {
      /* status already set by batchStarted */
    } else if (data.batchId === this.globalAssetsBatchId && !this.allAssetsAndPrefabsReady) {
      /* status already set */
    } else if (data.batchId === this.tilesetImagesBatchId && !this.allAssetsAndPrefabsReady) {
      /* status already set */
    }

    const percentage =
      data.total > 0
        ? Math.round((data.loaded / data.total) * 100)
        : data.status === 'cached' || data.status === 'loaded'
          ? 100
          : 0
    this.currentBatchProgressText = `(${data.loaded}/${data.total}) ${percentage}% [${data.assetName}]`
  }

  /** @private */
  _handleAssetError(data) {
    // data = { name, path, group, error, batchId }
    console.error(
      `LoadingScene: Error loading asset "${data.name}" from "${data.path}" (Batch: ${data.batchId}). Error:`,
      data.error?.message,
    )
    // A general error will be handled by the batchCompleted.success flag
  }

  /** @private */
  _handleBatchCompleted(data) {
    // data = { batchId, loadedAssets: Map<string, any>, totalAssetsInBatch: number, success: boolean }
    console.log(`LoadingScene: Batch "${data.batchId}" completed. Success: ${data.success}`)
    if (!this.engine) return

    if (!data.success) {
      this.handleError(
        `Asset batch "${data.batchId}" failed. Check console for individual asset errors.`,
      )
      return
    }

    if (data.batchId === this.manifestBatchId) {
      const manifest = this.assetLoader.get('initialAssetManifest')
      if (!manifest) {
        this.handleError('Manifest data not found in cache after load!')
        return
      }

      console.log('LoadingScene: Asset Manifest loaded. Queuing global assets from manifest...')
      this.loadingStatusText = 'Manifest loaded. Queuing game assets...'
      this.currentBatchProgressText = ''

      let assetsToLoadCount = 0
      if (manifest.images && Array.isArray(manifest.images)) {
        manifest.images.forEach((imgDef) => {
          if (imgDef.name && imgDef.path) {
            this.assetLoader.queueImage(imgDef.name, imgDef.path, 'global_images')
            assetsToLoadCount++
          }
        })
      }
      if (manifest.jsonFiles && Array.isArray(manifest.jsonFiles)) {
        manifest.jsonFiles.forEach((jsonDef) => {
          if (jsonDef.name && jsonDef.path) {
            this.assetLoader.queueJSON(jsonDef.name, jsonDef.path, 'global_json')
            assetsToLoadCount++
            if (jsonDef.name === this.mapDataAssetKey) {
              // e.g., 'testMapData'
              this.mapJsonActualPath = jsonDef.path // Store actual path for resolving relative paths
            }
          }
        })
      }
      if (manifest.audio && Array.isArray(manifest.audio)) {
        manifest.audio.forEach((audioDef) => {
          if (audioDef.name && audioDef.path && audioDef.type === 'audio') {
            // Check type
            this.assetLoader.queueAudio(audioDef.name, audioDef.path, 'global_audio')
            assetsToLoadCount++
            // console.log(`LoadingScene: Queued audio asset "${audioDef.name}" from ${audioDef.path}`);
          }
        })
      }
      // TODO: Add other asset types like audio

      if (assetsToLoadCount > 0) {
        this.assetLoader
          .loadAll(this.globalAssetsBatchId)
          .catch((error) =>
            this.handleError(`Failed to initiate global asset loading: ${error.message || error}`),
          )
      } else {
        this.queueTilesetImagesFromMapData() // No global assets, proceed to tilesets
      }
    } else if (data.batchId === this.globalAssetsBatchId) {
      // Global assets (including map JSON and prefab JSON) are loaded. Now load tileset images.
      this.queueTilesetImagesFromMapData()
    } else if (data.batchId === this.tilesetImagesBatchId) {
      // All visual tileset images are loaded. Now process prefabs.
      this.processPrefabsAndTransition()
    }
  }

  /** @private */
  queueTilesetImagesFromMapData() {
    if (!this.engine || !this.assetLoader) return
    console.log('LoadingScene: Global assets loaded. Parsing map for dynamic tileset images...')
    this.loadingStatusText = 'Map data loaded. Queuing tileset images...'
    this.currentBatchProgressText = ''

    const mapData = this.assetLoader.get(this.mapDataAssetKey)
    if (!mapData || !mapData.tilesets) {
      console.warn(
        `LoadingScene: Map data ("${this.mapDataAssetKey}") not found or has no tilesets. Skipping dynamic tileset image loading.`,
      )
      this.processPrefabsAndTransition()
      return
    }
    if (!this.mapJsonActualPath) {
      console.error(
        'LoadingScene: mapJsonActualPath not set. Cannot resolve relative tileset image paths.',
      )
      this.processPrefabsAndTransition() // Might still work if all paths are absolute from root
      return
    }

    let tilesetImagesToQueue = 0
    // Base URL for resolving paths relative to the map JSON file's location
    const mapFileBaseUrl = new URL(this.mapJsonActualPath, window.location.origin)

    mapData.tilesets.forEach((tsDef) => {
      if (tsDef.image) {
        // CRITICAL: map JSON must contain `image` path for each tileset
        // Resolve the relative image path from the map JSON's location
        let finalImagePathForLoader
        try {
          const imageUrl = new URL(tsDef.image, mapFileBaseUrl)
          finalImagePathForLoader = imageUrl.pathname // Path relative to public root (e.g., /assets/images/...)
        } catch (e) {
          console.error(
            `LoadingScene: Could not resolve image path "${tsDef.image}" relative to map "${this.mapJsonActualPath}". Error: ${e.message}`,
          )
          // Attempt to use the path as is, assuming it might be absolute from public root
          finalImagePathForLoader = tsDef.image.startsWith('/') ? tsDef.image : '/' + tsDef.image
        }

        // Use the original `tsDef.image` string (as found in JSON) as the unique asset key
        this.assetLoader.queueImage(tsDef.image, finalImagePathForLoader, 'tileset_images_dynamic')
        tilesetImagesToQueue++
        console.log(
          `LoadingScene: Queued tileset image using JSON key "${tsDef.image}" from resolved path "${finalImagePathForLoader}"`,
        )
      } else {
        console.warn(
          `LoadingScene: Tileset definition (name: ${tsDef.name || 'N/A'}, GID: ${tsDef.firstgid}, Source: ${tsDef.source || 'N/A'}) in mapData is missing 'image' property.`,
        )
      }
    })

    if (tilesetImagesToQueue > 0) {
      this.assetLoader
        .loadAll(this.tilesetImagesBatchId)
        .catch((error) =>
          this.handleError(`Failed to initiate tileset image loading: ${error.message || error}`),
        )
    } else {
      console.log('LoadingScene: No additional tileset images found in map data to load.')
      this.processPrefabsAndTransition()
    }
  }

  /** @private */
  processPrefabsAndTransition() {
    if (!this.engine || !this.prefabManager) return
    this.loadingStatusText = 'Finalizing assets. Processing prefabs...'
    this.currentBatchProgressText = ''

    let prefabsWereProcessed = false
    // Ensure the prefab JSON itself (e.g., 'entityPrefabs') was loaded in the globalAssetsBatch
    if (this.assetLoader.get(this.prefabsAssetKey)) {
      if (this.prefabManager.loadPrefabsFromAsset(this.prefabsAssetKey)) {
        console.log('LoadingScene: Entity prefabs processed by PrefabManager.')
        prefabsWereProcessed = true
      } else {
        console.warn(
          `LoadingScene: Prefab definitions ("${this.prefabsAssetKey}") could not be processed by PrefabManager, though file was loaded.`,
        )
      }
    } else {
      console.warn(
        `LoadingScene: Prefab JSON file ("${this.prefabsAssetKey}") not found in AssetLoader cache. Cannot process prefabs.`,
      )
    }

    this.allAssetsAndPrefabsReady = true
    this.loadingStatusText = 'Loading complete! Transitioning...'
    this.displayImage = this.assetLoader.get('testPlayer') // Example display image

    setTimeout(() => {
      const sceneManager = this.engine.getSceneManager()
      if (sceneManager) {
        sceneManager.switchTo('overworld', {
          assetsLoaded: true,
          prefabsReady: prefabsWereProcessed,
          message: 'All assets, dynamic tilesets, and prefabs processed.',
        })
      } else {
        console.error('LoadingScene: SceneManager not available for transition!')
      }
    }, 1000) // Shorter delay
  }

  handleError(errorMessage) {
    console.error('LoadingScene Error:', errorMessage)
    this.loadingError = errorMessage
    this.loadingStatusText = `ERROR: ${this.loadingError.substring(0, 100)}` // Keep error message brief for display
    this.currentBatchProgressText = ''
  }

  update(deltaTime, engine) {
    /* Progress text updated by events */
  }

  render(context, engine) {
    context.fillStyle = '#282828'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)
    context.font = '20px Arial'
    context.fillStyle = this.loadingError ? '#FF6B6B' : '#E0E0E0'
    context.textAlign = 'center'
    const mainMessageY = this.currentBatchProgressText
      ? context.canvas.height / 2 - 40
      : context.canvas.height / 2 - 10
    context.fillText(this.loadingStatusText, context.canvas.width / 2, mainMessageY)

    if (this.currentBatchProgressText && !this.loadingError) {
      context.font = '18px Arial'
      context.fillText(this.currentBatchProgressText, context.canvas.width / 2, mainMessageY + 25)
    }

    if (this.displayImage && this.displayImage.complete && this.displayImage.naturalWidth > 0) {
      const imgWidth = this.displayImage.width
      const imgHeight = this.displayImage.height
      const x = context.canvas.width / 2 - imgWidth / 2
      const y = mainMessageY + 60
      try {
        context.drawImage(this.displayImage, x, y, imgWidth, imgHeight)
      } catch (e) {
        /* ignore */
      }
    }
  }

  unload(engine) {
    console.log('LoadingScene: Unloaded. Removing event listeners.')
    if (this.eventManager) {
      this.eventManager.off('asset:progress', this._handleAssetProgress, this)
      this.eventManager.off('asset:batchStarted', this._handleBatchStarted, this)
      this.eventManager.off('asset:batchCompleted', this._handleBatchCompleted, this)
      this.eventManager.off('asset:error', this._handleAssetError, this)
    }
    this.displayImage = null
    this.engine = null
  }
}

export default LoadingScene
