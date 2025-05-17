// src/engine/ui/ValueBar.js
import BaseUIElement from './BaseUIElement.js'

/**
 * @class ValueBar
 * @extends BaseUIElement
 * @description A UI element to visually represent a quantifiable value as a proportion of a maximum,
 * such as health, mana, progress, etc.
 */
class ValueBar extends BaseUIElement {
  /**
   * Creates an instance of ValueBar.
   * @param {object} options - Configuration options for the value bar.
   * @param {number} [options.x=0] - The x-coordinate.
   * @param {number} [options.y=0] - The y-coordinate.
   * @param {number} [options.width=100] - The width of the bar.
   * @param {number} [options.height=10] - The height of the bar.
   * @param {number} [options.maxValue=100] - The maximum value the bar can represent.
   * @param {number} [options.currentValue=options.maxValue] - The current value to display.
   * @param {string} [options.backgroundColor='#444444'] - Color of the bar's background (empty part).
   * @param {string} [options.fillColor='skyblue'] - Color of the bar's fill (current value part).
   * @param {string} [options.borderColor='black'] - Color of the bar's border.
   * @param {number} [options.borderWidth=1] - Width of the border.
   * @param {boolean} [options.showText=false] - Whether to display text value on the bar.
   * @param {string} [options.font] - Font for the text (if shown). Defaults to a calculated size.
   * @param {string} [options.textColor='white'] - Color for the text (if shown).
   * @param {function(number, number): string} [options.textFormatFunction] - Function to format the text. Receives (current, max). Defaults to `current / max`.
   * @param {boolean} [options.visible=true] - Whether the bar is visible.
   * @param {string} [options.id] - Optional ID.
   */
  constructor(options = {}) {
    super(options) // Handles x, y, width, height, visible, enabled, id

    this.maxValue = options.maxValue !== undefined ? options.maxValue : 100
    let initialCurrentValue =
      options.currentValue !== undefined ? options.currentValue : this.maxValue
    this.currentValue = Math.max(0, Math.min(initialCurrentValue, this.maxValue))

    this.backgroundColor = options.backgroundColor || '#444444'
    this.fillColor = options.fillColor || 'skyblue' // Changed default from 'green'
    this.borderColor = options.borderColor || 'black'
    this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 1

    this.showText = options.showText || false
    this.font = options.font || `${Math.max(8, Math.floor(this.height * 0.7))}px sans-serif`
    this.textColor = options.textColor || 'white'
    this.textFormatFunction =
      options.textFormatFunction ||
      ((current, max) => `${Math.round(current)} / ${Math.round(max)}`)
  }

  /**
   * Sets the current and maximum values of the bar.
   * @param {number} current - The new current value.
   * @param {number} [max] - The new maximum value. If undefined, maxValue remains unchanged.
   */
  setValue(current, max) {
    if (max !== undefined) {
      this.maxValue = Math.max(1, max)
    }
    this.currentValue = Math.max(0, Math.min(current, this.maxValue))
  }

  /**
   * Sets the fill level of the bar based on a percentage.
   * @param {number} percentage - The percentage (0 to 100) to fill the bar.
   */
  setPercentage(percentage) {
    const clampedPercentage = Math.max(0, Math.min(percentage, 100))
    this.currentValue = (clampedPercentage / 100) * this.maxValue
  }

  /**
   * Update logic for the ValueBar.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../core/IroncladEngine.js').default} engine - The engine instance.
   * @param {{x: number, y: number}} [mousePos] - Current canvas-relative mouse position.
   */
  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos)
    // Value bars are typically updated via setValue/setPercentage.
  }

  /**
   * Specific drawing logic for the ValueBar.
   * Called by BaseUIElement.render after visibility and context checks.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../core/IroncladEngine.js').default} [engine] - The engine instance.
   * @protected
   */
  _drawSelf(context, engine) {
    // Draw background
    context.fillStyle = this.backgroundColor
    context.fillRect(this.x, this.y, this.width, this.height)

    // Calculate fill width
    const fillPercentage = this.maxValue > 0 ? this.currentValue / this.maxValue : 0
    const fillWidth = Math.max(0, this.width * fillPercentage)

    // Draw fill
    if (fillWidth > 0) {
      context.fillStyle = this.fillColor
      context.fillRect(this.x, this.y, fillWidth, this.height)
    }

    // Draw border
    if (this.borderWidth > 0) {
      context.strokeStyle = this.borderColor
      context.lineWidth = this.borderWidth
      context.strokeRect(this.x, this.y, this.width, this.height)
    }

    // Draw text
    if (this.showText) {
      context.font = this.font
      context.fillStyle = this.textColor
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      const textToDisplay = this.textFormatFunction(this.currentValue, this.maxValue)
      context.fillText(textToDisplay, this.x + this.width / 2, this.y + this.height / 2 + 1)
    }
  }
}

export default ValueBar
