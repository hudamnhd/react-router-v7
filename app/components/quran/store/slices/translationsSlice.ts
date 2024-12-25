import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAuthors } from '../../api/quranApi';
import type { RootState } from '../store';
import type { Author } from '../../api/types';

interface TranslationsState {
  authors: Author[];
  selectedAuthor: Author | null;
  loading: boolean;
  error: string | null;
}

const initialState: TranslationsState = {
  authors: [],
  selectedAuthor: null,
  loading: false,
  error: null,
};

export const fetchAllAuthors = createAsyncThunk(
  'translations/fetchAuthors',
  async () => {
    return await fetchAuthors();
  }
);

const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    setSelectedAuthor: (state, action) => {
      state.selectedAuthor = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAuthors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAuthors.fulfilled, (state, action) => {
        state.authors = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllAuthors.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch authors';
        state.loading = false;
      });
  },
});

export const { setSelectedAuthor } = translationsSlice.actions;

export const selectAuthors = (state: RootState) => state.translations.authors;
export const selectSelectedAuthor = (state: RootState) => state.translations.selectedAuthor;
export const selectTranslationsLoading = (state: RootState) => state.translations.loading;

export default translationsSlice.reducer;