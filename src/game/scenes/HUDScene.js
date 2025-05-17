// src/game/scenes/HUDScene.js
import BaseScene from '../../engine/core/BaseScene.js' // Adjust path as needed
import ValueBar from '../../engine/ui/ValueBar.js'

class HUDScene extends BaseScene {
  constructor() {
    super() // Calls BaseScene's constructor

    // HUD specific properties
    /** @type {import('../../game/entities/Player.js').default | null} */ // Assuming player type
    this.player = null
    /** @type {ValueBar | null} */
    this.healthBar = null
    /** @type {ValueBar | null} */
    this.experienceBar = null

    // Crucial for HUD: This scene is an overlay and should not block updates to scenes below it.
    this.isModal = false

    // this.engine, this.uiContext (if used), this.uiElements are initialized by BaseScene.
    // console.log("HUDScene: Constructed (extends BaseScene).");
  }

  /**
   * Called by the SceneManager when the scene is first created and activated.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Optional data passed when the scene is activated. Expected to contain 'player'.
   */
  async initialize(engine, data = {}) {
    await super.initialize(engine, data) // Call BaseScene's initialize

    // Attempt to get the player object
    if (data.player) {
      this.player = data.player
    } else if (engine.player) {
      // Fallback to an engine-level player reference if available
      this.player = engine.player
    } else {
      console.warn(
        'HUDScene: Player object not provided or found on engine. HUD will not display player stats effectively.',
      )
      // Initialize with placeholder data or make bars invisible if no player
      this.player = { hp: 0, maxHp: 100, currentXp: 0, xpToNextLevel: 100 } // Placeholder
    }

    this.uiElements = [] // Clear any from BaseScene, though it's already empty

    // Health Bar
    this.healthBar = new ValueBar({
      x: 20,
      y: 20,
      width: 200,
      height: 20,
      maxValue: this.player.maxHp || 100,
      currentValue: this.player.hp || 0,
      fillColor: 'red',
      backgroundColor: '#550000',
      borderColor: 'darkred',
      showText: true,
      font: '12px Arial',
      textColor: 'white',
      textFormatFunction: (current, max) => `HP: ${Math.round(current)}/${Math.round(max)}`,
    })
    this.addUIElement(this.healthBar) // Uses helper from BaseScene

    // Experience Bar
    this.experienceBar = new ValueBar({
      x: 20,
      y: 45, // Below health bar
      width: 200,
      height: 15,
      maxValue: this.player.xpToNextLevel || 100,
      currentValue: this.player.currentXp || 0,
      fillColor: 'gold',
      backgroundColor: '#554200',
      borderColor: 'darkgoldenrod',
      showText: true,
      font: '10px Arial',
      textColor: 'black',
      textFormatFunction: (current, max) => `XP: ${Math.round(current)}/${Math.round(max)}`,
    })
    this.addUIElement(this.experienceBar)

    // console.log("HUDScene: Initialized.");
  }

  /**
   * Updates the HUD elements, primarily syncing them with player data.
   * @param {number} deltaTime - The time elapsed since the last frame.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async update(deltaTime, engine) {
    await super.update(deltaTime, engine) // Call BaseScene's update

    if (!this.player) return

    // Keep the bars synced with player's actual stats
    if (this.healthBar) {
      const currentHp = this.player.hp !== undefined ? this.player.hp : 0
      const currentMaxHp = this.player.maxHp !== undefined ? this.player.maxHp : 100
      this.healthBar.setValue(currentHp, currentMaxHp)
    }

    if (this.experienceBar) {
      const currentXp = this.player.currentXp !== undefined ? this.player.currentXp : 0
      const currentXpToNext =
        this.player.xpToNextLevel !== undefined ? this.player.xpToNextLevel : 100
      this.experienceBar.setValue(currentXp, currentXpToNext)
    }

    // ValueBar's own update doesn't do much, but if other UI elements were added
    // that need mouse interaction, we'd call updateUIElements.
    // For now, HUD elements are passive displays.
    // this.updateUIElements(deltaTime, engine); // If HUD had interactive elements
  }

  /**
   * Renders the HUD elements.
   * @param {CanvasRenderingContext2D} context - The rendering context.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   */
  async render(context, engine) {
    await super.render(context, engine) // Call BaseScene's render

    // HUD usually doesn't clear the screen.
    // It just renders its elements on top of the current game scene.
    this.renderUIElements(context, engine) // Use helper from BaseScene
  }

  async unload(engine) {
    // console.log("HUDScene: Unloading, calling super.unload.");
    await super.unload(engine) // Calls BaseScene's unload (which clears this.uiElements)
    this.player = null // Clear player reference
    this.healthBar = null
    this.experienceBar = null
  }

  // Pause and Resume are less likely to be directly relevant for a simple HUD
  // as it's always active or hidden by modal scenes.
  // async pause(engine) { await super.pause(engine); }
  // async resume(engine, data = null) { await super.resume(engine, data); }
}

export default HUDScene
