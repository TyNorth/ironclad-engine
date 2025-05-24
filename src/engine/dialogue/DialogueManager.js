// src/engine/dialogue/DialogueManager.js
// import DialogueBox from '../ui/DialogueBox.js'; // Will be passed in

/**
 * @file DialogueManager.js
 * @description Manages the flow and state of dialogues in the game.
 */
class DialogueManager {
  /**
   * @param {import('../core/IroncladEngine.js').default} engine
   */
  constructor(engine) {
    if (!engine) {
      throw new Error('DialogueManager: Engine instance is required.')
    }
    /** @private @type {import('../core/IroncladEngine.js').default} */
    this.engine = engine
    /** @private @type {import('../core/AssetLoader.js').default} */
    this.assetLoader = engine.getAssetLoader()
    /** @private @type {import('../core/InputManager.js').default} */
    this.inputManager = engine.getInputManager()
    /** @private @type {import('../core/EventManager.js').default} */
    this.eventManager = engine.getEventManager()

    /** @private @type {import('../ui/DialogueBox.js').default | null} The UI element for displaying dialogue. */
    this.dialogueBoxInstance = null

    /** @private @type {object | null} The entire loaded collection of dialogues. */
    this.dialogueData = null
    /** @private @type {string | null} Asset key for the main dialogue JSON file. */
    this.dialogueDataAssetKey = 'gameDialogues' // Example key, configure as needed

    /** @private @type {Array<object> | null} The current dialogue set (array of nodes) being processed. */
    this.currentDialogueSet = null
    /** @private @type {string | null} The ID of the current dialogue set. */
    this.currentDialogueId = null
    /** @private @type {number} Index of the current node within the currentDialogueSet. */
    this.currentNodeIndex = -1
    /** @private @type {object | null} The current dialogue node object. */
    this.currentNode = null

    /** @type {boolean} Whether a dialogue is currently active. */
    this.isActive = false

    // console.log("DialogueManager: Constructed.");
  }

  /**
   * Sets the DialogueBox UI instance that this manager will control.
   * @param {import('../ui/DialogueBox.js').default} dialogueBox
   */
  setDialogueBox(dialogueBox) {
    this.dialogueBoxInstance = dialogueBox
    if (this.dialogueBoxInstance) {
      this.dialogueBoxInstance.onTextAdvance = this._handleTextAdvanceRequest.bind(this)
      this.dialogueBoxInstance.onChoiceSelect = this._handleChoiceSelection.bind(this)
      // console.log("DialogueManager: DialogueBox instance set and callbacks configured.");
    } else {
      console.warn('DialogueManager: A null DialogueBox instance was set.')
    }
  }

  /**
   * Loads the main dialogue data file.
   * Call this after assets are loaded, e.g., in a scene's initialize.
   * @param {string} [assetKey] - The asset key for the dialogue JSON file.
   * @returns {boolean} True if data was loaded, false otherwise.
   */
  loadDialogueData(assetKey) {
    this.dialogueDataAssetKey = assetKey || this.dialogueDataAssetKey
    if (!this.assetLoader) {
      console.error('DialogueManager: AssetLoader not available to load dialogue data.')
      return false
    }
    this.dialogueData = this.assetLoader.get(this.dialogueDataAssetKey)
    if (this.dialogueData) {
      // console.log(`DialogueManager: Dialogue data "${this.dialogueDataAssetKey}" loaded successfully.`);
      return true
    } else {
      console.error(
        `DialogueManager: Failed to load dialogue data from asset key "${this.dialogueDataAssetKey}". Ensure it's preloaded.`,
      )
      return false
    }
  }

  /**
   * Starts a dialogue sequence by its ID.
   * @param {string} dialogueId - The ID of the dialogue set to start (e.g., "npc_hermit_greeting").
   * @returns {boolean} True if dialogue started successfully, false otherwise.
   */
  startDialogue(dialogueId) {
    if (!this.dialogueBoxInstance) {
      console.error('DialogueManager: Cannot start dialogue, DialogueBox instance not set.')
      return false
    }
    if (!this.dialogueData) {
      // console.warn("DialogueManager: Dialogue data not loaded. Attempting to load now.");
      if (!this.loadDialogueData()) {
        // Try loading default key
        console.error(
          `DialogueManager: Cannot start dialogue "${dialogueId}", dialogue data still not available.`,
        )
        return false
      }
    }
    if (!this.dialogueData[dialogueId]) {
      console.error(`DialogueManager: Dialogue ID "${dialogueId}" not found in loaded data.`)
      return false
    }

    this.currentDialogueId = dialogueId
    this.currentDialogueSet = this.dialogueData[dialogueId]
    this.currentNodeIndex = 0
    this.isActive = true

    this.dialogueBoxInstance.show() // Make sure the dialogue box is visible

    this._displayCurrentNode()
    if (this.eventManager) this.eventManager.emit('dialogue:started', { dialogueId })
    // console.log(`DialogueManager: Started dialogue "${dialogueId}".`);
    return true
  }

  /**
   * Displays the current dialogue node in the DialogueBox.
   * @private
   */
  _displayCurrentNode() {
    if (
      !this.currentDialogueSet ||
      this.currentNodeIndex < 0 ||
      this.currentNodeIndex >= this.currentDialogueSet.length
    ) {
      // console.log("DialogueManager: No current node to display or index out of bounds. Ending dialogue.");
      this.endDialogue()
      return
    }
    this.currentNode = this.currentDialogueSet[this.currentNodeIndex]
    // console.log(`DialogueManager: Displaying node ${this.currentNodeIndex}:`, this.currentNode);

    this.dialogueBoxInstance.displayMessage({
      speaker: this.currentNode.speaker,
      text: this.currentNode.text,
      portraitKey: this.currentNode.portrait,
      choices: this.currentNode.choices, // Pass choices data to DialogueBox
    })
    if (this.eventManager)
      this.eventManager.emit('dialogue:nodeDisplayed', {
        dialogueId: this.currentDialogueId,
        node: this.currentNode,
      })
  }

  /**
   * Called by DialogueBox when player advances text (and no choices).
   * @private
   */
  _handleTextAdvanceRequest() {
    if (!this.isActive || !this.currentNode) return
    // console.log("DialogueManager: Text advance request received.");
    this.advanceToNextNode(this.currentNode.next)
  }

  /**
   * Called by DialogueBox when player selects a choice.
   * @private
   * @param {string} choiceId - The 'id' of the choice object (not the 'leadsTo' value yet).
   */
  _handleChoiceSelection(choiceId) {
    if (!this.isActive || !this.currentNode || !this.currentNode.choices) return

    const selectedChoice = this.currentNode.choices.find((c) => c.id === choiceId) // Assuming choices have unique 'id's
    if (selectedChoice && selectedChoice.leadsTo) {
      // console.log(`DialogueManager: Choice "${selectedChoice.text}" selected, leading to node/dialogue ID: "${selectedChoice.leadsTo}".`);
      if (this.eventManager)
        this.eventManager.emit('dialogue:choiceMade', {
          dialogueId: this.currentDialogueId,
          choice: selectedChoice,
        })
      // TODO: Check if leadsTo is an internal node ID or a new dialogue ID
      this.advanceToNextNode(selectedChoice.leadsTo)
    } else {
      console.warn('DialogueManager: Selected choice or its leadsTo path not found.', choiceId)
      this.endDialogue() // Or handle differently
    }
  }

  /**
   * Advances to a specified next node ID or ends dialogue.
   * @param {string | null | undefined} nextNodeId - The ID of the next node in the current set.
   */
  advanceToNextNode(nextNodeId) {
    if (!this.isActive) return

    if (nextNodeId) {
      const nextIndex = this.currentDialogueSet.findIndex((node) => node.id === nextNodeId)
      if (nextIndex !== -1) {
        this.currentNodeIndex = nextIndex
        this._displayCurrentNode()
      } else {
        console.warn(
          `DialogueManager: Next node ID "${nextNodeId}" not found in current dialogue set "${this.currentDialogueId}". Ending dialogue.`,
        )
        this.endDialogue()
      }
    } else {
      // No 'next' specified, end of this branch/dialogue
      // console.log(`DialogueManager: No next node specified for node ID "${this.currentNode?.id}". Ending dialogue.`);
      this.endDialogue()
    }
  }

  /**
   * Ends the current dialogue.
   */
  endDialogue() {
    if (!this.isActive) return
    // console.log(`DialogueManager: Ending dialogue "${this.currentDialogueId}".`);
    const endedDialogueId = this.currentDialogueId

    this.isActive = false
    this.currentDialogueId = null
    this.currentDialogueSet = null
    this.currentNodeIndex = -1
    this.currentNode = null

    if (this.dialogueBoxInstance) {
      this.dialogueBoxInstance.hide() // Hide the dialogue box
    }
    if (this.eventManager) this.eventManager.emit('dialogue:ended', { dialogueId: endedDialogueId })
  }

  /**
   * Update method, called by the game loop (e.g., from a scene's update).
   * Primarily listens for player input to advance dialogue if it's waiting.
   * @param {number} deltaTime
   */
  update(deltaTime) {
    if (!this.isActive || !this.dialogueBoxInstance || !this.inputManager) return

    // If text is fully displayed, no choices are active, and player gives advance input
    if (
      this.dialogueBoxInstance.isWaitingForAdvance &&
      !this.dialogueBoxInstance.isWaitingForChoice
    ) {
      // Using a generic 'confirm' or 'interact' action
      if (
        this.inputManager.isActionJustPressed('menuConfirm') ||
        this.inputManager.isActionJustPressed('interact')
      ) {
        // console.log("DialogueManager: Advance action detected.");
        this.dialogueBoxInstance.requestAdvance() // This will trigger onTextAdvance -> _handleTextAdvanceRequest
      }
    }
    // Choice selection is handled by Button clicks which directly call _handleChoiceSelection via DialogueBox.onChoiceSelect
  }

  /**
   * Cleans up resources, though most are managed by other systems.
   */
  destroy() {
    this.endDialogue() // Ensure current dialogue is properly ended
    this.dialogueBoxInstance = null // Release reference
    this.dialogueData = null
    // console.log("DialogueManager: Destroyed.");
  }
}

export default DialogueManager
