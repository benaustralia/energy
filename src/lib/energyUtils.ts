import { FONTS, EMOJIS } from './constants';

export const getFontForName = (
  name: string, 
  cache: { [key: string]: string }
): string => {
  if (!cache[name]) {
    const hash = name.toLowerCase().trim().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    cache[name] = FONTS[hash % FONTS.length];
  }
  return cache[name];
};

export const getEmojiForName = (
  name: string,
  cache: { [key: string]: string },
  allNames: string[]
): string => {
  if (!cache[`emoji_${name}`]) {
    // Get all currently used emojis
    const usedEmojis = new Set(
      allNames
        .filter(n => n !== name && cache[`emoji_${n}`])
        .map(n => cache[`emoji_${n}`])
    );
    
    // Find available emojis
    const availableEmojis = EMOJIS.filter(emoji => !usedEmojis.has(emoji));
    
    // Use hash to pick from available emojis, fallback to all emojis if none available
    const hash = name.toLowerCase().trim().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const emojiPool = availableEmojis.length > 0 ? availableEmojis : EMOJIS;
    cache[`emoji_${name}`] = emojiPool[hash % emojiPool.length];
  }
  return cache[`emoji_${name}`];
};

export const getColor = (level: number): string => 
  level <= 6 ? '#f97316' : level === 7 ? '#22c55e' : '#ef4444';

export const getBadgeColor = (score: number): string => {
  if (score >= 1 && score <= 6) return 'bg-orange-500';
  if (score === 7) return 'bg-green-500';
  if (score >= 8 && score <= 10) return 'bg-red-500';
  return 'bg-gray-500';
};

export const calculateAverage = (students: { score: number }[]): number => {
  const validScores = students.filter(s => s.score > 0);
  return validScores.length ? validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length : 0;
};

export const allStudentsHaveScore = (students: { score: number }[], targetScore: number): boolean => {
  const validScores = students.filter(s => s.score > 0);
  return validScores.length === students.length && validScores.every(s => s.score === targetScore);
};
