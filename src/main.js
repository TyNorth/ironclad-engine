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
import InputManager from './engine/core/InputManager.js' // Import InputManager to access static constants

// Import your game scenes
import LoadingScene from './game/scenes/LoadingScene.js'
import StartScene from './game/scenes/StartScene.js'
import OverworldScene from './game/scenes/OverworldScene.js'
import PauseScene from './game/scenes/PauseScene.js'
import OptionsMenuScene from './game/scenes/OptionsMenuScene.js'
import HUDScene from './game/scenes/HUDScene.js'
import InventoryScene from './game/scenes/InventoryScene.js'

// Import ECS systems
import MovementSystem from './game/systems/MovementSystem.js'
import RenderSystem from './engine/ecs/systems/RenderSystem.js'
import AnimationSystem from './engine/ecs/systems/AnimationSystem.js'

// Import Physics System
// In main.js
import PhysicsSystem from './engine/physics/PhysicsSystem.js' // Adjust path
// ...
// Example priority, run before collision
import { createPinia } from 'pinia'

const vueApp = createApp(App)
vueApp.use(createPinia())
vueApp.mount('#app')

Promise.resolve()
  .then(() => {
    const canvasElement = document.getElementById('game-canvas')
    if (!canvasElement) {
      console.error("main.js: Canvas element with ID 'game-canvas' not found.")
      return
    }
    const canvasWidth = 800
    const canvasHeight = 600

    const gameSceneRegistry = {
      loading: LoadingScene,
      start: StartScene,
      overworld: OverworldScene,
      PauseScene: PauseScene, // Note: Consider consistent casing for scene names in registry
      OptionsMenuScene: OptionsMenuScene,
      HUDScene: HUDScene,
      InventoryScene: InventoryScene,
    }
    const assetManifestPath = '/assets/data/asset-manifest.json' // Ensure this path is correct for your dev server

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
        // For debugging access
        window.gameEngine.vueApp = vueApp
      }
      console.log('main.js: IroncladEngine initialized successfully.')

      // --- Define Game Input Actions ---
      // src/main.js
      // ... (other imports) ...

      // ... (Promise.resolve().then(() => { ... engine setup ... })) ...

      // --- Define Game Input Actions ---
      if (engine && engine.inputManager && typeof engine.inputManager.defineAction === 'function') {
        const inputManagerInstance = engine.inputManager

        // Standard Analog Stick Axes
        const GP_LSTICK_Y = InputManager.GP_AXIS_LEFT_STICK_Y // Typically Axis 1
        const GP_LSTICK_X = InputManager.GP_AXIS_LEFT_STICK_X // Typically Axis 0

        // Standard D-Pad Buttons
        const GP_DPAD_UP = InputManager.GP_BUTTON_DPAD_UP // Standard Button 12
        const GP_DPAD_DOWN = InputManager.GP_BUTTON_DPAD_DOWN // Standard Button 13
        const GP_DPAD_LEFT = InputManager.GP_BUTTON_DPAD_LEFT // Standard Button 14
        const GP_DPAD_RIGHT = InputManager.GP_BUTTON_DPAD_RIGHT // Standard Button 15

        console.log(
          'main.js: Defining input actions using standard D-Pad buttons and analog sticks...',
        )

        inputManagerInstance.defineAction('jump', [
          { type: 'key', code: 'Space' },
          { type: 'key', code: 'KeyX' }, // Common alternative jump key
          { type: 'gamepadButton', buttonIndex: InputManager.GP_BUTTON_A, padIndex: 0 }, // Standard A button
          // Note: D-Pad Up is now part of 'moveUp', not 'jump', for Octopath-style movement.
          // If you want D-Pad Up to ALSO jump, add its binding here too.
        ])

        inputManagerInstance.defineAction('moveUp', [
          { type: 'key', code: 'KeyW' },
          { type: 'key', code: 'ArrowUp' },
          // D-pad Up (using standard button mapping)
          { type: 'gamepadButton', buttonIndex: GP_DPAD_UP, padIndex: 0 },
          // Left Analog Stick Up
          {
            type: 'gamepadAxis',
            axisIndex: GP_LSTICK_Y,
            direction: -1,
            threshold: 0.4,
            padIndex: 0,
          },
        ])

        inputManagerInstance.defineAction('moveDown', [
          { type: 'key', code: 'KeyS' },
          { type: 'key', code: 'ArrowDown' },
          // D-pad Down (using standard button mapping)
          { type: 'gamepadButton', buttonIndex: GP_DPAD_DOWN, padIndex: 0 },
          // Left Analog Stick Down
          {
            type: 'gamepadAxis',
            axisIndex: GP_LSTICK_Y,
            direction: 1,
            threshold: 0.4,
            padIndex: 0,
          },
        ])

        inputManagerInstance.defineAction('moveLeft', [
          { type: 'key', code: 'KeyA' },
          { type: 'key', code: 'ArrowLeft' },
          // D-pad Left (using standard button mapping)
          { type: 'gamepadButton', buttonIndex: GP_DPAD_LEFT, padIndex: 0 },
          // Left Analog Stick Left
          {
            type: 'gamepadAxis',
            axisIndex: GP_LSTICK_X,
            direction: -1,
            threshold: 0.4,
            padIndex: 0,
          },
        ])

        inputManagerInstance.defineAction('moveRight', [
          { type: 'key', code: 'KeyD' },
          { type: 'key', code: 'ArrowRight' },
          // D-pad Right (using standard button mapping)
          { type: 'gamepadButton', buttonIndex: GP_DPAD_RIGHT, padIndex: 0 },
          // Left Analog Stick Right
          {
            type: 'gamepadAxis',
            axisIndex: GP_LSTICK_X,
            direction: 1,
            threshold: 0.4,
            padIndex: 0,
          },
        ])

        // Other actions (using standard button mappings)
        inputManagerInstance.defineAction('menuConfirm', [
          { type: 'key', code: 'Enter' },
          { type: 'key', code: 'Space' },
          { type: 'gamepadButton', buttonIndex: InputManager.GP_BUTTON_A, padIndex: 0 },
        ])
        inputManagerInstance.defineAction('menuCancel', [
          { type: 'key', code: 'Escape' },
          { type: 'gamepadButton', buttonIndex: InputManager.GP_BUTTON_B, padIndex: 0 },
        ])
        inputManagerInstance.defineAction('togglePause', [
          { type: 'key', code: 'KeyP' },
          { type: 'gamepadButton', buttonIndex: InputManager.GP_BUTTON_START, padIndex: 0 },
        ])
        inputManagerInstance.defineAction('cancel', [
          { type: 'key', code: 'Escape' },
          { type: 'gamepadButton', buttonIndex: InputManager.GP_BUTTON_B, padIndex: 0 },
        ])
        inputManagerInstance.defineAction('toggleInventory', [
          { type: 'key', code: 'KeyI' },
          { type: 'gamepadButton', buttonIndex: InputManager.GP_BUTTON_Y, padIndex: 0 },
        ])
        inputManagerInstance.defineAction('toggleDebug', [{ type: 'key', code: 'KeyC' }])

        console.log('main.js: Input actions defined.')
      } else {
        console.error('main.js: Engine or InputManager not available for defining actions.')
      }

      // ... (rest of try-catch and engine start as in your provided main.js)

      // --- Register ECS Systems ---
      if (engine && typeof engine.registerSystem === 'function') {
        engine.registerSystem(new MovementSystem(), 10)
        engine.registerSystem(new AnimationSystem(), 50)
        engine.registerSystem(new RenderSystem(), 100)
        engine.registerSystem(new PhysicsSystem(), 20)
      } else {
        console.error(
          'main.js: Could not register systems, engine or registerSystem not available.',
        )
      }
    } catch (error) {
      console.error(
        'Fatal Error: Failed to initialize IroncladEngine, define actions, or register systems:',
        error,
      )
      if (error.stack) console.error(error.stack)
      alert(`Fatal Engine Error: ${error.message}. Check console for details.`)
      return
    }

    // Start the engine
    try {
      engine.start('loading', { gameName: 'Tartu Legends' }) // Or 'start' or 'overworld' for direct testing
    } catch (error) {
      console.error('Error starting engine:', error)
      alert(`Engine Start Error: ${error.message}. Check console.`)
    }
  })
  .catch((error) => {
    console.error('Unhandled promise rejection in main.js setup:', error)
    alert(`Critical Setup Error: ${error.message}. Check console.`)
  })
