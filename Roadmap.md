# Ironclad Engine - Roadmap & Progress Recap

**As of: May 17, 2025**

This document outlines the original roadmap phases and the current status of each component for the Ironclad Engine, being built alongside the _Tartu Legends_ testbed game.

---

## Core Engine & Architecture

### Phase E0: Core Engine API Refinement & Setup

- **Status:** ✅ **Complete**
- **Details:** Initial `IroncladEngine.js` class, main game loop (`GameLoop.js`), configuration handling, and global engine accessibility established.

### Phase E1: Core Architectural Patterns for Game Logic

- **Status:** ✅ **Complete**
- **Details:**
  - **Entity-Component-System (ECS) Core:**
    - `EntityManager.js`: Manages entity creation/destruction, component addition/retrieval. ✅
    - Components: Defined as POJOs (e.g., "Position", "Velocity", "RenderableSprite", "Animation", "Collider"). ✅
    - `System.js` (Base Class): For creating game logic systems. ✅
    - System Loop: Engine updates registered systems. ✅
  - `PrefabManager.js` & `prefabs.json`: Data-driven entity creation from JSON templates. ✅
  - `EventManager.js`: Global publish/subscribe system. ✅

---

## Phase E2: Rendering Engine API (Enhancements)

- **Sprite API (`Sprite.js`):** ✅ **Complete**
  - Handles drawing images/spritesheet frames with transformations (position, scale, rotation, opacity, source rectangle).
- **Camera API (`Camera.js`):** ✅ **Complete**
  - Manages a viewport that can follow a target (supporting objects with direct properties or `getPosition`/`getDimensions` methods).
  - Clamps to world boundaries.
  - Owned by `IroncladEngine`.
- **RenderSystem for ECS Entities (`RenderSystem.js`):** ✅ **Implemented**
  - ECS system that renders entities with "Position" and "RenderableSprite" components, using the camera.
  - Called by scenes or engine for draw order.
- **AnimationSystem API for Sprites (`AnimationSystem.js`):** ✅ **Implemented**
  - ECS system that updates "RenderableSprite" data based on "Animation" component definitions, animating entities.
- **TileLayerRenderer API (`TileLayerRenderer.js`):** ⏳ **Partially Implemented / ON HOLD**
  - Class exists and is instantiated by `OverworldScene`.
  - Parses Tiled JSON map data and tileset information.
  - Basic layer rendering (`renderLayer`) is present.
  - Full functionality (all Tiled features, performance optimizations) is pending further development.
- **FX System (NEW):** 🎉 **Initial Implementation Complete**
  - `EffectsManager.js`: Manages a list of active effects.
  - Offscreen Canvas Rendering: Engine renders scenes to an offscreen buffer, `EffectsManager` applies effects and draws to main canvas. ✅
  - `BaseEffect.js`: Abstract base class for effects. ✅
  - `ShakeEffect.js`: Implements screen shake. ✅
  - `FlashEffect.js`: Implements screen flash/color overlay. ✅
  - `TintEffect.js`: Implements persistent or timed screen tint. ✅

---

## Phase E3: Supporting Game Systems Support API

- **Physics/Collision API:** ✅ **Basic Implementation Complete**
  - Tile-based collision: `OverworldScene.isTileSolidAtWorldXY()` used by standalone `Player.js`. ✅
  - `MovementSystem.js`: Handles basic tile collision for ECS entities with `Position`, `Velocity`, and `Collider` components. ✅
- **UI Integration API:** 🎉 **Significant Progress / Partially Complete**
  - **Scene Stack for Overlays:** `SceneManager.js` supports `pushScene`, `popScene`, modal/non-modal scene updates (for HUDs). ✅
  - **Data Passing:** Pattern for `uiContext` and passing data between scenes established. ✅
  - **Basic UI Elements:**
    - `BaseUIElement.js`: Foundation class with common properties, `render`/`_drawSelf` pattern. ✅
    - `Label.js`: For displaying text. ✅
    - `Button.js`: Interactive, clickable buttons with hover/pressed states and callbacks. ✅
    - `Checkbox.js`: For boolean state toggling. ✅
    - `Panel.js`: Container for other UI elements with background/border. ✅
    - `ValueBar.js` (formerly HealthBar): Generic bar for displaying values (HP, XP, etc.). ✅
    - `ScrollablePanel.js`: Designed, initial implementation for vertical scrolling. Needs further testing and refinement for child interactions. ⏳
    - `TextInputField.js`: Designed, initial implementation. Needs robust focus and keyboard event handling. ⏳
    - `Slider.js`: Designed, initial implementation.
- **Save/Load API:** ⏳ **Initial Framework Established**
  - `SaveLoadManager.js`: Created with a provider pattern (`registerDataProvider`, `getSaveData`, `loadSaveData`). ✅
  - Uses `localStorage` and JSON. ✅
  - Basic save/load of `gameSettings` from `OverworldScene` tested. ✅
  - **Pending:** Comprehensive state saving (player stats/inventory/quests, entity states, scene/position for full restoration), UI for slot management, data versioning, robust load orchestration.

---

## Pending Enhancements (Original List - Status Update)

- **SceneManager API Enhancements (Scene stack for overlays like menus):** 🎉 **DONE**
  - `SceneManager.js` now supports a scene stack with `push`, `pop`, `switchTo`.
  - Handles modal and non-modal (overlay) scene updates.
  - Data passing between scenes is functional.
- **InputManager API V2 (Mouse, Gamepad support):** 🎉 **DONE**
  - `InputManager.js` refactored into modular components:
    - `Keyboard.js`: Handles raw keyboard input. ✅
    - `Mouse.js`: Handles raw mouse input (position, buttons). ✅
    - `Gamepad.js` (`GamepadHandler`): Handles gamepad connections, button/axis polling, dead zones. ✅
  - Action mapping system updated to support keyboard, mouse button, gamepad button, and gamepad axis bindings. ✅
- **AssetLoader API Enhancements (Audio, asset grouping):** ⏳ **Audio Loading Done, Grouping Pending**
  - `AssetLoader.js` updated with a queuing system and `loadAll()` for batch loading. ✅
  - Supports loading images, JSON. ✅
  - **Audio Loading:** Successfully loads and decodes audio files into `AudioBuffer`s using Web Audio API. ✅
  - `AudioManager.js`: Created for playing sound effects and music, with volume controls and gain nodes. ✅
  - Asset Grouping: The `group` parameter exists in queuing methods, but full utilization (e.g., loading/unloading specific groups) is not yet deeply implemented. ⏳

---

## Summary of Recent Major Achievements

- **Modular Input System:** Keyboard, Mouse, and Gamepad support are now functional and integrated into a flexible action mapping system.
- **Basic UI Toolkit:** A suite of foundational UI elements (`Label`, `Button`, `Checkbox`, `Panel`, `ValueBar`, initial `ScrollablePanel`) has been created, making UI development more component-based.
- **Initial FX System:** Screen shake, flash, and tint effects are operational using an offscreen canvas and a modular effect management system.
- **Audio Playback:** The engine can now load and play sound effects and music.
- **Save/Load Framework:** The `SaveLoadManager` provides a flexible way to start saving and loading game data.

The engine is becoming quite capable! The next steps will likely involve deepening the functionality of these systems (especially Save/Load and UI for RPG mechanics), implementing the `TileLayerRenderer`, or further expanding the FX and Audio systems.
