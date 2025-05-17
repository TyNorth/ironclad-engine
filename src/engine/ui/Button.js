// src/engine/ui/Button.js
import BaseUIElement from './BaseUIElement.js'

class Button extends BaseUIElement {
  constructor(options = {}) {
    super(options)

    // this.text is inherited from BaseUIElement if options.text is passed
    this.font = options.font || '16px sans-serif'
    this.textColor = options.textColor || 'white'
    this.disabledTextColor = options.disabledTextColor || 'darkgray'

    this.backgroundColor = options.backgroundColor || 'gray'
    this.hoverBackgroundColor = options.hoverBackgroundColor || 'darkgray'
    this.pressedBackgroundColor = options.pressedBackgroundColor || 'dimgray'
    this.disabledBackgroundColor = options.disabledBackgroundColor || '#555555'

    this.borderColor = options.borderColor || 'black'
    this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 1

    this.isHovered = false
    this.isPressed = false
  }

  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos)
    const elementName = this.id || this.text || this.constructor.name

    console.log(
      `[Button: ${elementName}] update called. Visible: ${this.visible}, Enabled: ${this.enabled}`,
    )

    if (!this.visible) {
      console.log(`[Button: ${elementName}] Not visible. Skipping update.`)
      this.isHovered = false
      this.isPressed = false
      return
    }
    if (!this.enabled) {
      console.log(`[Button: ${elementName}] Not enabled. Skipping interaction.`)
      this.isHovered = false
      this.isPressed = false
      return
    }

    // Log current state for this button
    // console.log(`[Button: ${elementName}] Updating. Pos:(${this.x},${this.y}) W:${this.width} H:${this.height}. Mouse:(${mousePos.x},${mousePos.y})`);

    this.isHovered = this.containsPoint(mousePos.x, mousePos.y)

    const inputManager = engine.inputManager
    const leftButton = inputManager.constructor.MOUSE_BUTTON_LEFT

    const lmbPressed = inputManager.isMouseButtonPressed(leftButton)
    const lmbJustReleased = inputManager.isMouseButtonJustReleased(leftButton)

    // if (this.text === 'Back') { // Focus debug on one button
    //     console.log(`[Button: ${elementName}] Hover: ${this.isHovered}, PressedState: ${this.isPressed}, LMB_Down: ${lmbPressed}, LMB_JustUp: ${lmbJustReleased}`);
    // }

    if (this.isHovered) {
      if (lmbPressed) {
        // Mouse button is currently down
        this.isPressed = true
      } else {
        // Mouse button is up
        if (this.isPressed && lmbJustReleased) {
          // Was pressed, and just released now WHILE HOVERED
          console.log(
            `%c[Button: ${elementName}] Click condition met! Hovered, was pressed, just released.`,
            'color: cyan;',
          )
          this._triggerClick()
        }
        this.isPressed = false
      }
    } else {
      // If mouse is not over the button
      if (!lmbPressed) {
        // If mouse button is also up, definitely not pressed
        this.isPressed = false
      }
      // If mouse was pressed on button then dragged off, isPressed remains true until button is released
    }
  }

  _drawSelf(context, engine) {
    const elementName = this.id || this.text || this.constructor.name
    let currentBgColor = this.backgroundColor
    let currentTxtColor = this.textColor

    if (!this.enabled) {
      currentBgColor = this.disabledBackgroundColor
      currentTxtColor = this.disabledTextColor
    } else if (this.isPressed && this.isHovered) {
      currentBgColor = this.pressedBackgroundColor
    } else if (this.isHovered) {
      currentBgColor = this.hoverBackgroundColor
    }

    context.fillStyle = currentBgColor
    context.fillRect(this.x, this.y, this.width, this.height)

    if (this.borderWidth > 0) {
      context.strokeStyle = this.borderColor
      context.lineWidth = this.borderWidth
      context.strokeRect(this.x, this.y, this.width, this.height)
    }

    context.font = this.font
    context.fillStyle = currentTxtColor
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2)
  }
}

export default Button
