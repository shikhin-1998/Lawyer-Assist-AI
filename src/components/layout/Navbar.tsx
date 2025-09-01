import React from 'react';
import { Moon, Sun, User } from 'lucide-react';
import { NavbarProps } from './types';

const Navbar: React.FC<NavbarProps> = ({ onThemeToggle, isDarkMode }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Lawyer Assist AI
              </h1>
            </div>
          </div>

          {/* Right side - Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-900 dark:text-white" />
              ) : (
                <Moon className="h-5 w-5 text-gray-900 dark:text-white" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <User className="h-5 w-5 text-gray-900 dark:text-white" />
                <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">
                  John Doe
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
