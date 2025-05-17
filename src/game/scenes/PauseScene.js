// src/game/scenes/PauseScene.js
import BaseUIElement from '../../engine/ui/BaseUIElement.js' // Not strictly needed here, but good for type hints if used
import Label from '../../engine/ui/Label.js'
import Button from '../../engine/ui/Button.js'
import Checkbox from '../../engine/ui/Checkbox.js'
// import Panel from '../../engine/ui/Panel.js'; // Optional: if you want to group elements in a panel

class PauseScene {
  constructor() {
    this.engine = null
    this.uiContext = null

    /** @type {BaseUIElement[]} */
    this.uiElements = [] // To hold all UI elements for easy iteration

    this.titleLabel = null
    this.resumeButton = null
    this.optionsButton = null
    this.saveButton = null
    this.loadButton = null
    this.muteCheckbox = null

    this.message = ''
    this.messageTimer = 0
    // console.log("PauseScene: Constructor");
  }

  async initialize(engine, data = {}) {
    this.engine = engine
    if (data.uiContext) {
      this.uiContext = data.uiContext
    } else {
      console.warn('PauseScene: Initialized without a UI Context!')
      this.uiContext = {
        changesMade: false,
        playerName: 'Player (Default)',
        isMuted: false, // Assuming a default for the checkbox
      }
    }
    // Ensure uiContext has isMuted if it wasn't there
    if (this.uiContext.isMuted === undefined) {
      this.uiContext.isMuted = false
    }

    const canvasWidth = engine.canvas.width
    const canvasHeight = engine.canvas.height
    const centerX = canvasWidth / 2

    this.uiElements = [] // Clear previous elements if re-initializing

    // Title Label
    this.titleLabel = new Label({
      x: centerX,
      y: canvasHeight / 2 - 200,
      text: 'Paused',
      font: '48px sans-serif',
      textAlign: 'center',
      textBaseline: 'middle',
    })
    this.titleLabel.setEngine(engine)
    this.uiElements.push(this.titleLabel)

    // Player Name Label (if playerName exists in context)
    if (this.uiContext.playerName) {
      const playerNameLabel = new Label({
        x: centerX,
        y: canvasHeight / 2 - 150,
        text: `Player: ${this.uiContext.playerName}`,
        font: '20px sans-serif',
        textAlign: 'center',
        textBaseline: 'middle',
      })
      playerNameLabel.setEngine(engine)
      this.uiElements.push(playerNameLabel)
    }

    // Button properties
    const buttonWidth = 220
    const buttonHeight = 45
    const buttonX = centerX - buttonWidth / 2
    let currentY = canvasHeight / 2 - 100 // Adjusted starting Y
    const buttonSpacing = 55

    // Resume Button
    this.resumeButton = new Button({
      x: buttonX,
      y: currentY,
      width: buttonWidth,
      height: buttonHeight,
      text: 'Resume Game',
      onClick: () => {
        console.log('PauseScene: Resume button clicked!')
        engine.sceneManager.popScene({ uiContext: this.uiContext })
      },
    })
    this.uiElements.push(this.resumeButton)

    // Options Button
    currentY += buttonSpacing
    this.optionsButton = new Button({
      x: buttonX,
      y: currentY,
      width: buttonWidth,
      height: buttonHeight,
      text: 'Options',
      onClick: () => {
        console.log('PauseScene: Options button clicked!')
        engine.sceneManager.pushScene('OptionsMenuScene', { uiContext: this.uiContext })
      },
    })
    this.uiElements.push(this.optionsButton)

    // Save Button
    currentY += buttonSpacing
    this.saveButton = new Button({
      x: buttonX,
      y: currentY,
      width: buttonWidth,
      height: buttonHeight,
      text: 'Save Game (Slot 1)',
      onClick: () => this.handleSaveGame(),
    })
    this.uiElements.push(this.saveButton)

    // Load Button
    currentY += buttonSpacing
    this.loadButton = new Button({
      x: buttonX,
      y: currentY,
      width: buttonWidth,
      height: buttonHeight,
      text: 'Load Game (Slot 1)',
      onClick: () => this.handleLoadGame(),
    })
    this.uiElements.push(this.loadButton)

    // Mute Checkbox
    currentY += buttonSpacing + 10 // Extra spacing for checkbox
    this.muteCheckbox = new Checkbox({
      x: buttonX, // Align with buttons
      y: currentY,
      label: 'Mute Sound',
      isChecked: this.uiContext.isMuted || false, // Get initial state from context
      font: '18px sans-serif',
      boxSize: 20,
      labelOffset: 8,
      onClick: () => {
        this.uiContext.isMuted = this.muteCheckbox.isChecked
        this.uiContext.changesMade = true // Indicate context has changed
        console.log('PauseScene: Mute toggled to:', this.uiContext.isMuted)
        // Here you would typically call: engine.audioManager.setMuted(this.uiContext.isMuted);
      },
    })
    this.uiElements.push(this.muteCheckbox)

    // Set engine for all elements (important if not done in addChild of a Panel)
    this.uiElements.forEach((element) => element.setEngine(engine))

    // console.log("PauseScene: Initialized with UI elements.");
  }

  async handleSaveGame() {
    if (!this.engine.saveLoadManager) {
      /* ... as before ... */ return
    }
    this.message = 'Saving...'
    this.messageTimer = 1000
    const slotId = 'slot1'
    const metadata = { description: 'PauseScene Save' /* ... */ }
    await new Promise((resolve) => setTimeout(resolve, 50))
    const success = await this.engine.saveLoadManager.saveGame(slotId, metadata)
    this.message = success ? `Game Saved to Slot ${slotId}!` : 'Save Failed!'
    this.messageTimer = 3000
    if (success) console.log(`PauseScene: Game Saved to Slot ${slotId}`)
    else console.error(`PauseScene: Save Failed for Slot ${slotId}`)
  }

  async handleLoadGame() {
    if (!this.engine.saveLoadManager) {
      /* ... as before ... */ return
    }
    this.message = 'Loading...'
    this.messageTimer = 1000
    await new Promise((resolve) => setTimeout(resolve, 50))
    const slotId = 'slot1'
    const loadedData = await this.engine.saveLoadManager.loadGame(slotId)
    if (loadedData) {
      this.message = `Game Loaded! Popping menu...`
      console.log(`PauseScene: Game Loaded from Slot ${slotId}. Popping.`, loadedData)
      this.messageTimer = 2000 // Shorter message before pop
      await new Promise((resolve) => setTimeout(resolve, 1500))
      this.engine.sceneManager.popScene({ uiContext: this.uiContext, loadOccurred: true })
    } else {
      this.message = 'Load Failed or Slot Empty!'
      this.messageTimer = 3000
      console.error(`PauseScene: Load Failed for Slot ${slotId}`)
    }
  }

  update(deltaTime, engine) {
    if (this.messageTimer > 0) {
      this.messageTimer -= deltaTime * 1000
      if (this.messageTimer <= 0) this.message = ''
    }

    // Only process UI element updates if no blocking message is shown
    const canInteract = !(this.message && this.messageTimer > 0)

    const mousePos = engine.inputManager.getCanvasMousePosition()
    for (const element of this.uiElements) {
      if (element.visible) {
        // Update only visible elements
        // Pass interaction capability based on message state
        element.enabled = canInteract // Enable/disable based on message
        element.update(deltaTime, engine, mousePos)
      }
    }

    // Keyboard fallbacks (only if not interacting via message)
    if (canInteract) {
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
  }

  render(context, engine) {
    // Dim background for the whole scene
    context.fillStyle = 'rgba(0, 0, 0, 0.75)' // Slightly more opaque
    context.fillRect(0, 0, engine.canvas.width, engine.canvas.height)

    // Render all UI elements
    for (const element of this.uiElements) {
      // Each element's render method will check its own 'visible' flag
      element.render(context, engine)
    }

    // Display message (Save/Load status)
    if (this.message) {
      context.fillStyle = this.message.includes('Failed')
        ? 'rgba(255, 100, 100, 0.9)'
        : 'rgba(100, 255, 100, 0.9)'
      context.font = 'bold 20px sans-serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      const textMetrics = context.measureText(this.message)
      const messagePadding = 15
      const messageBoxWidth = textMetrics.width + messagePadding * 2
      const messageBoxHeight = 20 + messagePadding * 2
      const messageBoxX = engine.canvas.width / 2 - messageBoxWidth / 2
      const messageBoxY = engine.canvas.height - 70 - messageBoxHeight / 2 // Positioned higher

      context.fillStyle = 'rgba(0, 0, 0, 0.8)' // Message box background
      context.fillRect(messageBoxX, messageBoxY, messageBoxWidth, messageBoxHeight)

      context.fillStyle = this.message.includes('Failed')
        ? 'rgb(255, 180, 180)'
        : 'rgb(180, 255, 180)'
      context.fillText(this.message, engine.canvas.width / 2, engine.canvas.height - 70)
    }
  }

  async resume(engine, data = {}) {
    // console.log("PauseScene: Resumed. Data from popped OptionsMenuScene:", data);
    if (this.uiContext && this.muteCheckbox) {
      // Ensure checkbox reflects the latest state from uiContext if OptionsScene changed it
      this.muteCheckbox.setChecked(!!this.uiContext.isMuted, false) // Don't trigger callback
    }
    // console.log("PauseScene: Current UI Context state on resume:", JSON.stringify(this.uiContext));
  }

  async unload(engine) {
    // console.log("PauseScene: Unloaded.");
    this.uiElements = [] // Clear elements
  }
}

export default PauseScene
