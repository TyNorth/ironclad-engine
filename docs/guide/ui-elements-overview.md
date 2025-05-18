# UI Elements in Ironclad Engine

The Ironclad Engine provides a growing set of reusable UI (User Interface) elements to help you build interactive menus, Heads-Up Displays (HUDs), and other in-game interfaces. These elements are designed to be easily integrated into your game scenes.

---

## Core Concepts

### `BaseUIElement.js`

All standard UI elements in the Ironclad Engine inherit from a common `BaseUIElement` class. This base class provides fundamental properties and methods shared by all elements, such as:

- **Position and Dimensions:** `x`, `y`, `width`, `height`.
- **Visibility and State:** `visible` (boolean), `enabled` (boolean).
- **Identification:** An optional `id` string.
- **Engine Reference:** A reference to the main engine instance, typically set by the scene or a parent panel.
- **Lifecycle Methods:**
  - `update(deltaTime, engine, mousePos)`: For handling per-frame logic, including input processing.
  - `render(context, engine)`: The public method called by scenes to draw the element. This method handles common checks (like visibility and context validity) before calling `_drawSelf`.
  - `_drawSelf(context, engine)`: A protected method that concrete subclasses _must_ implement to perform their specific drawing operations.
- **Basic Interaction:**
  - `containsPoint(px, py)`: Checks if a point is within the element's bounds.
  - `onClick(callback)`: Allows registering a callback function for click events.
  - `_triggerClick()`: A protected method used by interactive elements to execute the `onClick` callback.
- **Common Setters:** `setPosition()`, `setSize()`, `show()`, `hide()`, `enable()`, `disable()`.

### Scene Integration

Typically, a scene that uses UI elements will:

1. **Instantiate** the required UI elements (e.g., `new Button({...})`).
2. Store these elements in an array (e.g., `this.uiElements`). If using `BaseScene`, it provides `this.uiElements` and an `addUIElement(element)` helper method which also sets the engine reference on the element.
3. In the scene's **`update(deltaTime, engine)`** method, iterate through its active UI elements and call their `update(deltaTime, engine, mousePos)` method. (If using `BaseScene`, calling `await super.update()` or `this.updateUIElements()` handles this).
4. In the scene's **`render(context, engine)`** method, iterate through its visible UI elements and call their `render(context, engine)` method. (If using `BaseScene`, calling `await super.render()` or `this.renderUIElements()` handles this).

---

## Available UI Elements

Here's a list of the UI elements currently available or designed in the Ironclad Engine:

### 1. `Label.js`

- **Purpose:** Displays static or dynamic text.
- **Key Features:** Customizable text content, font, color, alignment (`textAlign`, `textBaseline`).
- **Interaction:** Typically non-interactive on its own.
- [Link to Label Guide](./label.md) _(Placeholder for future detailed guide)_

### 2. `Button.js`

- **Purpose:** A standard clickable button.
- **Key Features:** Displays text, customizable appearance for different states (normal, hover, pressed, disabled), executes an `onClick` callback.
- **Interaction:** Responds to mouse hover and clicks.
- [Link to Button Guide](./button.md) _(Placeholder)_

### 3. `Checkbox.js`

- **Purpose:** Represents a boolean state (checked or unchecked).
- **Key Features:** Displays a box that can be checked/unchecked, an optional text label, customizable appearance. Toggles its `isChecked` state and triggers `onClick` on interaction.
- **Interaction:** Responds to mouse clicks to toggle its state.
- [Link to Checkbox Guide](./checkbox.md) _(Placeholder)_

### 4. `Panel.js`

- **Purpose:** A container element to visually group other UI elements.
- **Key Features:** Can have its own background color and border. Manages a list of child UI elements, calling their update and render methods.
- **Interaction:** Typically not directly interactive itself, but its children are.
- [Link to Panel Guide](./panel.md) _(Placeholder)_

### 5. `ValueBar.js` (formerly HealthBar)

- **Purpose:** Visually represents a numerical value as a proportion of a maximum (e.g., health, mana, XP, progress).
- **Key Features:** Customizable colors for background and fill, optional border, optional text display of the value. Values are updated programmatically.
- **Interaction:** Usually non-interactive; its state is driven by game data.
- [Link to ValueBar Guide](./valuebar.md) _(Placeholder)_

### 6. `Slider.js`

- **Purpose:** Allows selecting a numerical value from a range by dragging a thumb along a track.
- **Key Features:** Customizable min/max values, current value, step increments, orientation (horizontal/vertical), appearance for track and thumb. Triggers an `onValueChanged` callback.
- **Interaction:** Responds to mouse click and drag on the thumb or track.
- [Link to Slider Guide](./slider.md) _(Placeholder)_

### 7. `ScrollablePanel.js` (Design/Initial Implementation)

- **Purpose:** A panel that can contain content taller than its visible area, providing a scrollbar for navigation.
- **Key Features (Planned):** Manages child elements, calculates content height, displays a vertical scrollbar, handles scrolling via mouse wheel and scrollbar interaction, clips content.
- **Interaction:** Mouse wheel scrolling, scrollbar dragging.
- [Link to ScrollablePanel Guide](./scrollable-panel.md) _(Placeholder)_

### 8. `TextInputField.js` (Design/Initial Implementation)

- **Purpose:** Allows users to input text using the keyboard.
- **Key Features (Planned):** Focus management, character input, backspace/delete, placeholder text, cursor display.
- **Interaction:** Gains focus on click, processes keyboard input when focused.
- [Link to TextInputField Guide](./text-input-field.md) _(Placeholder)_

---

This UI element system provides the building blocks for creating rich and interactive interfaces for your games. As the engine evolves, more elements and features will be added. Remember to check the individual guides for more detailed usage instructions for each component.
