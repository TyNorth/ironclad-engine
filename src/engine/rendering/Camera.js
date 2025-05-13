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
   * @param {object} targetEntity - The entity to follow. Must have `worldX`, `worldY`, `width`, and `height` properties.
   * @param {number} [screenFocusX] - Optional: The x-coordinate on screen where the target should be centered. Defaults to viewport center.
   * @param {number} [screenFocusY] - Optional: The y-coordinate on screen where the target should be centered. Defaults to viewport center.
   */
  setTarget(targetEntity, screenFocusX, screenFocusY) {
    if (
      targetEntity &&
      typeof targetEntity.worldX === 'number' &&
      typeof targetEntity.worldY === 'number' &&
      typeof targetEntity.width === 'number' &&
      typeof targetEntity.height === 'number'
    ) {
      this.target = targetEntity
      this.screenFocusX = screenFocusX !== undefined ? screenFocusX : this.viewportWidth / 2
      this.screenFocusY = screenFocusY !== undefined ? screenFocusY : this.viewportHeight / 2
      console.log('Camera: Target set.', targetEntity)
    } else {
      console.warn(
        'Camera: Invalid target entity provided. Target must have worldX, worldY, width, height.',
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
      // Calculate the target's center position in world coordinates
      const targetCenterX = this.target.worldX + this.target.width / 2
      const targetCenterY = this.target.worldY + this.target.height / 2

      // Calculate the desired top-left position of the camera to center the target
      this.x = targetCenterX - this.screenFocusX
      this.y = targetCenterY - this.screenFocusY
    }

    // Clamp camera to world boundaries
    if (this.worldWidth > 0 && this.worldHeight > 0) {
      // Ensure camera doesn't go past left/top edge
      this.x = Math.max(0, this.x)
      this.y = Math.max(0, this.y)

      // Ensure camera doesn't go past right/bottom edge
      // If world is smaller than viewport, camera stays at 0,0
      if (this.worldWidth < this.viewportWidth) {
        this.x = 0 // Or (this.worldWidth - this.viewportWidth) / 2 for centering smaller world
      } else {
        this.x = Math.min(this.x, this.worldWidth - this.viewportWidth)
      }

      if (this.worldHeight < this.viewportHeight) {
        this.y = 0 // Or (this.worldHeight - this.viewportHeight) / 2
      } else {
        this.y = Math.min(this.y, this.worldHeight - this.viewportHeight)
      }
    } else {
      // No valid world dimensions, keep camera at origin
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
