// src/game/scenes/LoadingScene.js

/**
 * @file LoadingScene.js
 * @description Loads the asset manifest, then all assets listed,
 * and then initializes the PrefabManager. Uses engine instance passed to methods.
 */

class LoadingScene {
  constructor() {
    /** @private @type {import('../../engine/core/IroncladEngine.js').default | null} */
    this.engine = null // Will be set in initialize
    /** @private @type {import('../../engine/core/AssetLoader.js').default | null} */
    this.assetLoader = null
    /** @private @type {import('../../engine/core/EventManager.js').default | null} */
    this.eventManager = null
    /** @private @type {import('../../engine/ecs/PrefabManager.js').default | null} */
    this.prefabManager = null

    /** @private @type {string | null} */
    this.assetManifestPath = null // Will get from engine or data

    /** @private @type {string} */
    this.loadingStatusText = 'Initializing...'
    /** @private @type {string} */
    this.currentBatchProgressText = ''
    /** @private @type {string | null} */
    this.manifestBatchId = 'manifest_load_batch'
    /** @private @type {string | null} */
    this.gameAssetsBatchId = 'game_assets_load_batch'

    /** @private @type {boolean} */
    this.allAssetsAndPrefabsReady = false
    /** @private @type {string | null} */
    this.loadingError = null
    /** @private @type {HTMLImageElement | null} */
    this.displayImage = null

    // Bind event handlers
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
   * @param {object} [data={}] - Optional data (assetManifestPath is expected here from IroncladEngine.start).
   */
  initialize(engine, context, data = {}) {
    console.log(`LoadingScene: Initializing with engine and data:`, data)
    this.engine = engine
    this.allAssetsAndPrefabsReady = false
    this.loadingError = null
    this.displayImage = null
    this.currentLoadingStage = 'manifest'
    this.loadingStatusText = 'Preparing asset manifest...'
    this.currentBatchProgressText = ''

    if (!this.engine) {
      this.handleError('Engine instance not provided to LoadingScene initialize!')
      return
    }

    this.assetLoader = this.engine.getAssetLoader()
    this.eventManager = this.engine.getEventManager()
    this.prefabManager = this.engine.getPrefabManager()

    if (!this.assetLoader || !this.eventManager || !this.prefabManager) {
      this.handleError(
        'Core engine systems (AssetLoader, EventManager, PrefabManager) missing or not gettable from engine!',
      )
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
    this.assetLoader.queueJSON('initialAssetManifest', this.assetManifestPath, 'manifest_group') // Added group
    this.assetLoader.loadAll(this.manifestBatchId).catch((error) => {
      this.handleError(`Failed to initiate manifest loading: ${error.message || error}`)
    })
  }

  /** @private */
  _handleAssetProgress(data) {
    if (data.batchId === this.manifestBatchId && !this.allAssetsAndPrefabsReady) {
      this.loadingStatusText = `Loading manifest...`
    } else if (data.batchId === this.gameAssetsBatchId && !this.allAssetsAndPrefabsReady) {
      this.loadingStatusText = `Loading game assets...`
    }
    const percentage =
      data.total > 0
        ? Math.round((data.loaded / data.total) * 100)
        : data.status === 'cached' || data.status === 'loaded'
          ? 100
          : 0
    this.currentBatchProgressText = `(${data.loaded}/${data.total}) ${percentage}%`
  }

  /** @private */
  _handleBatchStarted(data) {
    console.log(`LoadingScene: Batch "${data.batchId}" started, ${data.totalAssets} assets total.`)
    if (data.batchId === this.manifestBatchId) {
      this.loadingStatusText = `Loading manifest...`
    } else if (data.batchId === this.gameAssetsBatchId) {
      this.loadingStatusText = `Loading game assets...`
    }
    this.currentBatchProgressText = `(0/${data.totalAssets}) 0%`
  }

  /** @private */
  _handleBatchCompleted(data) {
    console.log(`LoadingScene: Batch "${data.batchId}" completed. Success: ${data.success}`)
    if (!this.engine) return // Should not happen if initialize worked

    if (!data.success) {
      this.handleError(`Asset batch "${data.batchId}" failed to load completely.`)
      return
    }

    if (data.batchId === this.manifestBatchId) {
      const manifest = this.assetLoader.get('initialAssetManifest')
      if (!manifest) {
        this.handleError('Manifest data not found after manifest batch load!')
        return
      }
      console.log('LoadingScene: Asset Manifest processed. Queuing game assets from manifest...')
      this.loadingStatusText = 'Manifest loaded. Queuing game assets...'
      this.currentBatchProgressText = ''

      let assetsToLoadFromManifest = 0
      if (manifest.images && Array.isArray(manifest.images)) {
        manifest.images.forEach((imgDef) => {
          /* ... queueImage ... */
          if (imgDef.name && imgDef.path) {
            this.assetLoader.queueImage(imgDef.name, imgDef.path, 'game_assets')
            assetsToLoadFromManifest++
          }
        })
      }
      if (manifest.jsonFiles && Array.isArray(manifest.jsonFiles)) {
        manifest.jsonFiles.forEach((jsonDef) => {
          /* ... queueJSON ... */
          if (jsonDef.name && jsonDef.path) {
            this.assetLoader.queueJSON(jsonDef.name, jsonDef.path, 'game_assets')
            assetsToLoadFromManifest++
          }
        })
      }
      // Add audio etc. here later

      if (assetsToLoadFromManifest > 0) {
        this.assetLoader
          .loadAll(this.gameAssetsBatchId)
          .catch((error) =>
            this.handleError(`Failed to initiate game asset loading: ${error.message || error}`),
          )
      } else {
        this.processPrefabsAndTransition()
      }
    } else if (data.batchId === this.gameAssetsBatchId) {
      this.processPrefabsAndTransition()
    }
  }

  /** @private */
  processPrefabsAndTransition() {
    if (!this.engine) return
    this.loadingStatusText = 'Game assets loaded. Processing prefabs...'
    this.currentBatchProgressText = ''

    let prefabsWereProcessed = false
    if (this.prefabManager.loadPrefabsFromAsset('entityPrefabs')) {
      console.log('LoadingScene: Entity prefabs processed by PrefabManager.')
      prefabsWereProcessed = true
    } else {
      console.warn("LoadingScene: Prefab definitions ('entityPrefabs') could not be processed.")
    }

    this.allAssetsAndPrefabsReady = true
    this.loadingStatusText = 'Loading complete! Transitioning...'
    this.displayImage = this.assetLoader.get('testPlayer')

    setTimeout(() => {
      const sceneManager = this.engine.getSceneManager()
      if (sceneManager) {
        sceneManager.switchTo('overworld', {
          assetsLoaded: true,
          prefabsReady: prefabsWereProcessed,
          message: 'All assets and prefabs processed.',
        })
      } else {
        console.error('LoadingScene: SceneManager not available for transition!')
      }
    }, 1000)
  }

  /** @private */
  _handleAssetError(data) {
    console.error(
      `LoadingScene: Error loading asset "${data.name}" from "${data.path}". Group: ${data.group}. Error:`,
      data.error.message,
    )
  }

  handleError(errorMessage) {
    console.error('LoadingScene:', errorMessage)
    this.loadingError = errorMessage
    this.loadingStatusText = `ERROR: ${this.loadingError}`
    this.currentBatchProgressText = ''
  }

  /**
   * Update method for the scene.
   * @param {number} deltaTime - Time since last frame.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  update(deltaTime, engine) {
    // Progress text is updated by event handlers primarily.
  }

  /**
   * Render method for the scene.
   * @param {CanvasRenderingContext2D} context - The drawing context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  render(context, engine) {
    // ... (render logic remains the same: draws loadingStatusText, currentBatchProgressText, displayImage)
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

  /**
   * Called when the scene is unloaded.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  unload(engine) {
    console.log('LoadingScene: Unloaded. Removing event listeners.')
    if (this.eventManager) {
      // Use the stored eventManager instance
      this.eventManager.off('asset:progress', this._handleAssetProgress, this)
      this.eventManager.off('asset:batchStarted', this._handleBatchStarted, this)
      this.eventManager.off('asset:batchCompleted', this._handleBatchCompleted, this)
      this.eventManager.off('asset:error', this._handleAssetError, this)
    }
    this.displayImage = null
    this.engine = null // Clear engine reference
  }
}

export default LoadingScene
