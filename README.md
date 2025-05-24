# Ironclad Engine 🛡️

**Ironclad Engine** is a modular, data-driven 2D/2.5D game engine being developed in JavaScript, utilizing HTML5 Canvas for rendering and Vite for the development environment. It's designed to be flexible and extensible, with its initial feature set driven by the development of the testbed RPG, _Tartu Legends_.

**Current Status (as of May 24, 2025):** Alpha Development

The engine has a solid foundational feature set, including core systems for rendering, input, asset management, ECS, UI, audio, physics, and dialogue. It is capable of supporting the development of 2D games with complex UI and gameplay mechanics.

---

## 🚀 Getting Started & Installation

The Ironclad Engine is available as an npm package.

[![npm version](https://badge.fury.io/js/ironclad-engine.svg)](https://badge.fury.io/js/ironclad-engine)
[![npm downloads](https://img.shields.io/npm/dt/ironclad-engine.svg)](https://www.npmjs.com/package/ironclad-engine)

You can install it in your project using npm or yarn:

```bash
npm install ironclad-engine
oryarn add ironclad-engine
Once installed, you can import modules from the engine:import { IroncladEngine, SceneManager, AssetLoader } from 'ironclad-engine';
Using via CDN (for Demos & Quick Starts)For quick prototyping, demos, or direct use in HTML pages without a build step, you can also load the Ironclad Engine from popular CDNs like unpkg or jsDelivr after it has been published to npm.Using the UMD (Universal Module Definition) build (recommended for simple script tags):This will typically expose the engine's exports on a global variable (e.g., window.IroncladEngine).<script src="[https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.umd.cjs](https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.umd.cjs)"></script>
<script>
  // Assuming your library's UMD name is 'IroncladEngine' and it exports named modules
  const { IroncladEngine, AssetLoader } = window.IroncladEngine;
  // If IroncladEngine class was the default export and is available directly:
  // const EngineClass = window.IroncladEngine;

  // Example:
  // const engine = new IroncladEngine({ canvas: myCanvasElement, ... });
  // engine.start('myScene');
</script>
(Replace @latest with a specific version like @0.1.1 for production use to avoid unexpected updates.)Using the ES Module (ESM) build (for modern browsers with <script type="module">):<script type="module">
  import { IroncladEngine, AssetLoader } from '[https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.js](https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.js)';
  // Or from jsDelivr:
  // import { IroncladEngine } from '[https://cdn.jsdelivr.net/npm/ironclad-engine@latest/dist/ironclad-engine.js](https://cdn.jsdelivr.net/npm/ironclad-engine@latest/dist/ironclad-engine.js)';

  // const engine = new IroncladEngine({ canvas: myCanvasElement, ... });
  // engine.start('myScene');
</script>
For more detailed setup and usage, please refer to our Full Documentation Site.You can find the package on npmjs.com here:View ironclad-engine on npmm✨ Core FeaturesThe Ironclad Engine currently boasts the following core systems and capabilities:**(js
```
