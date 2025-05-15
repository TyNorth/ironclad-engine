// src/engine/rendering/TileLayerRenderer.js

/**
 * @file TileLayerRenderer.js
 * @description Utility class to render individual tile layers from Tiled JSON map data,
 * supporting multiple tilesets and tile flipping/rotation.
 */

/**
 * @typedef {object} ProcessedTileset
 * @property {number} firstgid
 * @property {HTMLImageElement} image
 * @property {string} name
 * @property {number} tileWidth
 * @property {number} tileHeight
 * @property {number} columns
 * @property {number} imageWidth
 * @property {number} imageHeight
 * @property {number} spacing
 * @property {number} margin
 */

class TileLayerRenderer {
  /**
   * Creates an instance of TileLayerRenderer.
   * @param {object} mapData - The full parsed Tiled JSON map data.
   * @param {Map<string, HTMLImageElement>} loadedTilesetImages - A Map where keys are the
   * image paths (matching `mapData.tilesets[i].image`) and values are the
   * pre-loaded HTMLImageElement objects.
   */
  constructor(mapData, loadedTilesetImages) {
    this.mapData = mapData
    this.mapDefaultTileWidth = mapData.tilewidth
    this.mapDefaultTileHeight = mapData.tileheight

    /**
     * @private
     * @type {Array<ProcessedTileset>}
     */
    this.processedTilesets = []

    if (!mapData.tilesets || mapData.tilesets.length === 0) {
      console.warn('TileLayerRenderer: No tilesets array found in mapData.')
    } else {
      mapData.tilesets.forEach((tsDef) => {
        if (!tsDef.image) {
          console.warn(
            `TileLayerRenderer: Tileset definition (name: ${tsDef.name}, firstgid: ${tsDef.firstgid}) is missing 'image' property. Source: ${tsDef.source || 'N/A'}. This tileset will be skipped.`,
          )
          return
        }
        const imageElement = loadedTilesetImages.get(tsDef.image) // Key is the path from JSON

        if (imageElement) {
          if (
            !tsDef.tilewidth ||
            !tsDef.tileheight ||
            tsDef.tilewidth <= 0 ||
            tsDef.tileheight <= 0
          ) {
            console.error(
              `TileLayerRenderer: Tileset "${tsDef.name || tsDef.image}" has invalid 'tilewidth' or 'tileheight'. Skipping.`,
            )
            return
          }
          this.processedTilesets.push({
            firstgid: parseInt(tsDef.firstgid, 10),
            image: imageElement,
            name: tsDef.name || tsDef.image,
            tileWidth: parseInt(tsDef.tilewidth, 10),
            tileHeight: parseInt(tsDef.tileheight, 10),
            columns:
              parseInt(tsDef.columns, 10) ||
              Math.floor(imageElement.naturalWidth / parseInt(tsDef.tilewidth, 10)),
            imageWidth: parseInt(tsDef.imagewidth, 10) || imageElement.naturalWidth,
            imageHeight: parseInt(tsDef.imageheight, 10) || imageElement.naturalHeight,
            spacing: parseInt(tsDef.spacing, 10) || 0,
            margin: parseInt(tsDef.margin, 10) || 0,
          })
        } else {
          console.warn(
            `TileLayerRenderer: Tileset image for "${tsDef.image}" (first GID: ${tsDef.firstgid}) not found in pre-loaded images map. This tileset's tiles cannot be rendered.`,
          )
        }
      })
      this.processedTilesets.sort((a, b) => b.firstgid - a.firstgid) // Sort for efficient GID lookup
    }
    console.log(
      `TileLayerRenderer: Initialized. Processed ${this.processedTilesets.length} tilesets.`,
    )
  }

  /**
   * Finds the correct processed tileset and source rect for a given GID.
   * @private
   * @param {number} cleanGid - The Global ID of the tile, without flip flags.
   * @returns {ProcessedTileset & {sx: number, sy: number} | null}
   */
  _getTileDetails(cleanGid) {
    if (cleanGid === 0) return null
    for (const tileset of this.processedTilesets) {
      if (cleanGid >= tileset.firstgid) {
        const localId = cleanGid - tileset.firstgid
        const tileX = localId % tileset.columns
        const tileY = Math.floor(localId / tileset.columns)

        const sx = tileset.margin + tileX * (tileset.tileWidth + tileset.spacing)
        const sy = tileset.margin + tileY * (tileset.tileHeight + tileset.spacing)

        if (
          sx < 0 ||
          sy < 0 ||
          sx + tileset.tileWidth > tileset.imageWidth ||
          sy + tileset.tileHeight > tileset.imageHeight
        ) {
          // console.warn(`TileLayerRenderer: GID ${cleanGid} (local ${localId}) for tileset "${tileset.name}" maps out of image bounds.`);
          return null
        }
        return { ...tileset, sx, sy } // Return the full tileset info + sx, sy
      }
    }
    // console.warn(`TileLayerRenderer: GID ${cleanGid} not found in any processed tileset.`);
    return null
  }

  /**
   * Renders a specific named tile layer.
   * @param {CanvasRenderingContext2D} context - The drawing context.
   * @param {import('./Camera.js').default} camera - The game camera.
   * @param {string | number} layerIdentifier - The name (string) or index (number) of the layer to render.
   */
  renderLayer(context, camera, layerIdentifier) {
    if (!this.mapData || !this.mapData.layers || this.processedTilesets.length === 0) return
    if (!context || !camera) {
      console.error('TileLayerRenderer.renderLayer: Missing context or camera.')
      return
    }

    const layer =
      typeof layerIdentifier === 'string'
        ? this.mapData.layers.find((l) => l.name === layerIdentifier && l.type === 'tilelayer')
        : this.mapData.layers[layerIdentifier]

    if (!layer || layer.type !== 'tilelayer' || layer.visible === false || layer.opacity === 0) {
      // console.warn(`TileLayerRenderer: Layer "${layerIdentifier}" not found, not a tilelayer, not visible, or fully transparent.`);
      return
    }

    const viewportX = camera.getViewportX()
    const viewportY = camera.getViewportY()
    const canvasWidth = context.canvas.width
    const canvasHeight = context.canvas.height

    // Use map's default tile dimensions for grid placement and culling
    const destTileWidth = this.mapDefaultTileWidth
    const destTileHeight = this.mapDefaultTileHeight

    const startCol = Math.max(0, Math.floor(viewportX / destTileWidth))
    const endCol = Math.min(layer.width, Math.ceil((viewportX + canvasWidth) / destTileWidth))
    const startRow = Math.max(0, Math.floor(viewportY / destTileHeight))
    const endRow = Math.min(layer.height, Math.ceil((viewportY + canvasHeight) / destTileHeight))

    const originalAlpha = context.globalAlpha
    if (layer.opacity !== undefined && layer.opacity < 1.0) {
      context.globalAlpha = originalAlpha * layer.opacity
    }

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tileIndex = r * layer.width + c
        const gidWithFlags = layer.data[tileIndex]
        if (gidWithFlags === 0) continue

        const FLIPPED_HORIZONTALLY_FLAG = 0x80000000
        const FLIPPED_VERTICALLY_FLAG = 0x40000000
        const FLIPPED_DIAGONALLY_FLAG = 0x20000000
        const cleanGid =
          gidWithFlags &
          ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG)

        const tileDetails = this._getTileDetails(cleanGid)
        if (!tileDetails) continue

        const dx = Math.floor(c * destTileWidth - viewportX)
        const dy = Math.floor(r * destTileHeight - viewportY)

        if (
          dx + destTileWidth < 0 ||
          dx > canvasWidth ||
          dy + destTileHeight < 0 ||
          dy > canvasHeight
        ) {
          continue
        }

        context.save()
        const centerX = dx + destTileWidth / 2
        const centerY = dy + destTileHeight / 2
        context.translate(centerX, centerY)

        let scaleX = 1,
          scaleY = 1,
          rotation = 0
        const flipH = gidWithFlags & FLIPPED_HORIZONTALLY_FLAG
        const flipV = gidWithFlags & FLIPPED_VERTICALLY_FLAG
        const flipD = gidWithFlags & FLIPPED_DIAGONALLY_FLAG

        if (flipD) {
          rotation = Math.PI / 2
          if (flipH && flipV) {
            scaleX = 1
            scaleY = -1
          } else if (flipH) {
            scaleX = -1
            scaleY = -1
          } else if (flipV) {
            scaleX = 1
            scaleY = 1
          } else {
            scaleX = -1
          }
        } else {
          if (flipH) scaleX = -1
          if (flipV) scaleY = -1
        }

        if (scaleX !== 1 || scaleY !== 1) context.scale(scaleX, scaleY)
        if (rotation !== 0) context.rotate(rotation)

        context.translate(-centerX, -centerY)

        try {
          context.drawImage(
            tileDetails.image,
            tileDetails.sx,
            tileDetails.sy,
            tileDetails.tileWidth,
            tileDetails.tileHeight, // Use tileWidth/Height from specific tileset
            dx,
            dy,
            destTileWidth,
            destTileHeight, // Draw to map's default grid cell size
          )
        } catch (e) {
          console.error('Error drawing tile in layer:', layer.name, e)
        }
        context.restore()
      }
    }
    if (layer.opacity !== undefined && layer.opacity < 1.0) {
      context.globalAlpha = originalAlpha
    }
  }
}

export default TileLayerRenderer
