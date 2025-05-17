// src/game/scenes/OptionsMenuScene.js
import Label from '../../engine/ui/Label.js'
import Button from '../../engine/ui/Button.js'
import Checkbox from '../../engine/ui/Checkbox.js'
// import Panel from '../../engine/ui/Panel.js'; // Optional, if you want to wrap elements

class OptionsMenuScene {
  constructor() {
    this.engine = null
    this.uiContext = null

    /** @type {import('../../engine/ui/BaseUIElement.js').default[]} */
    this.uiElements = []

    this.titleLabel = null
    this.volumeLabel = null
    this.volDownButton = null
    this.volUpButton = null
    this.hintsCheckbox = null
    this.backButton = null
    // console.log("OptionsMenuScene: Constructor");
  }

  async initialize(engine, data = {}) {
    this.engine = engine
    if (data.uiContext) {
      this.uiContext = data.uiContext
    } else {
      console.warn('OptionsMenuScene: Initialized without a UI Context!')
      // Fallback, though it should always receive a context from PauseScene
      this.uiContext = {
        volume: 50,
        difficulty: 'Normal',
        showHints: true,
        changesMade: false,
      }
    }
    // Ensure necessary properties exist in uiContext
    if (this.uiContext.volume === undefined) this.uiContext.volume = 50
    if (this.uiContext.showHints === undefined) this.uiContext.showHints = true

    const canvasWidth = engine.canvas.width
    const canvasHeight = engine.canvas.height
    const centerX = canvasWidth / 2

    this.uiElements = [] // Clear previous elements

    // Title
    this.titleLabel = new Label({
      x: centerX,
      y: canvasHeight / 2 - 180, // Positioned higher
      text: 'Options Menu',
      font: '36px sans-serif',
      textAlign: 'center',
      textBaseline: 'middle',
    })
    this.uiElements.push(this.titleLabel)

    let currentY = canvasHeight / 2 - 100
    const elementSpacing = 60
    const smallButtonWidth = 50
    const standardButtonHeight = 40

    // Volume Controls
    this.volumeLabel = new Label({
      x: centerX,
      y: currentY,
      text: `Volume: ${this.uiContext.volume}`,
      font: '20px sans-serif',
      textAlign: 'center',
      textBaseline: 'middle',
    })
    this.uiElements.push(this.volumeLabel)

    this.volDownButton = new Button({
      x: centerX - 80 - smallButtonWidth / 2,
      y: currentY - standardButtonHeight / 2,
      width: smallButtonWidth,
      height: standardButtonHeight,
      text: '-',
      font: '24px sans-serif',
      onClick: () => {
        this.uiContext.volume = Math.max(0, this.uiContext.volume - 10)
        this.uiContext.changesMade = true
        this.volumeLabel.setText(`Volume: ${this.uiContext.volume}`) // Update label
        console.log(`OptionsMenuScene: Volume changed to ${this.uiContext.volume}`)
      },
    })
    this.uiElements.push(this.volDownButton)

    this.volUpButton = new Button({
      x: centerX + 80 - smallButtonWidth / 2,
      y: currentY - standardButtonHeight / 2,
      width: smallButtonWidth,
      height: standardButtonHeight,
      text: '+',
      font: '24px sans-serif',
      onClick: () => {
        this.uiContext.volume = Math.min(100, this.uiContext.volume + 10)
        this.uiContext.changesMade = true
        this.volumeLabel.setText(`Volume: ${this.uiContext.volume}`) // Update label
        console.log(`OptionsMenuScene: Volume changed to ${this.uiContext.volume}`)
      },
    })
    this.uiElements.push(this.volUpButton)

    // Hints Checkbox
    currentY += elementSpacing
    this.hintsCheckbox = new Checkbox({
      x: centerX - 100, // Adjust for label length
      y: currentY - 10, // Center checkbox vertically a bit
      label: 'Show Hints',
      isChecked: this.uiContext.showHints,
      font: '20px sans-serif',
      boxSize: 20,
      labelOffset: 10,
      onClick: () => {
        this.uiContext.showHints = this.hintsCheckbox.isChecked
        this.uiContext.changesMade = true
        console.log('OptionsMenuScene: Show Hints toggled to:', this.uiContext.showHints)
      },
    })
    this.uiElements.push(this.hintsCheckbox)

    // Back Button
    currentY += elementSpacing + 10
    this.backButton = new Button({
      x: centerX - 100, // Standard button width
      y: currentY,
      width: 200,
      height: 50,
      text: 'Back',
      onClick: () => {
        console.log('OptionsMenuScene: Back button clicked.')
        engine.sceneManager.popScene() // No data needed, changes are in uiContext
      },
    })
    this.uiElements.push(this.backButton)

    // Set engine for all elements
    this.uiElements.forEach((element) => element.setEngine(engine))
    // console.log("OptionsMenuScene: Initialized with UI elements.");
  }

  update(deltaTime, engine) {
    if (!this.uiContext) return

    const mousePos = engine.inputManager.getCanvasMousePosition()
    for (const element of this.uiElements) {
      if (element.visible && element.enabled) {
        element.update(deltaTime, engine, mousePos)
      }
    }

    // Keyboard fallback for "Back"
    if (engine.inputManager.isActionJustPressed('cancel')) {
      console.log("OptionsMenuScene: 'cancel' action (keyboard), popping self.")
      engine.sceneManager.popScene()
    }
    // Note: Keyboard controls for volume/hints were removed as buttons/checkbox handle this now.
    // If you want to keep them, you'd add them here, ensuring they also update the UI element state
    // (e.g., this.volumeLabel.setText(...), this.hintsCheckbox.setChecked(...)).
  }

  render(context, engine) {
    // Background overlay
    context.fillStyle = 'rgba(30, 30, 30, 0.95)'
    context.fillRect(0, 0, engine.canvas.width, engine.canvas.height)

    // Render all UI elements
    for (const element of this.uiElements) {
      element.render(context, engine)
    }
  }

  async resume(engine, data = {}) {
    // This scene typically doesn't have other scenes pushed on top of it,
    // so resume is less critical unless that changes.
    // console.log("OptionsMenuScene: Resumed (should be rare). Data:", data);
    // If settings could be changed by a sub-scene of options, refresh UI here:
    if (this.volumeLabel) this.volumeLabel.setText(`Volume: ${this.uiContext.volume}`)
    if (this.hintsCheckbox) this.hintsCheckbox.setChecked(!!this.uiContext.showHints, false)
  }

  async unload(engine) {
    // console.log("OptionsMenuScene: Unloaded.");
    this.uiElements = [] // Clear elements
  }
}

export default OptionsMenuScene
