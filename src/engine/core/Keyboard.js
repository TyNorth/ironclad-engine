// src/engine/core/Keyboard.js

/**
 * @file Keyboard.js
 * @description Manages raw keyboard input state (pressed, just pressed, just released keys).
 */

class Keyboard {
  constructor() {
    /** @private @type {Set<string>} Raw pressed physical keys (event.code) */
    this.pressedKeys = new Set()
    /** @private @type {Set<string>} Raw physical keys just pressed this frame */
    this.justPressedKeys = new Set()
    /** @private @type {Set<string>} Raw physical keys just released this frame */
    this.justReleasedKeys = new Set()

    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)
    // console.log("Keyboard module: Constructed");
  }

  /**
   * Initializes keyboard event listeners.
   */
  initialize() {
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
    // console.log("Keyboard module: Initialized and listeners attached.");
  }

  /**
   * @private
   * Handles the keydown event.
   * @param {KeyboardEvent} event
   */
  _onKeyDown(event) {
    const code = event.code
    // If the key was not already in pressedKeys, then it's "just pressed" for this frame.
    if (!this.pressedKeys.has(code)) {
      this.justPressedKeys.add(code)
    }
    this.pressedKeys.add(code)
  }

  /**
   * @private
   * Handles the keyup event.
   * @param {KeyboardEvent} event
   */
  _onKeyUp(event) {
    const code = event.code
    this.pressedKeys.delete(code)
    this.justReleasedKeys.add(code) // Mark as just released for this frame
  }

  /**
   * Updates internal state for the next frame.
   * Specifically, clears the "just pressed" and "just released" sets.
   * This should be called once per game loop, typically by the main InputManager.
   */
  update() {
    this.justPressedKeys.clear()
    this.justReleasedKeys.clear()
  }

  /**
   * Checks if a specific key is currently held down.
   * @param {string} keyCode - The event.code of the key.
   * @returns {boolean}
   */
  isKeyPressed(keyCode) {
    return this.pressedKeys.has(keyCode)
  }

  /**
   * Checks if a specific key was just pressed in the current frame.
   * @param {string} keyCode - The event.code of the key.
   * @returns {boolean}
   */
  isKeyJustPressed(keyCode) {
    return this.justPressedKeys.has(keyCode)
  }

  /**
   * Checks if a specific key was just released in the current frame.
   * @param {string} keyCode - The event.code of the key.
   * @returns {boolean}
   */
  isKeyJustReleased(keyCode) {
    return this.justReleasedKeys.has(keyCode)
  }

  /**
   * Cleans up event listeners and clears states.
   */
  destroy() {
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
    this.pressedKeys.clear()
    this.justPressedKeys.clear()
    this.justReleasedKeys.clear()
    // console.log("Keyboard module: Destroyed and listeners removed.");
  }
}

export default Keyboard
