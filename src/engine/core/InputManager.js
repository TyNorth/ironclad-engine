// src/engine/core/InputManager.js

/**
 * @file InputManager.js
 * @description Manages keyboard input, tracking pressed, just pressed, and just released keys,
 * and provides an action mapping system.
 */

/**
 * @class InputManager
 * @description Handles keyboard event listening, provides methods to query raw key states,
 * and manages abstract input actions mapped to physical keys.
 * Call `update()` once per game frame.
 */
class InputManager {
  constructor() {
    /** @private @type {Set<string>} Raw pressed physical keys (event.code) */
    this.pressedKeys = new Set()
    /** @private @type {Set<string>} Raw physical keys just pressed this frame */
    this.justPressedKeys = new Set()
    /** @private @type {Set<string>} Raw physical keys just released this frame */
    this.justReleasedKeys = new Set()

    /**
     * @private
     * @type {Map<string, Set<string>>}
     * @description Maps action names to a Set of their bound input codes (e.g., 'KeyW', 'ArrowUp').
     * Example: 'moveUp' -> Set['KeyW', 'ArrowUp']
     */
    this.actionToCodesMap = new Map()

    /**
     * @private
     * @type {Map<string, string[]>}
     * @description Maps input codes back to a list of action names they trigger.
     * Example: 'KeyW' -> ['moveUp', 'shoot']
     */
    this.codeToActionsMap = new Map()

    /**
     * @private
     * @type {Map<string, {pressed: boolean, justPressed: boolean, justReleased: boolean}>}
     * @description Stores the current state of defined actions.
     */
    this.actionStates = new Map()

    this._onKeyDown = this._onKeyDown.bind(this)
    this._onKeyUp = this._onKeyUp.bind(this)

    this._addEventListeners()
    console.log('InputManager: Initialized with action mapping support.')
  }

  /** @private */
  _addEventListeners() {
    window.addEventListener('keydown', this._onKeyDown)
    window.addEventListener('keyup', this._onKeyUp)
  }

  /** @private */
  _onKeyDown(event) {
    const code = event.code
    // Raw key state
    if (!this.pressedKeys.has(code)) {
      this.justPressedKeys.add(code)
    }
    this.pressedKeys.add(code)

    // Update action states
    const actions = this.codeToActionsMap.get(code)
    if (actions) {
      actions.forEach((actionName) => {
        const state = this.actionStates.get(actionName)
        if (state && !state.pressed) {
          // If action wasn't already pressed by another key
          // Check if *any* key for this action is now pressed
          let isAnyMappedKeyPressed = false
          const mappedCodes = this.actionToCodesMap.get(actionName)
          if (mappedCodes) {
            for (const mappedCode of mappedCodes) {
              if (this.pressedKeys.has(mappedCode)) {
                isAnyMappedKeyPressed = true
                break
              }
            }
          }
          if (isAnyMappedKeyPressed && !state.pressed) {
            // Check state.pressed again to be sure
            state.justPressed = true
          }
        }
        if (state) state.pressed = true // Set pressed regardless, as one of its keys is down
      })
    }
    // event.preventDefault(); // Uncomment if you want to prevent default for all game keys
  }

  /** @private */
  _onKeyUp(event) {
    const code = event.code
    // Raw key state
    this.pressedKeys.delete(code)
    this.justReleasedKeys.add(code)

    // Update action states
    const actions = this.codeToActionsMap.get(code)
    if (actions) {
      actions.forEach((actionName) => {
        const state = this.actionStates.get(actionName)
        if (state) {
          // Check if any *other* key for this action is still pressed
          let isStillPressedByOtherKey = false
          const mappedCodes = this.actionToCodesMap.get(actionName)
          if (mappedCodes) {
            for (const mappedCode of mappedCodes) {
              if (this.pressedKeys.has(mappedCode)) {
                isStillPressedByOtherKey = true
                break
              }
            }
          }

          if (!isStillPressedByOtherKey && state.pressed) {
            // Only if it was pressed and no other keys hold it
            state.justReleased = true
            state.pressed = false
          }
        }
      })
    }
  }

  /**
   * Updates input states for the next frame. Clears "just pressed/released" flags.
   * Should be called once per game loop frame by the engine.
   */
  update() {
    this.justPressedKeys.clear()
    this.justReleasedKeys.clear()
    this.actionStates.forEach((state) => {
      state.justPressed = false
      state.justReleased = false
    })
  }

  // --- Action Mapping API ---

  /**
   * Defines an action and maps it to one or more input codes.
   * @param {string} actionName - The unique name for the action (e.g., "moveUp", "fire").
   * @param {string[]} inputCodes - An array of `event.code` strings to map to this action.
   */
  defineAction(actionName, inputCodes) {
    if (!Array.isArray(inputCodes) || inputCodes.length === 0) {
      console.warn(`InputManager: No input codes provided for action "${actionName}".`)
      return
    }
    this.actionToCodesMap.set(actionName, new Set(inputCodes))
    this.actionStates.set(actionName, { pressed: false, justPressed: false, justReleased: false })

    inputCodes.forEach((code) => {
      if (!this.codeToActionsMap.has(code)) {
        this.codeToActionsMap.set(code, [])
      }
      // Ensure actionName is only added once per code
      const actionsForCode = this.codeToActionsMap.get(code)
      if (!actionsForCode.includes(actionName)) {
        actionsForCode.push(actionName)
      }
    })
    console.log(
      `InputManager: Action "${actionName}" defined with codes: [${inputCodes.join(', ')}]`,
    )
  }

  /**
   * Removes an action definition.
   * @param {string} actionName - The name of the action to remove.
   */
  removeAction(actionName) {
    const codes = this.actionToCodesMap.get(actionName)
    if (codes) {
      codes.forEach((code) => {
        const actionsForCode = this.codeToActionsMap.get(code)
        if (actionsForCode) {
          const index = actionsForCode.indexOf(actionName)
          if (index > -1) {
            actionsForCode.splice(index, 1)
          }
          if (actionsForCode.length === 0) {
            this.codeToActionsMap.delete(code)
          }
        }
      })
    }
    this.actionToCodesMap.delete(actionName)
    this.actionStates.delete(actionName)
    console.log(`InputManager: Action "${actionName}" removed.`)
  }

  /**
   * Checks if an action is currently active (at least one of its mapped inputs is pressed).
   * @param {string} actionName - The name of the action.
   * @returns {boolean} True if the action is pressed, false otherwise.
   */
  isActionPressed(actionName) {
    const state = this.actionStates.get(actionName)
    return state ? state.pressed : false
  }

  /**
   * Checks if an action was just activated in the current frame.
   * @param {string} actionName - The name of the action.
   * @returns {boolean} True if the action was just pressed, false otherwise.
   */
  isActionJustPressed(actionName) {
    const state = this.actionStates.get(actionName)
    return state ? state.justPressed : false
  }

  /**
   * Checks if an action was just deactivated in the current frame.
   * @param {string} actionName - The name of the action.
   * @returns {boolean} True if the action was just released, false otherwise.
   */
  isActionJustReleased(actionName) {
    const state = this.actionStates.get(actionName)
    return state ? state.justReleased : false
  }

  // --- Raw Key State API (can still be useful) ---

  isKeyPressed(keyCode) {
    return this.pressedKeys.has(keyCode)
  }
  isKeyJustPressed(keyCode) {
    return this.justPressedKeys.has(keyCode)
  }
  isKeyJustReleased(keyCode) {
    return this.justReleasedKeys.has(keyCode)
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown)
    window.removeEventListener('keyup', this._onKeyUp)
    this.pressedKeys.clear()
    this.justPressedKeys.clear()
    this.justReleasedKeys.clear()
    this.actionToCodesMap.clear()
    this.codeToActionsMap.clear()
    this.actionStates.clear()
    console.log('InputManager: Event listeners removed and all states cleared.')
  }
}

export default InputManager
