export interface Author {
  id: number;
  name: string;
  description: string;
  language: string;
  url: string | null;
}

export interface Surah {
  id: number;
  name: string;
  name_en: string;
  name_original: string;
  slug: string;
  verse_count: number;
  page_number: number;
  audio: Audio;
}

export interface Translation {
  id: number;
  text: string;
  author: Author;
  footnotes: Footnote[] | null;
}

export interface Footnote {
  id: number;
  text: string;
  number: number;
}

export interface Verse {
  data: {
    id: number;
    name: string;
    name_en: string;
    name_original: string;
    name_translation_tr: string;
    name_translation_en: string;
    slug: string;
    verse_count: number;
    page_number: number;
    audio: {
      mp3: string;
      duration: number;
      mp3_en: string;
      duration_en: number;
    };
  };
  id: number;
  surah_id: number;
  verse_number: number;
  verse: string;
  verse_simplified: string;
  page: number;
  juz_number: number;
  transcription: string;
  transcription_en: string;
  translation: Translation;
  surah: Surah;
  audio: Audio;
}

export interface Audio {
  mp3: string;
  duration: number;
  mp3_en: string;
  duration_en: number;
}

export interface SearchHit {
  id: number;
  text: string;
  verse_id: number;
  language: string;
  author: {
    id: number;
    name: string;
    language: string;
    description: string | null;
  };
  surah: {
    id: number;
    name: string;
    name_en: string;
    name_original: string;
    audio?: Audio;
  };
  verse: {
    id: number;
    page: number;
    verse: string;
    juz_number: number;
    verse_number: number;
    transcription: string;
    transcription_en: string;
  };
  _formatted?: {
    text: string;
    verse: {
      verse: string;
      transcription: string;
    };
  };
  _rankingScore?: number;
}

export interface SearchResponse {
  data: {
    hits: SearchHit[];
    estimatedTotalHits: number;
    limit: number;
    offset: number;
    processingTimeMs: number;
    query: string;
  };
}

export interface RandomSearchResponse {
  data: {
    hits: SearchHit[];
    estimatedTotalHits: number;
    limit: number;
    offset: number;
    processingTimeMs: number;
    query: string;
  };
}