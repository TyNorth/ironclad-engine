// src/engine/ui/Label.js
import BaseUIElement from './BaseUIElement.js'

/**
 * @class Label
 * @extends BaseUIElement
 * @description A simple UI element for displaying text.
 */
class Label extends BaseUIElement {
  /**
   * Creates an instance of Label.
   * @param {object} options - Configuration options for the label.
   * @param {number} [options.x=0] - The x-coordinate of the label.
   * @param {number} [options.y=0] - The y-coordinate of the label.
   * @param {string} options.text - The text content of the label.
   * @param {string} [options.font='16px sans-serif'] - The font style (e.g., '20px Arial', 'bold 16px Verdana').
   * @param {string} [options.color='white'] - The color of the text.
   * @param {string} [options.textAlign='left'] - Horizontal alignment of the text ('left', 'center', 'right', 'start', 'end').
   * @param {string} [options.textBaseline='top'] - Vertical alignment of the text ('top', 'middle', 'bottom', 'alphabetic', 'hanging', 'ideographic').
   * @param {boolean} [options.visible=true] - Whether the label is visible.
   * @param {boolean} [options.enabled=true] - Whether the label is enabled (usually doesn't affect Labels directly unless for color change).
   * @param {string} [options.id] - Optional ID for the label.
   * @param {string} [options.disabledColor='gray'] - Optional color for text when element is disabled.
   * @param {number} [options.width] - Optional: Explicit width.
   * @param {number} [options.height] - Optional: Explicit height.
   */
  constructor(options = {}) {
    super(options) // Pass all options to BaseUIElement constructor

    this.text = options.text || ''
    this.font = options.font || '16px sans-serif'
    this.color = options.color || 'white'
    this.textAlign = options.textAlign || 'left'
    this.textBaseline = options.textBaseline || 'top'
    this.disabledColor = options.disabledColor || 'gray' // Color when this.enabled is false
  }

  /**
   * Sets the text content of the label.
   * @param {string} newText - The new text to display.
   */
  setText(newText) {
    this.text = newText
  }

  /**
   * Specific drawing logic for the Label.
   * Called by BaseUIElement.render after visibility and context checks.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../core/IroncladEngine.js').default} [engine] - The engine instance.
   * @protected
   */
  _drawSelf(context, engine) {
    // No need to check this.visible or context here, BaseUIElement's render method did it.
    if (!this.text) {
      return // Don't render if no text
    }

    context.font = this.font
    context.fillStyle = this.enabled ? this.color : this.disabledColor
    context.textAlign = this.textAlign
    context.textBaseline = this.textBaseline

    // The x, y from BaseUIElement are used as the anchor point based on textAlign and textBaseline.
    context.fillText(this.text, this.x, this.y)
  }

  /**
   * Update logic for the Label (typically none for a static label).
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../core/IroncladEngine.js').default} engine - The engine instance.
   * @param {{x: number, y: number}} [mousePos] - Current canvas-relative mouse position.
   */
  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos) // Call base update
    // Labels are typically static and don't require per-frame updates beyond visibility/enable checks handled by base.
  }
}

export default Label
