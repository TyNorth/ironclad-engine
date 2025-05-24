
# Ironclad Engine 🛡️

**Ironclad Engine** is a modular, data-driven 2D/2.5D game engine being developed in JavaScript, utilizing HTML5 Canvas for rendering and Vite for the development environment. It's designed to be flexible and extensible, with its initial feature set driven by the development of the testbed RPG, _Tartu Legends_ (envisioned with Octopath Traveler-style overworld and Paper Mario-style jump mechanics).

**Current Status (as of May 24, 2025):** Alpha Development

The engine has a growing foundational feature set, including core systems for rendering, comprehensive input (Keyboard, Mouse, Gamepad), asset management (images, JSON, audio), a robust Entity-Component-System (ECS), a versatile UI toolkit, an audio playback system, a visual FX system, initial physics for 2D planar movement and collision, and a dialogue system. It is capable of supporting the development of 2D games with complex UI and gameplay mechanics.

---

## 🚀 Getting Started & Installation

The Ironclad Engine is available as an npm package.

[![npm version](https://badge.fury.io/js/ironclad-engine.svg)](https://badge.fury.io/js/ironclad-engine)
[![npm downloads](https://img.shields.io/npm/dt/ironclad-engine.svg)](https://www.npmjs.com/package/ironclad-engine)

You can install it in your project using npm or yarn:

```bash
npm install ironclad-engine
```


or

```bash
yarn add ironclad-engine
```

Once installed, you can import modules from the engine:

```javascript
import { IroncladEngine, SceneManager, AssetLoader } from 'ironclad-engine'
```

### Using via CDN (for Demos & Quick Starts)

For quick prototyping or direct use in HTML:

**UMD build (exposes `window.IroncladEngine` with named exports):**

```html
<script src="[https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.umd.cjs](https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.umd.cjs)"></script>
<script>
  const { IroncladEngine } = window.IroncladEngine
  // const engine = new IroncladEngine({ canvas: myCanvasElement, ... });
</script>
```

**ES Module (ESM) build:**

```html
<script type="module">
  import { IroncladEngine } from '[https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.js](https://unpkg.com/ironclad-engine@latest/dist/ironclad-engine.js)'
  // const engine = new IroncladEngine({ canvas: myCanvasElement, ... });
</script>
```

_(Replace `@latest` with a specific version like `@0.1.1` for production use.)_

For more detailed setup and usage, please refer to our **[Full Documentation Site](https://www.google.com/search?q=https://ironclad-engine-docs.web.app/)**.

You can find the package on npmjs.com here: **[View ironclad-engine on npm](https://www.npmjs.com/package/ironclad-engine)**

---

## ✨ Core Features

The Ironclad Engine currently boasts the following core systems and capabilities:

**1. Engine Core & Architecture:**

- **Game Loop (`GameLoop.js`):** Consistent updates and rendering.
- **Scene Management (`SceneManager.js`):** Scene stack, transitions (push, pop, switchTo), modal/non-modal updates, data passing.
- **Asset Management (`AssetLoader.js`):** Asynchronous, queued batch loading for images, JSON, and Audio (Web Audio API AudioBuffers) with progress events.
- **Input Management (`InputManager.js`):** Modular (Keyboard, Mouse, Gamepad), flexible Action Mapping System for multiple binding types (key, mouse button, gamepad button/axis) with "pressed", "just pressed/released", and analog "value" states.
- **Event Management (`EventManager.js`):** Global publish/subscribe system.
- **Audio Management (`AudioManager.js`):** Playback for SFX/Music, master/SFX/music volume controls, mute, fades.

**2. Entity-Component-System (ECS):**

- **`EntityManager.js`:** Core entity and component management.
- **Components:** Data-only POJOs (e.g., Position (3D), Velocity (3D), RenderableSprite, Animation, Collider, PhysicsBody, Health).
- **`System.js`:** Base class for systems.
- **`PrefabManager.js`:** Data-driven entity creation from `prefabs.json`.

**3. Rendering:**

- **`Sprite.js`:** Renders images/spritesheet frames with transformations.
- **`Camera.js`:** 2D viewport with target following (ECS compatible), world boundary clamping.
- **`RenderSystem.js`:** ECS system for rendering entities.
- **`AnimationSystem.js`:** ECS system for sprite-based animations.
- **Offscreen Canvas Rendering:** Enables full-screen post-processing effects.
- **FX System (`EffectsManager.js`, `BaseEffect.js`):**
  - `ShakeEffect.js`, `FlashEffect.js`, `TintEffect.js` implemented.
- **`TileLayerRenderer.js` (Partial):** Basic parsing and rendering of Tiled maps.

**4. UI System (UI Integration API):**

- Uses `SceneManager` for layering.
- **UI Elements:** `BaseUIElement`, `Label.js`, `Button.js`, `Checkbox.js`, `Panel.js`, `ValueBar.js`, `Slider.js`.
- **`DialogueBox.js`:** Interactive dialogue display with typewriter effect and button choices.
- **`ScrollablePanel.js`, `TextInputField.js` (Initial Designs).**

**5. Game Systems Support:**

- **Physics/Collision API (`PhysicsSystem.js`):**
  - Handles 2D planar movement (Octopath-style) with optional selective gravity (for Paper Mario-style jumps).
  - 3D-aware components (Position, Velocity, Acceleration, PhysicsBody, Collider).
  - Basic tile collision detection and "stop" response.
  - Entity-to-Entity AABB collision detection with basic "stop/separate" response.
- **Save/Load API (`SaveLoadManager.js` - Initial Framework):**
  - Provider-based system using `localStorage` and JSON.
- **Dialogue System (`DialogueManager.js`, `DialogueBox.js`):**
  - Manages and displays structured dialogues from JSON data.
- **Interaction System:** ⏳ Planned (For triggering dialogues, actions from player-NPC/object interactions).

---

## 🛠️ Technology Stack

- **Language:** JavaScript (ES6+)
- **Rendering:** HTML5 Canvas 2D API
- **Development Environment:** Vite
- **Architecture:** ECS, Modular Design

---

## 📖 Documentation

The Ironclad Engine's full documentation, including conceptual guides and API references, is hosted at:

**[https://ironclad-engine-docs.web.app/](https://www.google.com/search?q=https://ironclad-engine-docs.web.app/)**

- **API Reference:** Generated from JSDoc comments, browseable at `[DocsSite]/api/`.
- **Conceptual Guides:** Markdown files covering engine systems, setup, and usage at `[DocsSite]/guide/`.

---

## 🗺️ Roadmap Overview & Future Work

Key areas for future development include:

- **Interaction System:** Implementing robust player-world interactions.
- **Refined Physics & Collision Responses:** Smoother tile interactions, advanced AABB responses (restitution, friction).
- **Full `TileLayerRenderer.js` Implementation:** Complete Tiled map support.
- **Comprehensive Save/Load API:** Full game state persistence, UI for slots.
- **Advanced UI System:** More complex UI widgets (item grids, dialogue effects), theming.
- **Lighting & Shadow System:** Ambient light, simple projected shadows, dynamic 2D lights.
- **Particle System:** For richer visual effects.
- **Audio System Enhancements & Asset Grouping.**
- **Combat, Quest, and other RPG Gameplay Systems.**
- **Performance Optimizations & Tooling.**

---

## 🤝 Contributing (Conceptual)

This is primarily a solo development project for now. Future contributions might involve bug reports, feature suggestions, or pull requests.

---

## 📜 License

This project is licensed under the MIT License. 


