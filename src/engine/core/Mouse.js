// src/engine/core/Mouse.js

/**
 * @file Mouse.js
 * @description Manages raw mouse input state (position, pressed, just pressed, just released buttons).
 */

class Mouse {
  constructor() {
    /** @private @type {HTMLCanvasElement | null} Reference to the game canvas */
    this.canvas = null

    /** @private @type {{x: number, y: number}} Mouse position relative to the browser viewport */
    this.viewportPosition = { x: 0, y: 0 }
    /** @private @type {{x: number, y: number}} Mouse position relative to the canvas element */
    this.canvasPosition = { x: 0, y: 0 }

    /** @private @type {Set<number>} Currently pressed mouse buttons (event.button code) */
    this.pressedButtons = new Set()
    /** @private @type {Set<number>} Mouse buttons just pressed this frame */
    this.justPressedButtons = new Set()
    /** @private @type {Set<number>} Mouse buttons just released this frame */
    this.justReleasedButtons = new Set()

    this._onMouseMove = this._onMouseMove.bind(this)
    this._onMouseDown = this._onMouseDown.bind(this)
    this._onMouseUp = this._onMouseUp.bind(this)
    this._onContextMenu = this._onContextMenu.bind(this)
    // console.log("Mouse module: Constructed");
  }

  // Static constants for mouse button codes (matches event.button)
  static BUTTON_LEFT = 0
  static BUTTON_MIDDLE = 1
  static BUTTON_RIGHT = 2
  static BUTTON_BROWSER_BACK = 3
  static BUTTON_BROWSER_FORWARD = 4

  /**
   * Initializes mouse event listeners on the provided canvas.
   * @param {HTMLCanvasElement} canvasElement - The game canvas element.
   */
  initialize(canvasElement) {
    if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
      console.error('Mouse.initialize: Invalid canvas element provided.')
      return
    }
    this.canvas = canvasElement

    this.canvas.addEventListener('mousemove', this._onMouseMove)
    this.canvas.addEventListener('mousedown', this._onMouseDown)
    this.canvas.addEventListener('mouseup', this._onMouseUp)
    this.canvas.addEventListener('contextmenu', this._onContextMenu)

    // console.log("Mouse module: Initialized and listeners attached to canvas.");
  }

  _onMouseMove(event) {
    if (!this.canvas) return
    const rect = this.canvas.getBoundingClientRect()
    this.viewportPosition.x = event.clientX
    this.viewportPosition.y = event.clientY
    this.canvasPosition.x = event.clientX - rect.left
    this.canvasPosition.y = event.clientY - rect.top
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    this.canvasPosition.x *= scaleX
    this.canvasPosition.y *= scaleY
  }

  _onMouseDown(event) {
    const buttonCode = event.button
    if (!this.pressedButtons.has(buttonCode)) {
      this.justPressedButtons.add(buttonCode)
    }
    this.pressedButtons.add(buttonCode)

    // Optional: Prevent default for browser navigation buttons if you want to use them in-game
    // if (buttonCode === Mouse.BUTTON_BROWSER_BACK || buttonCode === Mouse.BUTTON_BROWSER_FORWARD) {
    //     event.preventDefault();
    // }
  }

  _onMouseUp(event) {
    const buttonCode = event.button
    this.pressedButtons.delete(buttonCode)
    this.justReleasedButtons.add(buttonCode)
  }

  _onContextMenu(event) {
    event.preventDefault()
  }

  update() {
    this.justPressedButtons.clear()
    this.justReleasedButtons.clear()
  }

  getViewportPosition() {
    return { ...this.viewportPosition }
  }

  getCanvasPosition() {
    return { ...this.canvasPosition }
  }

  isButtonPressed(buttonCode) {
    return this.pressedButtons.has(buttonCode)
  }

  isButtonJustPressed(buttonCode) {
    return this.justPressedButtons.has(buttonCode)
  }

  isButtonJustReleased(buttonCode) {
    return this.justReleasedButtons.has(buttonCode)
  }

  destroy() {
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this._onMouseMove)
      this.canvas.removeEventListener('mousedown', this._onMouseDown)
      this.canvas.removeEventListener('mouseup', this._onMouseUp)
      this.canvas.removeEventListener('contextmenu', this._onContextMenu)
    }
    this.pressedButtons.clear()
    this.justPressedButtons.clear()
    this.justReleasedButtons.clear()
    this.viewportPosition = { x: 0, y: 0 }
    this.canvasPosition = { x: 0, y: 0 }
    this.canvas = null
    // console.log("Mouse module: Destroyed and listeners removed.");
  }
}

export default Mouse
