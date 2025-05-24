# Ironclad Engine - Roadmap & Progress

**As of: May 24, 2025**

This document outlines the original roadmap phases and the current status of each component for the Ironclad Engine, being built alongside the _Tartu Legends_ testbed game.

---

## Core Engine & Architecture

### Phase E0: Core Engine API Refinement & Setup

- **Status:** ✅ **Complete**
- **Details:** Initial `IroncladEngine.js` class, main game loop (`GameLoop.js`), configuration handling, and global engine accessibility established.

### Phase E1: Core Architectural Patterns for Game Logic

- **Status:** ✅ **Complete**
- **Details:**
  - **Entity-Component-System (ECS) Core:** `EntityManager.js`, Components (POJOs), `System.js` (Base Class), System Loop. ✅
  - `PrefabManager.js` & `prefabs.json`: Data-driven entity creation. ✅
  - `EventManager.js`: Global publish/subscribe system. ✅

---

## Phase E2: Rendering Engine API (Enhancements)

- **Sprite API (`Sprite.js`):** ✅ **Complete**
- **Camera API (`Camera.js`):** ✅ **Complete & Verified** (Works with ECS entities).
- **RenderSystem for ECS Entities (`RenderSystem.js`):** ✅ **Implemented & Verified**
- **AnimationSystem API for Sprites (`AnimationSystem.js`):** ✅ **Implemented**
- **TileLayerRenderer API (`TileLayerRenderer.js`):** ⏳ **Partially Implemented / ON HOLD**
  - Basic parsing and layer rendering. Full Tiled feature support pending.
- **FX System:** 🎉 **Initial Implementation Complete**
  - `EffectsManager.js`, Offscreen Canvas Rendering, `BaseEffect.js`. ✅
  - `ShakeEffect.js`, `FlashEffect.js`, `TintEffect.js` operational. ✅
  - **Particle System:** ⏳ **To Do**
- **Lighting & Shadow System (NEW):** ⏳ **Planned**
  - **Ambient Lighting:** ⏳ (Could leverage existing `TintEffect` or a dedicated system).
  - **Simulated Point/Spot Lights:** ⏳ (Using gradients, lightmaps, or blend modes).
  - **Simple Projected Shadows (2.5D "Fake" Shadows):** ⏳
  - **Dynamic 2D Shadows (Ray Casting - Advanced):** ⏳ (Future consideration).

---

## Phase E3: Supporting Game Systems Support API

- **Physics/Collision API:** ⏳ **Initial 2D Planar Physics & AABB Detection Implemented**
  - **Physics Components (3D-aware):** ✅ Defined for `Position (x,y,z)`, `Velocity (vx,vy,vz)`, `Acceleration`, `PhysicsBody` (selective gravity, type), `Collider` (3D AABB structure).
  - **`PhysicsSystem.js`:** 🎉 **Implemented for 2D Planar Movement** (Octopath-style)
    - Selective gravity application for entities (player `useGravity: false` for overworld). ✅
    - Motion integration (Velocity/Position updates). ✅
    - Basic tile collision detection and "stop" response for X/Y axes. ✅
    - Entity-to-Entity AABB collision _detection_ and very basic "stop/separate" _response_ implemented. ✅
  - **Refined Entity-to-Entity AABB Collision _Response_:** ⏳ **To Do / In Progress** (More precise separation, dynamic vs. static handling).
  - **Advanced Collision Response Logic:** ⏳ **To Do**.
- **UI Integration API:** 🎉 **Significant Progress**
  - Scene Stack for Overlays, Data Passing. ✅
  - **UI Elements:** `BaseUIElement`, `Label`, `Button`, `Checkbox`, `Panel`, `ValueBar`, `Slider`. ✅
  - **`DialogueBox.js`:** 🎉 **Implemented** (Displays speaker, text, typewriter, interactive button choices).
  - `ScrollablePanel.js`, `TextInputField.js`: Initial designs/implementations, pending full integration/testing. ⏳
- **Save/Load API:** ⏳ **Initial Framework Established**
  - `SaveLoadManager.js` with provider pattern. ✅
  - **Pending:** Comprehensive state saving, load orchestration, UI.
- **Audio Support:** 🎉 **Initial Implementation Complete**
  - `AssetLoader.js` loads `AudioBuffer`s. ✅
  - `AudioManager.js` for SFX/Music playback. ✅
- **Dialogue System:** 🎉 **Initial Implementation Complete**
  - JSON data structure defined. ✅
  - `DialogueManager.js` loads data, manages flow, interfaces with `DialogueBox`. ✅
- **Interaction System (NEW):** ⏳ **Planned** (For player interaction with NPCs/objects).

---

## Standalone Enhancements (From Original Pending List)

- **SceneManager API Enhancements:** 🎉 **DONE**
- **InputManager API V2 (Keyboard, Mouse, Gamepad):** 🎉 **DONE**
- **AssetLoader API Enhancements (Audio Loading, Queuing):** 🎉 **DONE**
  - Asset Grouping: ⏳ **Pending**

---

## Game-Specific Progress (_Tartu Legends_ Testbed)

- **Player Entity (`Player.js`):** 🎉 **Successfully Refactored to ECS Entity**
  - Handles input for 4-directional planar movement and a "Paper Mario" style jump (when `useGravity` is true and jump action is triggered).
  - Player sprite visible and camera tracking correctly.
- **Movement Style:** Focus on "Octopath Traveler" style 2D planar movement (no gravity on player), with optional "Paper Mario" style jumping capabilities (requires enabling gravity on player entity for those segments/scenes). ✅

---

## Documentation & Distribution

- **Documentation (VitePress):** 🎉 **Site Setup Complete & Deployable**
  - VitePress site initialized, configured for Firebase Hosting, and live. ✅
  - Core structure (`index.md`, custom `404.md`, sidebar/navbar) in place. ✅
  - Several conceptual guides drafted for core engine systems. ✅
- **API Reference (JSDoc):** ⏳ **Setup in place, full generation & linking ongoing.**
  - JSDoc comments present in much of the codebase.
  - Strategy for integrating JSDoc HTML output with VitePress established.
- **Engine Packaging (npm):** 🎉 **Successfully Packaged & Published**
  - `src/engine/index.js` created as a public entry point. ✅
  - `package.json` configured for library distribution. ✅
  - `vite.engine.config.js` created and functional for building the engine as a library. ✅
  - Engine successfully built into `dist` folder and published to npm. ✅
  - `README.md` updated with installation/CDN info and documentation links. ✅

---

## Summary of Recent Major Achievements

- **Engine Packaged for Distribution:** Ironclad Engine is now buildable as a library and published on npm, with CDN usage documented.
- **Functional ECS Player:** Player character operates fully within the ECS, with 2D planar movement (Octopath-style) and foundational "Paper Mario" style jump logic implemented.
- **Physics System Basics:** Handles movement integration, optional gravity, and initial tile/AABB collision detection.
- **Dialogue System Foundation:** `DialogueManager` and `DialogueBox` are implemented.
- **Gamepad Controls Solidified:** Input system robustly handles various input devices.
- **Documentation Site Live:** VitePress documentation is set up, deployed, and being populated.
