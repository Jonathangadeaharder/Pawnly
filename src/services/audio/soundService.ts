/**
 * Sound Service
 * Manages all audio playback using expo-av
 * Provides satisfying, multi-sensory feedback for chess interactions
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { useUIStore } from '../../state/uiStore';

// Sound types
export type SoundType =
  | 'move'           // Standard piece move
  | 'capture'        // Piece capture
  | 'castling'       // Castling move
  | 'check'          // Check announcement
  | 'checkmate'      // Checkmate
  | 'draw'           // Draw/stalemate
  | 'success'        // Puzzle/drill success
  | 'error'          // Incorrect move/blunder
  | 'click'          // UI button click
  | 'whoosh'         // Menu navigation
  | 'streak'         // Streak achievement
  | 'levelUp'        // Level up
  | 'unlock'         // Achievement unlock
  | 'notification';  // General notification

// Sound cache
const soundCache: Map<SoundType, Audio.Sound> = new Map();

// Sound file mappings (using web audio APIs or embedded base64 for now)
// In production, these would be actual audio files in assets/sounds/
const SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number; volume?: number }> = {
  move: { frequency: 440, duration: 100, volume: 0.3 },
  capture: { frequency: 330, duration: 150, volume: 0.4 },
  castling: { frequency: 523, duration: 120, volume: 0.35 },
  check: { frequency: 880, duration: 200, volume: 0.5 },
  checkmate: { frequency: 660, duration: 400, volume: 0.6 },
  draw: { frequency: 392, duration: 300, volume: 0.4 },
  success: { frequency: 784, duration: 150, volume: 0.5 },
  error: { frequency: 220, duration: 200, volume: 0.4 },
  click: { frequency: 800, duration: 50, volume: 0.2 },
  whoosh: { frequency: 600, duration: 100, volume: 0.3 },
  streak: { frequency: 1046, duration: 250, volume: 0.5 },
  levelUp: { frequency: 1318, duration: 300, volume: 0.6 },
  unlock: { frequency: 987, duration: 350, volume: 0.55 },
  notification: { frequency: 523, duration: 150, volume: 0.4 },
};

/**
 * Initialize the audio system
 * Should be called once on app startup
 */
export async function initializeAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.error('Error initializing audio:', error);
  }
}

/**
 * Generate a simple tone sound
 * This is a fallback for when audio files aren't available
 */
function generateToneURI(frequency: number, duration: number, volume: number = 0.5): string {
  // For web, we can use data URIs with Web Audio API
  // For native, we'd use actual audio files
  // This is a simplified approach - in production, use real audio files
  return `data:audio/wav;base64,${btoa('simplified-tone-placeholder')}`;
}

/**
 * Load a sound into memory
 */
async function loadSound(type: SoundType): Promise<Audio.Sound | null> {
  try {
    // Check if already cached
    if (soundCache.has(type)) {
      return soundCache.get(type)!;
    }

    // In production, load from assets/sounds/
    // For now, we'll create a simple sound object
    const { frequency, duration, volume } = SOUND_FREQUENCIES[type];

    // Create a new sound
    // Note: In a real app, you'd load from require('./assets/sounds/move.mp3')
    const { sound } = await Audio.Sound.createAsync(
      // Placeholder - in production, use actual audio files:
      // require('../../../assets/sounds/move.mp3')
      { uri: generateToneURI(frequency, duration, volume || 0.5) },
      { shouldPlay: false, volume: volume || 0.5 }
    );

    // Cache the sound
    soundCache.set(type, sound);
    return sound;
  } catch (error) {
    console.error(`Error loading sound ${type}:`, error);
    return null;
  }
}

/**
 * Play a sound effect
 * Respects user's sound settings
 */
export async function playSound(type: SoundType): Promise<void> {
  try {
    // Check if sound is enabled
    const { soundEnabled } = useUIStore.getState();
    if (!soundEnabled) return;

    // Load sound if not cached
    let sound = soundCache.get(type);
    if (!sound) {
      sound = await loadSound(type);
    }

    if (sound) {
      // Reset to beginning if already playing
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (error) {
    console.error(`Error playing sound ${type}:`, error);
  }
}

/**
 * Play a sequence of sounds
 * Useful for compound events (e.g., check + capture)
 */
export async function playSoundSequence(types: SoundType[], delayMs: number = 100): Promise<void> {
  for (const type of types) {
    await playSound(type);
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Preload commonly used sounds
 * Call this on app startup to reduce latency
 */
export async function preloadSounds(): Promise<void> {
  const commonSounds: SoundType[] = [
    'move',
    'capture',
    'check',
    'success',
    'error',
    'click',
  ];

  await Promise.all(commonSounds.map(type => loadSound(type)));
}

/**
 * Unload all sounds from memory
 * Call this when cleaning up
 */
export async function unloadAllSounds(): Promise<void> {
  for (const [type, sound] of soundCache.entries()) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.error(`Error unloading sound ${type}:`, error);
    }
  }
  soundCache.clear();
}

/**
 * Play sound based on chess move context
 * Intelligently selects the right sound
 */
export async function playMoveSound(
  moveData: {
    isCapture?: boolean;
    isCastling?: boolean;
    isCheck?: boolean;
    isCheckmate?: boolean;
    isDraw?: boolean;
  }
): Promise<void> {
  if (moveData.isCheckmate) {
    await playSound('checkmate');
  } else if (moveData.isDraw) {
    await playSound('draw');
  } else if (moveData.isCheck) {
    // Play capture or move sound first, then check
    if (moveData.isCapture) {
      await playSoundSequence(['capture', 'check'], 50);
    } else {
      await playSoundSequence(['move', 'check'], 50);
    }
  } else if (moveData.isCastling) {
    await playSound('castling');
  } else if (moveData.isCapture) {
    await playSound('capture');
  } else {
    await playSound('move');
  }
}

/**
 * Play success sound with optional chaining for achievements
 */
export async function playSuccessSound(achievement?: boolean): Promise<void> {
  if (achievement) {
    await playSoundSequence(['success', 'unlock'], 100);
  } else {
    await playSound('success');
  }
}

/**
 * Set volume for all future sounds
 */
export function setGlobalVolume(volume: number): void {
  // Clamp between 0 and 1
  const clampedVolume = Math.max(0, Math.min(1, volume));

  // Update all cached sounds
  soundCache.forEach(async (sound) => {
    try {
      await sound.setVolumeAsync(clampedVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  });
}

// Export a singleton instance
export const SoundService = {
  initialize: initializeAudio,
  play: playSound,
  playSequence: playSoundSequence,
  playMove: playMoveSound,
  playSuccess: playSuccessSound,
  preload: preloadSounds,
  unloadAll: unloadAllSounds,
  setVolume: setGlobalVolume,
};

export default SoundService;
