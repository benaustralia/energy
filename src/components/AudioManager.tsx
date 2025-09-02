import { isSafari } from '@/lib/audioUtils';
import { createToneAudioManager } from './audio/ToneAudioManager';
import { createNativeAudioManager } from './audio/NativeAudioManager';

export const AudioManager = () => {
  const toneManager = createToneAudioManager();
  const nativeManager = createNativeAudioManager();
  
  const playSound = async (notes?: string[]) => {
    console.log('AudioManager playSound called with notes:', notes, 'Safari detected:', isSafari());
    if (isSafari()) {
      await nativeManager.playSound(notes);
    } else {
      await toneManager.playSound(notes);
    }
  };

  const playBeepBoop = async () => {
    if (isSafari()) {
      await nativeManager.playBeepBoop();
    } else {
      await nativeManager.playBeepBoop(); // Use native for all browsers for beep boop
    }
  };

  const playMarioSuccess = async () => {
    if (isSafari()) {
      await nativeManager.playMarioSuccess();
    } else {
      await toneManager.playMarioSuccess();
    }
  };

  return {
    playSound,
    playBeepBoop,
    playMarioSuccess
  };
};

export default AudioManager;
