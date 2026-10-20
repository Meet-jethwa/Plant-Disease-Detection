// languages.ts — Single source of truth for FloraAI supported languages

export const LANGUAGES = [
  { code: 'en', native: 'English',  english: 'English',  bcp47: 'en-US', font: 'sans-serif' },
  { code: 'hi', native: 'हिंदी',     english: 'Hindi',    bcp47: 'hi-IN', font: "'Noto Sans Devanagari', sans-serif" },
  { code: 'gu', native: 'ગુજરાતી',   english: 'Gujarati', bcp47: 'gu-IN', font: "'Noto Sans Gujarati', sans-serif" },
  { code: 'mr', native: 'मराठी',     english: 'Marathi',  bcp47: 'mr-IN', font: "'Noto Sans Devanagari', sans-serif" },
  { code: 'ta', native: 'தமிழ்',     english: 'Tamil',    bcp47: 'ta-IN', font: "'Noto Sans Tamil', sans-serif" },
  { code: 'te', native: 'తెలుగు',    english: 'Telugu',   bcp47: 'te-IN', font: "'Noto Sans Telugu', sans-serif" },
  { code: 'bn', native: 'বাংলা',     english: 'Bengali',  bcp47: 'bn-IN', font: "'Noto Sans Bengali', sans-serif" },
  { code: 'pa', native: 'ਪੰਜਾਬੀ',    english: 'Punjabi',  bcp47: 'pa-IN', font: "'Noto Sans Gurmukhi', sans-serif" },
] as const;

export type LangCode = typeof LANGUAGES[number]['code'];

export function getLanguageLabel(code: string): string {
  const found = LANGUAGES.find(l => l.code === code);
  return found ? found.native : code;
}

export function getLanguageMeta(code: string) {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0];
}
