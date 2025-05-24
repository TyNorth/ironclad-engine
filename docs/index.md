---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Ironclad Engine'
  text: 'Modular 2D/2.5D Game Engine'
  tagline: Build your vision with a flexible JavaScript game engine, designed for extensibility and data-driven development.
  image:
    src: /logo.svg # Optional: Place your logo in docs/public/logo.svg
    alt: Ironclad Engine Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started # Links to docs/guide/getting-started.md
    - theme: alt
      text: View on GitHub
      link: https://github.com/TyNorth/ironclad-engine # Replace with your actual GitHub repo link
    - theme: alt
      text: API Reference
      link: /api/home # Links to your JSDoc main page (docs/public/api/index.html) or your VitePress API landing page (docs/api/index.md)

features:
  - title: Modular Architecture
    icon: 🛠️
    details: Core systems (rendering, input, audio, ECS, UI, FX, scenes, assets, save/load) are designed as distinct modules, promoting flexibility and maintainability.
  - title: Data-Driven Design
    icon: 📄
    details: Leverages JSON for configurations such as asset manifests and entity prefabs, simplifying content management and iteration.
  - title: Comprehensive Input System
    icon: 🎮
    details: Supports keyboard, mouse, and gamepad inputs, all integrated into a versatile action mapping system for flexible control schemes.
  - title: Rich UI Toolkit
    icon: 🖼️
    details: Includes a growing library of UI elements (Labels, Buttons, Checkboxes, Panels, ValueBars, Sliders, etc.) built on a base element class.
  - title: Entity-Component-System
    icon: 🧩
    details: Features a functional ECS core with entity management, POJO components, systems, and prefab instantiation for scalable game logic.
  - title: Modern Development
    icon: ⚡
    details: Built with modern JavaScript (ES6+) and Vite for a fast and efficient development experience, complemented by JSDoc for API documentation.
---

## Welcome to Ironclad Engine

Ironclad Engine is a passion project aimed at creating a versatile and understandable game engine for 2D and "2.5D-style" games, with a strong initial focus on supporting RPG development.

### Current State

The engine is in active Alpha development and already includes a wide range of features:

- Full scene management with stacking and overlays.
- A robust, modular input system for Keyboard, Mouse, and Gamepad.
- An Entity-Component-System architecture.
- Asset loading for images, JSON, and audio (via Web Audio API).
- An `AudioManager` for sound effects and music.
- A flexible UI element library.
- An initial FX system supporting screen shake, flash, and tint via offscreen rendering.
- A foundational Save/Load system with a provider pattern.

### Testbed Game: Tartu Legends

The development of Ironclad Engine is driven by the needs of **Tartu Legends**, an RPG testbed game inspired by classics like Octopath Traveler, Pokémon, and Monster Hunter. This ensures that engine features are practical and relevant for real-world game development.

### Dive In

- Check out the **[Getting Started Guide](./guide/getting-started.md)** to set up your first project.
- Explore the **[Conceptual Guides](./guide/introduction)** to learn about specific engine systems.
- Browse the **[Full API Reference](/api/)** for detailed information on all classes and modules.

We hope you find Ironclad Engine a useful tool for your game development journey!
