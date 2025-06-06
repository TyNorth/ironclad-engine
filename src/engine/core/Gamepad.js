// src/engine/core/Gamepad.js

/**
 * @file Gamepad.js
 * @description Manages gamepad input, including connection/disconnection,
 * button states, and axis values for multiple gamepads.
 */

class GamepadHandler {
  constructor(inputManager) {
    /** @private @type {import('./InputManager.js').default} Reference to the main InputManager */
    this.inputManager = inputManager
    this.connectedGamepads = new Map()
    this.gamepadStates = new Map()
    this.prevGamepadStates = new Map()
    this.defaultDeadZone = 0.15 // Default dead zone for analog sticks
    this._onGamepadConnected = this._onGamepadConnected.bind(this)
    this._onGamepadDisconnected = this._onGamepadDisconnected.bind(this)
  }

  initialize() {
    window.addEventListener('gamepadconnected', this._onGamepadConnected)
    window.addEventListener('gamepaddisconnected', this._onGamepadDisconnected)
    this.scanForGamepads()

    console.log('GamepadHandler: Initialized, event listeners attached, and initial scan complete.')
    if (this.connectedGamepads.size > 0) {
      console.log(
        `GamepadHandler: Found ${this.connectedGamepads.size} gamepad(s) on initialization.`,
      )
      this.connectedGamepads.forEach((gp) => {
        console.log(
          `  - Gamepad [${gp.index}]: ${gp.id}, Buttons: ${gp.buttons.length}, Axes: ${gp.axes.length}, Mapping: ${gp.mapping}`,
        )
      })
    } else {
      console.log('GamepadHandler: No gamepads initially detected. Waiting for connection events.')
    }
  }

  _onGamepadConnected(event) {
    const gamepad = event.gamepad
    if (!gamepad) return
    console.log(
      `%cGamepadHandler: Gamepad CONNECTED at index ${gamepad.index}`,
      'color: limegreen; font-weight: bold;',
      `\n  ID: ${gamepad.id}`,
      `\n  Buttons: ${gamepad.buttons.length}`,
      `\n  Axes: ${gamepad.axes.length}`,
      `\n  Mapping: "${gamepad.mapping}"`,
    )
    this.connectedGamepads.set(gamepad.index, gamepad)
    if (!this.gamepadStates.has(gamepad.index)) {
      this.gamepadStates.set(gamepad.index, this._createEmptyGamepadState(gamepad))
      this.prevGamepadStates.set(gamepad.index, this._createEmptyGamepadState(gamepad))
    }
    if (this.inputManager && this.inputManager.engine && this.inputManager.engine.events) {
      this.inputManager.engine.events.emit('gamepadConnected', {
        index: gamepad.index,
        id: gamepad.id,
        buttons: gamepad.buttons.length,
        axes: gamepad.axes.length,
        mapping: gamepad.mapping,
      })
    }
  }

  _onGamepadDisconnected(event) {
    const gamepad = event.gamepad
    if (!gamepad) return
    console.log(
      `%cGamepadHandler: Gamepad DISCONNECTED at index ${gamepad.index}: ${gamepad.id}`,
      'color: orange;',
    )
    this.connectedGamepads.delete(gamepad.index)
    this.gamepadStates.delete(gamepad.index)
    this.prevGamepadStates.delete(gamepad.index)
    if (this.inputManager && this.inputManager.engine && this.inputManager.engine.events) {
      this.inputManager.engine.events.emit('gamepadDisconnected', {
        index: gamepad.index,
        id: gamepad.id,
      })
    }
  }

  _createEmptyGamepadState(gamepad) {
    return {
      buttons: Array(gamepad.buttons.length)
        .fill(null)
        .map(() => ({ pressed: false, value: 0 })),
      axes: Array(gamepad.axes.length).fill(0),
    }
  }

  scanForGamepads() {
    const rawGamepads = navigator.getGamepads ? navigator.getGamepads() : []
    for (let i = 0; i < rawGamepads.length; i++) {
      const gamepad = rawGamepads[i]
      if (gamepad) {
        if (!this.connectedGamepads.has(gamepad.index)) {
          this._onGamepadConnected({ gamepad: gamepad })
        }
      } else {
        if (this.connectedGamepads.has(i)) {
          this._onGamepadDisconnected({ gamepad: this.connectedGamepads.get(i) })
        }
      }
    }
  }

  update() {
    this.scanForGamepads()
    const rawGamepads = navigator.getGamepads ? navigator.getGamepads() : []

    this.connectedGamepads.forEach((trackedGamepad, index) => {
      const gamepad = rawGamepads[index]
      if (gamepad) {
        let currentState = this.gamepadStates.get(index)
        let prevState = this.prevGamepadStates.get(index)

        if (!currentState || !prevState) {
          if (!this.gamepadStates.has(index)) {
            this.gamepadStates.set(index, this._createEmptyGamepadState(gamepad))
            this.prevGamepadStates.set(index, this._createEmptyGamepadState(gamepad))
          }
          currentState = this.gamepadStates.get(index)
          prevState = this.prevGamepadStates.get(index)
          if (!currentState || !prevState) return
        }

        // Copy current to previous for buttons
        for (let b = 0; b < gamepad.buttons.length; b++) {
          if (currentState.buttons[b]) {
            prevState.buttons[b] = { ...currentState.buttons[b] }
          } else {
            prevState.buttons[b] = { pressed: false, value: 0 }
            currentState.buttons[b] = { pressed: false, value: 0 }
          }
        }
        // Copy current to previous for axes
        for (let a = 0; a < gamepad.axes.length; a++) {
          prevState.axes[a] = currentState.axes[a] || 0
        }

        // Update current state from raw gamepad data for buttons
        for (let b = 0; b < gamepad.buttons.length; b++) {
          const rawButton = gamepad.buttons[b]
          if (currentState.buttons[b]) {
            currentState.buttons[b].pressed = rawButton.pressed
            currentState.buttons[b].value = rawButton.value

            // --- ENHANCED LOG FOR ALL BUTTON STATE CHANGES ---
            if (rawButton.pressed !== prevState.buttons[b].pressed) {
              console.log(
                `[GamepadHandler Raw] Gamepad ${index}, Button ${b} state changed. Pressed: ${rawButton.pressed}, Value: ${rawButton.value.toFixed(2)}`,
              )
            } else if (
              rawButton.pressed &&
              Math.abs(rawButton.value - prevState.buttons[b].value) > 0.01
            ) {
              // Log if an analog button's value changes significantly while pressed
              console.log(
                `[GamepadHandler Raw] Gamepad ${index}, Button ${b} VALUE CHANGED. Value: ${rawButton.value.toFixed(2)}`,
              )
            }
            // --- END ENHANCED LOG ---
          }
        }
        // Update current state from raw gamepad data for axes
        for (let a = 0; a < gamepad.axes.length; a++) {
          let value = gamepad.axes[a]
          // --- ENHANCED LOG FOR ALL AXIS MOVEMENTS (above deadzone) ---
          if (Math.abs(value) > this.defaultDeadZone * 0.5) {
            // Log even slight movements
            // console.log(`[GamepadHandler Raw] Gamepad ${index}, Axis ${a} RAW VALUE: ${value.toFixed(4)}`);
          }
          // --- END ENHANCED LOG ---
          if (Math.abs(value) < this.defaultDeadZone) value = 0
          currentState.axes[a] = value
          if (value !== 0 && Math.abs(value - prevState.axes[a]) > 0.01) {
            // Log if axis value is active and changed
            console.log(
              `[GamepadHandler Raw] Gamepad ${index}, Axis ${a} ACTIVE VALUE: ${value.toFixed(4)}`,
            )
          }
        }
      } else if (this.connectedGamepads.has(index)) {
        this._onGamepadDisconnected({ gamepad: this.connectedGamepads.get(index) })
      }
    })
  }

  getConnectedGamepadCount() {
    return this.connectedGamepads.size
  }
  getGamepadApiObject(gamepadIndex) {
    return this.connectedGamepads.get(gamepadIndex) || null
  }
  isButtonPressed(gamepadIndex, buttonIndex) {
    const state = this.gamepadStates.get(gamepadIndex)
    return state && state.buttons[buttonIndex] ? state.buttons[buttonIndex].pressed : false
  }
  isButtonJustPressed(gamepadIndex, buttonIndex) {
    const current = this.gamepadStates.get(gamepadIndex)
    const prev = this.prevGamepadStates.get(gamepadIndex)
    if (current && prev && current.buttons[buttonIndex] && prev.buttons[buttonIndex]) {
      return current.buttons[buttonIndex].pressed && !prev.buttons[buttonIndex].pressed
    }
    return false
  }
  isButtonJustReleased(gamepadIndex, buttonIndex) {
    const current = this.gamepadStates.get(gamepadIndex)
    const prev = this.prevGamepadStates.get(gamepadIndex)
    if (current && prev && current.buttons[buttonIndex] && prev.buttons[buttonIndex]) {
      return !current.buttons[buttonIndex].pressed && prev.buttons[buttonIndex].pressed
    }
    return false
  }
  getButtonValue(gamepadIndex, buttonIndex) {
    const state = this.gamepadStates.get(gamepadIndex)
    return state && state.buttons[buttonIndex] ? state.buttons[buttonIndex].value : 0
  }
  getAxisValue(gamepadIndex, axisIndex) {
    const state = this.gamepadStates.get(gamepadIndex)
    return state && state.axes[axisIndex] !== undefined ? state.axes[axisIndex] : 0
  }
  destroy() {
    window.removeEventListener('gamepadconnected', this._onGamepadConnected)
    window.removeEventListener('gamepaddisconnected', this._onGamepadDisconnected)
    this.connectedGamepads.clear()
    this.gamepadStates.clear()
    this.prevGamepadStates.clear()
  }

  static BUTTON_A = 0
  static BUTTON_B = 1
  static BUTTON_X = 2
  static BUTTON_Y = 3
  static BUTTON_L1 = 4
  static BUTTON_R1 = 5
  static BUTTON_L2 = 6
  static BUTTON_R2 = 7
  static BUTTON_SELECT = 8
  static BUTTON_START = 9
  static BUTTON_L3 = 10
  static BUTTON_R3 = 11
  static BUTTON_DPAD_UP = 12
  static BUTTON_DPAD_DOWN = 13
  static BUTTON_DPAD_LEFT = 14
  static BUTTON_DPAD_RIGHT = 15
  static BUTTON_GUIDE = 16
  static AXIS_LEFT_STICK_X = 0
  static AXIS_LEFT_STICK_Y = 1
  static AXIS_RIGHT_STICK_X = 2
  static AXIS_RIGHT_STICK_Y = 3
}
export default GamepadHandler
