// src/main.js

/**
 * @file main.js
 * @description The main entry point for Tartu Legends.
 * Initializes Vue, then initializes and starts the IroncladEngine, and defines input actions.
 */

import { createApp } from 'vue'
import App from './App.vue'
import IroncladEngine from './engine/core/IroncladEngine.js'

// Import your game scenes
import LoadingScene from './game/scenes/LoadingScene.js'
import StartScene from './game/scenes/StartScene.js'
import OverworldScene from './game/scenes/OverworldScene.js'

import { createPinia } from 'pinia'

const vueApp = createApp(App)
vueApp.use(createPinia())
vueApp.mount('#app')

Promise.resolve()
  .then(() => {
    const canvasElement = document.getElementById('game-canvas')
    if (!canvasElement) {
      console.error('Fatal Error: Canvas element with ID "game-canvas" not found in the DOM.')
      alert('Fatal Error: Canvas element not found. Game cannot start.')
      return
    }
    console.log('main.js: Canvas element retrieved:', canvasElement)

    const canvasWidth = 800
    const canvasHeight = 600

    const gameSceneRegistry = {
      loading: LoadingScene,
      start: StartScene,
      overworld: OverworldScene,
    }

    const assetManifestPath = '/assets/data/asset-manifest.json'

    let engine
    try {
      console.log('main.js: Initializing IroncladEngine...')
      engine = new IroncladEngine({
        canvas: canvasElement,
        width: canvasWidth,
        height: canvasHeight,
        assetManifestPath: assetManifestPath,
        sceneRegistry: gameSceneRegistry,
      })

      if (window.gameEngine) {
        window.gameEngine.vueApp = vueApp
      }
      console.log('main.js: IroncladEngine initialized successfully.')

      // --- Define Game Input Actions ---
      // This should happen after engine (and thus InputManager) is initialized.
      if (window.gameEngine && typeof window.gameEngine.getInputManager === 'function') {
        const inputManager = window.gameEngine.getInputManager()

        // Player Movement Actions
        inputManager.defineAction('moveUp', ['KeyW', 'ArrowUp'])
        inputManager.defineAction('moveDown', ['KeyS', 'ArrowDown'])
        inputManager.defineAction('moveLeft', ['KeyA', 'ArrowLeft'])
        inputManager.defineAction('moveRight', ['KeyD', 'ArrowRight'])

        // Menu Navigation & Interaction Actions
        inputManager.defineAction('menuUp', ['ArrowUp']) // Can reuse ArrowUp or have distinct if needed later
        inputManager.defineAction('menuDown', ['ArrowDown']) // Can reuse ArrowDown
        inputManager.defineAction('menuConfirm', ['Enter', 'Space'])
        inputManager.defineAction('menuCancel', ['Escape']) // Example for a cancel action

        console.log('main.js: Game input actions defined.')
      } else {
        console.error('main.js: Could not get InputManager from gameEngine to define actions.')
      }
    } catch (error) {
      console.error('Fatal Error: Failed to initialize IroncladEngine or define actions:', error)
      alert(`Fatal Engine Error: ${error.message}. Check console for details.`)
      // ... (canvas error display logic from before) ...
      try {
        const ctx = canvasElement.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight)
          ctx.fillStyle = 'black'
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)
          ctx.font = '16px Arial'
          ctx.fillStyle = 'red'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('FATAL ENGINE ERROR. Check console.', canvasWidth / 2, canvasHeight / 2 - 10)
          ctx.font = '12px Arial'
          ctx.fillText(error.message, canvasWidth / 2, canvasHeight / 2 + 10)
        }
      } catch (canvasError) {
        /* Silently fail */
      }
      return
    }

    // Start the engine with the initial scene
    try {
      engine.start('loading', { gameName: 'Tartu Legends' })
    } catch (error) {
      console.error('Fatal Error: Failed to start IroncladEngine with initial scene:', error)
      alert(`Fatal Engine Start Error: ${error.message}. Check console for details.`)
    }
  })
  .catch((error) => {
    console.error('Error during global initialization sequence (Promise.resolve):', error)
    alert(`Global Initialization Error: ${error.message}. Check console for details.`)
  })
