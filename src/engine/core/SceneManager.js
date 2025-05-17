// src/engine/core/SceneManager.js

/**
 * @file SceneManager.js
 * @description Manages a stack of game scenes, controlling which scene(s) are active,
 * updating, and rendering. Passes engine instance to scene methods.
 */

// JSDoc typedefs as before...

class SceneManager {
  constructor() {
    this.scenes = {}
    this.sceneStack = []
    this.context = null
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
    // console.log('SceneManager: Engine instance and context set.');
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
    // console.log(`SceneManager: Scene "${name}" registered.`);
  }

  getActiveSceneInstance() {
    if (this.sceneStack.length > 0) {
      return this.sceneStack[this.sceneStack.length - 1].instance
    }
    return null
  }

  getActiveSceneName() {
    if (this.sceneStack.length > 0) {
      return this.sceneStack[this.sceneStack.length - 1].name
    }
    return null
  }

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

    // console.log(`SceneManager: Switching to base scene "${sceneName}". Unloading current stack...`);
    while (this.sceneStack.length > 0) {
      const sceneWrapper = this.sceneStack.pop()
      if (typeof sceneWrapper.instance.unload === 'function') {
        // console.log(`SceneManager: Unloading "${sceneWrapper.name}" from stack.`);
        sceneWrapper.instance.unload(this.engine)
      }
    }

    this.sceneStack.push({ name: sceneName, instance: newSceneInstance })
    if (typeof newSceneInstance.initialize === 'function') {
      // Ensure consistency with scenes expecting initialize(engine, data)
      // Your BaseScene expects (engine, data).
      // The old SceneManager JSDoc had (engine, context, data)
      // For now, matching pushScene's call signature which works with BaseScene
      newSceneInstance.initialize(this.engine, data)
    }
    if (this.engine.events) this.engine.events.emit('scene:switched', { name: sceneName, data })
    // console.log(`SceneManager: Switched to scene "${sceneName}". Stack size: ${this.sceneStack.length}`);
  }

  pushScene(sceneName, data = {}) {
    if (!this.engine || !this.context) {
      // context check might be redundant if scenes don't get it directly
      console.error('SceneManager.pushScene: Engine or context not set.')
      return
    }
    const newSceneInstance = this.scenes[sceneName]
    if (!newSceneInstance) {
      console.error(`SceneManager.pushScene: Scene "${sceneName}" not found.`)
      return
    }

    // MODIFIED CONSOLE LOG to prevent circular structure error
    if (typeof data === 'object' && data !== null) {
      console.log(
        `SceneManager: Pushing scene "${sceneName}". Data keys being passed: ${Object.keys(data).join(', ')}`,
      )
    } else {
      console.log(`SceneManager: Pushing scene "${sceneName}". Data being passed:`, data)
    }

    const currentTopSceneInstance = this.getActiveSceneInstance()
    if (currentTopSceneInstance && typeof currentTopSceneInstance.pause === 'function') {
      // console.log(`SceneManager: Pausing current top scene "${this.getActiveSceneName()}".`);
      currentTopSceneInstance.pause(this.engine)
    }

    this.sceneStack.push({ name: sceneName, instance: newSceneInstance })
    // console.log(`SceneManager: Pushed scene "${sceneName}". Stack size: ${this.sceneStack.length}`);
    if (typeof newSceneInstance.initialize === 'function') {
      // This assumes scenes (like BaseScene) expect initialize(engine, data)
      newSceneInstance.initialize(this.engine, data)
    }
    if (this.engine.events) this.engine.events.emit('scene:pushed', { name: sceneName, data })
  }

  popScene(dataToPassDown = {}) {
    if (!this.engine /*|| !this.context*/) {
      // context check might be redundant
      console.error('SceneManager.popScene: Engine not set.')
      return
    }
    if (this.sceneStack.length === 0) {
      console.warn('SceneManager.popScene: No scene to pop from stack.')
      return
    }

    const poppedSceneWrapper = this.sceneStack.pop()
    const poppedSceneName = poppedSceneWrapper.name
    // console.log(`SceneManager: Popping scene "${poppedSceneName}". Stack size: ${this.sceneStack.length}`);
    if (typeof poppedSceneWrapper.instance.unload === 'function') {
      poppedSceneWrapper.instance.unload(this.engine)
    }
    if (this.engine.events) {
      this.engine.events.emit('scene:popped', { name: poppedSceneName, dataPassed: dataToPassDown })
    }

    const newTopSceneInstance = this.getActiveSceneInstance()
    if (newTopSceneInstance && typeof newTopSceneInstance.resume === 'function') {
      // console.log(`SceneManager: Resuming new top scene "${this.getActiveSceneName()}".`);
      // BaseScene expects resume(engine, data)
      newTopSceneInstance.resume(this.engine, dataToPassDown)
    }
  }

  update(deltaTime) {
    for (let i = this.sceneStack.length - 1; i >= 0; i--) {
      const sceneEntry = this.sceneStack[i]
      if (sceneEntry.instance && typeof sceneEntry.instance.update === 'function') {
        sceneEntry.instance.update(deltaTime, this.engine)
      }
      const isModalScene =
        sceneEntry.instance.isModal !== undefined ? sceneEntry.instance.isModal : true
      if (isModalScene) {
        break
      }
    }
  }

  render() {
    if (!this.engine || !this.context) return
    for (const sceneWrapper of this.sceneStack) {
      if (sceneWrapper.instance && typeof sceneWrapper.instance.render === 'function') {
        sceneWrapper.instance.render(this.context, this.engine)
      }
    }
  }
}

export default SceneManager
