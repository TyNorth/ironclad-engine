// src/engine/index.js

// Core Engine Systems
import IroncladEngine from './core/IroncladEngine.js'
import AssetLoader from './core/AssetLoader.js'
import AudioManager from './core/AudioManager.js'
import BaseScene from './core/BaseScene.js'
import EffectsManager from './core/EffectsManager.js'
import EventManager from './core/EventManager.js'
import GameLoop from './core/GameLoop.js'
import InputManager from './core/InputManager.js'
import Keyboard from './core/Keyboard.js'
import Mouse from './core/Mouse.js'
import GamepadHandler from './core/Gamepad.js'
import SaveLoadManager from './core/SaveLoadManager.js'
import SceneManager from './core/SceneManager.js'

// ECS (Entity-Component-System)
import EntityManager from './ecs/EntityManager.js'
import BaseEntity from './ecs/BaseEntity.js'
import System from './ecs/System.js'
import PrefabManager from './ecs/PrefabManager.js'
import RenderSystem from './ecs/systems/RenderSystem.js'
import AnimationSystem from './ecs/systems/AnimationSystem.js'

// Physics System
import PhysicsSystem from './physics/PhysicsSystem.js'
// import { GRAVITY_Y } from './physics/PhysicsConstants.js';

// Rendering Modules
import Camera from './rendering/Camera.js'
import Sprite from './rendering/Sprite.js'
import TileLayerRenderer from './rendering/TileLayerRenderer.js'

// UI Elements
import BaseUIElement from './ui/BaseUIElement.js'
import Label from './ui/Label.js'
import Button from './ui/Button.js'
import Checkbox from './ui/Checkbox.js'
import Panel from './ui/Panel.js'
import ValueBar from './ui/ValueBar.js'
import Slider from './ui/Slider.js'
import ScrollablePanel from './ui/ScrollablePanel.js'
import TextInputField from './ui/TextInputField.js'
import DialogueBox from './ui/DialogueBox.js'

// FX (Effects) System
import BaseEffect from './fx/BaseEffect.js'
import ShakeEffect from './fx/ShakeEffect.js'
import FlashEffect from './fx/FlashEffect.js'
import TintEffect from './fx/TintEffect.js'

// Dialogue System
import DialogueManager from './dialogue/DialogueManager.js'

export {
  IroncladEngine, // IroncladEngine is now only a named export
  AssetLoader,
  AudioManager,
  BaseScene,
  EffectsManager,
  EventManager,
  GameLoop,
  InputManager,
  Keyboard,
  Mouse,
  GamepadHandler,
  SaveLoadManager,
  SceneManager,
  EntityManager,
  BaseEntity,
  System,
  PrefabManager,
  RenderSystem,
  AnimationSystem,
  PhysicsSystem,
  // GRAVITY_Y,
  Camera,
  Sprite,
  TileLayerRenderer,
  BaseUIElement,
  Label,
  Button,
  Checkbox,
  Panel,
  ValueBar,
  Slider,
  ScrollablePanel,
  TextInputField,
  DialogueBox,
  BaseEffect,
  ShakeEffect,
  FlashEffect,
  TintEffect,
  DialogueManager,
}

// REMOVED: export default IroncladEngine;
