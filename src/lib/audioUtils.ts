// Convert note names to frequencies
export const noteToFrequency = (note: string): number => {
  const noteMap: { [key: string]: number } = {
    'C5': 523.25, 'E5': 659.25, 'G5': 783.99, 'C6': 1046.50,
    'E6': 1318.51, 'G6': 1567.98, 'Ab5': 830.61, 'Bb5': 932.33
  };
  return noteMap[note] || 440;
};

// Course clear completion melody
export const COURSE_CLEAR_MELODY = [
  // Bar 1 (ascending)
  { note: 'C5',  time: 0.000 },
  { note: 'E5',  time: 0.133 },
  { note: 'G5',  time: 0.266 },
  { note: 'C6',  time: 0.399 },

  // Bar 2 (ascending, higher)
  { note: 'E5',  time: 0.532 },
  { note: 'G5',  time: 0.665 },
  { note: 'C6',  time: 0.798 },
  { note: 'E6',  time: 0.931 },

  // Bar 3 (ascending, highest)
  { note: 'G5',  time: 1.064 },
  { note: 'C6',  time: 1.197 },
  { note: 'E6',  time: 1.330 },
  { note: 'G6',  time: 1.463 },

  // Bar 4 (cadence with the classic ♭VI–♭VII–I "Mario cadence", then resolve)
  { note: 'Ab5', time: 1.596 },
  { note: 'Bb5', time: 1.729 },
  { note: 'C6',  time: 1.862 },
  { note: 'G5',  time: 1.995 },
  { note: 'E5',  time: 2.128 },
  { note: 'C5',  time: 2.261 }
];

export const isSafari = (): boolean => 
  /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

// Create native audio beeps for Safari using data URIs
export const createNativeBeep = (frequency: number, duration: number = 200): string => {
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
