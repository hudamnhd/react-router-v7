import { useSelector } from 'react-redux';
import { selectSearchLanguage } from '../store/slices/searchSlice';

const translations = {
  en: {
    app: {
      title: 'Quran',
      loading: 'Loading Quran...',
      search: {
        placeholder: 'Search verses, surah names...',
        noResults: 'No results found for',
        minChars: 'Enter at least 2 characters to search or click the shuffle icon for a random verse',
        random: 'Get random verse',
        searching: 'Searching...'
      },
      header: {
        toggleMenu: 'Toggle menu',
        toggleTheme: 'Toggle theme',
        toggleLanguage: 'Toggle language',
        darkMode: 'Dark mode',
        lightMode: 'Light mode'
      },
      sidebar: {
        selectSurah: 'Select Surah',
        selectTranslator: 'Select Translator',
        defaultTranslation: 'Default Translation(Turkish)',
        surahAudio: 'Surah Audio',
        playAudio: 'Play audio',
        pauseAudio: 'Pause audio',
        currentlyPlaying: 'Currently playing'
      },
      verse: {
        verse: 'Verse',
        juz: 'Juz',
        page: 'Page',
        showFootnotes: 'Show footnotes',
        hideFootnotes: 'Hide footnotes',
        footnotes: 'Footnotes',
        audio: {
          play: 'Play verse audio',
          pause: 'Pause verse audio',
          loading: 'Loading audio...'
        }
      },
      share: {
        title: 'Share Verse',
        copy: 'Copy to clipboard',
        share: 'Share',
        copied: 'Copied to clipboard!',
        shareError: 'Unable to share. Your browser may not support sharing.',
        copyError: 'Unable to copy. Please try again.'
      },
      errors: {
        loadingFailed: 'Failed to load content',
        retry: 'Retry',
        audioError: 'Failed to load audio',
        networkError: 'Network error. Please check your connection.'
      }
    }
  },
  tr: {
    app: {
      title: 'Kuran',
      loading: 'Kuran yükleniyor...',
      search: {
        placeholder: 'Ayetlerde, sure isimlerinde ara...',
        noResults: 'Sonuç bulunamadı:',
        minChars: 'Arama yapmak için en az 2 karakter girin veya rastgele bir ayet için karıştır simgesine tıklayın',
        random: 'Rastgele ayet getir',
        searching: 'Aranıyor...'
      },
      header: {
        toggleMenu: 'Menüyü aç/kapat',
        toggleTheme: 'Temayı değiştir',
        toggleLanguage: 'Dili değiştir',
        darkMode: 'Karanlık mod',
        lightMode: 'Aydınlık mod'
      },
      sidebar: {
        selectSurah: 'Sure Seç',
        selectTranslator: 'Çevirmen Seç',
        defaultTranslation: 'Varsayılan Çeviri(Türkçe)',
        surahAudio: 'Sure Sesi',
        playAudio: 'Sesi oynat',
        pauseAudio: 'Sesi duraklat',
        currentlyPlaying: 'Şu an çalıyor'
      },
      verse: {
        verse: 'Ayet',
        juz: 'Cüz',
        page: 'Sayfa',
        showFootnotes: 'Dipnotları göster',
        hideFootnotes: 'Dipnotları gizle',
        footnotes: 'Dipnotlar',
        audio: {
          play: 'Ayet sesini oynat',
          pause: 'Ayet sesini duraklat',
          loading: 'Ses yükleniyor...'
        }

      },
      share: {
        title: 'Ayeti Paylaş',
        copy: 'Panoya kopyala',
        share: 'Paylaş',
        copied: 'Panoya kopyalandı!',
        shareError: 'Paylaşılamadı. Tarayıcınız paylaşımı desteklemiyor olabilir.',
        copyError: 'Kopyalanamadı. Lütfen tekrar deneyin.'
      },
      errors: {
        loadingFailed: 'İçerik yüklenemedi',
        retry: 'Tekrar dene',
        audioError: 'Ses yüklenemedi',
        networkError: 'Ağ hatası. Lütfen bağlantınızı kontrol edin.'
      }
    }
  }
};

export type TranslationKey = keyof typeof translations.en.app;

export function useTranslations() {
  const language = useSelector(selectSearchLanguage);
  return translations[language].app;
}

export function getTranslation(language: 'en' | 'tr', key: string) {
  return key.split('.').reduce((obj, key) => obj[key], translations[language] as any);
}