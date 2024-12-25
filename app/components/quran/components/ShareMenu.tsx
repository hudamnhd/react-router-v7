import React from 'react';
import { Copy, Share, X } from 'lucide-react';
import { useTranslations } from '../translations';

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  verseText: string;
  verseInfo: string;
}

export function ShareMenu({ isOpen, onClose, verseText, verseInfo }: ShareMenuProps) {
  const t = useTranslations();
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${verseInfo}\n\n${verseText}`);
      onClose();
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: verseInfo,
        text: verseText,
        url: window.location.href,
      });
      onClose();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-sm mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t.share.title}
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Copy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-200">{t.share.copy}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Share className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-200">{t.share.share}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}