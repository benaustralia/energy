import { useRef, useEffect } from 'react';
import * as Tone from 'tone';

export interface AudioManagerProps {
  onAudioReady?: () => void;
}

export const AudioManager = ({ onAudioReady }: AudioManagerProps) => {
  const synthRef = useRef<Tone.Synth | null>(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
    onAudioReady?.();
  }, [onAudioReady]);

    const playSound = async (notes = ['C4', 'E4', 'G4']) => {
    if (!synthRef.current) return;
    if (Tone.context.state === 'suspended') await Tone.start();
    notes.forEach((note, i) => {
      synthRef.current!.triggerAttackRelease(note, '8n', Tone.now() + i * 0.1);
    });
  };



  // Create crazy sound effects using Web Audio API (Chrome only)
  const createSoundEffect = async (type: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') await audioContext.resume();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const startTime = audioContext.currentTime;
      
      switch (type) {
        case 'door_slam':
          oscillator.frequency.setValueAtTime(150, startTime);
          oscillator.frequency.exponentialRampToValueAtTime(80, startTime + 0.02);
          oscillator.frequency.setValueAtTime(200, startTime + 0.05);
          oscillator.frequency.exponentialRampToValueAtTime(60, startTime + 0.15);
          gainNode.gain.setValueAtTime(0.8, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
          oscillator.type = 'square';
          break;
        case 'dog_bark':
          oscillator.frequency.setValueAtTime(300, startTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, startTime + 0.05);
          oscillator.frequency.exponentialRampToValueAtTime(200, startTime + 0.1);
          oscillator.frequency.exponentialRampToValueAtTime(600, startTime + 0.15);
          gainNode.gain.setValueAtTime(0.5, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
          oscillator.type = 'sawtooth';
          break;
        case 'rubber_duck':
          oscillator.frequency.setValueAtTime(800, startTime);
          oscillator.frequency.linearRampToValueAtTime(600, startTime + 0.1);
          oscillator.frequency.linearRampToValueAtTime(800, startTime + 0.15);
          gainNode.gain.setValueAtTime(0.4, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
          oscillator.type = 'sine';
          break;
        case 'door_creak':
          oscillator.frequency.setValueAtTime(200, startTime);
          for (let i = 0; i < 8; i++) {
            oscillator.frequency.setValueAtTime(200 + i * 15, startTime + i * 0.06);
            oscillator.frequency.setValueAtTime(180 + i * 12, startTime + i * 0.06 + 0.03);
          }
          gainNode.gain.setValueAtTime(0.3, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.48);
          oscillator.type = 'sawtooth';
          break;
        case 'spring_boing':
          oscillator.frequency.setValueAtTime(400, startTime);
          for (let i = 0; i < 6; i++) {
            oscillator.frequency.exponentialRampToValueAtTime(Math.max(100, 200 - i * 20), startTime + i * 0.05 + 0.025);
            oscillator.frequency.setValueAtTime(Math.max(120, 400 - i * 40), startTime + i * 0.05 + 0.05);
          }
          gainNode.gain.setValueAtTime(0.5, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
          break;
        case 'cartoon_slip':
          oscillator.frequency.setValueAtTime(800, startTime);
          oscillator.frequency.linearRampToValueAtTime(200, startTime + 0.25);
          gainNode.gain.setValueAtTime(0.4, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          oscillator.type = 'sine';
          break;
      }
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
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
      // Chrome: Crazy sound effects
      const soundEffects = [
        'door_slam', 'dog_bark', 'rubber_duck', 'door_creak', 
        'spring_boing', 'cartoon_slip'
      ];
      const randomEffect = soundEffects[Math.floor(Math.random() * soundEffects.length)];
      await createSoundEffect(randomEffect);
    }
  };

  return {
    playSound,
    playBeepBoop
  };
};

export default AudioManager;
