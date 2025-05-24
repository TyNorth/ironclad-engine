// src/engine/ecs/systems/RenderSystem.js

import System from '../System.js'
import Sprite from '../../rendering/Sprite.js' // Ensure this path is correct

class RenderSystem extends System {
  static requiredComponents = ['Position', 'RenderableSprite']

  assetLoader = null

  constructor() {
    super()
    // console.log("RenderSystem: Constructor called");
  }

  initialize(engine) {
    super.initialize(engine)
    if (this.engine) {
      this.assetLoader = this.engine.getAssetLoader()
    }
    if (!this.assetLoader) {
      console.error('RenderSystem: AssetLoader not available from engine!')
    }
    // console.log('RenderSystem: Initialized.');
  }

  update(deltaTime, entities, engine) {
    // Not typically used for drawing if executeRenderPass is primary drawing method.
  }

  executeRenderPass(context, camera) {
    if (!this.engine || !this.assetLoader || !context || !camera) {
      console.error(
        'RenderSystem.executeRenderPass: Missing critical dependencies (engine, assetLoader, context, or camera).',
      )
      return
    }

    const entityManager = this.engine.getEntityManager()
    if (!entityManager) {
      console.error('RenderSystem.executeRenderPass: EntityManager not available.')
      return
    }

    const entitiesToRender = entityManager.getEntitiesWithComponents(
      RenderSystem.requiredComponents,
    )

    // console.log(`[RenderSystem] Found ${entitiesToRender.length} entities to render.`); // DEBUG

    const viewportX = camera.getViewportX()
    const viewportY = camera.getViewportY()

    for (const entityId of entitiesToRender) {
      const position = entityManager.getComponent(entityId, 'Position')
      const renderable = entityManager.getComponent(entityId, 'RenderableSprite')

      // This check should be redundant if getEntitiesWithComponents works correctly
      if (!position || !renderable) {
        // console.warn(`[RenderSystem] Entity ${entityId} missing Position or RenderableSprite component during render pass.`);
        continue
      }

      if (renderable.visible === false) {
        // Check visibility flag from component
        // console.log(`[RenderSystem] Entity ${entityId} (${renderable.assetName}) is not visible.`);
        continue
      }

      // Use 'assetName' from the RenderableSprite component
      const assetKey = renderable.assetName // <<<< CORRECTED PROPERTY NAME
      if (!assetKey) {
        // console.warn(`[RenderSystem] Entity ${entityId} RenderableSprite missing assetName.`);
        continue
      }

      // Lazy instantiate or update Sprite object on the component
      // This allows AnimationSystem to modify sx, sy, sWidth, sHeight on RenderableSprite
      // and RenderSystem picks them up.
      if (
        !renderable.spriteInstance ||
        renderable.spriteInstance.image?.src.includes(assetKey) === false
      ) {
        // Re-create if image source changed
        const image = this.assetLoader.get(assetKey)
        if (image instanceof HTMLImageElement) {
          // console.log(`[RenderSystem] Creating/Updating spriteInstance for entity ${entityId} with asset "${assetKey}"`);
          renderable.spriteInstance = new Sprite(
            image,
            0,
            0, // Initial x, y for Sprite object (will be updated below)
            renderable.width || image.naturalWidth, // Destination width
            renderable.height || image.naturalHeight, // Destination height
            renderable.sx || 0, // Source X
            renderable.sy || 0, // Source Y
            renderable.sWidth || image.naturalWidth, // Source Width
            renderable.sHeight || image.naturalHeight, // Source Height
          )
        } else {
          console.warn(
            `[RenderSystem] Image asset "${assetKey}" not found or not an HTMLImageElement for entity ${entityId}. Cannot render.`,
          )
          renderable.spriteInstance = null // Ensure it's null if image fails
          continue
        }
      }

      if (renderable.spriteInstance) {
        const sprite = renderable.spriteInstance

        sprite.x = Math.floor(position.x - viewportX + (renderable.offsetX || 0))
        sprite.y = Math.floor(position.y - viewportY + (renderable.offsetY || 0))
        // Position.z could be used for layering/sorting here or for y-sorting
        // For now, let's assume RenderableSprite.layer or Position.z can be used by a sort function if needed

        // Ensure sprite's display dimensions are set from the component, fallback to frame/image size
        sprite.width =
          renderable.width !== undefined
            ? renderable.width
            : renderable.sWidth || sprite.image.naturalWidth
        sprite.height =
          renderable.height !== undefined
            ? renderable.height
            : renderable.sHeight || sprite.image.naturalHeight

        // Update sprite from RenderableSprite component (animation system might change these)
        if (renderable.sx !== undefined) sprite.sx = renderable.sx
        if (renderable.sy !== undefined) sprite.sy = renderable.sy
        if (renderable.sWidth !== undefined) sprite.sWidth = renderable.sWidth
        if (renderable.sHeight !== undefined) sprite.sHeight = renderable.sHeight

        sprite.opacity = renderable.opacity !== undefined ? renderable.opacity : 1.0
        sprite.rotation = renderable.rotation !== undefined ? renderable.rotation : 0
        sprite.scaleX = renderable.scaleX !== undefined ? renderable.scaleX : 1.0
        sprite.scaleY = renderable.scaleY !== undefined ? renderable.scaleY : 1.0
        sprite.visible = renderable.visible !== undefined ? renderable.visible : true // Already checked above but good for sprite state

        // console.log(`[RenderSystem] Rendering Entity ${entityId} (${assetKey}) at screen (x:${sprite.x}, y:${sprite.y})`);
        sprite.render(context)
      }
    }
  }
}

export default RenderSystem
