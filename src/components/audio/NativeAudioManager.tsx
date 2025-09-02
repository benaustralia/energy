import { createNativeBeep, noteToFrequency, COURSE_CLEAR_MELODY } from '@/lib/audioUtils';

export const createNativeAudioManager = () => {
  // Simple sound effect using Web Audio API
  const createSimpleBeep = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') await audioContext.resume();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const startTime = audioContext.currentTime;
      oscillator.frequency.setValueAtTime(400, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, startTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
      oscillator.type = 'sine';
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    } catch (e) {
      console.error('Sound effect failed:', e);
    }
  };

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

  const playBeepBoop = async () => {
    await playNativeSafariSound();
  };

  const playMarioSuccess = async () => {
    await playNativeSuccessMelody();
  };

  return {
    playSound: createSimpleBeep,
    playBeepBoop,
    playMarioSuccess
  };
};
