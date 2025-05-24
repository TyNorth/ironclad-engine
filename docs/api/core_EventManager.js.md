# Class: EventManager

**Source:** [core/EventManager.js, line 8](core_EventManager.js.html#line8)

The `EventManager` provides a central system for **event-driven communication** within the Ironclad Engine. It implements a publish/subscribe pattern, allowing different parts of your game (or engine subsystems) to announce that something has happened (emit an event) and for other parts to react to those announcements (subscribe to an event) without being directly coupled to each other. This promotes modularity and cleaner code architecture. 🧩

---

## Constructor

### `new EventManager()`

Creates a new `EventManager` instance, initializing an internal store for event listeners.

**Source:** [core/EventManager.js, line 8](core_EventManager.js.html#line8)

---

## Methods

### `on(eventName, callback, context?, once?)`

Subscribes a `callback` function to a specific `eventName`. Whenever the event is emitted, the callback will be invoked.

**Parameters:**

| Name        | Type       | Attributes | Default | Description                                                                                                                    |
| :---------- | :--------- | :--------- | :------ | :----------------------------------------------------------------------------------------------------------------------------- |
| `eventName` | `string`   |            |         | The unique name of the event to subscribe to (e.g., `"playerDamaged"`, `"levelComplete"`).                                     |
| `callback`  | `function` |            |         | The function to be executed when the event is emitted. This function will receive any arguments passed during the `emit` call. |
| `context`   | `any`      | optional   | `null`  | The value to be used as `this` when the `callback` is executed. Useful for class methods.                                      |
| `once`      | `boolean`  | optional   | `false` | If `true`, the listener will be automatically removed after being triggered once.                                              |

**Example:**

```javascript
function onPlayerScore(scoreData) {
  console.log(`Player scored! New score: ${scoreData.newScore}`)
}
eventManager.on('playerScore', onPlayerScore)

// With context
class ScoreDisplay {
  constructor(eventManager) {
    this.score = 0
    eventManager.on('playerScore', this.updateScoreDisplay, this)
  }
  updateScoreDisplay(scoreData) {
    this.score = scoreData.newScore
    console.log(`Display updated to: ${this.score}`)
  }
}
```
