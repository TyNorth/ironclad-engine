// src/game/scenes/PauseMenuScene.js (or your actual path for PauseScene)
// Assuming you might have a base Scene class, otherwise implement methods directly.
// import Scene from '../../engine/core/Scene.js'; // Example path

class PauseMenuScene /* extends Scene */ {
  constructor() {
    // if (super) super(); // If extending a base class
    this.engine = null
    this.uiContext = null // To store the shared UI context
    // console.log("PauseMenuScene: Constructor");
  }

  /**
   * Called when the scene instance is created and pushed onto the stack.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Data passed during pushScene, expected to contain uiContext.
   */
  async initialize(engine, data = {}) {
    console.log(`PauseScene data: ${JSON.stringify(data)}`)
    this.engine = engine
    if (data.uiContext) {
      this.uiContext = data.uiContext
      // console.log("PauseMenuScene: Initialized with UI Context:", JSON.stringify(this.uiContext));
    } else {
      console.warn(
        'PauseMenuScene: Initialized without a UI Context! This is unexpected for this pattern.',
      )
      // Fallback or default if necessary, though the pushing scene should provide it.
      this.uiContext = { changesMade: false } // Minimal default
    }

    // For demonstration
    this.displayCurrentOptions()
  }

  displayCurrentOptions() {
    console.log(`--- Pause Menu ---`)
    if (this.uiContext && this.uiContext.playerName) {
      console.log(`Player: ${this.uiContext.playerName}`)
    }
    console.log(`(Simulate input: 'O' for Options, 'Esc' or 'P' to Resume Game)`)
  }

  /**
   * Called every frame if this scene is the active (top) one.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  update(deltaTime, engine) {
    // Option to go to OptionsMenuScene
    // For this test, let's use the 'O' key
    if (engine.inputManager.isKeyJustPressed('KeyO')) {
      // console.log("PauseMenuScene: 'O' key pressed, pushing OptionsMenuScene.");
      // Pass the *same* uiContext object to the OptionsMenuScene
      engine.sceneManager.pushScene('OptionsMenuScene', { uiContext: this.uiContext })
      return // Avoid processing other inputs in the same frame
    }

    // Resume game (pop this scene)
    // 'togglePause' or 'cancel' as before
    if (
      engine.inputManager.isActionJustPressed('togglePause') ||
      engine.inputManager.isActionJustPressed('cancel')
    ) {
      // console.log("PauseMenuScene: Popping self, passing back UI Context.");
      // Pass the (potentially modified by OptionsMenuScene) uiContext back to OverworldScene
      engine.sceneManager.popScene({ uiContext: this.uiContext })
    }
  }

  /**
   * Called every frame to draw the scene.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  render(context, engine) {
    // Existing render logic (semi-transparent overlay, "Paused" text)
    context.fillStyle = 'rgba(0, 0, 0, 0.6)'
    context.fillRect(0, 0, engine.canvas.width, engine.canvas.height)

    context.fillStyle = 'white'
    context.font = '48px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('Paused', engine.canvas.width / 2, engine.canvas.height / 2 - 60)

    context.font = '24px sans-serif'
    if (this.uiContext && this.uiContext.playerName) {
      context.fillText(
        `Player: ${this.uiContext.playerName}`,
        engine.canvas.width / 2,
        engine.canvas.height / 2,
      )
    }
    context.fillText('Press O for Options', engine.canvas.width / 2, engine.canvas.height / 2 + 40)
    context.fillText(
      'Press P or Esc to Resume Game',
      engine.canvas.width / 2,
      engine.canvas.height / 2 + 80,
    )
  }

  /**
   * Called when this scene becomes the top of the stack again (e.g., after OptionsMenuScene is popped).
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Optional data passed from the popped scene (OptionsMenuScene doesn't pass data on pop).
   */
  async resume(engine, data = {}) {
    // console.log("PauseMenuScene: Resumed. Data from popped scene (OptionsMenuScene):", data);
    // The key here is that this.uiContext should reflect any changes made in OptionsMenuScene
    // because they share the same object reference.
    if (this.uiContext) {
      // console.log("PauseMenuScene: Current UI Context state on resume:", JSON.stringify(this.uiContext));
    }
    this.displayCurrentOptions() // Re-display options, in case context changed what's shown
  }

  /**
   * Called when the scene is popped from the stack.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async unload(engine) {
    // console.log("PauseMenuScene: Unloaded.");
    // Nothing specific to unload for this simple scene if uiContext is managed by the pusher.
  }

  // Pause method (when another scene is pushed on top of THIS PauseMenuScene)
  // This generally shouldn't happen if PauseMenu is a top-level modal UI,
  // but good practice to have it.
  // async pause(engine) {
  //     console.log("PauseMenuScene: Paused.");
  // }
}

// If you renamed your original PauseScene, make sure to export this one:
export default PauseMenuScene // Or your original PauseScene class name
