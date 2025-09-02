import { useRef, useEffect } from 'react';
import * as Tone from 'tone';

export const AudioManager = () => {
  const synthRef = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
  }, []);

    const playSound = async (notes = ['C4', 'E4', 'G4']) => {
    if (!synthRef.current) return;
    if (Tone.context.state === 'suspended') await Tone.start();
    notes.forEach((note, i) => {
      synthRef.current!.triggerAttackRelease(note, '8n', Tone.now() + i * 0.1);
    });
  };



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

  // Create native audio beeps for Safari using data URIs
  const createNativeBeep = (frequency: number, duration: number = 200) => {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration / 1000);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3 * 32767;
      view.setInt16(44 + i * 2, sample, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
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

  const playBeepBoop = async () => {
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isSafari) {
      // Safari: Use native HTML5 Audio with generated WAV files
      await playNativeSafariSound();
    } else {
      // Chrome: Simple beep sound
      await createSimpleBeep();
    }
  };

  return {
    playSound,
    playBeepBoop
  };
};

export default AudioManager;
