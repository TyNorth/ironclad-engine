// src/main.js

/**
 * @file main.js
 * @description The main entry point for Tartu Legends.
 * Initializes Vue, then initializes and starts the IroncladEngine,
 * defines input actions, and registers ECS systems.
 */

import { createApp } from 'vue'
import App from './App.vue'
import IroncladEngine from './engine/core/IroncladEngine.js'

// Import your game scenes
import LoadingScene from './game/scenes/LoadingScene.js'
import StartScene from './game/scenes/StartScene.js'
import OverworldScene from './game/scenes/OverworldScene.js'
import PauseScene from './game/scenes/PauseScene.js'

// Import ECS systems
import MovementSystem from './game/systems/MovementSystem.js' // Game-specific system
import RenderSystem from './engine/ecs/systems/RenderSystem.js' // Engine system
import AnimationSystem from './engine/ecs/systems/AnimationSystem.js' // 1. Import AnimationSystem

import { createPinia } from 'pinia'
import OptionsMenuScene from './game/scenes/OptionsMenuScene'

const vueApp = createApp(App)
vueApp.use(createPinia())
vueApp.mount('#app')

Promise.resolve()
  .then(() => {
    const canvasElement = document.getElementById('game-canvas')
    // ... (canvas setup as before) ...
    if (!canvasElement) {
      /* ... error ... */ return
    }
    const canvasWidth = 800
    const canvasHeight = 600

    const gameSceneRegistry = {
      /* ... scenes ... */ loading: LoadingScene,
      start: StartScene,
      overworld: OverworldScene,
      PauseScene: PauseScene,
      OptionsMenuScene,
    }
    const assetManifestPath = '/assets/data/asset-manifest.json'

    let engine
    try {
      console.log('main.js: Initializing IroncladEngine...')
      engine = new IroncladEngine({
        /* ...config... */ canvas: canvasElement,
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
      if (engine && typeof engine.getInputManager === 'function') {
        /* ... input actions ... */
        const inputManager = engine.getInputManager()
        inputManager.defineAction('moveUp', ['KeyW', 'ArrowUp'])
        inputManager.defineAction('moveDown', ['KeyS', 'ArrowDown'])
        inputManager.defineAction('moveLeft', ['KeyA', 'ArrowLeft'])
        inputManager.defineAction('moveRight', ['KeyD', 'ArrowRight'])
        inputManager.defineAction('menuUp', ['ArrowUp'])
        inputManager.defineAction('menuDown', ['ArrowDown'])
        inputManager.defineAction('menuConfirm', ['Enter', 'Space'])
        inputManager.defineAction('menuCancel', ['Escape'])
        inputManager.defineAction('togglePause', ['KeyP'])
        inputManager.defineAction('cancel', ['Escape'])
      }

      // --- Register ECS Systems ---
      if (engine && typeof engine.registerSystem === 'function') {
        engine.registerSystem(new MovementSystem(), 10)
        // 2. Register AnimationSystem - should run after movement/AI but before rendering updates sprite data
        engine.registerSystem(new AnimationSystem(), 50)
        engine.registerSystem(new RenderSystem(), 100) // RenderSystem runs later
      } else {
        console.error(
          'main.js: Could not register systems, engine or registerSystem not available.',
        )
      }
    } catch (error) {
      /* ... error handling ... */
      console.error(
        'Fatal Error: Failed to initialize IroncladEngine, define actions, or register systems:',
        error,
      )
      alert(`Fatal Engine Error: ${error.message}. Check console for details.`)
      return
    }

    // Start the engine
    try {
      engine.start('loading', { gameName: 'Tartu Legends' })
    } catch (error) {
      /* ... error handling ... */
    }
  })
  .catch((error) => {
    /* ... */
  })
