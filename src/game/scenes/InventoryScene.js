// src/game/scenes/InventoryScene.js
// No BaseScene import needed
import Label from '../../engine/ui/Label.js'
import Button from '../../engine/ui/Button.js'
import ScrollablePanel from '../../engine/ui/ScrollablePanel.js'

class InventoryScene {
  constructor() {
    /** @type {import('../../engine/core/IroncladEngine.js').default | null} */
    this.engine = null
    /** @type {object | null} */
    this.uiContext = null // Data passed from the calling scene, if any
    /** @type {import('../../engine/ui/BaseUIElement.js').default[]} */
    this.uiElements = []

    this.isModal = true // Inventory screen should block game updates

    /** @type {ScrollablePanel | null} */
    this.inventoryPanel = null
    /** @type {Button | null} */
    this.closeButton = null
    /** @type {Label | null} */
    this.titleLabel = null

    this.inventoryItems = [] // To store item data passed to the scene
    // console.log("InventoryScene: Constructed (Standalone).");
  }

  /**
   * Initializes the InventoryScene.
   * @param {import('../../engine/core/IroncladEngine.js').default} engine - The engine instance.
   * @param {object} [data={}] - Optional data passed when the scene is activated.
   */
  async initialize(engine, data = {}) {
    this.engine = engine
    // console.log("InventoryScene: Initializing with data:", data);

    if (data.inventoryItems) {
      this.inventoryItems = data.inventoryItems
    } else if (data.uiContext && data.uiContext.inventoryItems) {
      this.inventoryItems = data.uiContext.inventoryItems
    } else {
      console.warn('InventoryScene: No inventory items provided. Displaying placeholder items.')
      this.inventoryItems = [
        { id: 'item001', name: 'Health Potion', quantity: 5 },
        { id: 'item002', name: 'Mana Potion', quantity: 3 },
        { id: 'item003', name: 'Iron Sword', quantity: 1 },
        { id: 'item004', name: 'Leather Armor', quantity: 1 },
        { id: 'item005', name: 'Old Map Fragment', quantity: 1 },
        { id: 'item006', name: 'Mystic Gem', quantity: 10 },
        { id: 'item007', name: 'Herbs', quantity: 25 },
        { id: 'item008', name: 'Bandages', quantity: 12 },
        { id: 'item009', name: 'Lockpick Set', quantity: 1 },
        { id: 'item010', name: 'Gold Coins', quantity: 157 },
      ]
    }
    // Also store the full uiContext if it was passed, for other potential uses
    if (data.uiContext) {
      this.uiContext = data.uiContext
    }

    const canvasWidth = engine.canvas.width
    const canvasHeight = engine.canvas.height
    const centerX = canvasWidth / 2

    this.uiElements = [] // Initialize/clear elements

    // Title
    this.titleLabel = new Label({
      x: centerX,
      y: 50,
      text: 'Inventory',
      font: '32px sans-serif',
      textAlign: 'center',
      textBaseline: 'middle',
    })
    this.addUIElement(this.titleLabel)

    // Scrollable Panel for inventory items
    this.inventoryPanel = new ScrollablePanel({
      x: centerX - 200,
      y: 100,
      width: 400,
      height: canvasHeight - 200,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderColor: 'rgba(150, 150, 150, 0.8)',
      borderWidth: 2,
      padding: 10,
      scrollbarWidth: 12,
      mouseWheelSensitivity: 30,
    })
    this.addUIElement(this.inventoryPanel)

    this.populateInventoryPanel()

    // Close Button
    this.closeButton = new Button({
      x: centerX - 75,
      y: canvasHeight - 70,
      width: 150,
      height: 40,
      text: 'Close',
      onClick: () => {
        // console.log("InventoryScene: Close button clicked.");
        if (this.engine && this.engine.sceneManager) {
          this.engine.sceneManager.popScene()
        }
      },
    })
    this.addUIElement(this.closeButton)

    // console.log("InventoryScene: Initialized with UI elements.");
  }

  addUIElement(element) {
    if (element && typeof element.setEngine === 'function' && this.engine) {
      element.setEngine(this.engine)
    }
    this.uiElements.push(element)
  }

  populateInventoryPanel() {
    if (!this.inventoryPanel || !this.engine) return // Need engine for child elements
    this.inventoryPanel.clearChildren()

    if (this.inventoryItems.length === 0) {
      const emptyLabel = new Label({
        text: 'Inventory is empty.',
        font: '16px sans-serif',
        color: 'gray',
        textAlign: 'center',
        width: this.inventoryPanel.width - 2 * this.inventoryPanel.padding,
      })
      emptyLabel.height = 20
      emptyLabel.setEngine(this.engine) // Set engine for children too
      this.inventoryPanel.addChild(emptyLabel)
    } else {
      this.inventoryItems.forEach((item) => {
        const itemEntry = new Button({
          width:
            this.inventoryPanel.width -
            2 * this.inventoryPanel.padding -
            this.inventoryPanel.scrollbarWidth,
          height: 30,
          text: `${item.name} (x${item.quantity})`,
          font: '16px sans-serif',
          textColor: 'white',
          backgroundColor: 'rgba(255,255,255,0.05)',
          hoverBackgroundColor: 'rgba(255,255,255,0.15)',
          // textAlign: 'left', // Button text is centered by default
          onClick: () => {
            console.log(`Clicked on item: ${item.name}`, item)
            // Example: this.engine.sceneManager.pushScene('ItemActionMenu', { item: item, uiContext: this.uiContext });
          },
        })
        itemEntry.setEngine(this.engine) // Set engine for children
        this.inventoryPanel.addChild(itemEntry)
      })
    }
    // ScrollablePanel's addChild calls _calculateContentHeightAndArrange
  }

  async update(deltaTime, engine) {
    if (!this.engine) this.engine = engine // Ensure engine is set if not passed in constructor

    // Update all UI elements directly
    if (this.engine && this.engine.inputManager) {
      const mousePos = this.engine.inputManager.getCanvasMousePosition()
      for (const element of this.uiElements) {
        if (element.visible && element.enabled) {
          element.update(deltaTime, this.engine, mousePos)
        }
      }
    }

    // Keyboard fallback for "Close"
    if (
      this.engine &&
      this.engine.inputManager &&
      (this.engine.inputManager.isActionJustPressed('cancel') ||
        this.engine.inputManager.isActionJustPressed('toggleInventory'))
    ) {
      // Changed from openInventory
      // console.log("InventoryScene: 'cancel' or 'toggleInventory' key, popping self.");
      if (this.engine.sceneManager) {
        this.engine.sceneManager.popScene()
      }
    }
  }

  async render(context, engine) {
    if (!this.engine) this.engine = engine // Ensure engine is set
    if (!context) {
      // console.error("InventoryScene.render: Context not available.");
      return
    }

    // Dim the background scene
    context.fillStyle = 'rgba(0, 0, 0, 0.5)'
    context.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height)

    // Render all UI elements directly
    for (const element of this.uiElements) {
      if (element.visible) {
        element.render(context, this.engine)
      }
    }
  }

  async pause(engine) {
    // console.log("InventoryScene: Paused.");
  }

  async resume(engine, data = {}) {
    // console.log("InventoryScene: Resumed. Data:", data);
    // If inventory could change while a sub-menu is open, refresh it:
    // this.populateInventoryPanel();
  }

  async unload(engine) {
    // console.log("InventoryScene: Unloading.");
    this.uiElements.forEach((element) => {
      if (typeof element.destroy === 'function') {
        element.destroy()
      }
    })
    this.uiElements = []
    this.inventoryPanel = null
    this.closeButton = null
    this.titleLabel = null
    this.engine = null // Clear engine reference
  }
}

export default InventoryScene
