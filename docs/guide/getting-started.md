# Getting Started with Ironclad Engine

Welcome to the Ironclad Engine! This guide will walk you through the basic steps to set up a new project and create your first simple scene using the engine.

## Prerequisites

Before you begin, ensure you have the following installed and have a basic understanding of:

- **Node.js and npm (or yarn):** The engine uses Vite, which requires Node.js.
- **JavaScript (ES6+):** The engine and game logic are written in modern JavaScript.
- **Basic HTML/CSS:** For setting up the initial HTML page and canvas.
- **Vite (Recommended):** Familiarity with Vite will be helpful, as it's the build tool for the engine's development environment.

## 1. Project Setup

Since the Ironclad Engine is currently being developed alongside _Tartu Legends_, it's not yet a distributable npm package. To use it for a new game project:

- **Option A (Recommended for now): Work within the existing project structure.**
  - The `src/engine/` directory contains the engine code.
  - The `src/game/` directory is where you can build your game (_Tartu Legends_ or a new game).
  - You can create new subdirectories within `src/game/` for your game-specific scenes, entities, systems, etc.
- **Option B (Separate Project - Advanced):**
  - You could copy the `src/engine/` directory into a new project.
  - You would then need to set up a Vite build configuration for that new project, ensuring paths to engine modules are correct.

For this guide, we'll assume you are working within the existing Ironclad Engine project structure and building your game in the `src/game/` directory.

## 2. Basic Project Structure Overview

A typical project using the Ironclad Engine will have:

- `public/`: Static assets that are served directly.
  - `public/assets/`: A good place for your game assets (images, audio, data).
    - `public/assets/data/asset-manifest.json`: Defines assets to be loaded.
- `src/`: Source code.
  - `src/engine/`: Contains all the core Ironclad Engine modules.
  - `src/game/`: Contains your game-specific code.
    - `src/game/scenes/`: Your game's scenes.
    - `src/game/entities/`: Game-specific entities (like `Player.js`).
    - `src/game/systems/`: Game-specific ECS systems.
  - `src/main.js`: The main entry point that initializes and starts the engine.
- `index.html`: The main HTML file that includes your canvas.
- `package.json`: Project dependencies and scripts.
- `vite.config.js`: Vite build configuration.

## 3. Creating Your `main.js`

Your `main.js` file is where you'll initialize the Ironclad Engine. Here's a minimal setup:

```javascript
// src/main.js
import IroncladEngine from './engine/core/IroncladEngine.js';
import MyFirstScene from './game/scenes/MyFirstScene.js'; // Your new scene

// Optional: Other imports like global styles, Vue app if using it for overlay UI

// Ensure the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvasElement = document.getElementById('game-canvas'); // Make sure this ID matches your HTML

    if (!canvasElement) {
        console.error("main.js: Canvas element with ID 'game-canvas' not found.");
        return;
    }

    const config = {
        canvas: canvasElement,
        width: 800, // Desired game width
        height: 600, // Desired game height
        assetManifestPath: '/assets/data/asset-manifest.json', // Path to your asset list
        sceneRegistry: {
            'myFirstScene': MyFirstScene,
            // Add other scenes here as you create them
            // 'loading': LoadingScene, // etc.
        },
        // defaultWorldWidth: 1600, // Optional: initial world size for camera
        // defaultWorldHeight: 1200, // Optional: initial world size for camera
    };

    try {
        console.log('main.js: Initializing IroncladEngine...');
        const engine = new IroncladEngine(config);
        window.gameEngine = engine; // Make it globally accessible for debugging

        // Define Input Actions (Example)
        const inputManager = engine.getInputManager();
        if (inputManager) {
            inputManager.defineAction('confirm', [{ type: 'key', code: 'Enter' }]);
        }

        // Register Global ECS Systems (if any)
        // Example: engine.registerSystem(new MyGlobalSystem());

        console.log('main.js: Starting engine...');
        engine.start('myFirstScene', { message: "Hello from Ironclad!" }); // Start with your scene

    } catch (error) {
        console.error("Fatal Error in main.js:", error);
        alert(`Fatal Engine Error: ${error.message}. Check console.`);
    }
});
4. Creating Your First SceneCreate a new file, for example, src/game/scenes/MyFirstScene.js:// src/game/scenes/MyFirstScene.js
// If you use BaseScene (recommended for consistency):
// import BaseScene from '../../engine/core/BaseScene.js';
// class MyFirstScene extends BaseScene {

class MyFirstScene { // Standalone version for simplicity here
    constructor() {
        this.engine = null;
        this.message = "Scene not initialized";
        // console.log("MyFirstScene: Constructed");
    }

    // SceneManager (older version) calls: initialize(engine, context, data) for initial scene via switchTo
    // SceneManager (newer, class-based) calls: initialize(engine, data)
    // For simplicity, let's assume the newer signature (or your BaseScene handles it)
    async initialize(engine, data = {}) {
        this.engine = engine;
        this.message = data.message || "Welcome to My First Scene!";
        console.log(`MyFirstScene: Initialized. Message: ${this.message}`);

        // Example: Change background color
        // This requires access to the context, which the render method receives.
        // For now, this scene will just log and draw text.
    }

    async update(deltaTime, engine) {
        // Game logic for this scene goes here
        // Example: Check for input
        if (engine.inputManager.isActionJustPressed('confirm')) {
            console.log("MyFirstScene: Confirm action pressed!");
            this.message = "Confirm was pressed!";
        }
    }

    async render(context, engine) {
        // Clear the canvas (or offscreen canvas if EffectsManager is used)
        context.fillStyle = '#333333'; // Dark gray background
        context.fillRect(0, 0, engine.canvas.width, engine.canvas.height);

        // Draw the message
        context.fillStyle = 'white';
        context.font = '24px sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.message, engine.canvas.width / 2, engine.canvas.height / 2);
    }

    async unload(engine) {
        console.log("MyFirstScene: Unloaded.");
    }

    // Optional: pause() and resume() methods
    // async pause(engine) { console.log("MyFirstScene: Paused."); }
    // async resume(engine, data = {}) { console.log("MyFirstScene: Resumed."); }
}

export default MyFirstScene;
Note on initialize signature: The example above uses initialize(engine, data = {}). Your current SceneManager.js (the one that uses setContextAndEngine) calls initialize(engine, context, data) for scenes loaded via switchTo (like an initial scene) and initialize(engine, data) for scenes loaded via pushScene. If MyFirstScene is your initial scene, you might need to adjust its initialize signature to (engine, context, data) to match your current SceneManager.switchTo call, or better yet, update your SceneManager.switchTo to consistently call initialize(engine, data) like pushScene does, which aligns with the BaseScene pattern.5. HTML SetupEnsure your index.html (or main HTML file) has a canvas element:<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ironclad Engine Game</title>
    <link rel="stylesheet" href="/style.css"> </head>
<body>
    <div id="app">
        </div>
    <canvas id="game-canvas"></canvas> <script type="module" src="/src/main.js"></script>
</body>
</html>
6. Running Your ProjectIf you have Vite set up (as assumed for Ironclad Engine development), you typically run:npm run dev
Or if using Yarn:yarn dev
This will start the Vite development server, and you should be able to open your game in the browser. You should see your MyFirstScene with its dark gray background and message.Next StepsCongratulations! You've set up a basic project with the Ironclad Engine. From here, you can explore:Asset Loading: Refer to the AssetLoader guide (once written) and the example LoadingScene.js to load images, JSON, and audio.Scene Management: Learn more about pushing and popping scenes, and passing data, in the Scene Management guide.Input System: Define more complex actions and handle keyboard, mouse, and gamepad input.ECS: Start creating entities and components for your game objects and systems to manage their behavior.UI Elements: Use the built-in UI elements (Label, Button, Checkbox, etc.) to create menus and HUDs.Refer to the API documentation and other conceptual guides for more details
```
