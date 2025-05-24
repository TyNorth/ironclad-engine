# Class: Sprite

**Source:** `rendering/Sprite.js`
**File Description:** Defines a Sprite class for rendering images or portions of images (sprite sheets) on the canvas.

The `Sprite` class represents a visual object that can be drawn onto a 2D canvas. It's highly versatile, capable of rendering an entire image or a specific rectangular portion (a "frame" or "tile") from a larger image, commonly known as a sprite sheet. This makes it fundamental for character animations, game objects, and various visual elements.

Sprites have properties to control their position, size, visibility, opacity, rotation, scaling, and which part of a source image they display.

---

## Constructor

### `new Sprite(image, x?, y?, width?, height?, sx?, sy?, sWidth?, sHeight?)`

Creates an instance of a `Sprite`.

**Parameters:**

| Name      | Type               | Attributes | Default                                      | Description                                                                                                                            |
| :-------- | :----------------- | :--------- | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `image`   | `HTMLImageElement` |            |                                              | The `HTMLImageElement` to be rendered. **It's crucial that this image is pre-loaded** before the sprite attempts to render it.         |
| `x`       | `number`           | optional   | `0`                                          | The x-coordinate of the sprite's top-left corner on the destination canvas (world/screen position).                                    |
| `y`       | `number`           | optional   | `0`                                          | The y-coordinate of the sprite's top-left corner on the destination canvas (world/screen position).                                    |
| `width`   | `number`           | optional   | Source frame width or `image.naturalWidth`   | The width to draw the sprite on the canvas. If undefined, it defaults to `sWidth` (if specified) or the natural width of the image.    |
| `height`  | `number`           | optional   | Source frame height or `image.naturalHeight` | The height to draw the sprite on the canvas. If undefined, it defaults to `sHeight` (if specified) or the natural height of the image. |
| `sx`      | `number`           | optional   | `0`                                          | The x-coordinate of the top-left corner of the sub-rectangle (frame) within the **source image**. Used for sprite sheets.              |
| `sy`      | `number`           | optional   | `0`                                          | The y-coordinate of the top-left corner of the sub-rectangle (frame) within the **source image**. Used for sprite sheets.              |
| `sWidth`  | `number`           | optional   | `image.naturalWidth - sx` or `0`             | The width of the sub-rectangle (frame) in the **source image**. If undefined, it defaults to the image width minus `sx`.               |
| `sHeight` | `number`           | optional   | `image.naturalHeight - sy` or `0`            | The height of the sub-rectangle (frame) in the **source image**. If undefined, it defaults to the image height minus `sy`.             |

_If the provided `image` is not a valid `HTMLImageElement`, an error will be logged, and `this.image` will be set to `null`._

---

## Properties

### `image`

**Type:** `HTMLImageElement | null`
The source image used by the sprite. This should be a pre-loaded image.

### `x`

**Type:** `number`
The x-coordinate where the sprite's top-left corner will be drawn on the canvas.

### `y`

**Type:** `number`
The y-coordinate where the sprite's top-left corner will be drawn on the canvas.

### `width`

**Type:** `number`
The width the sprite will occupy on the canvas when drawn.

### `height`

**Type:** `number`
The height the sprite will occupy on the canvas when drawn.

### `sx`

**Type:** `number`
The x-coordinate of the top-left corner of the rectangular frame to cut from the source `image`.

### `sy`

**Type:** `number`
The y-coordinate of the top-left corner of the rectangular frame to cut from the source `image`.

### `sWidth`

**Type:** `number`
The width of the rectangular frame to cut from the source `image`.

### `sHeight`

**Type:** `number`
The height of the rectangular frame to cut from the source `image`.

### `visible`

**Type:** `boolean` (Default: `true`)
If `true`, the sprite will be rendered. If `false`, the `render` method will do nothing.

### `opacity`

**Type:** `number` (Default: `1.0`)
The opacity of the sprite, ranging from `0.0` (fully transparent) to `1.0` (fully opaque).

### `rotation`

**Type:** `number` (Default: `0`)
The rotation angle of the sprite in **radians**. Rotation is applied around the sprite's `anchor` point.

### `anchor`

**Type:** `object` (Default: `{ x: 0.5, y: 0.5 }`)
The anchor point (origin) for rotation and scaling operations, defined as a normalized coordinate within the sprite's bounds (where `x: 0, y: 0` is top-left and `x: 1, y: 1` is bottom-right). The default `{x: 0.5, y: 0.5}` makes transformations occur around the center of the sprite.

- `anchor.x: number`
- `anchor.y: number`

### `scaleX`

**Type:** `number` (Default: `1.0`)
The horizontal scaling factor applied to the sprite. `1.0` is normal size.

### `scaleY`

**Type:** `number` (Default: `1.0`)
The vertical scaling factor applied to the sprite. `1.0` is normal size.

---

## Methods

### `setFrame(sx, sy, sWidth, sHeight)`

Updates the source rectangle (frame) for the sprite. This is particularly useful for sprite sheet animations, allowing you to change which part of the source image is displayed without creating a new `Sprite` object.

**Parameters:**

| Name      | Type     | Description                                                                   |
| :-------- | :------- | :---------------------------------------------------------------------------- |
| `sx`      | `number` | The new x-coordinate of the top-left corner of the frame in the source image. |
| `sy`      | `number` | The new y-coordinate of the top-left corner of the frame in the source image. |
| `sWidth`  | `number` | The new width of the frame in the source image.                               |
| `sHeight` | `number` | The new height of the frame in the source image.                              |

_Note: This method only changes the source frame dimensions (`sx`, `sy`, `sWidth`, `sHeight`). It does not automatically update the destination `width` and `height`. If you want the sprite's drawn size to match the new frame size, you'll need to update `this.width` and `this.height` separately._

---

### `render(context)`

Renders the sprite onto the provided 2D canvas rendering context. It respects the sprite's `visible`, `opacity`, `rotation`, `scaleX`, `scaleY`, and `anchor` properties.

**Parameters:**

| Name      | Type                       | Description                                        |
| :-------- | :------------------------- | :------------------------------------------------- |
| `context` | `CanvasRenderingContext2D` | The 2D rendering context of the canvas to draw on. |

**Rendering Steps:**

1. Returns early if `!this.visible`, `!this.image`, or `this.opacity <= 0`.
2. Saves the current context state (`context.save()`).
3. Sets `context.globalAlpha` to `this.opacity`.
4. If rotation or scaling is applied:
   a. Translates the context to the sprite's anchor point (`this.x + this.width * this.anchor.x`, `this.y + this.height * this.anchor.y`).
   b. Applies rotation (`context.rotate(this.rotation)`).
   c. Applies scaling (`context.scale(this.scaleX, this.scaleY)`).
   d. Translates the context back by the negative anchor point.
5. Draws the specified portion of `this.image` (`sx`, `sy`, `sWidth`, `sHeight`) to the destination rectangle on the canvas (`this.x`, `this.y`, `this.width`, `this.height`) using `context.drawImage()`.
6. Restores the context state (`context.restore()`).

---

### `update(deltaTime)`

A placeholder method for updating the sprite's state over time. In its current form, the `Sprite` class is primarily a rendering component. Logic for animation (like cycling through frames by calling `setFrame`) or other state changes would typically be handled by an external system, an `AnimationController`, or the entity that owns this sprite instance.

**Parameters:**

| Name        | Type     | Description                                        |
| :---------- | :------- | :------------------------------------------------- |
| `deltaTime` | `number` | The time elapsed since the last frame, in seconds. |
