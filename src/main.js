// src/main.js

/**
 * @file main.js
 * @description The main entry point for the Vite Vue application.
 * Initializes Vue, sets up the game canvas, SceneManager, AssetLoader, InputManager, and starts the GameLoop.
 */

import { createApp } from 'vue'
import App from './App.vue'
import GameLoop from './engine/core/GameLoop.js'
import SceneManager from './engine/core/SceneManager.js'
import AssetLoader from './engine/core/AssetLoader.js'
import InputManager from './engine/core/InputManager.js'
import LoadingScene from './game/scenes/LoadingScene.js'
import StartScene from './game/scenes/StartScene.js'
import OverworldScene from './game/scenes/OverworldScene.js' // 1. Import OverworldScene
// Remove: import TilemapTestScene from './game/scenes/TilemapTestScene.js';
import { createPinia } from 'pinia'

const vueApp = createApp(App)
vueApp.use(createPinia())
vueApp.mount('#app')

Promise.resolve()
  .then(() => {
    const canvas = document.getElementById('game-canvas')
    if (!canvas) {
      console.error('Fatal Error: Canvas element with ID "game-canvas" not found in the DOM.')
      return
    }
    console.log('main.js: Canvas element retrieved:', canvas)

    canvas.width = 800
    canvas.height = 600
    console.log(`main.js: Canvas dimensions set to ${canvas.width}x${canvas.height}`)

    const context = canvas.getContext('2d')
    if (!context) {
      console.error('Fatal Error: Failed to get 2D rendering context from canvas.')
      return
    }
    console.log('main.js: Canvas 2D context retrieved.')

    // --- Core Engine Systems Instantiation ---
    const assetLoader = new AssetLoader()
    console.log('main.js: AssetLoader instantiated.')

    const inputManager = new InputManager()
    console.log('main.js: InputManager instantiated.')

    const sceneManager = new SceneManager()
    sceneManager.setContext(context)
    console.log('main.js: SceneManager instantiated and context set.')

    // Instantiate scenes
    const loadingScene = new LoadingScene()
    const startScene = new StartScene()
    const overworldScene = new OverworldScene() // 2. Instantiate OverworldScene
    // Remove: const tilemapTestScene = new TilemapTestScene();

    sceneManager.add('loading', loadingScene)
    sceneManager.add('start', startScene)
    sceneManager.add('overworld', overworldScene) // 3. Add OverworldScene to SceneManager
    // Remove: sceneManager.add('tilemapTest', tilemapTestScene);

    // --- Setup Global Game Object ---
    window.game = {
      canvas: canvas,
      context: context,
      sceneManager: sceneManager,
      assetLoader: assetLoader,
      inputManager: inputManager,
      vueApp: vueApp,
      loop: null,
    }
    console.log('main.js: window.game object initialized with core systems.')

    // --- Initial Scene ---
    sceneManager.switchTo('loading', { message: 'Welcome to the Game!' })

    // --- GameLoop Setup ---
    const gameLoop = new GameLoop(
      (deltaTime) => {
        sceneManager.update(deltaTime)
        inputManager.update()
      },
      () => sceneManager.render(),
    )

    window.game.loop = gameLoop
    console.log('main.js: GameLoop instance assigned to window.game.loop.')

    gameLoop.start()
  })
  .catch((error) => {
    console.error('Error during engine initialization:', error)
  })
