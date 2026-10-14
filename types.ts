export type FilterPreset = 'summer-glow' | 'golden-hour' | 'mediterranean-sun' | 'vintage-film' | 'natural-clean';

export interface PhotoItem {
  id: string;
  originalUrl: string;
  enhancedUrl: string;
  caption: string;
  filterPreset: FilterPreset;
}

export interface InstagramStorySlide {
  slideNumber: number;
  hookHeadline: string;
  stickerText: string;
  locationSticker: string;
  photoIndex: number;
}

export interface InstagramSong {
  title: string;
  artist: string;
  vibe: string;
  hookTimestamp: string;
  searchLink: string;
}

export interface InstagramPackage {
  vibe: string;
  recommendedSong: InstagramSong;
  slides: InstagramStorySlide[];
  fullCaption: string;
  hashtags: string[];
}

export interface LogEntry {
  id: string;
  date: string;
  title: string;
  mood: string;
  moodLabel: string;
  impressions: string;
  food: string;
  foodRating: number;
  moments: string;
  reflection: string;
  photos: PhotoItem[];
  filterPreset: FilterPreset;
  aiSummary?: string;
  photoInsights?: string;
  quoteOfTheDay?: string;
  vibeKeywords?: string[];
  instagramPackage?: InstagramPackage;
  createdAt: number;
}
