// src/engine/ui/ScrollablePanel.js
import BaseUIElement from './BaseUIElement.js'

/**
 * @class ScrollablePanel
 * @extends BaseUIElement
 * @description A panel that can contain child elements and allows vertical scrolling
 * if the content height exceeds the panel height.
 */
class ScrollablePanel extends BaseUIElement {
  /**
   * Creates an instance of ScrollablePanel.
   * @param {object} options - Configuration options.
   * @param {number} [options.x=0] - The x-coordinate.
   * @param {number} [options.y=0] - The y-coordinate.
   * @param {number} [options.width=200] - The width of the panel.
   * @param {number} [options.height=150] - The height of the panel (viewport height).
   * @param {string} [options.backgroundColor=null] - Background color.
   * @param {string} [options.borderColor='gray'] - Border color.
   * @param {number} [options.borderWidth=1] - Width of the border.
   * @param {number} [options.padding=5] - Inner padding for content.
   * @param {number} [options.scrollbarWidth=10] - Width of the scrollbar.
   * @param {string} [options.scrollbarTrackColor='#333'] - Color of the scrollbar track.
   * @param {string} [options.scrollbarThumbColor='#888'] - Color of the scrollbar thumb.
   * @param {string} [options.scrollbarThumbHoverColor='#AAA'] - Color of the scrollbar thumb on hover.
   * @param {number} [options.mouseWheelSensitivity=20] - Pixels to scroll per mouse wheel event.
   */
  constructor(options = {}) {
    super(options)

    this.backgroundColor = options.backgroundColor || null
    this.borderColor = options.borderColor || 'gray'
    this.borderWidth = options.borderWidth !== undefined ? options.borderWidth : 1
    this.padding = options.padding !== undefined ? options.padding : 5

    /** @type {BaseUIElement[]} */
    this.children = []
    this.contentHeight = 0 // Total height of all children
    this.scrollTop = 0 // Current vertical scroll offset

    this.scrollbarWidth = options.scrollbarWidth || 10
    this.scrollbarTrackColor = options.scrollbarTrackColor || '#333'
    this.scrollbarThumbColor = options.scrollbarThumbColor || '#888'
    this.scrollbarThumbHoverColor = options.scrollbarThumbHoverColor || '#AAA'
    this.mouseWheelSensitivity = options.mouseWheelSensitivity || 20

    this._scrollbarTrackRect = { x: 0, y: 0, width: 0, height: 0 }
    this._scrollbarThumbRect = { x: 0, y: 0, width: 0, height: 0 }
    this._isDraggingThumb = false
    this._isMouseOverScrollbarThumb = false
    this._dragStartY = 0
    this._dragStartScrollTop = 0

    this._boundHandleMouseWheel = this._handleMouseWheel.bind(this)
    this._isMouseOverPanel = false // To manage wheel listener
  }

  setEngine(engine) {
    super.setEngine(engine)
    this.children.forEach((child) => child.setEngine(engine))
  }

  addChild(element) {
    if (element instanceof BaseUIElement) {
      this.children.push(element)
      if (this.engine) {
        element.setEngine(this.engine)
      }
      this._calculateContentHeightAndArrange() // Recalculate and potentially update scrollbar
    } else {
      console.warn('ScrollablePanel.addChild: Attempted to add a non-UIElement.', element)
    }
  }

  removeChild(element) {
    const index = this.children.indexOf(element)
    if (index > -1) {
      this.children.splice(index, 1)
      this._calculateContentHeightAndArrange()
      return true
    }
    return false
  }

  clearChildren() {
    this.children = []
    this.contentHeight = 0
    this.scrollTop = 0
    this._updateScrollbar()
  }

  _calculateContentHeightAndArrange() {
    // For this version, assume children y positions are relative to content area top (0)
    // And children are stacked vertically. A more complex layout manager could be used.
    // This method also updates the scrollbar after calculating content height.
    let currentY = this.padding
    this.children.forEach((child) => {
      child.x = this.padding // Simple horizontal positioning within padding
      child.y = currentY // Stack vertically
      currentY += child.height + this.padding // Add padding between elements
    })
    this.contentHeight = Math.max(0, currentY - this.padding) // Total height used by children
    this.scrollTo(this.scrollTop) // Re-clamp scrollTop and update scrollbar
  }

  _updateScrollbar() {
    if (this.contentHeight <= this.height - 2 * this.padding) {
      // No scrollbar needed
      this._scrollbarTrackRect.height = 0
      this._scrollbarThumbRect.height = 0
      return
    }

    const viewportInnerHeight = this.height - 2 * this.padding
    this._scrollbarTrackRect = {
      x: this.x + this.width - this.scrollbarWidth - this.padding,
      y: this.y + this.padding,
      width: this.scrollbarWidth,
      height: viewportInnerHeight,
    }

    const thumbHeightRatio = Math.min(1, viewportInnerHeight / this.contentHeight)
    this._scrollbarThumbRect.height = Math.max(10, viewportInnerHeight * thumbHeightRatio) // Min thumb height
    this._scrollbarThumbRect.width = this.scrollbarWidth
    this._scrollbarThumbRect.x = this._scrollbarTrackRect.x

    const scrollableRange = this.contentHeight - viewportInnerHeight
    const scrollRatio = scrollableRange > 0 ? this.scrollTop / scrollableRange : 0
    const availableThumbTravel = this._scrollbarTrackRect.height - this._scrollbarThumbRect.height

    this._scrollbarThumbRect.y = this._scrollbarTrackRect.y + availableThumbTravel * scrollRatio
  }

  scrollTo(newScrollTop, fromScrollbar = false) {
    const viewportInnerHeight = this.height - 2 * this.padding
    const maxScrollTop = Math.max(0, this.contentHeight - viewportInnerHeight)
    this.scrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop))
    this._updateScrollbar()
  }

  _handleMouseWheel(event) {
    if (!this.visible || !this.enabled || !this._isMouseOverPanel) return
    event.preventDefault()
    const newScrollTop = this.scrollTop + (event.deltaY > 0 ? 1 : -1) * this.mouseWheelSensitivity
    this.scrollTo(newScrollTop)
  }

  update(deltaTime, engine, mousePos) {
    super.update(deltaTime, engine, mousePos)
    if (!this.visible) {
      if (this._isMouseOverPanel) {
        // Remove listener if panel becomes invisible while mouse was over
        engine.canvas.removeEventListener('wheel', this._boundHandleMouseWheel)
        this._isMouseOverPanel = false
      }
      return
    }

    const wasMouseOverPanel = this._isMouseOverPanel
    this._isMouseOverPanel = this.containsPoint(mousePos.x, mousePos.y)

    if (this._isMouseOverPanel && !wasMouseOverPanel && this.enabled) {
      engine.canvas.addEventListener('wheel', this._boundHandleMouseWheel, { passive: false })
    } else if (!this._isMouseOverPanel && wasMouseOverPanel) {
      engine.canvas.removeEventListener('wheel', this._boundHandleMouseWheel)
    }

    if (!this.enabled) {
      if (wasMouseOverPanel) engine.canvas.removeEventListener('wheel', this._boundHandleMouseWheel)
      this._isMouseOverPanel = false
      this.isDraggingThumb = false
      return
    }

    // Scrollbar interaction
    this._isMouseOverScrollbarThumb =
      this.containsPoint(mousePos.x, mousePos.y, this._scrollbarThumbRect) &&
      this._scrollbarTrackRect.height > 0 // Only if scrollbar active

    const inputManager = engine.inputManager
    const leftButton = inputManager.constructor.MOUSE_BUTTON_LEFT

    if (inputManager.isMouseButtonJustPressed(leftButton)) {
      if (this._isMouseOverScrollbarThumb) {
        this._isDraggingThumb = true
        this._dragStartY = mousePos.y
        this._dragStartScrollTop = this.scrollTop
      } else if (
        this.containsPoint(mousePos.x, mousePos.y, this._scrollbarTrackRect) &&
        this._scrollbarTrackRect.height > 0
      ) {
        // Click on track
        const clickRatio =
          (mousePos.y - this._scrollbarTrackRect.y) / this._scrollbarTrackRect.height
        const viewportInnerHeight = this.height - 2 * this.padding
        const newScrollTop = clickRatio * this.contentHeight - viewportInnerHeight * clickRatio
        this.scrollTo(newScrollTop)
        this._isDraggingThumb = true // Allow immediate drag from new position
        this._dragStartY = mousePos.y
        this._dragStartScrollTop = this.scrollTop
      }
    }

    if (this._isDraggingThumb) {
      if (inputManager.isMouseButtonPressed(leftButton)) {
        const dy = mousePos.y - this._dragStartY
        const viewportInnerHeight = this.height - 2 * this.padding
        const scrollableRange = this.contentHeight - viewportInnerHeight
        const trackScrollableRange =
          this._scrollbarTrackRect.height - this._scrollbarThumbRect.height

        if (trackScrollableRange > 0 && scrollableRange > 0) {
          const scrollTopDelta = (dy / trackScrollableRange) * scrollableRange
          this.scrollTo(this._dragStartScrollTop + scrollTopDelta)
        }
      } else {
        this._isDraggingThumb = false
      }
    }

    // Update children: transform mouse coordinates for children
    // Children are positioned relative to the panel's content area (0,0 after padding)
    // Their y is effectively (child.y - this.scrollTop)
    const contentOriginX = this.x + this.padding
    const contentOriginY = this.y + this.padding

    for (const child of this.children) {
      if (child.visible && child.enabled) {
        // Child's actual screen Y for hit testing (considering scroll)
        const childScreenY = contentOriginY + child.y - this.scrollTop
        const childScreenX = contentOriginX + child.x // Assuming child.x is relative to panel padding

        // Check if child is visible within the clipped viewport
        const childIsVisibleInViewport =
          childScreenY < this.y + this.height - this.padding &&
          childScreenY + child.height > this.y + this.padding

        if (childIsVisibleInViewport) {
          // Create mousePos relative to the child's coordinate system IF child expects relative mouse
          // OR pass global mousePos and let child use its absolute screen coords for containsPoint
          // For now, assuming child.update takes global mousePos and child uses its screen coords for hit detection
          // We need to ensure child.x and child.y are correctly set for rendering within the scrolled view.
          // The rendering part handles this by translating context.
          // For update, the child needs to know its current screen position.
          // Let's make a temporary modification to child's x/y for its update logic.
          const originalChildX = child.x
          const originalChildY = child.y
          child.x = childScreenX // Temporarily set to screen coordinates for hit detection
          child.y = childScreenY

          child.update(deltaTime, engine, mousePos)

          child.x = originalChildX // Restore original relative x
          child.y = originalChildY // Restore original relative y
        }
      }
    }
  }

  _drawSelf(context, engine) {
    // Draw panel background
    if (this.backgroundColor) {
      context.fillStyle = this.backgroundColor
      context.fillRect(this.x, this.y, this.width, this.height)
    }

    // --- Setup Clipping for Content ---
    context.save()
    context.beginPath()
    context.rect(
      this.x + this.padding,
      this.y + this.padding,
      this.width -
        2 * this.padding -
        (this._scrollbarTrackRect.height > 0 ? this.scrollbarWidth : 0), // Adjust width for scrollbar
      this.height - 2 * this.padding,
    )
    context.clip()

    // Translate context for scrolled content
    context.translate(this.x + this.padding, this.y + this.padding - this.scrollTop)

    // Render children (they will use their y relative to content top)
    for (const child of this.children) {
      // Child's render method will check its own visibility
      child.render(context, engine)
    }

    context.restore() // Remove clipping and translation

    // --- Draw Scrollbar ---
    this._updateScrollbar() // Ensure positions are correct
    if (this._scrollbarTrackRect.height > 0) {
      // Only draw if scrollbar is active
      // Draw track
      context.fillStyle = this.scrollbarTrackColor
      context.fillRect(
        this._scrollbarTrackRect.x,
        this._scrollbarTrackRect.y,
        this._scrollbarTrackRect.width,
        this._scrollbarTrackRect.height,
      )

      // Draw thumb
      let currentThumbColor = this.scrollbarThumbColor
      if (this.enabled) {
        if (this._isDraggingThumb) {
          currentThumbColor = this.scrollbarThumbHoverColor // Or a dedicated dragging color
        } else if (this._isMouseOverScrollbarThumb) {
          currentThumbColor = this.scrollbarThumbHoverColor
        }
      }
      context.fillStyle = currentThumbColor
      context.fillRect(
        this._scrollbarThumbRect.x,
        this._scrollbarThumbRect.y,
        this._scrollbarThumbRect.width,
        this._scrollbarThumbRect.height,
      )
    }

    // Draw panel border (drawn last to be on top of content edges and scrollbar)
    if (this.borderWidth > 0) {
      context.strokeStyle = this.borderColor
      context.lineWidth = this.borderWidth
      context.strokeRect(this.x, this.y, this.width, this.height)
    }
  }

  destroy() {
    super.destroy()
    if (this.engine && this.engine.canvas && this._isMouseOverPanel) {
      this.engine.canvas.removeEventListener('wheel', this._boundHandleMouseWheel)
    }
    this.children.forEach((child) => {
      if (typeof child.destroy === 'function') child.destroy()
    })
    this.children = []
  }
}

export default ScrollablePanel
