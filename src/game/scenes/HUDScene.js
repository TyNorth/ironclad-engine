// src/game/scenes/HUDScene.js
import BaseScene from '../../engine/core/BaseScene.js'
import ValueBar from '../../engine/ui/ValueBar.js'

/**
 * @file HUDScene.js
 * @description Displays the Heads-Up Display (HUD) for the player, like health and experience bars.
 * It's a non-modal overlay scene.
 */

/**
 * @class HUDScene
 * @extends BaseScene
 * @description Scene responsible for rendering the player's HUD elements.
 */
class HUDScene extends BaseScene {
  constructor() {
    super() // Calls BaseScene's constructor

    /** * Reference to the player entity/object whose stats are displayed.
     * Expected to have methods like getHealth(), getExperience().
     * @type {import('../../game/entities/Player.js').default | {getHealth: Function, getExperience: Function} | null}
     */
    this.player = null
    /** * UI element for displaying player health.
     * @type {ValueBar | null}
     */
    this.healthBar = null
    /** * UI element for displaying player experience.
     * @type {ValueBar | null}
     */
    this.experienceBar = null

    // Crucial for HUD: This scene is an overlay and should not block updates.
    this.isModal = false

    // console.log("HUDScene: Constructed.");
  }

  /**
   * Initializes the HUDScene, creating UI elements based on player data.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Data passed when the scene is activated. Expected to contain `data.player`.
   */
  async initialize(engine, data = {}) {
    await super.initialize(engine, data) // Sets this.engine

    if (
      data.player &&
      typeof data.player.getHealth === 'function' &&
      typeof data.player.getExperience === 'function'
    ) {
      this.player = data.player
    } else {
      console.warn(
        'HUDScene: Valid ECS Player object not provided in data.player. HUD will display default/empty stats.',
      )
      // Placeholder player data structure if a valid player isn't passed
      this.player = {
        getHealth: () => ({ current: 0, max: 100 }),
        getExperience: () => ({ current: 0, nextLevel: 100 }),
        // Add default getters for any other stats the HUD might display
      }
    }

    // Ensure uiElements array is clean (BaseScene.initialize doesn't clear it)
    this.uiElements = []

    const initialHealth = this.player.getHealth()
    const initialExp = this.player.getExperience()

    this.healthBar = new ValueBar({
      engine: this.engine, // Pass engine for UI elements that might need it
      x: 20,
      y: 20,
      width: 200,
      height: 20,
      maxValue: initialHealth.max,
      currentValue: initialHealth.current,
      fillColor: 'red',
      backgroundColor: '#550000',
      borderColor: 'darkred',
      showText: true,
      font: '12px Arial',
      textColor: 'white',
      textFormatFunction: (current, max) => `HP: ${Math.round(current)}/${Math.round(max)}`,
    })
    this.addUIElement(this.healthBar)

    this.experienceBar = new ValueBar({
      engine: this.engine,
      x: 20,
      y: 45,
      width: 200,
      height: 15,
      maxValue: initialExp.nextLevel,
      currentValue: initialExp.current,
      fillColor: 'gold',
      backgroundColor: '#554200',
      borderColor: 'darkgoldenrod',
      showText: true,
      font: '10px Arial',
      textColor: 'black',
      textFormatFunction: (current, max) => `XP: ${Math.round(current)}/${Math.round(max)}`,
    })
    this.addUIElement(this.experienceBar)

    // console.log("HUDScene: Initialized with player:", this.player ? 'Player Set' : 'No Player');
  }

  /**
   * Updates the HUD elements to reflect the current player stats.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async update(deltaTime, engine) {
    // BaseScene.update() now calls updateUIElements by default.
    // For the HUD, its elements (ValueBars) are passive displays updated by data,
    // so their own update() methods don't do much beyond basic state.
    // The critical part is updating their values from this.player.
    await super.update(deltaTime, engine)

    if (!this.player || typeof this.player.getHealth !== 'function') {
      // Check for valid player methods
      // console.warn("HUDScene Update: Player object or its methods are missing.");
      return
    }

    if (this.healthBar) {
      const healthData = this.player.getHealth()
      this.healthBar.setValue(healthData.current, healthData.max)
    }

    if (this.experienceBar) {
      const expData = this.player.getExperience()
      this.experienceBar.setValue(expData.current, expData.nextLevel)
    }
  }

  /**
   * Renders the HUD elements.
   * BaseScene.render() now calls renderUIElements by default.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async render(context, engine) {
    // HUD usually doesn't clear the screen.
    // BaseScene.render() will call this.renderUIElements()
    await super.render(context, engine)
  }

  /**
   * Cleans up when the HUD scene is unloaded.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async unload(engine) {
    // console.log("HUDScene: Unloading.");
    await super.unload(engine) // BaseScene.unload clears UI elements and engine ref
    this.player = null
    this.healthBar = null
    this.experienceBar = null
  }
}

export default HUDScene
