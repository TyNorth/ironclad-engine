// src/game/scenes/PauseScene.js
// import InputManager from '../../engine/core/InputManager.js'; // If needed for InputManager.MOUSE_BUTTON_LEFT

class PauseScene {
  constructor() {
    this.engine = null
    this.uiContext = null // To store the shared UI context from the pushing scene

    // Define button areas (x, y, width, height)
    // Positions will be calculated in initialize based on canvas size
    this.resumeButtonRect = { x: 0, y: 0, width: 220, height: 50 }
    this.optionsButtonRect = { x: 0, y: 0, width: 220, height: 50 }
    this.saveButtonRect = { x: 0, y: 0, width: 220, height: 50 }
    this.loadButtonRect = { x: 0, y: 0, width: 220, height: 50 }

    this.message = '' // For displaying save/load status
    this.messageTimer = 0 // Duration to show the message in milliseconds
    // console.log("PauseScene: Constructor");
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
      // console.log("PauseScene: Initialized with UI Context:", JSON.stringify(this.uiContext));
    } else {
      console.warn(
        'PauseScene: Initialized without a UI Context! This is unexpected if pushed by OverworldScene with context.',
      )
      // Fallback or default if necessary, though the pushing scene (OverworldScene) should provide it.
      this.uiContext = { changesMade: false, playerName: 'Player (Default)' } // Minimal default
    }

    // Calculate button positions (centered)
    const canvasWidth = engine.canvas.width
    const canvasHeight = engine.canvas.height
    const buttonX = canvasWidth / 2 - this.resumeButtonRect.width / 2 // All buttons same width here

    let currentY = canvasHeight / 2 - 120 - 30 // Start higher up
    const buttonSpacing = 60 // Space between buttons

    this.resumeButtonRect.x = buttonX
    this.resumeButtonRect.y = currentY

    currentY += buttonSpacing
    this.optionsButtonRect.x = buttonX
    this.optionsButtonRect.y = currentY

    currentY += buttonSpacing
    this.saveButtonRect.x = buttonX
    this.saveButtonRect.y = currentY

    currentY += buttonSpacing
    this.loadButtonRect.x = buttonX
    this.loadButtonRect.y = currentY

    this.displayInitialLog()
  }

  displayInitialLog() {
    // console.log(`--- Pause Scene ---`);
    // if (this.uiContext && this.uiContext.playerName) {
    //     console.log(`Player: ${this.uiContext.playerName}`);
    // }
    // console.log(`(Keyboard: 'O' for Options, 'Esc' or 'P' to Resume Game)`);
    // console.log(`(Mouse: Click buttons)`);
  }

  async handleSaveGame() {
    if (!this.engine.saveLoadManager) {
      this.message = 'Save System not available!'
      this.messageTimer = 3000
      console.error('PauseScene: SaveLoadManager not found on engine.')
      return
    }
    this.message = 'Saving...'
    this.messageTimer = 1000 // Brief "Saving..." message
    const slotId = 'slot1' // For testing
    const metadata = {
      description: 'Test Save from Pause Scene',
      timestamp: new Date().toLocaleString(),
      scene:
        this.uiContext?.originSceneName ||
        (this.engine.sceneManager ? this.engine.sceneManager.getActiveSceneName() : 'Unknown'), // Example metadata
      // It's better if uiContext contains the original scene name if Overworld passed it.
    }

    // Allow render to show "Saving..." then save
    await new Promise((resolve) => setTimeout(resolve, 50))

    const success = await this.engine.saveLoadManager.saveGame(slotId, metadata)
    if (success) {
      this.message = `Game Saved to Slot ${slotId}!`
      console.log(`PauseScene: Game Saved to Slot ${slotId}`)
    } else {
      this.message = 'Save Failed!'
      console.error(`PauseScene: Save Failed for Slot ${slotId}`)
    }
    this.messageTimer = 3000 // Show result message longer
  }

  async handleLoadGame() {
    if (!this.engine.saveLoadManager) {
      this.message = 'Load System not available!'
      this.messageTimer = 3000
      console.error('PauseScene: SaveLoadManager not found on engine.')
      return
    }
    this.message = 'Loading...'
    this.messageTimer = 1000 // Brief "Loading..."

    // Allow render to show "Loading..." then load
    await new Promise((resolve) => setTimeout(resolve, 50))

    const slotId = 'slot1' // For testing
    const loadedData = await this.engine.saveLoadManager.loadGame(slotId)

    if (loadedData) {
      this.message = `Game Loaded from Slot ${slotId}! Popping Pause Menu...`
      console.log(
        `PauseScene: Game Loaded from Slot ${slotId}. Popping self. Loaded data:`,
        loadedData,
      )
      this.messageTimer = 3000

      // Give message time to display before popping and potentially changing scene context quickly
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // The actual application of data happens in the registered providers (like OverworldScene's loadSaveData)
      // We pop the PauseScene. OverworldScene.resume() will be called.
      // OverworldScene's gameSettings should now reflect the loaded data.
      // The uiContext passed back here might be "stale" if options were changed *before* loading.
      // The 'loadOccurred' flag helps the resuming scene understand the context.
      this.engine.sceneManager.popScene({ uiContext: this.uiContext, loadOccurred: true })
    } else {
      this.message = 'Load Failed or Slot Empty!'
      console.error(`PauseScene: Load Failed for Slot ${slotId}`)
      this.messageTimer = 3000
    }
  }

  update(deltaTime, engine) {
    if (this.messageTimer > 0) {
      this.messageTimer -= deltaTime * 1000 // Assuming deltaTime is in seconds
      if (this.messageTimer <= 0) {
        this.message = ''
      }
    }

    // Prevent actions if a message is being displayed (especially after load/save action)
    if (this.message && this.messageTimer > 0) {
      return
    }

    const mousePos = engine.inputManager.getCanvasMousePosition()
    const leftMouseButton = engine.inputManager.constructor.MOUSE_BUTTON_LEFT

    if (engine.inputManager.isMouseButtonJustPressed(leftMouseButton)) {
      if (this.isPointInRect(mousePos, this.resumeButtonRect)) {
        console.log('PauseScene: Resume button clicked!')
        engine.sceneManager.popScene({ uiContext: this.uiContext })
        return
      }
      if (this.isPointInRect(mousePos, this.optionsButtonRect)) {
        console.log('PauseScene: Options button clicked!')
        engine.sceneManager.pushScene('OptionsMenuScene', { uiContext: this.uiContext })
        return
      }
      if (this.isPointInRect(mousePos, this.saveButtonRect)) {
        this.handleSaveGame() // This is async
        return
      }
      if (this.isPointInRect(mousePos, this.loadButtonRect)) {
        this.handleLoadGame() // This is async
        return
      }
    }

    // Keyboard controls
    if (engine.inputManager.isKeyJustPressed('KeyO')) {
      console.log("PauseScene: 'O' key pressed, pushing OptionsMenuScene.")
      engine.sceneManager.pushScene('OptionsMenuScene', { uiContext: this.uiContext })
      return
    }
    if (
      engine.inputManager.isActionJustPressed('togglePause') ||
      engine.inputManager.isActionJustPressed('cancel')
    ) {
      console.log('PauseScene: Keyboard pop, passing back UI Context.')
      engine.sceneManager.popScene({ uiContext: this.uiContext })
    }
  }

  /**
   * Helper function to check if a point is inside a rectangle.
   * @param {{x: number, y: number}} point - The point to check.
   * @param {{x: number, y: number, width: number, height: number}} rect - The rectangle.
   * @returns {boolean}
   */
  isPointInRect(point, rect) {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    )
  }

  render(context, engine) {
    // Dim background
    context.fillStyle = 'rgba(0, 0, 0, 0.7)' // Slightly darker for better text contrast
    context.fillRect(0, 0, engine.canvas.width, engine.canvas.height)

    // Draw Title
    context.fillStyle = 'white'
    context.font = '48px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('Paused', engine.canvas.width / 2, engine.canvas.height / 2 - 200)

    // Display player name from context
    if (this.uiContext && this.uiContext.playerName) {
      context.font = '20px sans-serif'
      context.fillText(
        `Player: ${this.uiContext.playerName}`,
        engine.canvas.width / 2,
        engine.canvas.height / 2 - 150,
      )
    }

    // Render buttons
    const buttons = [
      { rect: this.resumeButtonRect, text: 'Resume Game' },
      { rect: this.optionsButtonRect, text: 'Options' },
      { rect: this.saveButtonRect, text: 'Save Game (Slot 1)' },
      { rect: this.loadButtonRect, text: 'Load Game (Slot 1)' },
    ]

    buttons.forEach((button) => {
      // Simple hover effect (optional, basic example)
      const mousePos = engine.inputManager.getCanvasMousePosition()
      if (this.isPointInRect(mousePos, button.rect)) {
        context.fillStyle = 'rgba(150, 150, 150, 0.8)'
      } else {
        context.fillStyle = 'rgba(100, 100, 100, 0.7)'
      }
      context.fillRect(button.rect.x, button.rect.y, button.rect.width, button.rect.height)

      context.fillStyle = 'white'
      context.font = '20px sans-serif'
      context.fillText(
        button.text,
        button.rect.x + button.rect.width / 2,
        button.rect.y + button.rect.height / 2,
      )
    })

    // Display message (Save/Load status)
    if (this.message) {
      context.fillStyle = this.message.includes('Failed')
        ? 'rgba(255, 100, 100, 0.9)'
        : 'rgba(100, 255, 100, 0.9)'
      context.font = 'bold 20px sans-serif'
      // Simple message box
      const textMetrics = context.measureText(this.message)
      const messagePadding = 10
      const messageBoxWidth = textMetrics.width + messagePadding * 2
      const messageBoxHeight = 20 + messagePadding * 2 // Approx height for 20px font
      const messageBoxX = engine.canvas.width / 2 - messageBoxWidth / 2
      const messageBoxY = engine.canvas.height - 60 - messageBoxHeight / 2

      context.fillStyle = 'rgba(0, 0, 0, 0.7)'
      context.fillRect(messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight)

      context.fillStyle = this.message.includes('Failed')
        ? 'rgb(255, 180, 180)'
        : 'rgb(180, 255, 180)'
      context.fillText(this.message, engine.canvas.width / 2, engine.canvas.height - 60)
    }
  }

  async resume(engine, data = {}) {
    // console.log("PauseScene: Resumed. Data from popped OptionsMenuScene:", data);
    // this.uiContext should reflect changes from OptionsMenuScene if it was popped
    if (this.uiContext) {
      // console.log("PauseScene: Current UI Context state on resume from Options:", JSON.stringify(this.uiContext));
    }
    // this.displayInitialLog(); // If you want to re-log keyboard hints
  }

  async unload(engine) {
    // console.log("PauseScene: Unloaded.");
  }
}

export default PauseScene
