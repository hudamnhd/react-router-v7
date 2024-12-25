import { Author, Surah, Verse, SearchResponse, RandomSearchResponse } from './types';

const BASE_URL = 'https://api.acikkuran.com';
const API_V2_URL = 'https://apiv2.acikkuran.com';

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function fetchAuthors(): Promise<Author[]> {
  const data = await fetchData<{ data: Author[] }>(`${BASE_URL}/authors`);
  return data.data;
}

export async function searchQuran(query: string, language: string = 'en'): Promise<SearchResponse> {
  const url = `${API_V2_URL}/search?q=${encodeURIComponent(query)}&type=quick&lang=${language}`;
  return fetchData<SearchResponse>(url);
}
export async function getRandomVerse(language: string = 'en'): Promise<RandomSearchResponse> {
  const url = `${API_V2_URL}/random-search?lang=${language}`;
  return fetchData<RandomSearchResponse>(url);
}

export async function fetchSurahs(): Promise<Surah[]> {
  const data = await fetchData<{ data: Surah[] }>(`${BASE_URL}/surahs`);
  return data.data;
}

export async function fetchSurahVerses(surahId: number, authorId?: number): Promise<Verse[]> {
  const url = authorId
    ? `${BASE_URL}/surah/${surahId}?author=${authorId}`
    : `${BASE_URL}/surah/${surahId}`;
  const data = await fetchData<{ data: { verses: Verse[] } }>(url);
  return data.data.verses;
}

export async function fetchVerseById(surahId: number, verseNumber: number, authorId?: number): Promise<Verse> {
  const url = authorId
    ? `${BASE_URL}/surah/${surahId}/verse/${verseNumber}?author=${authorId}`
    : `${BASE_URL}/surah/${surahId}/verse/${verseNumber}`;
  const data = await fetchData<{ data: Verse }>(url);
  return data.data;
}
