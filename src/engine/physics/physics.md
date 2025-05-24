# Planning the Ironclad Physics Engine (2.5D Focus)

This document outlines the goals, desired features, and potential architectural approaches for a physics engine within Ironclad, with a focus on supporting **2.5D gameplay** (simulated depth on a 2D plane) and flexible movement, including considerations for **3D positioning**. We aim for a practical solution, not an overly complex, "jack-of-all-trades" 3D physics simulation.

## I. Clarifying "2.5D" and "Movement Axes" for Ironclad

Given our HTML5 Canvas 2D rendering context:

- **2.5D Visuals:** We'll simulate depth primarily through:
  - **Layering:** Using the Z-coordinate to determine draw order (entities with higher Z appear in front of those with lower Z, or vice-versa depending on convention).
  - **Scaling (Optional Perspective):** Potentially using the Z-coordinate to scale sprites (e.g., entities further "into the screen" appear smaller).
  - This does _not_ imply true 3D projection like isometric or perspective rendering unless we build a specialized camera and renderer for it. For now, Z is primarily for ordering and conceptual depth.
- **Coordinate System Convention (Proposal):**
  - **X-axis:** Horizontal movement across the screen (left/right).
  - **Y-axis:** Vertical movement across the screen (up/down). **Gravity will act along this axis.**
  - **Z-axis:** Depth movement "into" or "out of" the screen. This can be used for layering or limited depth movement.
- **Movement Axes (Initial Focus):**
  - We will support **3D positional movement** (translation along X, Y, Z).
  - **Rotation:** Initially, we'll support simple 2D rotation for sprites (e.g., rotation on the XY plane, effectively around the Z-axis), as handled by `Sprite.rotation`. Full 3D orientation (pitch, yaw, roll) for 2D sprites is significantly more complex and will be deferred unless a specific core mechanic requires it.

This interpretation allows for platformers (X-Y movement with Y as height) or top-down games with a sense of depth or layering (X-Y movement on a plane, Z for layering or limited "height").

## II. Goals & Desired Capabilities (Revised for 2.5D)

**A. Motion & Forces (in 3D-aware space):**

1. **Gravity:**
   - Apply a configurable global gravitational force, primarily along the defined "vertical" axis (e.g., positive or negative Y).
   - Allow entities to ignore gravity or have individual gravity scales.
2. **3D Kinematics:**
   - Manage entity `Position (x, y, z)`, `Velocity (vx, vy, vz)`, and `Acceleration (ax, ay, az)`.
3. **Applying Forces/Impulses:**
   - Mechanism to apply 3D impulses (e.g., for jumps in X, Y, or Z).
   - Mechanism to apply continuous 3D forces.

**B. Collision Detection (3D-aware):**

1. **Entity vs. Tilemap (for 2.5D Platforming/Worlds):**
   - If tilemaps represent a primary plane (e.g., XZ ground, with Y as height), detection might be 2D on that plane with height checks against tile properties or colliders.
   - If tilemaps themselves imply depth/height, this becomes more complex (effectively voxel-like checks or multi-layered 2D checks). _Initial focus might be on a primary 2D collision plane._
2. **Entity vs. Entity (3D AABB - Cuboids):**
   - Detect when the Axis-Aligned Bounding Boxes (defined by `width`, `height`, `depth`) of two entities overlap in 3D space.
3. **Collision Filtering (Layers/Masks):**
   - As before, to control which entity types interact.
4. **Triggers/Sensors (3D):**
   - Detect 3D AABB overlaps without solid collision response.

**C. Collision Response (3D-aware):**

1. **Solid Collisions:**
   - Prevent interpenetration in 3D space.
   - Adjust 3D `Position` to resolve overlaps.
   - Modify 3D `Velocity` based on the collision (e.g., stop, bounce).
2. **Platformer-Specific Responses (Adapted for defined vertical axis):**
   - Landing on a surface (e.g., XY plane at a certain Z, or XZ plane at a certain Y). Set `isOnGround` state, nullify velocity along the gravitational axis.
   - Hitting ceilings/walls in 3D.
3. **Material Properties (Restitution, Friction):**
   - Can be applied in a simplified manner to 3D collisions.

**D. Rotation (Simplified Initial Focus):**

1. Primarily support 2D visual rotation of sprites (e.g., character facing left/right).
2. Full 3D rotational physics (torque, angular velocity for pitch/yaw/roll) is out of scope for the initial "flexible but not jack-of-all-trades" engine unless a specific gameplay need arises.

**E. Integration with ECS:**

1. Physics-related data (3D vectors, collider dimensions) will be stored in components.
2. Logic will be in `PhysicsSystem(s)`.

## III. Potential Design & Architecture (Revised for 2.5D)

**A. Core Physics Components (Updated):**

- **`PositionComponent`**: `{ x: number, y: number, z: number }`
- **`VelocityComponent`**: `{ vx: number, vy: number, vz: number }`
- **`AccelerationComponent`**: `{ ax: number, ay: number, az: number }`
- **`PhysicsBodyComponent`**: (Largely same, but `isOnGround` would relate to the defined "ground" plane)
  - `entityType: string` ('dynamic', 'static')
  - `mass: number`, `useGravity: boolean`, `friction: number`, `restitution: number`
  - `isOnGround: boolean`
  - `gravityScale: number`
- **`ColliderComponent`**:
  - `shape: string` (start with 'aabb')
  - `width: number`, `height: number`, `depth: number` (for 3D AABB)
  - `offsetX: number`, `offsetY: number`, `offsetZ: number`
  - `isTrigger: boolean`
  - `collisionLayer: number`, `collisionMask: number`

**B. Physics-Related Systems (Logic now 3D):**

1. **`ForceApplicationSystem` / `PhysicsSystem` (Phase 1):**
   - Applies gravity along the designated vertical axis (e.g., to `Acceleration.ay`).
2. **`MovementSystem` / `PhysicsSystem` (Phase 2 - Integrator):**
   - Updates 3D `Velocity` from 3D `Acceleration`.
   - Updates 3D `Position` from 3D `Velocity`.
3. **`CollisionDetectionSystem` / `PhysicsSystem` (Phase 3):**
   - Tilemap collision (adapted for the primary movement plane and height checks).
   - 3D AABB overlap tests for entity-vs-entity.
   - Generates 3D collision information (penetration vector, normal).
4. **`CollisionResponseSystem` / `PhysicsSystem` (Phase 4):**
   - Resolves 3D penetration.
   - Adjusts 3D `Velocity` based on collision.
   - Sets flags like `isOnGround`.

**C. Rendering Considerations for 2.5D:**

- **RenderSystem:** Will need to use the Z component from `PositionComponent` for depth sorting (drawing entities further "back" first).
- **Camera:** May still operate primarily on an X/Y screen plane, but world-to-screen transformations might need to account for Z for perspective scaling if desired (more advanced). Initially, Z can just be for layering.

## IV. Initial Focus for Platformer Demo (2.5D Context)

1. **Define Axes:** Clearly define X as horizontal, Y as vertical (gravity axis), Z as depth (for layering, limited movement).
2. **Implement 3D Vectors:** Update `Position`, `Velocity`, `Acceleration` components to be 3D.
3. **Gravity:** Implement gravity in the `PhysicsSystem` acting along the chosen vertical axis (Y).
4. **Player Control:** `InputManager` actions map to changes in X (move left/right) and Y (jump impulse) velocity/acceleration. Z movement can be added if desired.
5. **Collision:**
   - Start with **2D AABB collisions on the XY plane** (player-platform, player-wall), effectively treating Z for layering first. This simplifies initial collision logic.
   - Or, if platforms have depth, implement **3D AABB**.
   - Tile collision can be on the XY plane.
6. **Collision Response:** Focus on stopping movement and "grounding" on the XY plane.

---
