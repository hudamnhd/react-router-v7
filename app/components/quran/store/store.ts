import { configureStore } from '@reduxjs/toolkit';
import quranReducer from './slices/quranSlice';
import translationsReducer from './slices/translationsSlice';
import uiReducer from './slices/uiSlice';
import searchReducer from './slices/searchSlice';

export const store = configureStore({
  reducer: {
    quran: quranReducer,
    translations: translationsReducer,
    ui: uiReducer,
    search: searchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;