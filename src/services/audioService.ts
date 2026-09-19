import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { AUDIO_SOURCES, type AudioKey } from "@/src/constants/audio";

export type { AudioKey } from "@/src/constants/audio";

class AudioService {
  private players = new Map<AudioKey, AudioPlayer>();

  private initialized = false;

  /**
   * Configure the audio session for short UI sound effects.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "mixWithOthers",
    });

    this.initialized = true;
  }

  /**
   * Get or create a reusable player for a sound.
   */
  private getPlayer(key: AudioKey): AudioPlayer {
    const existingPlayer = this.players.get(key);

    if (existingPlayer) {
      return existingPlayer;
    }

    const player = createAudioPlayer(AUDIO_SOURCES[key]);

    this.players.set(key, player);

    return player;
  }

  /**
   * Play a sound effect.
   */
  async play(key: AudioKey): Promise<void> {
    try {
      await this.initialize();

      const player = this.getPlayer(key);

      // expo-audio keeps the player at the end after playback.
      // Reset it before playing again.
      await player.seekTo(0);

      player.play();
    } catch (error) {
      console.warn(`[AudioService] Failed to play "${key}"`, error);
    }
  }

  /**
   * Set volume for a specific sound.
   */
  setVolume(key: AudioKey, volume: number): void {
    const player = this.players.get(key);

    if (!player) {
      return;
    }

    player.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Stop a specific sound.
   */
  async stop(key: AudioKey): Promise<void> {
    const player = this.players.get(key);

    if (!player) {
      return;
    }

    player.pause();
    await player.seekTo(0);
  }

  /**
   * Release all audio players.
   */
  release(): void {
    for (const player of this.players.values()) {
      player.remove();
    }

    this.players.clear();
    this.initialized = false;
  }
}

export const audioService = new AudioService();
