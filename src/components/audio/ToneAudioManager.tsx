import * as Tone from 'tone';
import { COURSE_CLEAR_MELODY } from '@/lib/audioUtils';

export const createToneAudioManager = () => {
  let synth: Tone.Synth | null = null;
  let isInitializing = false;

  // Initialize synth when first needed (async to prevent blocking)
  const getSynth = async (): Promise<Tone.Synth | null> => {
    if (!synth && !isInitializing) {
      isInitializing = true;
      try {
        // Use requestIdleCallback if available, otherwise setTimeout
        await new Promise<void>(resolve => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              synth = new Tone.Synth().toDestination();
              resolve();
            });
          } else {
            setTimeout(() => {
              synth = new Tone.Synth().toDestination();
              resolve();
            }, 0);
          }
        });
      } catch (error) {
        console.warn('Failed to initialize audio synth:', error);
      } finally {
        isInitializing = false;
      }
    }
    return synth;
  };

  const playSound = async (notes = ['C4', 'E4', 'G4']) => {
    const synthInstance = await getSynth();
    if (!synthInstance) return;
    try {
      if (Tone.context.state === 'suspended') await Tone.start();
      notes.forEach((note, i) => {
        synthInstance.triggerAttackRelease(note, '8n', Tone.now() + i * 0.1);
      });
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const playMarioSuccess = async () => {
    const synthInstance = await getSynth();
    if (!synthInstance) return;
    try {
      if (Tone.context.state === 'suspended') await Tone.start();
      
      COURSE_CLEAR_MELODY.forEach(({ note, time }) => {
        synthInstance.triggerAttackRelease(note, '8n', Tone.now() + time);
      });
    } catch (error) {
      console.warn('Mario success melody failed:', error);
    }
  };

  return {
    playSound,
    playMarioSuccess
  };
};
