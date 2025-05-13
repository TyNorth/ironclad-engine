// src/game/scenes/StartScene.js

/**
 * @file StartScene.js
 * @description The main starting menu scene for Tartu Legends.
 * Uses InputManager (via the passed engine instance) for menu navigation.
 */

class StartScene {
  constructor() {
    /**
     * @private
     * @type {import('../../engine/core/IroncladEngine.js').default | null}
     */
    this.engine = null // Will be set in initialize
    /**
     * @private
     * @type {import('../../engine/core/InputManager.js').default | null}
     */
    this.inputManager = null
    /**
     * @private
     * @type {import('../../engine/core/SceneManager.js').default | null}
     */
    this.sceneManager = null

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
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {object} [data={}] - Optional data passed during scene transition.
   */
  initialize(engine, context, data = {}) {
    console.log(`StartScene: Initializing with engine. Received data:`, data)
    this.engine = engine
    this.selectedOptionIndex = 0

    if (!this.engine) {
      console.error('StartScene: Engine instance not provided to initialize!')
      // Potentially set a flag to prevent updates/renders if engine is crucial
      return
    }

    this.inputManager = this.engine.getInputManager()
    this.sceneManager = this.engine.getSceneManager()

    if (!this.inputManager) {
      console.error('StartScene: InputManager not available via engine instance!')
    }
    if (!this.sceneManager) {
      console.error('StartScene: SceneManager not available via engine instance!')
    }

    if (data && data.message) {
      console.log(`StartScene received message: ${data.message}`)
    }
  }

  /**
   * Updates the scene's logic.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  update(deltaTime, engine) {
    // engine parameter is available if needed
    if (!this.inputManager) {
      return
    }

    if (this.inputManager.isActionJustPressed('menuUp')) {
      // Using action defined in main.js
      this.selectedOptionIndex--
      if (this.selectedOptionIndex < 0) {
        this.selectedOptionIndex = this.menuOptions.length - 1
      }
    } else if (this.inputManager.isActionJustPressed('menuDown')) {
      // Using action
      this.selectedOptionIndex++
      if (this.selectedOptionIndex >= this.menuOptions.length) {
        this.selectedOptionIndex = 0
      }
    }

    if (this.inputManager.isActionJustPressed('menuConfirm')) {
      // Using action
      this.handleMenuSelection()
    }
  }

  /**
   * Renders the scene.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  render(context, engine) {
    // engine parameter is available if needed
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

  /**
   * Cleans up when the scene is exited.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  unload(engine) {
    // engine parameter is available if needed
    console.log('StartScene: Unloaded.')
    this.engine = null // Clear engine reference
  }

  /** @private */
  handleMenuSelection() {
    const selected = this.menuOptions[this.selectedOptionIndex]
    console.log(`StartScene: Selected option: "${selected}" (Index: ${this.selectedOptionIndex})`)

    if (!this.sceneManager) {
      // sceneManager should be set during initialize
      console.error('StartScene: SceneManager not available for action handling!')
      return
    }

    switch (this.selectedOptionIndex) {
      case 0: // Start New Game
        console.log('StartScene: "Start New Game" selected. Transitioning to Overworld...')
        // Assuming 'overworld' assets are loaded by the initial LoadingScene
        this.sceneManager.switchTo('overworld', { newGame: true, from: 'StartScene' })
        break
      default:
        console.log(`StartScene: Action for "${selected}" not yet implemented.`)
        break
    }
  }
}

export default StartScene
