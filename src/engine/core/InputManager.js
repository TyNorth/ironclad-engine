// src/engine/core/InputManager.js

/**
 * @file InputManager.js
 * @description Orchestrates keyboard and mouse input modules, and provides an action mapping system.
 */

import Keyboard from './Keyboard.js' // Assuming Keyboard.js is in the same directory
import Mouse from './Mouse.js' // Assuming Mouse.js is in the same directory

/**
 * @class InputManager
 * @description Central hub for input. Manages keyboard and mouse sub-modules,
 * and handles abstract input actions mapped to physical keys.
 * Call `initialize(canvas)` once, then `update()` once per game frame.
 */
class InputManager {
  constructor() {
    /** @private @type {Keyboard} Handles keyboard input */
    this.keyboard = new Keyboard()
    /** @private @type {Mouse} Handles mouse input */
    this.mouse = new Mouse()

    // --- Action Mapping Properties (remain from your original InputManager) ---
    /** @private @type {Map<string, Set<string>>} Maps action names to a Set of their bound KEYBOARD input codes */
    this.actionToCodesMap = new Map()
    /** @private @type {Map<string, string[]>} Maps KEYBOARD input codes back to a list of action names */
    this.codeToActionsMap = new Map()
    /** @private @type {Map<string, {pressed: boolean, justPressed: boolean, justReleased: boolean}>} Stores action states */
    this.actionStates = new Map()

    // Bind event handlers FOR ACTION MAPPING to this instance
    // These will listen to window events directly for simplicity in action processing
    this._onKeyDownForActions = this._onKeyDownForActions.bind(this)
    this._onKeyUpForActions = this._onKeyUpForActions.bind(this)

    console.log('InputManager: Constructed. Orchestrates Keyboard and Mouse modules.')
  }

  // --- Static Constants for Mouse Buttons (exposed via InputManager for convenience) ---
  static MOUSE_BUTTON_LEFT = Mouse.BUTTON_LEFT
  static MOUSE_BUTTON_MIDDLE = Mouse.BUTTON_MIDDLE
  static MOUSE_BUTTON_RIGHT = Mouse.BUTTON_RIGHT
  static MOUSE_BUTTON_BROWSER_BACK = Mouse.BUTTON_BROWSER_BACK
  static MOUSE_BUTTON_BROWSER_FORWARD = Mouse.BUTTON_BROWSER_FORWARD

  /**
   * Initializes the InputManager and its sub-modules (Keyboard, Mouse).
   * @param {HTMLCanvasElement} canvasElement - The game canvas element (required for Mouse).
   */
  initialize(canvasElement) {
    this.keyboard.initialize()
    this.mouse.initialize(canvasElement) // Mouse module needs the canvas

    // Add listeners specifically for the action mapping system
    // These are separate from the listeners within Keyboard.js for raw state,
    // though they listen to the same DOM events. This keeps action logic central.
    window.addEventListener('keydown', this._onKeyDownForActions)
    window.addEventListener('keyup', this._onKeyUpForActions)

    console.log('InputManager: Initialized. Keyboard and Mouse modules are active.')
  }

  /**
   * @private Handles keydown events specifically for updating action states.
   * Relies on `this.keyboard` for the definitive state of raw keys if needed.
   */
  _onKeyDownForActions(event) {
    const code = event.code
    const actions = this.codeToActionsMap.get(code)

    if (actions) {
      actions.forEach((actionName) => {
        const state = this.actionStates.get(actionName)
        if (state) {
          // To be "justPressed", the action must not have been pressed,
          // AND at least one of its keys must NOW be considered pressed.
          // The Keyboard module has already updated its state from this same event.
          let isAnyMappedKeyPressed = false
          const mappedCodes = this.actionToCodesMap.get(actionName)
          if (mappedCodes) {
            for (const mappedCode of mappedCodes) {
              // Query the Keyboard module for the current state
              if (this.keyboard.isKeyPressed(mappedCode)) {
                isAnyMappedKeyPressed = true
                break
              }
            }
          }

          if (isAnyMappedKeyPressed && !state.pressed) {
            state.justPressed = true
          }
          if (isAnyMappedKeyPressed) {
            // If any key for the action is down
            state.pressed = true
          }
        }
      })
    }
  }

  /**
   * @private Handles keyup events specifically for updating action states.
   * Relies on `this.keyboard` for the definitive state of raw keys.
   */
  _onKeyUpForActions(event) {
    const code = event.code
    const actions = this.codeToActionsMap.get(code)

    if (actions) {
      actions.forEach((actionName) => {
        const state = this.actionStates.get(actionName)
        if (state && state.pressed) {
          // Only process if action was considered pressed
          // Check if any *other* key for this action is still pressed
          let isStillPressedByOtherKey = false
          const mappedCodes = this.actionToCodesMap.get(actionName)
          if (mappedCodes) {
            for (const mappedCode of mappedCodes) {
              // Query the Keyboard module, note: event.code (the released key) will be reported as NOT pressed by keyboard module at this point.
              if (mappedCode !== code && this.keyboard.isKeyPressed(mappedCode)) {
                isStillPressedByOtherKey = true
                break
              }
            }
          }

          if (!isStillPressedByOtherKey) {
            state.justReleased = true
            state.pressed = false
          }
        }
      })
    }
  }

  /**
   * Updates all input modules and action states for the next frame.
   * Should be called once per game loop frame by the engine.
   */
  update() {
    this.keyboard.update() // Clears keyboard's justPressed/justReleased sets
    this.mouse.update() // Clears mouse's justPressed/justReleased sets

    // Clear "just" states for actions AFTER game logic for the current frame has used them
    this.actionStates.forEach((state) => {
      state.justPressed = false
      state.justReleased = false
    })
  }

  // --- Action Mapping API (Largely Unchanged Internally, still keyboard-focused) ---
  defineAction(actionName, inputCodes) {
    // This system currently only maps keyboard event.codes
    // Future extension: allow binding mouse buttons or gamepad inputs here.
    if (!Array.isArray(inputCodes) || inputCodes.length === 0) {
      console.warn(`InputManager: No input codes provided for keyboard action "${actionName}".`)
      return
    }
    this.actionToCodesMap.set(actionName, new Set(inputCodes))
    this.actionStates.set(actionName, { pressed: false, justPressed: false, justReleased: false })

    inputCodes.forEach((code) => {
      if (!this.codeToActionsMap.has(code)) {
        this.codeToActionsMap.set(code, [])
      }
      const actionsForCode = this.codeToActionsMap.get(code)
      if (!actionsForCode.includes(actionName)) {
        actionsForCode.push(actionName)
      }
    })
    // console.log(`InputManager: Action "${actionName}" defined with codes: [${inputCodes.join(', ')}]`);
  }

  removeAction(actionName) {
    // ... (implementation from your existing InputManager is fine) ...
    const codes = this.actionToCodesMap.get(actionName)
    if (codes) {
      codes.forEach((code) => {
        const actionsForCode = this.codeToActionsMap.get(code)
        if (actionsForCode) {
          const index = actionsForCode.indexOf(actionName)
          if (index > -1) actionsForCode.splice(index, 1)
          if (actionsForCode.length === 0) this.codeToActionsMap.delete(code)
        }
      })
    }
    this.actionToCodesMap.delete(actionName)
    this.actionStates.delete(actionName)
    // console.log(`InputManager: Action "${actionName}" removed.`);
  }

  isActionPressed(actionName) {
    const state = this.actionStates.get(actionName)
    return state ? state.pressed : false
  }

  isActionJustPressed(actionName) {
    const state = this.actionStates.get(actionName)
    return state ? state.justPressed : false
  }

  isActionJustReleased(actionName) {
    const state = this.actionStates.get(actionName)
    return state ? state.justReleased : false
  }

  // --- Raw Key State API (Delegates to Keyboard module) ---
  isKeyPressed(keyCode) {
    return this.keyboard.isKeyPressed(keyCode)
  }
  isKeyJustPressed(keyCode) {
    return this.keyboard.isKeyJustPressed(keyCode)
  }
  isKeyJustReleased(keyCode) {
    return this.keyboard.isKeyJustReleased(keyCode)
  }

  // --- Raw Mouse State API (Delegates to Mouse module) ---
  getMouseViewportPosition() {
    // Renamed to avoid conflict if you had getMousePosition before
    return this.mouse.getViewportPosition()
  }
  getCanvasMousePosition() {
    return this.mouse.getCanvasPosition()
  }
  isMouseButtonPressed(buttonCode) {
    return this.mouse.isButtonPressed(buttonCode)
  }
  isMouseButtonJustPressed(buttonCode) {
    return this.mouse.isButtonJustPressed(buttonCode)
  }
  isMouseButtonJustReleased(buttonCode) {
    return this.mouse.isButtonJustReleased(buttonCode)
  }

  /**
   * Cleans up event listeners and all input states from sub-modules.
   */
  destroy() {
    // Remove action-specific listeners
    window.removeEventListener('keydown', this._onKeyDownForActions)
    window.removeEventListener('keyup', this._onKeyUpForActions)

    this.keyboard.destroy()
    this.mouse.destroy()

    this.actionToCodesMap.clear()
    this.codeToActionsMap.clear()
    this.actionStates.clear()
    console.log('InputManager: Destroyed. Keyboard and Mouse modules destroyed.')
  }
}

export default InputManager
