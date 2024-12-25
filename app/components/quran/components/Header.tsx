import React, { useEffect } from "react";
import { Book, Moon, Sun, Search, Menu } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, selectIsDarkMode } from "../store/slices/uiSlice";
import { setLanguage, selectSearchLanguage } from "../store/slices/searchSlice";
import { SearchDialog } from "./SearchDialog";
import { useTranslations } from "../translations";
import * as Popover from "@radix-ui/react-popover";

interface HeaderProps {
  onMenuClick: () => void;
  isPopoverVisible: boolean;
  setIsPopoverVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
export function Header({  
  onMenuClick, 
  isPopoverVisible, 
  setIsPopoverVisible  }: HeaderProps) {
  const dispatch = useDispatch();
  const t = useTranslations();
  const isDarkMode = useSelector(selectIsDarkMode);
  const language = useSelector(selectSearchLanguage);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  // const [isPopoverVisible, setIsPopoverVisible] = React.useState<boolean>(
  //   !localStorage.getItem("languageChanged")
  // );

  useEffect(() => {
    if (!localStorage.getItem("languageChanged")) {
      dispatch(setLanguage("en"));
      setIsPopoverVisible(true);
    } else {
      setIsPopoverVisible(false); 
    }
  }, [dispatch]);
  
  const handleLanguageChange = () => {
    const newLanguage = language === "tr" ? "en" : "tr";
    dispatch(setLanguage(newLanguage));
    localStorage.setItem("languageChanged", "true");
    setIsPopoverVisible(false); 
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg">
                <Book className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {isPopoverVisible && (
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center" 
                onClick={() => setIsPopoverVisible(false)}
              />
            )}
            <Popover.Root 
              open={isPopoverVisible} 
              onOpenChange={(open) => {
                if (localStorage.getItem("languageChanged")) {
                  setIsPopoverVisible(false);
                } else {
                  setIsPopoverVisible(open);
                }
              }}
            >
              <Popover.Trigger asChild>
                <button
                  onClick={handleLanguageChange}
                  className="flex items-center justify-center w-10 h-10 rounded-md bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 transition-colors shadow-sm relative z-[70]"
                  title={t.header.toggleLanguage}
                >
                  <span className="text-sm font-semibold">
                    {language === "tr" ? "TR" : "EN"}
                  </span>
                </button>
              </Popover.Trigger>
              <Popover.Content
                className="rounded-lg bg-white dark:bg-gray-800 shadow-lg p-4 text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 relative z-[70]"
                side="bottom"
                align="center"
                sideOffset={5}
              >
                <p>Press the button to change language</p>
                <Popover.Arrow className="fill-current text-gray-200 dark:text-gray-700" />
              </Popover.Content>
            </Popover.Root>

            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
