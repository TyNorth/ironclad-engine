# Class: IroncladEngine

**Source:** `core/IroncladEngine.js`

The `IroncladEngine` is the central orchestrator for games built with the Ironclad Engine. It manages the main game loop, scene transitions, core systems (assets, input, entities, rendering, audio, effects), and provides a unified interface to these components. It follows a singleton pattern, ensuring only one instance is active during the application's lifecycle.

## Singleton Access

The engine is designed as a singleton. Once initialized, the single instance can be accessed statically via `IroncladEngine.instance`. If the engine is running in a browser environment, it also typically assigns itself to `window.gameEngine` for easy debugging access.

```javascript
// Example of getting the instance (after it has been created)
const engine = IroncladEngine.instance

// In a browser, often also available as:
// const engine = window.gameEngine;
```
