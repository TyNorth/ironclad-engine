// src/game/scenes/OptionsMenuScene.js
// Assuming you might have a base Scene class, otherwise implement methods directly.
// import Scene from '../../engine/core/Scene.js'; // Example path

class OptionsMenuScene /* extends Scene */ {
  constructor() {
    // if (super) super(); // If extending a base class
    this.engine = null
    this.uiContext = null // To store the shared UI context
    // console.log("OptionsMenuScene: Constructor");
  }

  /**
   * Called when the scene instance is created and pushed onto the stack.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Data passed during pushScene, expected to contain uiContext.
   */
  async initialize(engine, data = {}) {
    this.engine = engine
    if (data.uiContext) {
      this.uiContext = data.uiContext
      // console.log("OptionsMenuScene: Initialized with UI Context:", JSON.stringify(this.uiContext));
    } else {
      console.warn(
        'OptionsMenuScene: Initialized without a UI Context! This might not be intended.',
      )
      // Initialize with default values or handle error if context is critical
      this.uiContext = { volume: 50, difficulty: 'Normal', showHints: true, changesMade: false }
    }

    // For demonstration, let's log the current settings
    this.displayCurrentSettings()

    // In a real UI, you'd set up buttons, sliders, etc. here.
  }

  displayCurrentSettings() {
    if (!this.uiContext) return
    console.log(`--- Options Menu ---`)
    console.log(`Current Volume: ${this.uiContext.volume}`)
    console.log(`Current Difficulty: ${this.uiContext.difficulty}`)
    console.log(`Show Hints: ${this.uiContext.showHints}`)
    console.log(
      `(Simulate input: '1' to decrease volume, '2' to increase, '3' to toggle hints, 'Escape' to go back)`,
    )
  }

  /**
   * Called every frame if this scene is the active (top) one.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  update(deltaTime, engine) {
    if (!this.uiContext) return

    // Simulate changing settings with keyboard input for this test
    if (engine.inputManager.isKeyJustPressed('Digit1')) {
      // Decrease volume
      this.uiContext.volume = Math.max(0, this.uiContext.volume - 10)
      this.uiContext.changesMade = true
      console.log(`OptionsMenuScene: Volume changed to ${this.uiContext.volume}`)
      this.displayCurrentSettings() // Re-log to show change
    } else if (engine.inputManager.isKeyJustPressed('Digit2')) {
      // Increase volume
      this.uiContext.volume = Math.min(100, this.uiContext.volume + 10)
      this.uiContext.changesMade = true
      console.log(`OptionsMenuScene: Volume changed to ${this.uiContext.volume}`)
      this.displayCurrentSettings()
    } else if (engine.inputManager.isKeyJustPressed('Digit3')) {
      // Toggle Hints
      this.uiContext.showHints = !this.uiContext.showHints
      this.uiContext.changesMade = true
      console.log(`OptionsMenuScene: Show Hints changed to ${this.uiContext.showHints}`)
      this.displayCurrentSettings()
    }

    // Go back (pop this scene)
    if (engine.inputManager.isActionJustPressed('cancel')) {
      // 'cancel' usually mapped to Escape
      // console.log("OptionsMenuScene: 'cancel' action, popping self.");
      // No need to pass data in popScene, as changes are made directly to the shared uiContext.
      engine.sceneManager.popScene()
    }
  }

  /**
   * Called every frame to draw the scene.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  render(context, engine) {
    // For a real UI, you'd render text and interactive elements here.
    // For this test, we'll keep it simple and rely on console logs.
    // You could add a minimal visual indicator if you like:

    context.fillStyle = 'rgba(30, 30, 30, 0.9)' // Darker overlay than pause
    context.fillRect(0, 0, engine.canvas.width, engine.canvas.height)

    context.fillStyle = 'white'
    context.font = '36px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('Options Menu', engine.canvas.width / 2, engine.canvas.height / 2 - 100)

    if (this.uiContext) {
      context.font = '20px sans-serif'
      context.fillText(
        `Volume: ${this.uiContext.volume} (Press 1/2 to change)`,
        engine.canvas.width / 2,
        engine.canvas.height / 2 - 20,
      )
      context.fillText(
        `Hints: ${this.uiContext.showHints ? 'ON' : 'OFF'} (Press 3 to toggle)`,
        engine.canvas.width / 2,
        engine.canvas.height / 2 + 20,
      )
      context.fillText(
        `Press ESC to Go Back`,
        engine.canvas.width / 2,
        engine.canvas.height / 2 + 80,
      )
    }
  }

  /**
   * Called when the scene is popped from the stack.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async unload(engine) {
    // console.log("OptionsMenuScene: Unloaded. Final UI Context:", JSON.stringify(this.uiContext));
    // Clean up any listeners or resources specific to this scene if needed.
  }
}

export default OptionsMenuScene
