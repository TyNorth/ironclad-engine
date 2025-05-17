// src/engine/ui/Panel.js
import BaseUIElement from './BaseUIElement.js'

/**
 * @class Panel
 * @extends BaseUIElement
 * @description A UI element that acts as a container for other UI elements,
 * providing a background and border.
 */
class Panel extends BaseUIElement {
  /**
   * Creates an instance of Panel.
   * @param {object} options - Configuration options for the panel.
   * @param {number} [options.x=0] - The x-coordinate.
   * @param {number} [options.y=0] - The y-coordinate.
   * @param {number} [options.width=100] - The width of the panel.
   * @param {number} [options.height=100] - The height of the panel.
   * @param {string} [options.backgroundColor=null] - Background color (e.g., 'rgba(0,0,0,0.5)'). If null, no background.
   * @param {string} [options.borderColor='gray'] - Border color.
   * @param {number} [options.borderWidth=0] - Width of the border. If 0, no border.
   * @param {BaseUIElement[]} [options.children=[]] - Initial child elements.
   * @param {boolean} [options.visible=true] - Whether the panel is visible.
   * @param {boolean} [options.enabled=true] - Whether the panel is enabled for updates.
   * @param {string} [options.id] - Optional ID.
   */
  constructor(options = {}) {
    super(options) // BaseUIElement handles x, y, width, height, visible, enabled, id

    this.backgroundColor = options.backgroundColor || null
    this.borderColor = options.borderColor || 'gray'
    this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 0

    /** @type {BaseUIElement[]} */
    this.children = []
    if (options.children && Array.isArray(options.children)) {
      options.children.forEach((child) => this.addChild(child))
    }
  }

  addChild(element) {
    if (element instanceof BaseUIElement) {
      this.children.push(element)
      if (this.engine) {
        element.setEngine(this.engine)
      }
    } else {
      console.warn('Panel.addChild: Attempted to add a non-UIElement.', element)
    }
  }

  removeChild(element) {
    const index = this.children.indexOf(element)
    if (index > -1) {
      this.children.splice(index, 1)
      return true
    }
    return false
  }

  clearChildren() {
    this.children = []
  }

  setEngine(engine) {
    super.setEngine(engine)
    this.children.forEach((child) => child.setEngine(engine))
  }

  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos) // Call base update

    if (!this.visible || !this.enabled) {
      // If panel is not active, its children aren't either for input processing purposes.
      // Individual children will still respect their own visible/enabled flags for rendering/updating.
      return
    }

    for (const child of this.children) {
      // Children's update methods will check their own visible/enabled flags.
      child.update(deltaTime, engine, mousePos)
    }
  }

  /**
   * Specific drawing logic for the Panel and its children.
   * Called by BaseUIElement.render after visibility and context checks.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../core/IroncladEngine.js').default} engine - The engine instance.
   * @protected
   */
  _drawSelf(context, engine) {
    // No need for this.visible check, BaseUIElement.render handles it.

    // Render panel background
    if (this.backgroundColor) {
      context.fillStyle = this.backgroundColor
      context.fillRect(this.x, this.y, this.width, this.height)
    }

    // Render panel border
    if (this.borderWidth > 0) {
      context.strokeStyle = this.borderColor
      context.lineWidth = this.borderWidth
      context.strokeRect(this.x, this.y, this.width, this.height)
    }

    // Render children
    // Children will perform their own visibility checks via their public render method.
    // context.save(); // Optional: if applying clipping or transforms for children
    // If children's x,y were relative to the panel, you'd use:
    // context.translate(this.x, this.y);
    // Then children would draw at (child.x, child.y) within this translated space.
    // For now, children use absolute canvas coordinates.

    for (const child of this.children) {
      // IMPORTANT: Call the child's public `render` method, not `_drawSelf` directly.
      // This allows each child to do its own visibility/context checks.
      child.render(context, engine)
    }

    // if (context.translate was used) context.restore();
  }
}

export default Panel
