import React from 'react';
import { Search, X } from 'lucide-react';
import { useTranslations } from '../translations';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  const t = useTranslations();
  return (
    <div className="relative max-w-2xl mx-auto mt-6 ">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search verses..."
        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none
                 text-gray-900 dark:text-gray-100 transition-all duration-200
                 placeholder-gray-400 dark:placeholder-gray-500"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                   dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}