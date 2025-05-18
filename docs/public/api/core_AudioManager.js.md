# Audio Management with `AudioManager.js`

The `AudioManager.js` module in the Ironclad Engine is responsible for all audio playback, including sound effects (SFX) and background music. It leverages the Web Audio API for robust and flexible audio control and relies on `AssetLoader.js` for providing decoded audio data.

## Core Concepts

1.  **Web Audio API:**

    - The `AudioManager` uses the browser's native Web Audio API for all audio operations. This provides precise control over audio playback, volume, and routing.
    - It initializes and manages an `AudioContext`, which is the gateway to using the Web Audio API.

2.  **Integration with `AssetLoader`:**

    - All audio files (e.g., `.wav`, `.mp3`, `.ogg`) must first be defined in your `asset-manifest.json` and loaded by `AssetLoader.js`.
    - `AssetLoader` decodes these files into `AudioBuffer` objects.
    - `AudioManager` retrieves these `AudioBuffer`s from the `AssetLoader`'s cache using their asset names before playback.

3.  **Gain Nodes for Volume Control:**

    - To manage volume effectively, `AudioManager` sets up a hierarchy of `GainNode`s:
      - **Master Gain (`masterGainNode`):** Controls the overall output volume of all game audio.
      - **SFX Gain (`sfxGainNode`):** Controls the volume specifically for all sound effects. This node is connected to the `masterGainNode`.
      - **Music Gain (`musicGainNode`):** Controls the volume specifically for all background music. This node is also connected to the `masterGainNode`.
    - Individual sound effects and music tracks can also have their own volume adjustments, which are applied relative to their respective category gain (SFX or Music).

4.  **Sound Effects (SFX) vs. Music:**

    - **SFX (`playSoundEffect`)**: Typically short, one-shot sounds (e.g., UI clicks, player actions, impacts). Multiple SFX can play concurrently.
    - **Music (`playMusic`, `stopMusic`)**: Typically longer tracks intended for background ambiance. Only one primary music track (managed by `currentMusicSource`) plays at a time; starting new music stops the current one.

5.  **Event Emission (Optional):**
    - If an `EventManager` instance is provided to its constructor, `AudioManager` can emit events like `audio:musicStarted`, `audio:musicEnded`, and `audio:muteChanged`.

## Initialization

The `AudioManager` is typically instantiated by the `IroncladEngine` during its setup phase. It requires an instance of `AssetLoader` and can optionally take an `EventManager`.

```javascript
// In IroncladEngine.js constructor (example)
this.audioManager = new AudioManager(this.assetLoader, this.events);
The AudioManager will attempt to use the AudioContext from the AssetLoader or create its own if necessary.Key API MethodsPlaying Sound EffectsplaySoundEffect(assetName, volume = 1.0, playbackRate = 1.0, startTime = 0): AudioBufferSourceNode | nullPlays a sound effect that has been pre-loaded by AssetLoader.assetName (string): The unique name of the audio asset (as defined in asset-manifest.json).volume (number, optional, 0-1): Volume for this specific sound instance, relative to the global SFX volume.playbackRate (number, optional): Speed of playback (1.0 is normal).startTime (number, optional): Offset in seconds within the audio buffer to start playing from.Returns the AudioBufferSourceNode created for this sound, or null if playback fails (e.g., asset not found, muted, or AudioContext unavailable).Example:// Assuming 'sfx_jump' is a loaded AudioBuffer asset name
if (this.engine.audioManager) {
    this.engine.audioManager.playSoundEffect('sfx_jump', 0.8); // Play jump sound at 80% of SFX volume
}
Playing Background MusicplayMusic(assetName, loop = true, volume = 1.0, fadeInDuration = 0)Plays a music track. Stops any music currently playing.assetName (string): The name of the pre-loaded audio asset.loop (boolean, optional): Whether the music should loop.volume (number, optional, 0-1): Volume for this music track, relative to the global music volume.fadeInDuration (number, optional, seconds): Duration for a linear fade-in effect from 0 volume.stopMusic(fadeOutDuration = 0)Stops the currently playing background music.fadeOutDuration (number, optional, seconds): Duration for a linear fade-out effect.Example:if (this.engine.audioManager) {
    // Start overworld music, looping, at 50% volume, with a 2-second fade-in
    this.engine.audioManager.playMusic('music_overworld_theme', true, 0.5, 2.0);

    // To stop it later with a fade:
    // this.engine.audioManager.stopMusic(1.5); // Fade out over 1.5 seconds
}
Global Audio ControlpauseAll(): Suspends the entire AudioContext, effectively pausing all sounds.resumeAll(): Resumes a suspended AudioContext. Note: Browsers often require user interaction (like a click) to resume an AudioContext if it was suspended due to page inactivity or autoplay policies. It's good practice to call this after a user interaction that starts or resumes the game (e.g., clicking a "Start Game" button or unpausing).Volume and Mute ControlsThe AudioManager provides methods to control master, SFX, and music volumes independently, as well as a global mute function. All volumes are values between 0 (silent) and 1 (full).setMasterVolume(volume: number)getMasterVolume(): numbersetSfxVolume(volume: number)getSfxVolume(): numbersetMusicVolume(volume: number)getMusicVolume(): numbersetMuted(muted: boolean)toggleMute()getMuted(): booleanChanges to these volumes are applied with a short linear ramp to prevent abrupt sound changes. The isMuted state overrides the master volume (setting it effectively to 0).Example (from an Options Menu):// Assuming 'uiContext.volume' is 0-100 from a slider
const newMasterVolume = this.uiContext.volume / 100;
this.engine.audioManager.setMasterVolume(newMasterVolume);

// Toggle mute
this.engine.audioManager.setMuted(this.uiContext.isMuted);
Lifecycledestroy(): Should be called when the engine is shutting down. It stops any playing music and disconnects the main gain nodes. The AudioContext itself is typically managed and closed by AssetLoader.destroy().The AudioManager provides a comprehensive way to handle audio in your game, giving you control over individual sounds
```
