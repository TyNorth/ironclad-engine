# Ironclad Engine 🛡️

**Ironclad Engine** is a modular, data-driven 2D/2.5D game engine being developed in JavaScript, utilizing HTML5 Canvas for rendering and Vite for the development environment. It's designed to be flexible and extensible, with its initial feature set driven by the development of the testbed RPG, _Tartu Legends_.

**Current Status (as of May 17, 2025):** Alpha Development

The engine has a solid foundational feature set, including core systems for rendering, input, asset management, ECS, UI, audio, and basic physics. It is capable of supporting the development of 2D games with complex UI and gameplay mechanics.

---

## ✨ Core Features

The Ironclad Engine currently boasts the following core systems and capabilities:

**1. Engine Core & Architecture:**

- **Game Loop:** Robust `GameLoop.js` for consistent updates and rendering.
- **Scene Management (`SceneManager.js`):**
  - Manages a stack of game scenes.
  - Supports `pushScene`, `popScene`, and `switchTo` operations.
  - Handles modal (blocking) and non-modal (overlay, e.g., HUD) scene updates.
  - Facilitates data passing between scenes (e.g., via `uiContext`).
- **Asset Management (`AssetLoader.js`):**
  - Asynchronous loading and caching of assets.
  - Supports images (PNG, JPG), JSON data, and **Audio** (WAV, MP3, OGG via Web Audio API).
  - Queuing system and batch loading (`loadAll()`) with event-driven progress.
- **Input Management (`InputManager.js`):**
  - Modular design: `Keyboard.js`, `Mouse.js`, `Gamepad.js` (`GamepadHandler`).
  - Handles raw keyboard, mouse (position, buttons), and gamepad (connections, buttons, axes with dead zones) input.
  - Flexible **Action Mapping System** supporting multiple bindings (key, mouse button, gamepad button, gamepad axis) per action.
  - Provides "pressed", "just pressed", "just released", and analog "value" states for actions.
- **Event Management (`EventManager.js`):**
  - Global publish/subscribe system for decoupled communication between engine modules and game systems.
- **Audio Management (`AudioManager.js`):**
  - Manages playback of sound effects and background music using Web Audio API.
  - Supports master, SFX, and music volume controls, and global mute.
  - Features include looping, individual sound volume, and basic fade-in/out for music.

**2. Entity-Component-System (ECS):**

- **`EntityManager.js`:** Core for creating, destroying entities and managing their components.
- **Components:** Data-only POJOs (e.g., `Position`, `Velocity`, `RenderableSprite`, `Animation`, `Collider`, `Health`, `PlayerStats`).
- **`System.js`:** Base class for game logic systems.
- **`PrefabManager.js`:** Enables data-driven entity creation from `prefabs.json`.

**3. Rendering:**

- **`Sprite.js`:** Renders images or spritesheet frames with transformations (position, scale, rotation, opacity).
- **`Camera.js`:** Manages a 2D viewport with target following and world boundary clamping.
- **`RenderSystem.js`:** ECS system for rendering entities with `Position` and `RenderableSprite` components.
- **`AnimationSystem.js`:** ECS system for sprite-based animations.
- **Offscreen Canvas Rendering:** Scenes are rendered to an offscreen buffer, allowing for full-screen post-processing effects.
- **FX System (`EffectsManager.js`, `BaseEffect.js`):**
  - `ShakeEffect.js`: Implements customizable screen shake.
  - `FlashEffect.js`: Implements screen flash/color overlay.
  - `TintEffect.js`: Implements persistent or timed screen tint.
- **`TileLayerRenderer.js` (Partial):** Class exists for parsing and basic rendering of Tiled map data. Full feature support is ongoing.

**4. UI System (UI Integration API):**

- Built upon the `SceneManager` for UI layering.
- **UI Elements (`BaseUIElement.js` and subclasses):**
  - `Label.js`: Text display.
  - `Button.js`: Clickable buttons with hover/pressed states.
  - `Checkbox.js`: Boolean state toggle.
  - `Panel.js`: Container for grouping UI elements.
  - `ValueBar.js`: For HP, XP, progress bars.
  - `Slider.js`: For selecting values within a range.
  - `ScrollablePanel.js` (Initial Design): For scrollable content areas.
  - `TextInputField.js` (Initial Design): For text input.

**5. Game Systems Support:**

- **Physics/Collision API (Basic):**
  - Tile-based collision checks (via scene methods like `isTileSolidAtWorldXY`).
  - `MovementSystem.js` for ECS entity movement and basic tile collision.
- **Save/Load API (`SaveLoadManager.js` - Initial Framework):**
  - Provider-based system for flexible data saving/loading.
  - Uses `localStorage` and JSON.
  - Basic settings saving tested; comprehensive game state persistence is a major pending item.

---

## 🛠️ Technology Stack

- **Language:** JavaScript (ES6+)
- **Rendering:** HTML5 Canvas 2D API
- **Development Environment:** Vite
- **ECS Architecture**
- **Modular Design**

---

## 🚀 Getting Started (Conceptual)

As this is a project in active development, a formal "getting started" guide for external users is pending.
Internal setup typically involves:

1. Cloning the repository.
2. Installing dependencies (e.g., `npm install`).
3. Running the Vite development server (e.g., `npm run dev`).
4. Accessing the game via the provided local URL.

---

## 🗺️ Roadmap Overview & Future Work

The Ironclad Engine aims to be a capable 2D/2.5D engine for RPGs and similar genres. Key areas for future development include:

- **Full `TileLayerRenderer.js` Implementation:** Complete support for Tiled map features (all layer types, object layers for entity spawning, custom properties, animated tiles).
- **Comprehensive `Save/Load API`:**
  - Saving/loading all critical game state (player progression, inventory, quests, world state, entity states).
  - Robust scene transition and state restoration on load.
  - UI for save slot management.
  - Data versioning and migration.
- **Advanced UI System:**
  - Refinement of `ScrollablePanel.js` and `TextInputField.js`.
  - Potentially more complex UI widgets (e.g., item grids, dialogue boxes with text effects).
  - UI theming/skinning capabilities.
- **Audio System Enhancements:**
  - More advanced audio controls (spatial audio if moving to 2.5D, effects like reverb).
  - Asset grouping for managing audio assets.
- **Advanced Combat & Gameplay Systems:**
  - Turn-based or action combat mechanics.
  - AI systems for NPCs and enemies.
  - Status effect system.
  - More detailed physics/collision if needed.
- **Quest & Dialogue Systems:** Engine-level support or robust patterns for these critical RPG elements.
- **Particle System:** For visual effects like spells, impacts, weather.
- **Performance Optimizations:** Culling, object pooling, rendering optimizations as complexity grows.
- **Tooling:** Potential for in-engine or external tools for editing game data, scenes, or entities.

---

## 🤝 Contributing (Conceptual)

While currently a solo/internal project, contributions in the future might involve:

- Reporting bugs or issues.
- Suggesting new features or enhancements.
- Submitting pull requests for bug fixes or new features (with adherence to coding standards).

---

## 📜 License (Placeholder)

This project is currently under a placeholder license. A proper open-source license (e.g., MIT, Apache 2.0) will be chosen if the project is publicly released.

---

Thank you for your interest in the Ironclad Engine!
