// src/engine/ecs/systems/AnimationSystem.js

import System from '../System.js'

// ... (JSDoc typedefs remain the same) ...

class AnimationSystem extends System {
  static requiredComponents = ['RenderableSprite', 'Animation']

  constructor() {
    super()
    // console.log("[AnimationSystem] Constructor called");
  }

  initialize(engine) {
    super.initialize(engine)
    console.log('[AnimationSystem] Initialized.')
  }

  update(deltaTime, entities, engine) {
    if (!engine || !engine.entityManager) {
      console.error('[AnimationSystem] EntityManager not available via engine instance!')
      return
    }

    if (entities.length > 0) {
      // console.log(`[AnimationSystem] Updating ${entities.length} entities.`);
    }

    for (const entityId of entities) {
      const anim = engine.entityManager.getComponent(entityId, 'Animation')
      const renderable = engine.entityManager.getComponent(entityId, 'RenderableSprite')

      if (!anim || !renderable) {
        // This should not happen if requiredComponents filter works
        console.warn(
          `[AnimationSystem] Entity ${entityId} missing Animation or RenderableSprite component.`,
        )
        continue
      }

      // console.log(`[AnimationSystem] Processing Entity ${entityId}:`, { anim, renderable });

      if (!anim.isPlaying || !anim.currentAnimation || !anim.animations) {
        // console.log(`[AnimationSystem] Entity ${entityId}: Not playing or no current animation/definitions. isPlaying: ${anim.isPlaying}, currentAnim: ${anim.currentAnimation}`);
        continue
      }

      const currentAnimDef = anim.animations[anim.currentAnimation]
      if (
        !currentAnimDef ||
        !currentAnimDef.frames ||
        currentAnimDef.frames.length === 0 ||
        !currentAnimDef.columns ||
        currentAnimDef.columns <= 0 ||
        !currentAnimDef.tileWidth || // Added check for tileWidth
        !currentAnimDef.tileHeight // Added check for tileHeight
      ) {
        console.warn(
          `[AnimationSystem] Entity ${entityId}: Animation definition for "${anim.currentAnimation}" is invalid (missing frames, columns, tileWidth, or tileHeight). Def:`,
          currentAnimDef,
        )
        continue
      }

      // console.log(`[AnimationSystem] Entity ${entityId}, Anim: "${anim.currentAnimation}", FrameTimer (before): ${anim.frameTimer.toFixed(3)}, CurrentFrameIdx: ${anim.currentFrameIndex}`);

      const effectiveDeltaTime = deltaTime * (anim.playbackSpeed || 1.0)
      anim.frameTimer += effectiveDeltaTime

      if (anim.frameTimer >= currentAnimDef.frameDuration) {
        anim.frameTimer -= currentAnimDef.frameDuration
        anim.currentFrameIndex++
        // console.log(`[AnimationSystem] Entity ${entityId}: Advanced to frame index ${anim.currentFrameIndex}`);

        if (anim.currentFrameIndex >= currentAnimDef.frames.length) {
          if (currentAnimDef.loop) {
            anim.currentFrameIndex = 0
            // console.log(`[AnimationSystem] Entity ${entityId}: Looped animation "${anim.currentAnimation}" to frame 0.`);
          } else {
            anim.currentFrameIndex = currentAnimDef.frames.length - 1
            anim.isPlaying = false
            console.log(
              `[AnimationSystem] Entity ${entityId}: Animation "${anim.currentAnimation}" completed and stopped.`,
            )
            if (engine.events) {
              engine.events.emit('animation:completed', {
                entityId,
                animationName: anim.currentAnimation,
              })
            }
          }
        }
      }

      const frameValueFromArray = currentAnimDef.frames[anim.currentFrameIndex]
      const tileWidth = currentAnimDef.tileWidth
      const tileHeight = currentAnimDef.tileHeight
      const columns = currentAnimDef.columns

      if (tileWidth > 0 && tileHeight > 0 && columns > 0 && frameValueFromArray !== undefined) {
        renderable.sx = (frameValueFromArray % columns) * tileWidth
        renderable.sy = Math.floor(frameValueFromArray / columns) * tileHeight
        renderable.sWidth = tileWidth
        renderable.sHeight = tileHeight

        // CRITICAL LOG: What values are being set on RenderableSprite?
        console.log(
          `[AnimationSystem] Entity ${entityId}, Anim: "${anim.currentAnimation}", FrameValue: ${frameValueFromArray}, CurrentFrameIdx: ${anim.currentFrameIndex} => Set Renderable: sx=${renderable.sx}, sy=${renderable.sy}, sW=${renderable.sWidth}, sH=${renderable.sHeight}`,
        )
      } else {
        console.warn(
          `[AnimationSystem] Entity ${entityId}: Animation "${anim.currentAnimation}" has invalid tileWidth, tileHeight, columns, or frameValueFromArray is undefined. FrameValue: ${frameValueFromArray}, tileW: ${tileWidth}, tileH: ${tileHeight}, cols: ${columns}`,
        )
      }
    }
  }
}

export default AnimationSystem
