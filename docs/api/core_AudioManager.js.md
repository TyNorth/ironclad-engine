# Class: AudioManager

Manages audio playback for the game, including music and sound effects. It interfaces with an `AssetLoader` to get audio data and an optional `EventManager` for audio-related events.

**Source:** [core/AudioManager.js, line 12](core/AudioManager.js.html#line12)

---

## Constructor

### `new AudioManager(assetLoader, eventManager)`

Creates an instance of AudioManager.

**Parameters:**

| Name           | Type           | Default | Description                                      |
| -------------- | -------------- | ------- | ------------------------------------------------ |
| `assetLoader`  | `AssetLoader`  |         | An instance of AssetLoader to load audio assets. |
| `eventManager` | `EventManager` | `null`  | An optional instance of EventManager.            |

**Source:** [core/AudioManager.js, line 12](core/AudioManager.js.html#line12)

---

## Methods

### `destroy()`

Call this when the engine is shutting down.
This method typically handles cleanup, such as stopping all audio and releasing resources.

**Source:** [core/AudioManager.js, line 317](core/AudioManager.js.html#line317)

---

### `pauseAll()`

Pauses the AudioContext (suspends all audio).
This is useful for when the game is paused or loses focus.

**Source:** [core/AudioManager.js, line 228](core/AudioManager.js.html#line228)

---

### `playMusic(assetName, loop?, volume?, fadeInDuration?)`

Plays background music. Stops any currently playing music.

**Parameters:**

| Name             | Type      | Attributes | Default | Description                                                              |
| ---------------- | --------- | ---------- | ------- | ------------------------------------------------------------------------ |
| `assetName`      | `string`  |            |         | The name of the pre-loaded audio asset (AudioBuffer).                    |
| `loop`           | `boolean` | optional   | `true`  | Whether the music should loop.                                           |
| `volume`         | `number`  | optional   | `1.0`   | Volume for this music track (0-1), relative to the global `musicVolume`. |
| `fadeInDuration` | `number`  | optional   | `0`     | Duration in seconds for a fade-in effect.                                |

**Source:** [core/AudioManager.js, line 127](core/AudioManager.js.html#line127)

---

### `playSoundEffect(assetName, volume?, playbackRate?, startTime?)`

Plays a sound effect.

**Parameters:**

| Name           | Type     | Attributes | Default | Description                                                               |
| -------------- | -------- | ---------- | ------- | ------------------------------------------------------------------------- |
| `assetName`    | `string` |            |         | The name of the pre-loaded audio asset (AudioBuffer).                     |
| `volume`       | `number` | optional   | `1.0`   | Volume for this specific sound (0-1), relative to the global `sfxVolume`. |
| `playbackRate` | `number` | optional   | `1.0`   | Speed of playback.                                                        |
| `startTime`    | `number` | optional   | `0`     | Offset in seconds to start playing from.                                  |

**Returns:** `AudioBufferSourceNode | null`
The created source node, or `null` if the sound cannot be played (e.g., asset not found or audio context issue).

**Source:** [core/AudioManager.js, line 90](../public/api/AudioManager.js.html#line90)

---

### `resumeAll()`

Resumes the AudioContext (resumes all audio).
Needs user interaction to start/resume AudioContext if it was suspended by browser policy (e.g., after a page load before any user click).

**Source:** [core/AudioManager.js, line 240](core/AudioManager.js.html#line240)

---

### `stopMusic(fadeOutDuration?)`

Stops the currently playing background music.

**Parameters:**

| Name              | Type     | Attributes | Default | Description                                |
| ----------------- | -------- | ---------- | ------- | ------------------------------------------ |
| `fadeOutDuration` | `number` | optional   | `0`     | Duration in seconds for a fade-out effect. |

**Source:** [core/AudioManager.js, line 175](core/AudioManager.js.html#line175)
