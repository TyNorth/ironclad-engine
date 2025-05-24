// src/engine/rendering/Camera.js

/**
 * @file Camera.js
 * @description Defines a Camera class to manage the game's viewport,
 * follow a target, and stay within world boundaries.
 */

/**
 * @class Camera
 * @description Manages the viewport of the game world.
 */
class Camera {
  /**
   * Creates a new Camera instance.
   * @param {object} config - Configuration object for the camera.
   * @param {number} config.viewportWidth - The width of the camera's viewport (typically canvas width).
   * @param {number} config.viewportHeight - The height of the camera's viewport (typically canvas height).
   * @param {number} config.worldWidth - The total width of the game world.
   * @param {number} config.worldHeight - The total height of the game world.
   */
  constructor({ viewportWidth, viewportHeight, worldWidth, worldHeight }) {
    /**
     * @type {number}
     * @description The x-coordinate of the camera's top-left corner in world space.
     * This is effectively the viewportX offset.
     */
    this.x = 0

    /**
     * @type {number}
     * @description The y-coordinate of the camera's top-left corner in world space.
     * This is effectively the viewportY offset.
     */
    this.y = 0

    if (viewportWidth <= 0 || viewportHeight <= 0) {
      console.error('Camera: viewportWidth and viewportHeight must be greater than 0.')
      // Set to default sensible values to prevent further errors down the line
      this.viewportWidth = 800
      this.viewportHeight = 600
    } else {
      this.viewportWidth = viewportWidth
      this.viewportHeight = viewportHeight
    }

    this.worldWidth = worldWidth
    this.worldHeight = worldHeight

    /**
     * @private
     * @type {object | null}
     * @description The target entity for the camera to follow.
     * Expected to have `worldX`, `worldY`, `width`, `height` properties.
     */
    this.target = null

    /**
     * @private
     * @type {number}
     * @description The desired x-coordinate on the screen where the target's center should be.
     */
    this.screenFocusX = this.viewportWidth / 2

    /**
     * @private
     * @type {number}
     * @description The desired y-coordinate on the screen where the target's center should be.
     */
    this.screenFocusY = this.viewportHeight / 2

    console.log(
      `Camera: Initialized. Viewport: ${this.viewportWidth}x${this.viewportHeight}, World: ${this.worldWidth}x${this.worldHeight}`,
    )
  }

  /**
   * Sets the target entity for the camera to follow.
   * The target should either have direct worldX, worldY, width, height properties,
   * OR have getPosition() and getDimensions() methods.
   * @param {object | null} targetEntity - The entity or object to follow.
   * @param {number} [screenFocusX] - Optional: The x-coordinate on screen where the target should be centered.
   * @param {number} [screenFocusY] - Optional: The y-coordinate on screen where the target should be centered.
   */
  setTarget(targetEntity, screenFocusX, screenFocusY) {
    if (targetEntity === null) {
      this.target = null
      console.log('Camera: Target cleared.')
      return
    }

    const hasMethods =
      typeof targetEntity.getPosition === 'function' &&
      typeof targetEntity.getDimensions === 'function'
    const hasDirectProps =
      typeof targetEntity.worldX === 'number' &&
      typeof targetEntity.worldY === 'number' &&
      typeof targetEntity.width === 'number' &&
      typeof targetEntity.height === 'number'

    if (hasMethods || hasDirectProps) {
      this.target = targetEntity
      this.screenFocusX = screenFocusX !== undefined ? screenFocusX : this.viewportWidth / 2
      this.screenFocusY = screenFocusY !== undefined ? screenFocusY : this.viewportHeight / 2
      console.log('Camera: Target set.', targetEntity)
    } else {
      console.warn(
        'Camera: Invalid target. Must have worldX/Y/width/height properties OR getPosition/getDimensions methods.',
        targetEntity,
      )
      this.target = null
    }
  }

  /**
   * Updates the camera's position. If a target is set, it follows the target.
   * Also clamps the camera to the world boundaries.
   */
  update() {
    if (this.target) {
      let targetWorldX, targetWorldY, targetWidth, targetHeight

      if (
        typeof this.target.getPosition === 'function' &&
        typeof this.target.getDimensions === 'function'
      ) {
        const pos = this.target.getPosition() // Should return {x, y}
        const dim = this.target.getDimensions() // Should return {width, height}

        if (
          pos &&
          dim &&
          typeof pos.x === 'number' &&
          typeof pos.y === 'number' &&
          typeof dim.width === 'number' &&
          typeof dim.height === 'number'
        ) {
          targetWorldX = pos.x
          targetWorldY = pos.y
          targetWidth = dim.width
          targetHeight = dim.height
        } else {
          console.warn(
            "Camera: Target's getPosition() or getDimensions() did not return expected data.",
            { pos, dim },
          )
          return // Cannot update camera without valid target data
        }
      } else if (
        this.target.worldX !== undefined &&
        this.target.worldY !== undefined &&
        this.target.width !== undefined &&
        this.target.height !== undefined
      ) {
        // Fallback to direct properties
        targetWorldX = this.target.worldX
        targetWorldY = this.target.worldY
        targetWidth = this.target.width
        targetHeight = this.target.height
      } else {
        // Target is invalid or doesn't conform to expected interfaces
        console.warn('Camera: Target is missing required properties or methods for tracking.')
        this.target = null // Clear invalid target
        return
      }

      // Ensure we have valid numbers before proceeding
      if (isNaN(targetWorldX) || isNaN(targetWorldY) || isNaN(targetWidth) || isNaN(targetHeight)) {
        console.warn('Camera: Target provided NaN values for position or dimensions.', {
          targetWorldX,
          targetWorldY,
          targetWidth,
          targetHeight,
        })
        // Optionally, keep the camera at its current position or reset target
        // this.target = null; // Or just don't update camera position this frame
        return
      }

      const targetCenterX = targetWorldX + targetWidth / 2
      const targetCenterY = targetWorldY + targetHeight / 2

      this.x = targetCenterX - this.screenFocusX
      this.y = targetCenterY - this.screenFocusY
    }

    // Clamp camera to world boundaries (no changes to this part)
    if (this.worldWidth > 0 && this.worldHeight > 0) {
      this.x = Math.max(0, this.x)
      this.y = Math.max(0, this.y)
      if (this.worldWidth < this.viewportWidth) {
        this.x = 0
      } else {
        this.x = Math.min(this.x, this.worldWidth - this.viewportWidth)
      }
      if (this.worldHeight < this.viewportHeight) {
        this.y = 0
      } else {
        this.y = Math.min(this.y, this.worldHeight - this.viewportHeight)
      }
    } else {
      this.x = 0
      this.y = 0
    }
  }

  /**
   * Gets the current x-coordinate of the viewport (camera's top-left x in world space).
   * @returns {number}
   */
  getViewportX() {
    return this.x
  }

  /**
   * Gets the current y-coordinate of the viewport (camera's top-left y in world space).
   * @returns {number}
   */
  getViewportY() {
    return this.y
  }

  /**
   * Updates the dimensions of the game world.
   * @param {number} worldWidth - The new total width of the game world.
   * @param {number} worldHeight - The new total height of the game world.
   */
  setWorldDimensions(worldWidth, worldHeight) {
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
    console.log(`Camera: World dimensions updated to ${this.worldWidth}x${this.worldHeight}`)
    this.update() // Re-clamp immediately
  }

  /**
   * Updates the dimensions of the camera's viewport (e.g., if canvas is resized).
   * @param {number} viewportWidth - The new width of the viewport.
   * @param {number} viewportHeight - The new height of the viewport.
   */
  setViewportDimensions(viewportWidth, viewportHeight) {
    if (viewportWidth > 0) this.viewportWidth = viewportWidth
    if (viewportHeight > 0) this.viewportHeight = viewportHeight
    // Recalculate screen focus points if they were based on viewport center
    this.screenFocusX = this.viewportWidth / 2
    this.screenFocusY = this.viewportHeight / 2
    console.log(
      `Camera: Viewport dimensions updated to ${this.viewportWidth}x${this.viewportHeight}`,
    )
    this.update() // Re-clamp immediately
  }
}

export default Camera
