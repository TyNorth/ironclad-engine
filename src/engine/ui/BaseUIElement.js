// src/engine/ui/BaseUIElement.js

class BaseUIElement {
  constructor(options = {}) {
    this.x = options.x || 0
    this.y = options.y || 0
    this.width = options.width || 0
    this.height = options.height || 0
    this.visible = options.visible !== undefined ? options.visible : true
    this.enabled = options.enabled !== undefined ? options.enabled : true
    this.id = options.id || null
    this.text = options.text || '' // Store text for logging if available

    this.engine = null

    this._clickCallback = null
    if (typeof options.onClick === 'function') {
      this._clickCallback = options.onClick
    }
  }

  setEngine(engine) {
    this.engine = engine
  }

  containsPoint(px, py) {
    return px >= this.x && px <= this.x + this.width && py >= this.y && py <= this.y + this.height
  }

  update(deltaTime, engine, mousePos) {
    // Base implementation
  }

  render(context, engine) {
    if (!this.visible) {
      return
    }
    if (!context) {
      console.error(
        `UIElement (${this.id || this.constructor.name}): Render called without a valid context.`,
      )
      return
    }
    this._drawSelf(context, engine)
  }

  _drawSelf(context, engine) {
    // console.warn(`UIElement (${this.id || this.constructor.name}): _drawSelf method not implemented.`);
  }

  onClick(callback) {
    if (typeof callback === 'function') {
      this._clickCallback = callback
    }
  }

  _triggerClick() {
    const elementName = this.id || this.text || this.constructor.name // Get a descriptive name
    if (this.enabled && this.visible && this._clickCallback) {
      console.log(
        `%c[BaseUIElement] TRIGGERING CLICK for: ${elementName}`,
        'color: limegreen; font-weight: bold;',
      )
      this._clickCallback()
    } else {
      console.warn(
        `%c[BaseUIElement] Click NOT triggered for: ${elementName}. Enabled: ${this.enabled}, Visible: ${this.visible}, CallbackPresent: ${!!this._clickCallback}`,
        'color: orange;',
      )
    }
  }

  setPosition(x, y) {
    this.x = x
    this.y = y
  }
  setSize(width, height) {
    this.width = width
    this.height = height
  }
  show() {
    this.visible = true
  }
  hide() {
    this.visible = false
  }
  enable() {
    this.enabled = true
  }
  disable() {
    this.enabled = false
  }
}

export default BaseUIElement
