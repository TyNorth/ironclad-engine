// src/main.js

/**
 * @file main.js
 * @description The main entry point for Tartu Legends.
 * Initializes Vue, then initializes and starts the IroncladEngine,
 * defines input actions, and registers ECS systems.
 */

import { createApp } from 'vue'
import App from './App.vue' // Your root Vue component
import IroncladEngine from './engine/core/IroncladEngine.js' // The main engine class

// Import your game scenes
import LoadingScene from './game/scenes/LoadingScene.js'
import StartScene from './game/scenes/StartScene.js'
import OverworldScene from './game/scenes/OverworldScene.js'

// Import game-specific ECS systems
import MovementSystem from './game/systems/MovementSystem.js' // 1. Import MovementSystem

// Import Pinia if you're using it
import { createPinia } from 'pinia'

// Initialize Vue App
const vueApp = createApp(App)
vueApp.use(createPinia())
vueApp.mount('#app') // Mount Vue to the div with id="app" in your index.html

// --- Game Engine Initialization ---
// Wait for Vue to mount and DOM to be ready
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

    let engine // Will hold the IroncladEngine instance
    try {
      console.log('main.js: Initializing IroncladEngine...')
      engine = new IroncladEngine({
        canvas: canvasElement,
        width: canvasWidth,
        height: canvasHeight,
        assetManifestPath: assetManifestPath,
        sceneRegistry: gameSceneRegistry,
      })

      // window.gameEngine is set by IroncladEngine's constructor
      if (window.gameEngine) {
        window.gameEngine.vueApp = vueApp // Optionally attach Vue app
      }
      console.log('main.js: IroncladEngine initialized successfully.')

      // --- Define Game Input Actions ---
      if (window.gameEngine && typeof window.gameEngine.getInputManager === 'function') {
        const inputManager = window.gameEngine.getInputManager()
        inputManager.defineAction('moveUp', ['KeyW', 'ArrowUp'])
        inputManager.defineAction('moveDown', ['KeyS', 'ArrowDown'])
        inputManager.defineAction('moveLeft', ['KeyA', 'ArrowLeft'])
        inputManager.defineAction('moveRight', ['KeyD', 'ArrowRight'])
        inputManager.defineAction('menuUp', ['ArrowUp'])
        inputManager.defineAction('menuDown', ['ArrowDown'])
        inputManager.defineAction('menuConfirm', ['Enter', 'Space'])
        inputManager.defineAction('menuCancel', ['Escape'])
        console.log('main.js: Game input actions defined in InputManager.')
      } else {
        console.error('main.js: Could not get InputManager from gameEngine to define actions.')
      }

      // --- Register ECS Systems ---
      // Ensure 'engine' instance is used here, which is the same as window.gameEngine
      if (engine && typeof engine.registerSystem === 'function') {
        engine.registerSystem(new MovementSystem(), 10) // 2. Register MovementSystem (priority 10)
        // Register other systems here later, e.g.:
        // engine.registerSystem(new RenderSystem(), 100);
        // engine.registerSystem(new AISystem(), 20);
      } else {
        console.error(
          'main.js: Could not register MovementSystem, engine or registerSystem not available.',
        )
      }
    } catch (error) {
      console.error(
        'Fatal Error: Failed to initialize IroncladEngine, define actions, or register systems:',
        error,
      )
      alert(`Fatal Engine Error: ${error.message}. Check console for details.`)
      // ... (canvas error display logic) ...
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
