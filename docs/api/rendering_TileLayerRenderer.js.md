# Class: TileLayerRenderer

**Source:** [rendering/TileLayerRenderer.js, line 31](rendering_TileLayerRenderer.js.html#line31)

The `TileLayerRenderer` is a specialized class responsible for drawing tile-based maps, typically those created with external map editors like [Tiled Map Editor](https://www.mapeditor.org/) and exported in JSON format. It takes parsed map data and pre-loaded tileset images to efficiently render the game's tiled environments.

This renderer handles the complexities of:

- Interpreting tile layer data from the map structure.
- Mapping tile Global IDs (GIDs) to the correct tileset image and source rectangle.
- Drawing the appropriate tiles onto the canvas, considering the camera's viewport for culling and positioning.

---

## Constructor

### `new TileLayerRenderer(mapData, loadedTilesetImages)`

Creates an instance of `TileLayerRenderer`. It processes the provided map data and associates tileset definitions with their corresponding loaded image assets.

**Parameters:**

| Name                  | Type                            | Description                                                                                                                                                                                                                      |
| :-------------------- | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mapData`             | `object`                        | The complete parsed Tiled JSON map data object. This includes information about map dimensions, tile dimensions, layers, and tileset references.                                                                                 |
| `loadedTilesetImages` | `Map<string, HTMLImageElement>` | A `Map` where keys are the **image paths** of the tilesets (exactly as specified in the `mapData.tilesets[i].image` property within the Tiled JSON) and values are the pre-loaded `HTMLImageElement` objects for those tilesets. |

**Initialization Steps:**
The constructor typically performs the following:

1. Stores the `mapData`.
2. Processes the `tilesets` array within `mapData`, creating an internal representation that links each tileset definition (like `firstgid`, `tilewidth`, `tileheight`, `columns`, `image`, `spacing`, `margin`) with its corresponding `HTMLImageElement` from `loadedTilesetImages`. This creates a collection of [ProcessedTileset](#ProcessedTileset) objects.

**Source:** [rendering/TileLayerRenderer.js, line 31](rendering_TileLayerRenderer.js.html#line31)

---

## Methods

### `renderLayer(context, camera, layerIdentifier)`

Renders a specific tile layer from the map data onto the provided canvas context. It intelligently draws only the tiles visible within the camera's current viewport (culling) for performance.

**Parameters:**

| Name              | Type                       | Description                                                                                                                                                     |
| :---------------- | :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context`         | `CanvasRenderingContext2D` | The 2D rendering context of the canvas where the tile layer will be drawn (usually an offscreen canvas context managed by the engine or scene).                 |
| `camera`          | `Camera`                   | The game's camera instance, used to determine the visible area (viewport) and apply transformations for scrolling.                                              |
| `layerIdentifier` | `string` \| `number`       | The identifier for the tile layer to render. This can be the layer's **name** (string) as defined in Tiled, or its **index** (number) in the map's layer array. |

**Rendering Process:**

1. Identifies the specified tile layer from `mapData.layers`.
2. Determines the range of tiles visible within the `camera`'s viewport.
3. Iterates through the visible tile GIDs (Global IDs) in the layer's `data` array.
4. For each GID:
   - Finds the correct [`ProcessedTileset`](#ProcessedTileset) that contains this GID.
   - Calculates the source `(sx, sy, sWidth, sHeight)` coordinates of the tile within the tileset image.
   - Calculates the destination `(dx, dy, dWidth, dHeight)` coordinates on the canvas, adjusted by the camera's position.
   - Draws the tile using `context.drawImage()`.

**Source:** [rendering/TileLayerRenderer.js, line 132](rendering_TileLayerRenderer.js.html#line132)
