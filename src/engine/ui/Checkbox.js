// src/engine/ui/Checkbox.js
import BaseUIElement from './BaseUIElement.js'

/**
 * @class Checkbox
 * @extends BaseUIElement
 * @description An interactive UI element that represents a boolean state (checked/unchecked).
 */
class Checkbox extends BaseUIElement {
  /**
   * Creates an instance of Checkbox.
   * @param {object} options - Configuration options for the checkbox.
   * @param {number} [options.x=0] - The x-coordinate of the checkbox (top-left of the box).
   * @param {number} [options.y=0] - The y-coordinate of the checkbox (top-left of the box).
   * @param {string} [options.label=''] - Text label to display next to the checkbox.
   * @param {boolean} [options.isChecked=false] - Initial checked state.
   * @param {number} [options.boxSize=16] - The size (width and height) of the checkbox square.
   * @param {number} [options.labelOffset=5] - Space between the checkbox and the label text.
   * @param {string} [options.font='16px sans-serif'] - Font for the label.
   * @param {string} [options.textColor='white'] - Color for the label text.
   * @param {string} [options.boxColor='white'] - Color of the checkbox border/box.
   * @param {string} [options.checkColor='dodgerblue'] - Color of the checkmark or fill when checked.
   * @param {string} [options.hoverBoxColor=null] - Optional: Color of the box when hovered (if you implement hover visual state).
   * @param {string} [options.disabledColor='gray'] - Color for box and text when disabled.
   * @param {string} [options.disabledCheckColor='darkgray'] - Color for the checkmark when disabled and checked.
   * @param {function} [options.onClick] - Callback function when the checkbox is clicked (state toggled).
   * @param {boolean} [options.visible=true] - Whether the checkbox is visible.
   * @param {boolean} [options.enabled=true] - Whether the checkbox is enabled.
   * @param {string} [options.id] - Optional ID.
   * @param {number} [options.width] - Optional: Explicit width for the entire clickable area (box + label).
   * @param {number} [options.height] - Optional: Explicit height for the entire clickable area.
   */
  constructor(options = {}) {
    const boxSize = options.boxSize || 16
    const labelOffset = options.labelOffset || 5
    let estimatedWidth = boxSize
    if (options.label) {
      // A more accurate width estimation would require measuring text with canvas context.
      // For simplicity, this is a rough estimate.
      // Consider setting explicit width if precise hit area for label text is needed.
      estimatedWidth += labelOffset + options.label.length * (boxSize * 0.6) // Rough estimate
    }

    super({
      ...options,
      width: options.width !== undefined ? options.width : estimatedWidth,
      height: options.height !== undefined ? options.height : boxSize,
    })

    this.label = options.label || ''
    this.isChecked = !!options.isChecked // Ensure boolean
    this.boxSize = boxSize
    this.labelOffset = labelOffset

    this.font = options.font || '16px sans-serif'
    this.textColor = options.textColor || 'white'
    this.boxColor = options.boxColor || 'white'
    this.checkColor = options.checkColor || 'dodgerblue'
    this.hoverBoxColor = options.hoverBoxColor || null
    this.disabledColor = options.disabledColor || 'gray'
    this.disabledCheckColor = options.disabledCheckColor || 'darkgray'

    this.isHovered = false // For visual feedback on hover, if desired
  }

  /**
   * Toggles the checked state of the checkbox.
   * Also triggers the onClick callback.
   */
  toggle() {
    if (!this.enabled || !this.visible) return
    this.isChecked = !this.isChecked
    this._triggerClick() // Call the inherited click handler from BaseUIElement
  }

  /**
   * Sets the checked state of the checkbox.
   * @param {boolean} checked - The new checked state.
   * @param {boolean} [triggerCallback=false] - Whether to trigger the onClick callback.
   */
  setChecked(checked, triggerCallback = false) {
    if (!this.enabled || !this.visible) return
    const newState = !!checked
    if (this.isChecked !== newState) {
      this.isChecked = newState
      if (triggerCallback) {
        this._triggerClick()
      }
    }
  }

  /**
   * Updates the checkbox's state based on mouse input.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../core/IroncladEngine.js').default} engine - The engine instance.
   * @param {{x: number, y: number}} mousePos - Current canvas-relative mouse position.
   */
  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos) // Call base update

    if (!this.visible || !this.enabled) {
      this.isHovered = false
      return
    }

    // The clickable area is defined by this.x, this.y, this.width, this.height from BaseUIElement
    this.isHovered = this.containsPoint(mousePos.x, mousePos.y)

    const inputManager = engine.inputManager
    if (
      this.isHovered &&
      inputManager.isMouseButtonJustPressed(inputManager.constructor.MOUSE_BUTTON_LEFT)
    ) {
      this.toggle()
    }
  }

  /**
   * Specific drawing logic for the Checkbox.
   * Called by BaseUIElement.render after visibility and context checks.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../core/IroncladEngine.js').default} engine - The engine instance.
   * @protected
   */
  _drawSelf(context, engine) {
    // Determine colors based on enabled state
    const currentBoxColor = !this.enabled
      ? this.disabledColor
      : this.isHovered && this.hoverBoxColor
        ? this.hoverBoxColor
        : this.boxColor
    const currentTextColor = !this.enabled ? this.disabledColor : this.textColor
    const currentCheckColor = !this.enabled ? this.disabledCheckColor : this.checkColor

    // Draw the checkbox square
    context.strokeStyle = currentBoxColor
    context.lineWidth = 2
    context.strokeRect(this.x, this.y, this.boxSize, this.boxSize)

    // Draw the checkmark if checked
    if (this.isChecked) {
      context.fillStyle = currentCheckColor
      // Simple filled square as checkmark
      const padding = Math.max(2, this.boxSize / 5) // Ensure padding is reasonable
      context.fillRect(
        this.x + padding,
        this.y + padding,
        this.boxSize - padding * 2,
        this.boxSize - padding * 2,
      )
    }

    // Draw the label text
    if (this.label) {
      context.font = this.font
      context.fillStyle = currentTextColor
      context.textAlign = 'left'
      context.textBaseline = 'middle' // Align text vertically with the middle of the box
      context.fillText(
        this.label,
        this.x + this.boxSize + this.labelOffset,
        this.y + this.boxSize / 2,
      )
    }
  }
}

export default Checkbox
