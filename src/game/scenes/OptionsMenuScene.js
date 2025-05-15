// src/game/scenes/OptionsMenuScene.js
// import InputManager from '../../engine/core/InputManager.js'; // If needed for static constants

class OptionsMenuScene {
  constructor() {
    this.engine = null
    this.uiContext = null

    // Define button areas (x, y, width, height)
    this.volDownButtonRect = { x: 0, y: 0, width: 50, height: 40 }
    this.volUpButtonRect = { x: 0, y: 0, width: 50, height: 40 }
    this.hintsToggleButtonRect = { x: 0, y: 0, width: 180, height: 40 }
    this.backButtonRect = { x: 0, y: 0, width: 150, height: 50 }
    // console.log("OptionsMenuScene: Constructor");
  }

  async initialize(engine, data = {}) {
    this.engine = engine
    if (data.uiContext) {
      this.uiContext = data.uiContext
    } else {
      console.warn('OptionsMenuScene: Initialized without a UI Context!')
      this.uiContext = { volume: 50, difficulty: 'Normal', showHints: true, changesMade: false }
    }

    // Calculate button positions
    const canvasWidth = engine.canvas.width
    const canvasHeight = engine.canvas.height
    const centerX = canvasWidth / 2

    // Volume controls
    const volY = canvasHeight / 2 - 60
    this.volDownButtonRect.x = centerX - 100 - this.volDownButtonRect.width / 2
    this.volDownButtonRect.y = volY - this.volDownButtonRect.height / 2
    this.volUpButtonRect.x = centerX + 100 - this.volUpButtonRect.width / 2
    this.volUpButtonRect.y = volY - this.volUpButtonRect.height / 2

    // Hints toggle
    const hintsY = canvasHeight / 2
    this.hintsToggleButtonRect.x = centerX - this.hintsToggleButtonRect.width / 2
    this.hintsToggleButtonRect.y = hintsY - this.hintsToggleButtonRect.height / 2

    // Back button
    this.backButtonRect.x = centerX - this.backButtonRect.width / 2
    this.backButtonRect.y = canvasHeight / 2 + 80

    // console.log("OptionsMenuScene: Initialized with UI Context:", JSON.stringify(this.uiContext));
    this.displayCurrentSettings() // For keyboard hints
  }

  displayCurrentSettings() {
    // For keyboard hints
    if (!this.uiContext) return
    console.log(`--- Options Menu ---`)
    console.log(`Current Volume: ${this.uiContext.volume}`)
    console.log(`Current Difficulty: ${this.uiContext.difficulty}`)
    console.log(`Show Hints: ${this.uiContext.showHints}`)
    console.log(`(Keyboard: '1'/'2' Volume, '3' Hints, 'Escape' Back)`)
  }

  update(deltaTime, engine) {
    if (!this.uiContext) return

    const mousePos = engine.inputManager.getCanvasMousePosition()
    const leftMouseButton = engine.inputManager.constructor.MOUSE_BUTTON_LEFT // Access static const

    if (engine.inputManager.isMouseButtonJustPressed(leftMouseButton)) {
      // Volume Down
      if (this.isPointInRect(mousePos, this.volDownButtonRect)) {
        this.uiContext.volume = Math.max(0, this.uiContext.volume - 10)
        this.uiContext.changesMade = true
        console.log(`OptionsMenuScene: Volume via click to ${this.uiContext.volume}`)
        return // Click handled
      }
      // Volume Up
      if (this.isPointInRect(mousePos, this.volUpButtonRect)) {
        this.uiContext.volume = Math.min(100, this.uiContext.volume + 10)
        this.uiContext.changesMade = true
        console.log(`OptionsMenuScene: Volume via click to ${this.uiContext.volume}`)
        return // Click handled
      }
      // Toggle Hints
      if (this.isPointInRect(mousePos, this.hintsToggleButtonRect)) {
        this.uiContext.showHints = !this.uiContext.showHints
        this.uiContext.changesMade = true
        console.log(`OptionsMenuScene: Show Hints via click to ${this.uiContext.showHints}`)
        return // Click handled
      }
      // Back Button
      if (this.isPointInRect(mousePos, this.backButtonRect)) {
        console.log('OptionsMenuScene: Back button clicked.')
        engine.sceneManager.popScene()
        return // Click handled
      }
    }

    // Existing Keyboard controls for quick testing
    if (engine.inputManager.isKeyJustPressed('Digit1')) {
      this.uiContext.volume = Math.max(0, this.uiContext.volume - 10)
      this.uiContext.changesMade = true
      // console.log(`OptionsMenuScene: Volume changed to ${this.uiContext.volume}`);
      // this.displayCurrentSettings();
    } else if (engine.inputManager.isKeyJustPressed('Digit2')) {
      this.uiContext.volume = Math.min(100, this.uiContext.volume + 10)
      this.uiContext.changesMade = true
      // console.log(`OptionsMenuScene: Volume changed to ${this.uiContext.volume}`);
      // this.displayCurrentSettings();
    } else if (engine.inputManager.isKeyJustPressed('Digit3')) {
      this.uiContext.showHints = !this.uiContext.showHints
      this.uiContext.changesMade = true
      // console.log(`OptionsMenuScene: Show Hints changed to ${this.uiContext.showHints}`);
      // this.displayCurrentSettings();
    }

    if (engine.inputManager.isActionJustPressed('cancel')) {
      // console.log("OptionsMenuScene: 'cancel' action, popping self.");
      engine.sceneManager.popScene()
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
    context.fillStyle = 'rgba(30, 30, 30, 0.95)' // Slightly more opaque
    context.fillRect(0, 0, engine.canvas.width, engine.canvas.height)

    context.fillStyle = 'white'
    context.font = '36px sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('Options Menu', engine.canvas.width / 2, engine.canvas.height / 2 - 150)

    if (this.uiContext) {
      const centerX = engine.canvas.width / 2
      const volY = this.volDownButtonRect.y + this.volDownButtonRect.height / 2
      const hintsY = this.hintsToggleButtonRect.y + this.hintsToggleButtonRect.height / 2

      // Volume Buttons & Display
      context.fillStyle = 'rgba(100, 100, 100, 0.7)'
      context.fillRect(
        this.volDownButtonRect.x,
        this.volDownButtonRect.y,
        this.volDownButtonRect.width,
        this.volDownButtonRect.height,
      )
      context.fillRect(
        this.volUpButtonRect.x,
        this.volUpButtonRect.y,
        this.volUpButtonRect.width,
        this.volUpButtonRect.height,
      )

      context.fillStyle = 'white'
      context.font = '24px sans-serif'
      context.fillText('-', this.volDownButtonRect.x + this.volDownButtonRect.width / 2, volY)
      context.fillText('+', this.volUpButtonRect.x + this.volUpButtonRect.width / 2, volY)
      context.fillText(`Volume: ${this.uiContext.volume}`, centerX, volY)

      // Hints Toggle Button
      context.fillStyle = 'rgba(100, 100, 100, 0.7)'
      context.fillRect(
        this.hintsToggleButtonRect.x,
        this.hintsToggleButtonRect.y,
        this.hintsToggleButtonRect.width,
        this.hintsToggleButtonRect.height,
      )
      context.fillStyle = 'white'
      context.fillText(`Hints: ${this.uiContext.showHints ? 'ON' : 'OFF'}`, centerX, hintsY)

      // Back Button
      context.fillStyle = 'rgba(120, 100, 100, 0.7)'
      context.fillRect(
        this.backButtonRect.x,
        this.backButtonRect.y,
        this.backButtonRect.width,
        this.backButtonRect.height,
      )
      context.fillStyle = 'white'
      context.fillText(
        'Back',
        this.backButtonRect.x + this.backButtonRect.width / 2,
        this.backButtonRect.y + this.backButtonRect.height / 2,
      )
    }
  }

  async unload(engine) {
    // console.log("OptionsMenuScene: Unloaded. Final UI Context state from this scene's perspective:", JSON.stringify(this.uiContext));
  }
}

export default OptionsMenuScene
