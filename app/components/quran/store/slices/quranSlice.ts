import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSurahVerses, fetchSurahs, fetchVerseById } from '../../api/quranApi';
import type { RootState } from '../store';
import type { Surah, Verse } from '../../api/types';

interface QuranState {
  surahs: Surah[];
  currentSurah: number;
  currentVerse: Verse | null;
  verses: Verse[];
  loading: boolean;
  error: string | null;
}

const initialState: QuranState = {
  surahs: [],
  currentSurah: 1,
  currentVerse: null,
  verses: [],
  loading: false,
  error: null,
};

export const fetchAllSurahs = createAsyncThunk(
  'quran/fetchAllSurahs',
  async () => {
    return await fetchSurahs();
  }
);

export const fetchVerses = createAsyncThunk(
  'quran/fetchVerses',
  async ({ surahId, authorId }: { surahId: number; authorId?: number }) => {
    return await fetchSurahVerses(surahId, authorId);
  }
);

export const fetchVerse = createAsyncThunk(
  'quran/fetchVerse',
  async ({ surahId, verseNumber }: { surahId: number; verseNumber: number }) => {
    return await fetchVerseById(surahId, verseNumber);
  }
);

const quranSlice = createSlice({
  name: 'quran',
  initialState,
  reducers: {
    setCurrentSurah: (state, action) => {
      state.currentSurah = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSurahs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllSurahs.fulfilled, (state, action) => {
        state.surahs = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllSurahs.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch surahs';
        state.loading = false;
      })
      .addCase(fetchVerses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVerses.fulfilled, (state, action) => {
        state.verses = action.payload;
        state.loading = false;
      })
      .addCase(fetchVerses.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch verses';
        state.loading = false;
      })
      .addCase(fetchVerse.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVerse.fulfilled, (state, action) => {
        state.currentVerse = action.payload;
        state.loading = false;
      })
      .addCase(fetchVerse.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch verse';
        state.loading = false;
      });
  },
});

export const { setCurrentSurah } = quranSlice.actions;

export const selectSurahs = (state: RootState) => state.quran.surahs;
export const selectCurrentSurah = (state: RootState) => state.quran.currentSurah;
export const selectCurrentVerse = (state: RootState) => state.quran.currentVerse;
export const selectVerses = (state: RootState) => state.quran.verses;
export const selectLoading = (state: RootState) => state.quran.loading;

export default quranSlice.reducer;