// src/engine/rendering/Sprite.js

/**
 * @file Sprite.js
 * @description Defines a Sprite class for rendering images or portions of images (sprite sheets) on the canvas.
 */

/**
 * @class Sprite
 * @description Represents a visual object that can be drawn on the canvas.
 * It can render an entire image or a specific rectangular portion of an image (a frame from a sprite sheet).
 */
class Sprite {
  /**
   * Creates an instance of Sprite.
   * @param {HTMLImageElement} image - The HTMLImageElement to be rendered. Should be pre-loaded.
   * @param {number} [x=0] - The x-coordinate for the sprite's top-left corner on the canvas.
   * @param {number} [y=0] - The y-coordinate for the sprite's top-left corner on the canvas.
   * @param {number} [width] - The width to draw the sprite on the canvas. Defaults to source frame width or image width.
   * @param {number} [height] - The height to draw the sprite on the canvas. Defaults to source frame height or image height.
   * @param {number} [sx=0] - The x-coordinate of the top-left corner of the sub-rectangle (frame) in the source image.
   * @param {number} [sy=0] - The y-coordinate of the top-left corner of the sub-rectangle (frame) in the source image.
   * @param {number} [sWidth] - The width of the sub-rectangle (frame) in the source image. Defaults to image width.
   * @param {number} [sHeight] - The height of the sub-rectangle (frame) in the source image. Defaults to image height.
   */
  constructor(image, x = 0, y = 0, width, height, sx = 0, sy = 0, sWidth, sHeight) {
    if (!(image instanceof HTMLImageElement)) {
      console.error('Sprite: Invalid image provided. Must be an HTMLImageElement.', image)
      // You might throw an error here or set a placeholder/error state
      this.image = null // Or a placeholder error image
    } else {
      this.image = image
    }

    this.x = x
    this.y = y

    // Source image frame dimensions
    this.sx = sx
    this.sy = sy
    this.sWidth = sWidth === undefined ? (this.image ? this.image.naturalWidth - sx : 0) : sWidth
    this.sHeight =
      sHeight === undefined ? (this.image ? this.image.naturalHeight - sy : 0) : sHeight

    // Destination canvas dimensions
    this.width = width === undefined ? this.sWidth : width
    this.height = height === undefined ? this.sHeight : height

    /** @type {boolean} - Whether the sprite should be rendered. */
    this.visible = true

    /** @type {number} - Opacity of the sprite (0 = transparent, 1 = opaque). */
    this.opacity = 1.0

    /** @type {number} - Rotation angle in radians. Rotation is around the sprite's anchor point. */
    this.rotation = 0 // Radians

    /** @type {{x: number, y: number}} - Anchor point for rotation and scaling (0-1 scale, e.g., {x:0.5, y:0.5} is center). */
    this.anchor = { x: 0.5, y: 0.5 }

    /** @type {number} - Horizontal scale factor. */
    this.scaleX = 1.0
    /** @type {number} - Vertical scale factor. */
    this.scaleY = 1.0

    // Ensure sWidth and sHeight are valid if image is null initially due to error
    if (!this.image) {
      this.sWidth = sWidth === undefined ? 0 : sWidth
      this.sHeight = sHeight === undefined ? 0 : sHeight
      this.width = width === undefined ? this.sWidth : width
      this.height = height === undefined ? this.sHeight : height
    }
  }

  /**
   * Sets the source frame for the sprite, useful for sprite sheet animations.
   * @param {number} sx - The x-coordinate of the top-left corner of the frame in the source image.
   * @param {number} sy - The y-coordinate of the top-left corner of the frame in the source image.
   * @param {number} sWidth - The width of the frame in the source image.
   * @param {number} sHeight - The height of the frame in the source image.
   */
  setFrame(sx, sy, sWidth, sHeight) {
    this.sx = sx
    this.sy = sy
    this.sWidth = sWidth
    this.sHeight = sHeight
    // Optionally update destination width/height if they are meant to match the frame
    // this.width = sWidth;
    // this.height = sHeight;
  }

  /**
   * Renders the sprite on the canvas context.
   * Takes into account visibility, opacity, rotation, and scaling.
   * @param {CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
   */
  render(context) {
    if (!this.visible || !this.image || this.opacity <= 0) {
      return
    }

    context.save() // Save current context state

    // Apply opacity
    context.globalAlpha = this.opacity

    // Calculate translation point for rotation and scaling
    const anchorX = this.x + this.width * this.anchor.x
    const anchorY = this.y + this.height * this.anchor.y

    // Translate to anchor point, apply rotation and scale, then translate back
    if (this.rotation !== 0 || this.scaleX !== 1.0 || this.scaleY !== 1.0) {
      context.translate(anchorX, anchorY)
      if (this.rotation !== 0) context.rotate(this.rotation)
      if (this.scaleX !== 1.0 || this.scaleY !== 1.0) context.scale(this.scaleX, this.scaleY)
      context.translate(-anchorX, -anchorY)
    }

    // Draw the image
    // The sx, sy, sWidth, sHeight define the portion of the image to draw.
    // The x, y, width, height define where on the canvas and how large to draw it.
    try {
      context.drawImage(
        this.image,
        this.sx,
        this.sy,
        this.sWidth,
        this.sHeight,
        this.x,
        this.y,
        this.width,
        this.height,
      )
    } catch (e) {
      console.error('Error drawing sprite:', e, this)
      // This can happen if sWidth/sHeight are 0 or image is not fully loaded/corrupted
    }

    context.restore() // Restore context state to prevent affecting other drawings
  }

  /**
   * Updates the sprite's state. Placeholder for now, could be used for animations internal to the sprite.
   * @param {number} deltaTime - The time elapsed since the last frame, in seconds.
   */
  update(deltaTime) {
    // Currently, Sprite is mostly a rendering component.
    // Animation logic (changing sx, sy) would typically be handled by an AnimationController
    // or an Entity that owns this Sprite.
  }
}

export default Sprite
