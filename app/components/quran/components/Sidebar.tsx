import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, PlayCircle, PauseCircle } from 'lucide-react';
import { selectSurahs, setCurrentSurah, selectCurrentSurah } from '../store/slices/quranSlice';
import { selectAuthors, selectSelectedAuthor, setSelectedAuthor } from '../store/slices/translationsSlice';
import { selectSearchLanguage } from '../store/slices/searchSlice';
import { useTranslations } from '../translations';

export function Sidebar() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const language = useSelector(selectSearchLanguage);
  const surahs = useSelector(selectSurahs);
  const currentSurah = useSelector(selectCurrentSurah);
  const authors = useSelector(selectAuthors);
  const selectedAuthor = useSelector(selectSelectedAuthor);

  const selectedSurah = surahs.find((surah) => surah.id === currentSurah);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  
  useEffect(() => {
    setCurrentTime(0); 
    setDuration(0); 
  }, [language]);

  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (!audioElement) return;  
  
    const updateProgress = () => {
      const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
      setProgress(progressPercent);
      setCurrentTime(audioElement.currentTime);
      setDuration(audioElement.duration);
    };
  
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
  
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleEnded);
  
    return () => {
      if (audioElement) {
        audioElement.removeEventListener('timeupdate', updateProgress);
        audioElement.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  const handlePlayPause = () => {
    const audioElement = audioRef.current;
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audioElement = audioRef.current;
    const seekTime = (e.target.value / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-800/50 pb-20">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t.sidebar.selectSurah}
            </label>
            <div className="relative">
              <select
                value={currentSurah}
                onChange={(e) => dispatch(setCurrentSurah(Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none transition-all duration-200"
              >
                {surahs.map((surah) => (
                  <option key={surah.id} value={surah.id}>
                    {surah.id}. {surah.name_en} ({surah.name})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t.sidebar.selectTranslator}
            </label>
            <div className="relative">
              <select
                value={selectedAuthor?.id || ''}
                onChange={(e) => {
                  const author = authors.find(a => a.id === Number(e.target.value));
                  dispatch(setSelectedAuthor(author || null));
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none transition-all duration-200"
              >
                <option value="">{t.sidebar.defaultTranslation}</option>
                {authors
                  .filter((author) => author.language === language) 
                  .map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {selectedSurah && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
                {t.sidebar.surahAudio}
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedSurah.name_en} ({selectedSurah.name})
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={handlePlayPause}
                        className="p-1 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 focus:outline-none transition-colors duration-300"
                        title={isPlaying ? t.sidebar.pauseAudio : t.sidebar.playAudio}
                      >
                        {isPlaying ? (
                          <PauseCircle className="h-8 w-8" />
                        ) : (
                          <PlayCircle className="h-8 w-8" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSurah && (
        <div className="fixed bottom-0 left-0 w-72 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-2xl">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handlePlayPause} 
                className="text-emerald-500 hover:text-emerald-600"
                title={isPlaying ? t.sidebar.pauseAudio : t.sidebar.playAudio}
              >
                {isPlaying ? (
                  <PauseCircle className="h-8 w-8" />
                ) : (
                  <PlayCircle className="h-8 w-8" />
                )}
              </button>

              <div className="flex-grow">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full 
                  appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:bg-emerald-500 
                  [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-2">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <audio 
                ref={audioRef} 
                src={
                  language === "tr"
                    ? selectedSurah.audio.mp3
                    : language === "en"
                    ? selectedSurah.audio.mp3_en
                    : null 
                }
                preload="auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}