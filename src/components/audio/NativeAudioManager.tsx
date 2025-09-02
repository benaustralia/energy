import { createNativeBeep, noteToFrequency, COURSE_CLEAR_MELODY } from '@/lib/audioUtils';

export const createNativeAudioManager = () => {
  const playNativeSafariSound = async () => {
    try {
      // Create different frequency beeps for variety
      const frequencies = [262, 294, 330, 349, 392, 440, 494, 523]; // C4 to C5
      const randomFreqs = [];
      for (let i = 0; i < 3; i++) {
        randomFreqs.push(frequencies[Math.floor(Math.random() * frequencies.length)]);
      }
      
      // Play beeps in sequence
      for (let i = 0; i < randomFreqs.length; i++) {
        const audioUrl = createNativeBeep(randomFreqs[i], 150);
        const audio = new Audio(audioUrl);
        audio.volume = 0.3;
        
        setTimeout(() => {
          audio.play().catch(e => console.log('Native audio failed:', e));
          // Clean up the URL after playing
          setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
        }, i * 100);
      }
    } catch (e) {
      console.log('Native Safari audio failed:', e);
    }
  };

  const playNativeSuccessMelody = async () => {
    try {
      // Convert melody to frequencies with millisecond timing
      const courseClearMelody = COURSE_CLEAR_MELODY.map(({ note, time }) => ({
        freq: noteToFrequency(note),
        time: time * 1000 // Convert to milliseconds
      }));
      
      // Play each note using native audio
      courseClearMelody.forEach(({ freq, time }) => {
        setTimeout(() => {
          const audioUrl = createNativeBeep(freq, 300);
          const audio = new Audio(audioUrl);
          audio.volume = 0.4;
          audio.play().catch(e => console.log('Native success note failed:', e));
          // Clean up the URL after playing
          setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
        }, time);
      });
    } catch (e) {
      console.log('Native success melody failed:', e);
    }
  };

  const playNativeNotes = async (notes: string[] = ['C4', 'E4', 'G4']) => {
    try {
      console.log('Safari playing notes:', notes);
      // Convert notes to frequencies and play in sequence
      notes.forEach((note, i) => {
        setTimeout(() => {
          const freq = noteToFrequency(note);
          console.log(`Safari playing note ${note} at frequency ${freq}Hz`);
          const audioUrl = createNativeBeep(freq, 200);
          const audio = new Audio(audioUrl);
          audio.volume = 0.4;
          audio.play().then(() => {
            console.log(`Successfully played ${note} at ${freq}Hz`);
          }).catch(e => console.log('Native note failed:', e));
          // Clean up the URL after playing
          setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
        }, i * 150); // 150ms between notes
      });
    } catch (e) {
      console.log('Native notes failed:', e);
    }
  };

  const playBeepBoop = async () => {
    await playNativeSafariSound();
  };

  const playMarioSuccess = async () => {
    await playNativeSuccessMelody();
  };

  return {
    playSound: playNativeNotes,
    playBeepBoop,
    playMarioSuccess
  };
};
