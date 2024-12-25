import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Loader2,
  Book,
  Shuffle,
  Volume2,
  Pause,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
// import DOMPurify from 'dompurify';
import {
  searchVerses,
  fetchRandomVerse,
  clearResults,
  selectSearchResults,
  selectSearchLoading,
  selectSearchLanguage,
  selectRandomVerse,
} from "../store/slices/searchSlice";
import { setCurrentSurah } from "../store/slices/quranSlice";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useTranslations } from "../translations";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const dispatch = useDispatch();
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const searchResults = useSelector(selectSearchResults);
  const isLoading = useSelector(selectSearchLoading);
  const language = useSelector(selectSearchLanguage);
  const randomVerse = useSelector(selectRandomVerse);
  const { isPlaying, currentAudioId, playAudio } = useAudioPlayer();

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      dispatch(clearResults());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        dispatch(searchVerses({ searchTerm, language }));
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, language, dispatch]);

  const handleVerseClick = (surahId: number) => {
    dispatch(setCurrentSurah(surahId));
    onClose();
  };

  const handleRandomVerse = () => {
    dispatch(fetchRandomVerse(language));
  };

  const handleAudioPlay = (audioUrl: string, id: number) => {
    playAudio(audioUrl, id);
  };

  const sanitizeHTML = (html: string) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html; // Browser akan membuang tag berbahaya secara default
    return tempDiv.innerHTML; // Ambil kembali isi yang aman
  };

  const createMarkup = (html: string) => {
    return { __html: sanitizeHTML(html) };
  };
  // const createMarkup = (html: string) => {
  //   return { __html: DOMPurify.sanitize(html) };
  // };

  if (!isOpen) return null;

  return (
    //bg-black/50 backdrop-blur-sm
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-4 sm:pt-16">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.search.placeholder}
              className="flex-1 min-w-[200px] bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
              autoFocus
            />
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleRandomVerse}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Get random verse"
              >
                <Shuffle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-8rem)] sm:max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : searchTerm.length < 2 && !randomVerse ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t.search.minChars}</p>
            </div>
          ) : searchResults.length === 0 && !randomVerse ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {t.search.noResults} "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {randomVerse && !searchTerm && (
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl flex-shrink-0">
                      <Shuffle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {randomVerse.surah.name_en} ({randomVerse.surah.name})
                        </h3>
                        <div className="flex items-center gap-2">
                          {randomVerse.surah.audio && (
                            <button
                              onClick={() =>
                                handleAudioPlay(
                                  language === "en"
                                    ? randomVerse.surah.audio!.mp3_en
                                    : randomVerse.surah.audio!.mp3,
                                  randomVerse.verse.id,
                                )
                              }
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              {isPlaying &&
                              currentAudioId === randomVerse.verse.id ? (
                                <Pause className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </button>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {t.verse.verse} {randomVerse.verse.verse_number}
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-2xl leading-relaxed text-right font-arabic"
                        dir="rtl"
                      >
                        {randomVerse.verse.verse}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {language === "en"
                          ? randomVerse.verse.transcription_en
                          : randomVerse.verse.transcription}
                      </p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {randomVerse.text}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleVerseClick(result.surah.id)}
                  className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 p-3 rounded-xl flex-shrink-0">
                      <Book className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {result.surah.name_en} ({result.surah.name})
                        </h3>
                        <div className="flex items-center gap-2">
                          {result.surah.audio && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAudioPlay(
                                  language === "en"
                                    ? result.surah.audio!.mp3_en
                                    : result.surah.audio!.mp3,
                                  result.verse.id,
                                );
                              }}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              {isPlaying &&
                              currentAudioId === result.verse.id ? (
                                <Pause className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Volume2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </button>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Verse {result.verse.verse_number}
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-2xl leading-relaxed text-right font-arabic"
                        dir="rtl"
                      >
                        {result.verse.verse}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        {language === "en"
                          ? result.verse.transcription_en
                          : result.verse.transcription}
                      </p>
                      <p
                        className="text-gray-900 dark:text-gray-100"
                        dangerouslySetInnerHTML={
                          result._formatted
                            ? createMarkup(result._formatted.text)
                            : { __html: result.text }
                        }
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

