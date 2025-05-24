// src/engine/physics/PhysicsConstants.js

/**
 * @file PhysicsConstants.js
 * @description Defines global constants for the physics system.
 */

/**
 * Gravitational acceleration on the Y-axis in pixels per second squared.
 * Positive value means downward acceleration.
 * @type {number}
 */
export const GRAVITY_Y = 980 // A common value, adjust for game feel

/**
 * Gravitational acceleration on the X-axis (usually 0 for most 2D/2.5D games).
 * @type {number}
 */
export const GRAVITY_X = 0

/**
 * Gravitational acceleration on the Z-axis (usually 0 if Z is depth not height).
 * If Z was your vertical jump axis, this would be non-zero and GRAVITY_Y might be 0.
 * For our X (horizontal), Y (vertical screen, jump/fall), Z (depth) convention, Z gravity is 0.
 * @type {number}
 */
export const GRAVITY_Z = 0

/**
 * A small value to prevent division by zero or floating point inaccuracies.
 * @type {number}
 */
export const EPSILON = 0.0001

// Add other constants as needed, e.g.:
// export const DEFAULT_AIR_DENSITY = 1.2;
// export const DEFAULT_STATIC_FRICTION = 0.6;
// export const DEFAULT_DYNAMIC_FRICTION = 0.4;
