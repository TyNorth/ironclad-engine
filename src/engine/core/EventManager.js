// src/engine/core/EventManager.js

/**
 * @file EventManager.js
 * @description A simple publish/subscribe event system for the Ironclad Engine.
 */

/**
 * @class EventManager
 * @description Allows for registering, unregistering, and emitting custom events.
 */
class EventManager {
  constructor() {
    /**
     * @private
     * @type {Map<string, Array<{callback: Function, context: any, once: boolean}>>}
     * @description Stores event listeners. The key is the eventName,
     * and the value is an array of listener objects.
     */
    this.listeners = new Map()
    console.log('EventManager: Initialized.')
  }

  /**
   * Subscribes a callback function to a specific event.
   * @param {string} eventName - The name of the event to subscribe to.
   * @param {Function} callback - The function to call when the event is emitted.
   * @param {any} [context=null] - The `this` context for the callback function.
   * @param {boolean} [once=false] - If true, the listener will be removed after the first time it's triggered.
   */
  on(eventName, callback, context = null, once = false) {
    if (typeof callback !== 'function') {
      console.error(
        `EventManager.on: Provided callback for event "${eventName}" is not a function.`,
      )
      return
    }
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName).push({ callback, context, once })
    // console.log(`EventManager: Listener added for event "${eventName}".`);
  }

  /**
   * Subscribes a callback function to a specific event, to be triggered only once.
   * @param {string} eventName - The name of the event to subscribe to.
   * @param {Function} callback - The function to call when the event is emitted.
   * @param {any} [context=null] - The `this` context for the callback function.
   */
  once(eventName, callback, context = null) {
    this.on(eventName, callback, context, true)
  }

  /**
   * Unsubscribes a callback function from a specific event.
   * For this to work reliably, the same function reference used for `on` must be provided.
   * If context was provided during `on`, it should ideally be matched too for more specific unsubscription,
   * but this basic version primarily relies on the callback reference.
   * @param {string} eventName - The name of the event to unsubscribe from.
   * @param {Function} callback - The callback function to remove.
   * @param {any} [context=null] - Optional: The context that was used during subscription.
   */
  off(eventName, callback, context = null) {
    if (typeof callback !== 'function') {
      console.error(
        `EventManager.off: Provided callback for event "${eventName}" is not a function.`,
      )
      return
    }
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners) {
      // Filter out the listener. If context is also provided, match it.
      // This creates a new array, which is fine.
      this.listeners.set(
        eventName,
        eventListeners.filter((listener) => {
          return (
            listener.callback !== callback || (context !== null && listener.context !== context)
          )
        }),
      )
      // console.log(`EventManager: Listener removed for event "${eventName}".`);
    }
  }

  /**
   * Emits an event, calling all subscribed callback functions.
   * @param {string} eventName - The name of the event to emit.
   * @param {...any} args - Arguments to pass to the callback functions.
   */
  emit(eventName, ...args) {
    const eventListeners = this.listeners.get(eventName)
    if (eventListeners && eventListeners.length > 0) {
      // console.log(`EventManager: Emitting event "${eventName}" with args:`, args);
      // Iterate over a copy of the listeners array in case a listener modifies the original array (e.g., by calling off or on)
      const listenersToCall = [...eventListeners]

      listenersToCall.forEach((listener) => {
        try {
          listener.callback.apply(listener.context, args)
        } catch (error) {
          console.error(`EventManager: Error in listener for event "${eventName}":`, error)
        }
        if (listener.once) {
          // If it was a 'once' listener, remove it using the more specific 'off'
          this.off(eventName, listener.callback, listener.context)
        }
      })
    }
  }

  /**
   * Removes all listeners for a specific event.
   * @param {string} eventName - The name of the event.
   */
  removeAllListeners(eventName) {
    if (this.listeners.has(eventName)) {
      this.listeners.delete(eventName)
      console.log(`EventManager: All listeners removed for event "${eventName}".`)
    }
  }

  /**
   * Removes all listeners for all events. Use with caution (e.g., for full engine reset).
   */
  clearAll() {
    this.listeners.clear()
    console.log('EventManager: All event listeners cleared.')
  }
}

export default EventManager
