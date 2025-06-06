// src/engine/ui/TextInputField.js
import BaseUIElement from './BaseUIElement.js'

/**
 * @class TextInputField
 * @extends BaseUIElement
 * @description An interactive UI element for text input from the keyboard.
 */
class TextInputField extends BaseUIElement {
  /**
   * Creates an instance of TextInputField.
   * @param {object} options - Configuration options.
   * @param {number} [options.x=0] - The x-coordinate.
   * @param {number} [options.y=0] - The y-coordinate.
   * @param {number} [options.width=200] - The width of the input field.
   * @param {number} [options.height=30] - The height of the input field.
   * @param {string} [options.initialText=''] - Initial text content.
   * @param {string} [options.placeholderText=''] - Text to display when the field is empty and not focused.
   * @param {number} [options.maxLength=null] - Maximum number of characters. Null for no limit.
   * @param {string} [options.font='16px sans-serif'] - Font for the text.
   * @param {string} [options.textColor='black'] - Color of the text.
   * @param {string} [options.placeholderColor='gray'] - Color of the placeholder text.
   * @param {string} [options.backgroundColor='white'] - Background color of the field.
   * @param {string} [options.borderColor='gray'] - Border color.
   * @param {string} [options.focusBorderColor='dodgerblue'] - Border color when focused.
   * @param {number} [options.borderWidth=1] - Width of the border.
   * @param {number} [options.padding=5] - Inner padding for text.
   * @param {function(string):void} [options.onEnterPressed] - Callback when Enter is pressed. Receives current text.
   * @param {function(string):void} [options.onTextChanged] - Callback when text changes. Receives new text.
   * @param {function():void} [options.onFocus] - Callback when the field gains focus.
   * @param {function():void} [options.onBlur] - Callback when the field loses focus.
   */
  constructor(options = {}) {
    super(options) // Handles x, y, width, height, visible, enabled, id

    this.text = options.initialText || ''
    this.placeholderText = options.placeholderText || ''
    this.maxLength = options.maxLength || null

    this.font = options.font || '16px sans-serif'
    this.textColor = options.textColor || 'black'
    this.placeholderColor = options.placeholderColor || 'gray'
    this.backgroundColor = options.backgroundColor || 'white'
    this.borderColor = options.borderColor || 'gray'
    this.focusBorderColor = options.focusBorderColor || 'dodgerblue'
    this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 1
    this.padding = options.padding !== undefined ? options.padding : 5

    this.isFocused = false
    this.cursorVisible = false
    this.cursorBlinkRate = 500 // milliseconds
    this._cursorBlinkTimer = 0
    this._cursorPosition = this.text.length // For now, cursor is always at the end

    this.onEnterPressed = options.onEnterPressed || null
    this.onTextChanged = options.onTextChanged || null
    this.onFocusCallback = options.onFocus || null
    this.onBlurCallback = options.onBlur || null

    // Bind methods that will be used as event handlers
    this._boundHandleKeyDown = this._handleKeyDown.bind(this)
    this._boundHandleGlobalClick = this._handleGlobalClick.bind(this)
  }

  focus() {
    if (!this.enabled || this.isFocused) return
    this.isFocused = true
    this.cursorVisible = true
    this._cursorBlinkTimer = 0
    window.addEventListener('keydown', this._boundHandleKeyDown)
    document.addEventListener('mousedown', this._boundHandleGlobalClick, true) // Capture phase for global click
    if (this.onFocusCallback) this.onFocusCallback()
    // console.log(`TextInput (${this.id || 'ID_not_set'}): Focused`);
  }

  blur() {
    if (!this.isFocused) return
    this.isFocused = false
    this.cursorVisible = false
    window.removeEventListener('keydown', this._boundHandleKeyDown)
    document.removeEventListener('mousedown', this._boundHandleGlobalClick, true)
    if (this.onBlurCallback) this.onBlurCallback()
    // console.log(`TextInput (${this.id || 'ID_not_set'}): Blurred`);
  }

  setText(newText, triggerCallback = true) {
    const oldText = this.text
    if (this.maxLength !== null) {
      this.text = newText.substring(0, this.maxLength)
    } else {
      this.text = newText
    }
    this._cursorPosition = this.text.length // Keep cursor at end for simplicity

    if (this.onTextChanged && triggerCallback && oldText !== this.text) {
      this.onTextChanged(this.text)
    }
  }

  _handleGlobalClick(event) {
    // If click is outside this element, blur it.
    if (this.isFocused) {
      const canvas = this.engine ? this.engine.canvas : null
      if (canvas && event.target !== canvas) {
        // Click was outside canvas entirely
        this.blur()
        return
      }
      // If click was on canvas, check if it's outside this element's bounds
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top
        // TODO: Adjust mouseX, mouseY for canvas scaling if necessary
        if (!this.containsPoint(mouseX, mouseY)) {
          this.blur()
        }
      }
    }
  }

  _handleKeyDown(event) {
    if (!this.isFocused || !this.enabled) return

    // Prevent default browser action for keys we handle,
    // to avoid page scroll on space, or form submission on enter etc.
    if (
      event.key.length === 1 ||
      event.key === 'Backspace' ||
      event.key === 'Enter' ||
      event.key === 'Delete'
    ) {
      event.preventDefault()
    }

    let newText = this.text
    if (event.key.length === 1) {
      // Printable character
      if (this.maxLength === null || this.text.length < this.maxLength) {
        newText += event.key
      }
    } else if (event.key === 'Backspace') {
      newText = this.text.substring(0, this.text.length - 1)
    } else if (event.key === 'Enter') {
      if (this.onEnterPressed) {
        this.onEnterPressed(this.text)
      }
      // Optionally blur on enter: this.blur();
      return // Don't update text or call onTextChanged for Enter itself
    } else if (event.key === 'Delete') {
      // Basic delete: if cursor was at end, same as backspace.
      // Advanced: would delete char at cursor position.
      newText = this.text.substring(0, this.text.length - 1)
    } else {
      return // Ignore other special keys for now (arrows, home, end, etc.)
    }

    if (newText !== this.text) {
      this.setText(newText) // This will call onTextChanged
    }
    this.cursorVisible = true // Make cursor visible on key press
    this._cursorBlinkTimer = 0 // Reset blink timer
  }

  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos)
    if (!this.visible) return // Enabled check is handled in focus/blur/keydown

    // Handle click to focus
    const inputManager = engine.inputManager
    if (
      this.enabled &&
      inputManager.isMouseButtonJustPressed(inputManager.constructor.MOUSE_BUTTON_LEFT)
    ) {
      if (this.containsPoint(mousePos.x, mousePos.y)) {
        if (!this.isFocused) {
          this.focus()
        }
      }
      // Blurring by clicking outside is handled by _handleGlobalClick
    }

    // Cursor blinking
    if (this.isFocused) {
      this._cursorBlinkTimer += deltaTime * 1000 // deltaTime is in seconds
      if (this._cursorBlinkTimer >= this.cursorBlinkRate) {
        this.cursorVisible = !this.cursorVisible
        this._cursorBlinkTimer = 0
      }
    } else {
      this.cursorVisible = false
    }
  }

  _drawSelf(context, engine) {
    // Background
    context.fillStyle = this.backgroundColor
    context.fillRect(this.x, this.y, this.width, this.height)

    // Border
    if (this.borderWidth > 0) {
      context.strokeStyle =
        this.isFocused && this.enabled ? this.focusBorderColor : this.borderColor
      context.lineWidth = this.borderWidth
      context.strokeRect(this.x, this.y, this.width, this.height)
    }

    // Text or Placeholder
    context.font = this.font
    context.textAlign = 'left'
    context.textBaseline = 'middle' // Vertically center text

    const textX = this.x + this.padding
    const textY = this.y + this.height / 2

    if (this.text.length > 0) {
      context.fillStyle = this.enabled ? this.textColor : 'darkgray'
      context.fillText(this.text, textX, textY)
    } else if (!this.isFocused && this.placeholderText) {
      context.fillStyle = this.enabled ? this.placeholderColor : 'darkgray'
      context.fillText(this.placeholderText, textX, textY)
    }

    // Cursor
    if (this.isFocused && this.cursorVisible && this.enabled) {
      // Measure text to position cursor at the end
      // For simplicity, cursor is always at the end.
      // A more complex implementation would track cursor position within the text.
      const textWidth = context.measureText(this.text).width
      const cursorX = textX + textWidth
      const cursorYStart = this.y + this.padding
      const cursorYEnd = this.y + this.height - this.padding

      context.strokeStyle = this.enabled ? this.textColor : 'darkgray'
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(cursorX, cursorYStart)
      context.lineTo(cursorX, cursorYEnd)
      context.stroke()
    }
  }

  destroy() {
    super.destroy() // Call if BaseUIElement has a destroy method
    this.blur() // Ensure listeners are removed
    // console.log(`TextInput (${this.id || 'ID_not_set'}): Destroyed`);
  }
}

export default TextInputField
