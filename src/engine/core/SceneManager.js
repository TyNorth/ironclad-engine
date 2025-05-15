// src/engine/core/SceneManager.js

/**
 * @file SceneManager.js
 * @description Manages a stack of game scenes, controlling which scene(s) are active,
 * updating, and rendering. Passes engine instance to scene methods.
 */

/**
 * @typedef {object} SceneInstance // Actual instance of a scene class
 * @description Interface for a game scene instance.
 * @property {function(import('./IroncladEngine.js').default, CanvasRenderingContext2D, object=): void} initialize - Called when the scene is first activated (pushed or switched to).
 * @property {function(number, import('./IroncladEngine.js').default): void} update - Called every frame if the scene is active.
 * @property {function(CanvasRenderingContext2D, import('./IroncladEngine.js').default): void} render - Called every frame to draw the scene if it's in the stack.
 * @property {function(import('./IroncladEngine.js').default): void} unload - Called when the scene is popped, or when a switchTo clears the stack.
 * @property {function(import('./IroncladEngine.js').default): void} [pause] - Optional: Called when another scene is pushed on top of this one.
 * @property {function(import('./IroncladEngine.js').default, CanvasRenderingContext2D, object=): void} [resume] - Optional: Called when this scene becomes the top of the stack again after a pop.
 */

/**
 * @typedef {object} SceneStackEntry
 * @property {string} name - The registered name of the scene.
 * @property {SceneInstance} instance - The instance of the scene.
 */

/**
 * @class SceneManager
 * @description Manages the collection of registered scenes and an active scene stack.
 */
class SceneManager {
  constructor() {
    /**
     * @private
     * @type {Object.<string, SceneInstance>}
     * @description Stores all registered scene instances, keyed by their name.
     * These are instantiated by IroncladEngine and added here.
     */
    this.scenes = {}

    /**
     * @private
     * @type {Array<SceneStackEntry>}
     * @description The stack of active scenes. The scene at the end of the array is the top/active one.
     */
    this.sceneStack = []

    /** @private @type {CanvasRenderingContext2D | null} */
    this.context = null
    /** @private @type {import('./IroncladEngine.js').default | null} */
    this.engine = null

    // console.log('SceneManager: Initialized with stack support.');
  }

  setContextAndEngine(context, engineInstance) {
    if (!context) console.error('SceneManager: Provided context is invalid.')
    this.context = context

    if (!engineInstance) {
      console.error('SceneManager: Provided engine instance is invalid.')
      return
    }
    this.engine = engineInstance
    console.log('SceneManager: Engine instance and context set.')
  }

  add(name, sceneInstance) {
    if (typeof name !== 'string' || !name) {
      console.error('SceneManager: Scene name invalid.')
      return
    }
    if (typeof sceneInstance !== 'object' || sceneInstance === null) {
      console.error(`SceneManager: Scene object for "${name}" invalid.`)
      return
    }
    if (
      typeof sceneInstance.initialize !== 'function' ||
      typeof sceneInstance.update !== 'function' ||
      typeof sceneInstance.render !== 'function' ||
      typeof sceneInstance.unload !== 'function'
      // Optional methods: pause, resume
    ) {
      console.error(
        `SceneManager: Scene "${name}" missing required methods. Check JSDoc SceneInstance typedef.`,
      )
      return
    }
    if (this.scenes[name]) {
      console.warn(`SceneManager: Scene "${name}" already exists. Overwriting.`)
    }
    this.scenes[name] = sceneInstance
    console.log(`SceneManager: Scene "${name}" registered.`)
  }

  /**
   * Gets the current active scene instance (top of the stack).
   * @returns {SceneInstance | null}
   */
  getActiveSceneInstance() {
    if (this.sceneStack.length > 0) {
      return this.sceneStack[this.sceneStack.length - 1].instance
    }
    return null
  }

  /**
   * Gets the name of the current active scene (top of the stack).
   * @returns {string | null}
   */
  getActiveSceneName() {
    if (this.sceneStack.length > 0) {
      return this.sceneStack[this.sceneStack.length - 1].name
    }
    return null
  }

  /**
   * Clears the current scene stack (unloading all) and switches to a new base scene.
   * @param {string} sceneName - The name of the scene to switch to.
   * @param {object} [data={}] - Data to pass to the new scene's initialize method.
   */
  switchTo(sceneName, data = {}) {
    if (!this.engine || !this.context) {
      console.error('SceneManager.switchTo: Engine or context not set.')
      return
    }
    const newSceneInstance = this.scenes[sceneName]
    if (!newSceneInstance) {
      console.error(`SceneManager.switchTo: Scene "${sceneName}" not found.`)
      return
    }

    console.log(`SceneManager: Switching to base scene "${sceneName}". Unloading current stack...`)
    while (this.sceneStack.length > 0) {
      const sceneWrapper = this.sceneStack.pop()
      if (typeof sceneWrapper.instance.unload === 'function') {
        console.log(`SceneManager: Unloading "${sceneWrapper.name}" from stack.`)
        sceneWrapper.instance.unload(this.engine)
      }
    }

    this.sceneStack.push({ name: sceneName, instance: newSceneInstance })
    if (typeof newSceneInstance.initialize === 'function') {
      newSceneInstance.initialize(this.engine, this.context, data)
    }
    if (this.engine.events) this.engine.events.emit('scene:switched', { name: sceneName, data })
    console.log(
      `SceneManager: Switched to scene "${sceneName}". Stack size: ${this.sceneStack.length}`,
    )
  }

  /**
   * Pushes a new scene onto the stack, making it the active scene.
   * The previous top scene (if any) will be paused if it has a `pause` method.
   * @param {string} sceneName - The name of the scene to push.
   * @param {object} [data={}] - Data to pass to the new scene's initialize method.
   */
  pushScene(sceneName, data = {}) {
    if (!this.engine || !this.context) {
      console.error('SceneManager.pushScene: Engine or context not set.')
      return
    }
    const newSceneInstance = this.scenes[sceneName]
    if (!newSceneInstance) {
      console.error(`SceneManager.pushScene: Scene "${sceneName}" not found.`)
      return
    }
    console.log(`SceneManager: Sending Data received : ${JSON.stringify(data)}`)

    const currentTopSceneInstance = this.getActiveSceneInstance()
    if (currentTopSceneInstance && typeof currentTopSceneInstance.pause === 'function') {
      console.log(`SceneManager: Pausing current top scene "${this.getActiveSceneName()}".`)
      currentTopSceneInstance.pause(this.engine)
    }

    this.sceneStack.push({ name: sceneName, instance: newSceneInstance })
    console.log(`SceneManager: Pushed scene "${sceneName}". Stack size: ${this.sceneStack.length}`)
    if (typeof newSceneInstance.initialize === 'function') {
      newSceneInstance.initialize(this.engine, data)
    }
    if (this.engine.events) this.engine.events.emit('scene:pushed', { name: sceneName, data })
  }

  /**
   * Pops the current top scene from the stack.
   * The scene below it (if any) will be resumed if it has a `resume` method.
   * @param {object} [dataToPassDown={}] - Optional data to pass to the resume method of the scene below.
   */
  popScene(dataToPassDown = {}) {
    if (!this.engine || !this.context) {
      console.error('SceneManager.popScene: Engine or context not set.')
      return
    }
    if (this.sceneStack.length === 0) {
      console.warn('SceneManager.popScene: No scene to pop from stack.')
      return
    }

    const poppedSceneWrapper = this.sceneStack.pop()
    const poppedSceneName = poppedSceneWrapper.name
    console.log(
      `SceneManager: Popping scene "${poppedSceneName}". Stack size: ${this.sceneStack.length}`,
    )
    if (typeof poppedSceneWrapper.instance.unload === 'function') {
      poppedSceneWrapper.instance.unload(this.engine)
    }
    if (this.engine.events)
      this.engine.events.emit('scene:popped', { name: poppedSceneName, dataPassed: dataToPassDown })

    const newTopSceneInstance = this.getActiveSceneInstance()
    if (newTopSceneInstance && typeof newTopSceneInstance.resume === 'function') {
      const newTopSceneName = this.getActiveSceneName()
      console.log(`SceneManager: Resuming new top scene "${newTopSceneName}".`)
      newTopSceneInstance.resume(this.engine, this.context, dataToPassDown)
    }
  }

  /**
   * Updates the active scene (top of the stack).
   * TODO: Consider allowing multiple scenes to update if they have an `updateWhenCovered` flag.
   * @param {number} deltaTime - The time elapsed since the last frame.
   */
  update(deltaTime) {
    if (!this.engine) return
    const activeSceneInstance = this.getActiveSceneInstance()
    if (activeSceneInstance && typeof activeSceneInstance.update === 'function') {
      activeSceneInstance.update(deltaTime, this.engine)
    }
  }

  /**
   * Renders all scenes in the stack, from bottom to top, to allow for overlays.
   */
  render() {
    if (!this.engine || !this.context) return
    for (const sceneWrapper of this.sceneStack) {
      if (sceneWrapper.instance && typeof sceneWrapper.instance.render === 'function') {
        // Potentially save/restore context state around each scene render if they interfere
        // For now, assume scenes manage their own state cleanly or don't interfere.
        sceneWrapper.instance.render(this.context, this.engine)
      }
    }
  }
}

export default SceneManager
