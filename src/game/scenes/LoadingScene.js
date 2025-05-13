// src/game/scenes/LoadingScene.js

/**
 * @file LoadingScene.js
 * @description Loads the asset manifest, then all assets listed in the manifest.
 * Uses the IroncladEngine API.
 */

class LoadingScene {
  constructor() {
    /** @private @type {import('../../engine/core/AssetLoader.js').default | null} */
    this.assetLoader = null
    /** @private @type {string | null} */
    this.assetManifestPath = null

    /** @private @type {string} */
    this.loadingProgressText = 'Initializing...'
    /** @private @type {string} */
    this.currentLoadingStage = '' // e.g., 'manifest', 'assets'

    /** @private @type {boolean} */
    this.manifestLoaded = false
    /** @private @type {boolean} */
    this.allGameAssetsLoaded = false
    /** @private @type {string | null} */
    this.loadingError = null
    /** @private @type {HTMLImageElement | null} */
    this.displayImage = null // An image to display during loading, if any

    console.log('LoadingScene: Constructor called')
  }

  /**
   * Initializes the scene.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {object} [data={}] - Optional data, expected to contain `assetManifestPath`.
   */
  initialize(context, data = {}) {
    console.log(`LoadingScene: Initialized with data:`, data)
    this.manifestLoaded = false
    this.allGameAssetsLoaded = false
    this.loadingError = null
    this.displayImage = null
    this.currentLoadingStage = 'manifest'
    this.loadingProgressText = 'Preparing to load asset manifest...'

    if (!data.assetManifestPath) {
      this.handleError('Asset Manifest Path not provided to LoadingScene!')
      return
    }
    this.assetManifestPath = data.assetManifestPath

    if (window.gameEngine && typeof window.gameEngine.getAssetLoader === 'function') {
      this.assetLoader = window.gameEngine.getAssetLoader()
    } else {
      this.handleError('AssetLoader not available via gameEngine!')
      return
    }

    // --- Stage 1: Load the Asset Manifest ---
    console.log(`LoadingScene: Queuing asset manifest from: ${this.assetManifestPath}`)
    this.assetLoader.queueJSON('initialAssetManifest', this.assetManifestPath)
    this.updateProgressText()

    this.assetLoader
      .loadAll()
      .then(() => {
        this.manifestLoaded = true
        const manifest = this.assetLoader.get('initialAssetManifest')
        if (!manifest) {
          this.handleError('Failed to load or parse the asset manifest!')
          return
        }
        console.log('LoadingScene: Asset Manifest loaded successfully:', manifest)
        this.currentLoadingStage = 'game_assets'
        this.loadingProgressText = 'Manifest loaded. Queuing game assets...'
        this.updateProgressText() // Update with 0% for next stage

        // --- Stage 2: Queue assets from the manifest ---
        let assetsToLoadFromManifest = 0

        if (manifest.images && Array.isArray(manifest.images)) {
          manifest.images.forEach((imgDef) => {
            if (imgDef.name && imgDef.path) {
              this.assetLoader.queueImage(imgDef.name, imgDef.path)
              assetsToLoadFromManifest++
            }
          })
        }
        if (manifest.jsonFiles && Array.isArray(manifest.jsonFiles)) {
          manifest.jsonFiles.forEach((jsonDef) => {
            if (jsonDef.name && jsonDef.path) {
              this.assetLoader.queueJSON(jsonDef.name, jsonDef.path)
              assetsToLoadFromManifest++
            }
          })
        }
        // Add other asset types here (e.g., audio) in the future

        if (assetsToLoadFromManifest > 0) {
          console.log(
            `LoadingScene: Queued ${assetsToLoadFromManifest} assets from manifest. Starting load...`,
          )
          return this.assetLoader.loadAll() // Returns a new promise for this batch
        } else {
          console.log('LoadingScene: No assets listed in the manifest to load.')
          return Promise.resolve() // Nothing more to load from manifest
        }
      })
      .then(() => {
        // This .then() is for the promise returned by loading assets *from the manifest*
        if (this.loadingError) return // If manifest loading failed, error already handled.

        console.log('LoadingScene: All game assets from manifest loaded successfully!')
        this.allGameAssetsLoaded = true
        this.loadingProgressText = 'All assets loaded! Transitioning...'

        // Optionally try to get a specific image to display from the manifest
        this.displayImage = this.assetLoader.get('testPlayer') // Assuming 'testPlayer' is in your manifest

        setTimeout(() => {
          if (window.gameEngine && typeof window.gameEngine.getSceneManager === 'function') {
            const sceneManager = window.gameEngine.getSceneManager()
            sceneManager.switchTo('overworld', {
              // Or 'start' if you prefer start menu after loading
              assetsLoaded: true,
              message: 'All assets from manifest loaded successfully.',
            })
          } else {
            console.error('LoadingScene: SceneManager not available for transition!')
          }
        }, 1500)
      })
      .catch((error) => {
        // This catch handles errors from EITHER the manifest loading OR asset loading stage
        this.handleError(`Error during asset loading process: ${error.message || error}`)
      })
  }

  /** @private */
  updateProgressText() {
    if (!this.assetLoader || this.loadingError) return
    const progressData = this.assetLoader.getProgress()
    const percentage = Math.round(progressData.progress * 100)
    if (this.currentLoadingStage === 'manifest' && !this.manifestLoaded) {
      this.loadingProgressText = `Loading manifest... (${progressData.loaded}/${progressData.total}) ${percentage}%`
    } else if (this.currentLoadingStage === 'game_assets' && !this.allGameAssetsLoaded) {
      this.loadingProgressText = `Loading game assets... (${progressData.loaded}/${progressData.total}) ${percentage}%`
    }
  }

  /** @private */
  handleError(errorMessage) {
    console.error('LoadingScene:', errorMessage)
    this.loadingError = errorMessage
    this.loadingProgressText = `ERROR: ${this.loadingError}`
  }

  update(deltaTime) {
    if (!this.allGameAssetsLoaded && !this.loadingError && this.assetLoader) {
      this.updateProgressText()
    }
  }

  render(context) {
    context.fillStyle = '#282828'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    context.font = '20px Arial'
    context.fillStyle = this.loadingError ? '#FF6B6B' : '#E0E0E0'
    context.textAlign = 'center'
    context.fillText(
      this.loadingProgressText,
      context.canvas.width / 2,
      context.canvas.height / 2 - 30,
    )

    if (this.displayImage && this.displayImage.complete && this.displayImage.naturalWidth > 0) {
      const imgWidth = this.displayImage.width * 2 // Or use actual sprite dimensions
      const imgHeight = this.displayImage.height * 2
      const x = context.canvas.width / 2 - imgWidth / 2
      const y = context.canvas.height / 2 + 20
      try {
        context.drawImage(this.displayImage, x, y, imgWidth, imgHeight)
      } catch (e) {
        /*Already logged by asset loader if image is broken */
      }
    }
  }

  unload() {
    console.log('LoadingScene: Unloaded.')
    this.displayImage = null
  }
}

export default LoadingScene
