// src/engine/index.js

// Core Engine Systems
import IroncladEngine from './core/IroncladEngine.js'
import AssetLoader from './core/AssetLoader.js'
import AudioManager from './core/AudioManager.js'
import BaseScene from './core/BaseScene.js' // If you decide to use it again
import EffectsManager from './core/EffectsManager.js'
import EventManager from './core/EventManager.js'
import GameLoop from './core/GameLoop.js'
import InputManager from './core/InputManager.js'
import Keyboard from './core/Keyboard.js'
import Mouse from './core/Mouse.js'
import GamepadHandler from './core/Gamepad.js' // Or Gamepad.js if the class name is Gamepad
import SaveLoadManager from './core/SaveLoadManager.js'
import SceneManager from './core/SceneManager.js'

// ECS (Entity-Component-System)
import EntityManager from './ecs/EntityManager.js'
import BaseEntity from './ecs/BaseEntity.js' // If you decide to use it
import System from './ecs/System.js'
import PrefabManager from './ecs/PrefabManager.js'
// Specific Systems (you might export game-agnostic ones from engine, game-specific from game)
import RenderSystem from './ecs/systems/RenderSystem.js' // Assuming this is generic enough
import AnimationSystem from './ecs/systems/AnimationSystem.js' // Assuming this is generic

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

// FX (Effects) System
import BaseEffect from './fx/BaseEffect.js'
import ShakeEffect from './fx/ShakeEffect.js'
import FlashEffect from './fx/FlashEffect.js'
import TintEffect from './fx/TintEffect.js'

export {
  IroncladEngine,
  AssetLoader,
  AudioManager,
  BaseScene,
  EffectsManager,
  EventManager,
  GameLoop,
  InputManager,
  Keyboard,
  Mouse,
  GamepadHandler, // Or Gamepad
  SaveLoadManager,
  SceneManager,
  EntityManager,
  BaseEntity,
  System,
  PrefabManager,
  RenderSystem,
  AnimationSystem,
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
  BaseEffect,
  ShakeEffect,
  FlashEffect,
  TintEffect,
}

// You might also consider a default export if IroncladEngine is the primary thing to import
export default IroncladEngine
