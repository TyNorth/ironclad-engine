// src/game/scenes/StartScene.js

/**
 * @file StartScene.js
 * @description The main starting menu scene for Tartu Legends.
 * Uses InputManager (via IroncladEngine API) for menu navigation.
 */

class StartScene {
  constructor() {
    /**
     * @private
     * @type {import('../../engine/core/InputManager.js').default | null}
     */
    this.inputManager = null
    /**
     * @private
     * @type {import('../../engine/core/SceneManager.js').default | null}
     */
    this.sceneManager = null // Store SceneManager for convenience

    /** @private @type {string} */
    this.titleText = 'Tartu Legends'

    /** @private @type {Array<string>} */
    this.menuOptions = [
      'Start New Game',
      'Continue (Not Implemented)',
      'Load Game (Not Implemented)',
      'Options (Not Implemented)',
    ]
    /** @private @type {number} */
    this.selectedOptionIndex = 0

    console.log('StartScene: Constructor called')
  }

  /**
   * Initializes the scene.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {object} [data={}] - Optional data passed during scene transition.
   */
  initialize(context, data = {}) {
    console.log(`StartScene: Initialized with data:`, data)
    this.selectedOptionIndex = 0

    if (window.gameEngine) {
      if (typeof window.gameEngine.getInputManager === 'function') {
        this.inputManager = window.gameEngine.getInputManager()
      } else {
        console.error('StartScene: InputManager getter not found on gameEngine!')
      }
      if (typeof window.gameEngine.getSceneManager === 'function') {
        this.sceneManager = window.gameEngine.getSceneManager()
      } else {
        console.error('StartScene: SceneManager getter not found on gameEngine!')
      }
    } else {
      console.error('StartScene: window.gameEngine is not defined! Core systems unavailable.')
    }

    if (data && data.message) {
      console.log(`StartScene received message: ${data.message}`)
    }
  }

  /**
   * Updates the scene's logic.
   * @param {number} deltaTime - The time elapsed since the last frame.
   */
  update(deltaTime) {
    if (!this.inputManager) {
      return
    }

    if (this.inputManager.isKeyJustPressed('ArrowUp')) {
      this.selectedOptionIndex--
      if (this.selectedOptionIndex < 0) {
        this.selectedOptionIndex = this.menuOptions.length - 1
      }
      // console.log('StartScene: Navigated Up, selected index:', this.selectedOptionIndex);
    } else if (this.inputManager.isKeyJustPressed('ArrowDown')) {
      this.selectedOptionIndex++
      if (this.selectedOptionIndex >= this.menuOptions.length) {
        this.selectedOptionIndex = 0
      }
      // console.log('StartScene: Navigated Down, selected index:', this.selectedOptionIndex);
    }

    if (
      this.inputManager.isKeyJustPressed('Enter') ||
      this.inputManager.isKeyJustPressed('Space')
    ) {
      this.handleMenuSelection()
    }
  }

  /**
   * Renders the scene.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   */
  render(context) {
    context.fillStyle = '#301040'
    context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    context.font = '48px "Times New Roman", serif'
    context.fillStyle = '#FFDF80'
    context.textAlign = 'center'
    context.fillText(this.titleText, context.canvas.width / 2, context.canvas.height / 4)

    context.font = '28px Arial, sans-serif'
    const startY = context.canvas.height / 2
    const lineHeight = 45

    this.menuOptions.forEach((option, index) => {
      if (index === this.selectedOptionIndex) {
        context.fillStyle = '#FFFFFF'
        context.fillText(`> ${option} <`, context.canvas.width / 2, startY + index * lineHeight)
      } else {
        context.fillStyle = '#AAAAAA'
        context.fillText(option, context.canvas.width / 2, startY + index * lineHeight)
      }
    })

    context.font = '16px Arial'
    context.fillStyle = '#CCCCCC'
    context.fillText(
      'Use Arrow Keys to navigate, Enter/Space to select.',
      context.canvas.width / 2,
      context.canvas.height - 30,
    )
  }

  unload() {
    console.log('StartScene: Unloaded.')
  }

  /** @private */
  handleMenuSelection() {
    const selected = this.menuOptions[this.selectedOptionIndex]
    console.log(`StartScene: Selected option: "${selected}" (Index: ${this.selectedOptionIndex})`)

    if (!this.sceneManager) {
      console.error('StartScene: SceneManager not available for action handling!')
      return
    }

    switch (this.selectedOptionIndex) {
      case 0: // Start New Game
        console.log('StartScene: "Start New Game" selected. Transitioning to Overworld...')
        // If 'loading' scene has already run and loaded all assets including those for overworld,
        // we can switch directly. If not, 'loading' should be the target.
        // Our current LoadingScene loads based on manifest and then switches to 'overworld'.
        // So, if StartScene is reached AFTER LoadingScene, 'overworld' assets should be ready.
        this.sceneManager.switchTo('overworld', { newGame: true, from: 'StartScene' })
        break
      // Add other cases for Continue, Load Game, Options later
      default:
        console.log(`StartScene: Action for "${selected}" not yet implemented.`)
        break
    }
  }
}

export default StartScene
