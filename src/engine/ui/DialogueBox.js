// src/engine/ui/DialogueBox.js
import BaseUIElement from './BaseUIElement.js'
import Button from './Button.js'
// import Label from './Label.js'; // Not strictly needed if Button handles its own text

/**
 * @class DialogueBox
 * @extends BaseUIElement
 * @description A UI element for displaying dialogue text, speaker name, character portraits, and interactive choices.
 *
 * @param {object} options - Configuration options for the dialogue box.
 * @param {number} [options.x=0] - The x-coordinate of the top-left corner.
 * @param {number} [options.y=0] - The y-coordinate of the top-left corner.
 * @param {number} [options.width=600] - The width of the dialogue box.
 * @param {number} [options.height=150] - The height of the dialogue box.
 * @param {string} [options.backgroundColor='rgba(0,0,0,0.75)'] - Background color of the box.
 * @param {string} [options.borderColor='white'] - Border color of the box.
 * @param {number} [options.borderWidth=2] - Width of the border.
 * @param {number} [options.padding=15] - Inner padding for text and other elements.
 * @param {string} [options.textFont='18px sans-serif'] - Font for the main dialogue text.
 * @param {string} [options.textColor='white'] - Color for the main dialogue text.
 * @param {string} [options.speakerFont='bold 20px sans-serif'] - Font for the speaker's name.
 * @param {string} [options.speakerColor='lightblue'] - Color for the speaker's name.
 * @param {number} [options.typewriterSpeed=50] - Characters per second for the typewriter effect (0 for instant text).
 * @param {string} [options.advanceIndicatorText='▼'] - Text/symbol for the advance indicator.
 * @param {string} [options.advanceIndicatorFont='16px sans-serif'] - Font for the advance indicator.
 * @param {string} [options.advanceIndicatorColor='lightgray'] - Color for the advance indicator.
 * @param {object} [options.portraitConfig] - Configuration for character portraits.
 * @param {number} [options.portraitConfig.width=80] - Width of the portrait area.
 * @param {number} [options.portraitConfig.height=80] - Height of the portrait area.
 * @param {number} [options.portraitConfig.xOffset=10] - X offset for the portrait from the box edge.
 * @param {number} [options.portraitConfig.yOffset=10] - Y offset for the portrait.
 * @param {number} [options.choiceButtonHeight=30] - Height of each choice button.
 * @param {number} [options.choiceButtonWidth=0] - Width of choice buttons. If 0, fits to panel width minus padding/portrait.
 * @param {number} [options.choiceSpacing=5] - Vertical spacing between choice buttons.
 * @param {string} [options.choiceFont='16px sans-serif'] - Font for choice button text.
 * @param {string} [options.choiceButtonBgColor='rgba(50,50,50,0.8)'] - Background color for choice buttons.
 * @param {string} [options.choiceButtonHoverBgColor='rgba(80,80,80,0.9)'] - Hover background color for choice buttons.
 * @param {string} [options.choiceButtonTextColor='white'] - Text color for choice buttons.
 * @param {function(string):void} [options.onChoiceSelect] - Callback when a player choice is selected (passes the choice ID).
 * @param {function():void} [options.onTextAdvance] - Callback when player requests to advance fully displayed text (and no choices are pending).
 */
class DialogueBox extends BaseUIElement {
  constructor(options = {}) {
    super(options)

    this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0.75)'
    this.borderColor = options.borderColor || 'white'
    this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 2
    this.padding = options.padding !== undefined ? options.padding : 15

    this.textFont = options.textFont || '18px sans-serif'
    this.textColor = options.textColor || 'white'
    this.speakerFont = options.speakerFont || 'bold 20px sans-serif'
    this.speakerColor = options.speakerColor || 'lightblue'

    this.typewriterSpeed = options.typewriterSpeed !== undefined ? options.typewriterSpeed : 50

    this.advanceIndicatorText = options.advanceIndicatorText || '▼'
    this.advanceIndicatorFont = options.advanceIndicatorFont || '16px sans-serif'
    this.advanceIndicatorColor = options.advanceIndicatorColor || 'lightgray'

    this.portraitConfig = {
      width: options.portraitConfig?.width || 80,
      height: options.portraitConfig?.height || 80,
      xOffset: options.portraitConfig?.xOffset || this.padding,
      yOffset: options.portraitConfig?.yOffset || this.padding,
    }

    this.choiceButtonHeight = options.choiceButtonHeight || 30
    this.choiceButtonWidth = options.choiceButtonWidth || 0
    this.choiceSpacing = options.choiceSpacing || 5
    this.choiceFont = options.choiceFont || '16px sans-serif'
    this.choiceButtonBgColor = options.choiceButtonBgColor || 'rgba(50,50,50,0.8)'
    this.choiceButtonHoverBgColor = options.choiceButtonHoverBgColor || 'rgba(80,80,80,0.9)'
    this.choiceButtonTextColor = options.choiceButtonTextColor || 'white'

    /** @type {string} The name of the current speaker. */
    this.speakerName = ''
    /** @type {string} The full dialogue text to be displayed for the current line. */
    this.fullText = ''
    /** @type {string} The currently visible portion of the fullText (for typewriter effect). */
    this.currentDisplayedText = ''
    /** @type {HTMLImageElement | null} The current character portrait image. */
    this.portraitImage = null

    /** @type {Array<{id: string, text: string}>} Raw choice data. */
    this.currentChoicesData = []
    /** @private @type {Button[]} Interactive Button elements for choices. */
    this._choiceButtons = []

    /** @private @type {number} Character index for the typewriter effect. */
    this._typewriterIndex = 0
    /** @private @type {number} Timer for controlling typewriter speed interval. */
    this._typewriterTimer = 0
    /** @private @type {boolean} True if the fullText has been displayed by the typewriter. */
    this._isTextFullyDisplayed = true
    /** @type {boolean} True if the dialogue box is currently waiting for player input to advance (and no choices are shown). */
    this.isWaitingForAdvance = false
    /** @type {boolean} True if player choices are currently displayed and awaiting selection. */
    this.isWaitingForChoice = false

    /** @type {function(string):void | null} Callback when a choice is selected. */
    this.onChoiceSelect = options.onChoiceSelect || null
    /** @type {function():void | null} Callback when text advance is requested. */
    this.onTextAdvance = options.onTextAdvance || null
  }

  /**
   * Displays a new dialogue message, including speaker, text, optional portrait, and choices.
   * Resets typewriter and choice states.
   * @param {object} dialogueData - Data for the dialogue line.
   * @param {string} [dialogueData.speaker] - Name of the speaker.
   * @param {string} dialogueData.text - The dialogue text.
   * @param {string} [dialogueData.portraitKey] - Asset key for the portrait image (loaded via AssetLoader).
   * @param {Array<{id: string, text: string}>} [dialogueData.choices] - Array of player choices.
   */
  displayMessage(dialogueData = {}) {
    this.speakerName = dialogueData.speaker || ''
    this.fullText = dialogueData.text || ''
    this.currentDisplayedText = ''
    this._typewriterIndex = 0
    this._typewriterTimer = 0
    this._isTextFullyDisplayed = this.typewriterSpeed <= 0 || !this.fullText
    this.isWaitingForAdvance = false
    this.isWaitingForChoice = false

    this.currentChoicesData = dialogueData.choices || []
    this._destroyChoiceButtons()

    if (this._isTextFullyDisplayed) {
      this.currentDisplayedText = this.fullText
      if (this.currentChoicesData.length > 0) {
        this._createChoiceButtons()
        this.isWaitingForChoice = true
      } else {
        this.isWaitingForAdvance = true
      }
    }

    this.portraitImage = null
    if (dialogueData.portraitKey && this.engine && this.engine.assetLoader) {
      const imgAsset = this.engine.assetLoader.get(dialogueData.portraitKey)
      if (imgAsset instanceof HTMLImageElement) {
        this.portraitImage = imgAsset
      } else {
        // console.warn(`DialogueBox: Portrait asset "${dialogueData.portraitKey}" not found or not an image.`);
      }
    }
  }

  /**
   * Destroys existing choice buttons.
   * @private
   */
  _destroyChoiceButtons() {
    this._choiceButtons.forEach((button) => {
      if (typeof button.destroy === 'function') button.destroy()
    })
    this._choiceButtons = []
  }

  /**
   * Creates Button instances for the current choices.
   * @private
   */
  _createChoiceButtons() {
    this._destroyChoiceButtons()
    if (!this.engine || this.currentChoicesData.length === 0) return

    // Calculate available width for choice buttons, considering portrait and padding
    let choiceAreaX = this.x + this.padding
    let choiceAreaWidth = this.width - 2 * this.padding

    if (this.portraitImage && this.portraitConfig.xOffset < this.width / 2) {
      // Assuming portrait on left
      choiceAreaX = this.x + this.portraitConfig.xOffset + this.portraitConfig.width + this.padding
      choiceAreaWidth = this.width - (choiceAreaX - this.x) - this.padding
    }

    const buttonWidth = this.choiceButtonWidth > 0 ? this.choiceButtonWidth : choiceAreaWidth
    // If buttonWidth is less than choiceAreaWidth, center the buttons
    const buttonX = choiceAreaX + (choiceAreaWidth - buttonWidth) / 2

    // Position choices from the bottom of the dialogue box, stacking upwards
    let startChoiceY = this.y + this.height - this.padding - this.choiceButtonHeight

    ;[...this.currentChoicesData].reverse().forEach((choiceData, indexFromBottom) => {
      const button = new Button({
        engine: this.engine,
        x: buttonX,
        y: startChoiceY - indexFromBottom * (this.choiceButtonHeight + this.choiceSpacing),
        width: buttonWidth,
        height: this.choiceButtonHeight,
        text: choiceData.text,
        font: this.choiceFont,
        textColor: this.choiceButtonTextColor,
        backgroundColor: this.choiceButtonBgColor,
        hoverBackgroundColor: this.choiceButtonHoverBgColor,
        pressedBackgroundColor: this.choiceButtonHoverBgColor, // Can be same as hover or different
        onClick: () => this._handleChoiceSelected(choiceData.id),
      })
      this._choiceButtons.unshift(button) // Add to beginning to keep original order for iteration
    })
  }

  /**
   * Processes a player's request to advance the dialogue.
   * If text is currently typing via typewriter effect, it completes the text instantly.
   * If text is fully displayed and no choices are pending, it invokes the onTextAdvance callback.
   */
  requestAdvance() {
    if (!this.enabled || !this.visible) return

    if (!this._isTextFullyDisplayed) {
      this._isTextFullyDisplayed = true
      this.currentDisplayedText = this.fullText
      this._typewriterIndex = this.fullText.length
      this._typewriterTimer = 0
      if (this.currentChoicesData.length > 0 && this._choiceButtons.length === 0) {
        this._createChoiceButtons()
      }
      this.isWaitingForChoice = this.currentChoicesData.length > 0
      this.isWaitingForAdvance = !this.isWaitingForChoice
    } else if (this.isWaitingForAdvance && this.currentChoicesData.length === 0) {
      if (this.onTextAdvance) {
        this.onTextAdvance()
      }
    }
  }

  /**
   * Internally handles a choice selection.
   * @private
   * @param {string} choiceId - The ID of the selected choice.
   */
  _handleChoiceSelected(choiceId) {
    if (!this.enabled || !this.visible || !this.isWaitingForChoice) return
    if (this.onChoiceSelect) {
      this.onChoiceSelect(choiceId)
    }
  }

  /**
   * Updates the dialogue box state, primarily for the typewriter effect and choice button updates.
   * @param {number} deltaTime - Time since the last frame in seconds.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {{x: number, y: number}} mousePos - Current mouse position.
   */
  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos)
    if (!this.visible || !this.enabled) return

    if (!this._isTextFullyDisplayed && this.typewriterSpeed > 0 && this.fullText.length > 0) {
      this._typewriterTimer += deltaTime * 1000
      const interval = 1000 / this.typewriterSpeed

      while (this._typewriterTimer >= interval && this._typewriterIndex < this.fullText.length) {
        this._typewriterIndex++
        this.currentDisplayedText = this.fullText.substring(0, this._typewriterIndex)
        this._typewriterTimer -= interval
      }

      if (this._typewriterIndex >= this.fullText.length) {
        this._isTextFullyDisplayed = true
        this.currentDisplayedText = this.fullText
        if (this.currentChoicesData.length > 0 && this._choiceButtons.length === 0) {
          this._createChoiceButtons()
        }
        this.isWaitingForChoice = this.currentChoicesData.length > 0
        this.isWaitingForAdvance = !this.isWaitingForChoice
      }
    }

    if (this.isWaitingForChoice) {
      this._choiceButtons.forEach((button) => {
        if (button.visible && button.enabled) {
          button.update(deltaTime, engine, mousePos)
        }
      })
    }
  }

  /**
   * Renders the dialogue box, including background, border, portrait, speaker name, text, choices, and advance indicator.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @protected
   */
  _drawSelf(context, engine) {
    // Draw background box
    if (this.backgroundColor) {
      context.fillStyle = this.backgroundColor
      context.fillRect(this.x, this.y, this.width, this.height)
    }
    if (this.borderWidth > 0 && this.borderColor) {
      context.strokeStyle = this.borderColor
      context.lineWidth = this.borderWidth
      context.strokeRect(this.x, this.y, this.width, this.height)
    }

    let textContentX = this.x + this.padding
    let currentContentY = this.y + this.padding
    let dialogueTextDisplayWidth = this.width - 2 * this.padding

    if (this.portraitImage instanceof HTMLImageElement) {
      const pConfig = this.portraitConfig
      try {
        context.drawImage(
          this.portraitImage,
          this.x + pConfig.xOffset,
          this.y + pConfig.yOffset,
          pConfig.width,
          pConfig.height,
        )
        if (this.x + pConfig.xOffset + pConfig.width < this.x + this.width / 2) {
          // If portrait is on the left side
          textContentX = this.x + pConfig.xOffset + pConfig.width + this.padding
          dialogueTextDisplayWidth = this.width - (textContentX - this.x) - this.padding
        }
      } catch (e) {
        console.error('DialogueBox: Error drawing portrait.', e)
      }
    }

    if (this.speakerName) {
      context.fillStyle = this.speakerColor
      context.font = this.speakerFont
      context.textAlign = 'left'
      context.textBaseline = 'top'
      context.fillText(this.speakerName, textContentX, currentContentY)
      currentContentY += parseFloat(this.speakerFont.match(/\d+/)?.[0] || '20') * 1.2
    }

    context.fillStyle = this.textColor
    context.font = this.textFont
    context.textAlign = 'left'
    context.textBaseline = 'top'
    this.wrapAndDrawText(
      context,
      this.currentDisplayedText,
      textContentX,
      currentContentY,
      dialogueTextDisplayWidth,
      parseFloat(this.textFont.match(/\d+/)?.[0] || '18') * 1.2,
    )

    if (this._isTextFullyDisplayed && this.isWaitingForChoice) {
      this._choiceButtons.forEach((button) => {
        if (button.visible) button.render(context, engine)
      })
    }

    if (
      this._isTextFullyDisplayed &&
      this.isWaitingForAdvance &&
      this.currentChoicesData.length === 0
    ) {
      context.fillStyle = this.advanceIndicatorColor
      context.font = this.advanceIndicatorFont
      context.textAlign = 'right'
      context.textBaseline = 'alphabetic'
      context.fillText(
        this.advanceIndicatorText,
        this.x + this.width - this.padding,
        this.y + this.height - this.padding,
      )
    }
  }

  /**
   * Basic text wrapping and drawing function.
   * @param {CanvasRenderingContext2D} context
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} maxWidth
   * @param {number} lineHeight
   */
  wrapAndDrawText(context, text, x, y, maxWidth, lineHeight) {
    if (!text) return
    const words = text.split(' ')
    let line = ''
    let currentY = y
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line.trim(), x, currentY)
        line = words[n] + ' '
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    context.fillText(line.trim(), x, currentY)
  }

  /**
   * Destroys the DialogueBox and its internal UI elements (choice buttons).
   */
  destroy() {
    super.destroy() // If BaseUIElement has its own destroy logic
    this._destroyChoiceButtons()
  }
}
export default DialogueBox
