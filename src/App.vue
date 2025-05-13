<template>
  <div id="app-container">
    <canvas ref="gameCanvasRef" id="game-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/**
 * @file App.vue
 * @description The main Vue application component.
 * It hosts the HTML canvas element where the game will be rendered.
 * JSDoc comments in Vue SFC <script setup> are for descriptive purposes.
 */

/**
 * A template ref to the game's canvas element.
 * This allows us to access the canvas DOM element directly.
 * @type {import('vue').Ref<HTMLCanvasElement | null>}
 */
const gameCanvasRef = ref(null)

onMounted(() => {
  // This lifecycle hook is called after the component's template has been mounted to the DOM.
  // We can safely access `gameCanvasRef.value` here.
  if (gameCanvasRef.value) {
    console.log('App.vue: Canvas element successfully mounted and referenced.', gameCanvasRef.value)
    // Further canvas initialization (like setting initial size or passing to the engine)
    // will primarily be handled in `src/main.js` after the Vue app is mounted.
  } else {
    console.error('App.vue: Canvas element ref is null after mount.')
  }
})

// Expose the ref for potential access by parent components or for easier access in main.js
// though querySelector on the #game-canvas ID in main.js is also straightforward.
// Making it available for advanced use cases or testing.
defineExpose({
  gameCanvasRef,
})
</script>

<style scoped>
/**
 * @styles App.vue
 * @description Styles for the main application container and the game canvas.
 */
#app-container {
  width: 100vw; /* Full viewport width */
  height: 100vh; /* Full viewport height */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1a; /* A dark background for the page, less harsh than pure black */
  margin: 0;
  padding: 0;
  overflow: hidden; /* Prevents scrollbars if canvas slightly mismatches viewport */
}

#game-canvas {
  border: 2px solid #4ae07a; /* A clear, visible border for the canvas */
  background-color: #000000; /* Default canvas background to black */
  /*
    Initial canvas dimensions (width and height attributes) should ideally be set
    directly on the canvas element's properties in JavaScript (e.g., canvas.width = 800)
    to define the drawing surface resolution.
    CSS width/height can be used to scale the canvas element visually if needed,
    but it's distinct from the rendering resolution.
    We will handle setting the drawing surface dimensions in main.js.
  */
  /* Example for visual scaling if desired, but not for render resolution: */
  /* width: 80%; */
  /* height: 80%; */
}
</style>
