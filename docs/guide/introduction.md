# Introduction to Ironclad Engine

Welcome to the Ironclad Engine! We're excited to have you explore what this engine is all about and what it aims to achieve.

## What is Ironclad Engine?

Ironclad Engine is a **modular, data-driven 2D/2.5D game engine** built with modern JavaScript (ES6+) and leveraging the power of the HTML5 Canvas for rendering. It's developed using Vite, ensuring a fast and efficient development experience.

The core philosophy behind Ironclad is to provide a flexible and extensible foundation for creating engaging 2D and "2.5D-style" games, with an initial focus on supporting RPGs like our testbed project, _Tartu Legends_.

**Key Design Goals:**

- **Modularity:** Core systems (rendering, input, audio, UI, ECS, etc.) are designed to be as independent as possible, allowing developers to use, extend, or replace parts as needed.
- **Data-Driven:** We emphasize the use of external data files (like JSON for asset manifests and entity prefabs) to configure and drive game content, making iteration and content creation more manageable.
- **Developer Experience:** Utilizing modern JavaScript and tools like Vite, we aim for a smooth and efficient development workflow.
- **Extensibility:** While providing a solid set of core features, the engine is built with the idea that game-specific logic will extend its capabilities.
- **Learning & Prototyping:** Ironclad Engine also serves as a practical learning project and a rapid prototyping tool for 2D game ideas.

## Current Capabilities

As of its current development phase (Alpha, May 2025), Ironclad Engine offers a robust set of features to start building games:

- **Core Engine:** Game loop, scene management (stacking, overlays, data passing), asset loading (images, JSON, audio), and a global event system.
- **Input System:** Comprehensive support for keyboard, mouse, and gamepad, all integrated into a flexible action mapping system.
- **Entity-Component-System (ECS):** A functional ECS core with entity management, component handling, systems, and data-driven prefabs.
- **Rendering:** 2D sprite rendering, sprite-based animations, a 2D camera with target following, and an offscreen canvas pipeline for screen-level FX.
- **Effects System:** Support for screen shake, screen flash, and screen tint.
- **Audio System:** Loading and playback of sound effects and music with volume controls.
- **UI Toolkit:** A growing set of basic UI elements like labels, buttons, checkboxes, panels, value bars, and initial designs for scrollable panels and text input fields.
- **Physics & Collision:** Basic tile-based collision for both standalone player objects and ECS entities.
- **Save/Load Framework:** An initial, provider-based system for saving and loading game data using `localStorage`.

## Who is this Engine For?

- Developers interested in understanding modern JavaScript game engine architecture.
- Indie developers or hobbyists looking for a flexible 2D engine to build RPGs or similar genre games.
- Those who want to learn about ECS, scene management, and other common game engine patterns in a practical context.
- Anyone wanting to quickly prototype 2D game ideas.

## The Journey Ahead

Ironclad Engine is an evolving project. Our roadmap includes further enhancements to the rendering pipeline (especially for Tiled maps), a more comprehensive save/load system, an expanded UI toolkit, advanced audio features, and deeper support for RPG mechanics.

The development of _Tartu Legends_ serves as the primary driver and testbed for these features, ensuring that the engine evolves based on real-world game development needs.

We hope you find the Ironclad Engine useful and inspiring. Dive into the "Getting Started" guide to begin your journey!
