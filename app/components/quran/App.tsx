import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader2, Menu, X } from 'lucide-react';
import { AppDispatch } from './store/store';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VerseCard } from './components/VerseCard';
import {
  fetchVerses,
  selectVerses,
  selectCurrentSurah,
  selectLoading,
  fetchAllSurahs,
} from './store/slices/quranSlice';
import { selectSearchLanguage } from './store/slices/searchSlice';
import { fetchAllAuthors, selectSelectedAuthor } from './store/slices/translationsSlice';
import { useTranslations } from './translations';

function App() {
  const language = useSelector(selectSearchLanguage);
  const t = useTranslations();
  const [isPopoverVisible, setIsPopoverVisible] = useState(
    !localStorage.getItem("languageChanged")
  );
  const dispatch = useDispatch<AppDispatch>();
  const verses = useSelector(selectVerses);
  const currentSurah = useSelector(selectCurrentSurah);
  const loading = useSelector(selectLoading);
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllSurahs());
    dispatch(fetchAllAuthors());
  }, [dispatch]);

  useEffect(() => {
    if (currentSurah) {
      dispatch(fetchVerses({ surahId: currentSurah, authorId: selectedAuthor?.id }));
    }
  }, [dispatch, currentSurah, selectedAuthor]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
       {isPopoverVisible && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] flex items-center justify-center" 
          onClick={() => {
            setIsPopoverVisible(false);
            localStorage.setItem("languageChanged", "true");
          }}
        />
      )}
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isPopoverVisible={isPopoverVisible}
        setIsPopoverVisible={setIsPopoverVisible}
      />
      
      <div className="flex">
        <div className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 z-40 
          ${isSidebarOpen 
            ? 'max-lg:opacity-100 max-lg:pointer-events-auto lg:opacity-100 lg:pointer-events-auto' 
            : 'max-lg:opacity-0 max-lg:pointer-events-none lg:opacity-100 lg:pointer-events-auto'
          }
          `}>
          <div 
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 lg:hidden
              ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none display-none'}`}
            onClick={() => setIsSidebarOpen(false)}
          />


          <div 
            className={`absolute top-0 left-0 h-full w-full transform transition-transform duration-300 lg:translate-x-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          >
            <div className="absolute right-4 top-4 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>

        <main className="flex-1 ml-0 lg:ml-72 transition-all duration-300">
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            {verses.map((verse) => (
              <VerseCard
                key={verse.id}
                verse={verse}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;