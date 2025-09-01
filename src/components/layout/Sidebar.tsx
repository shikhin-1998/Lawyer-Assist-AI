import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import { SidebarProps } from './types';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const mockChatHistory = [
    { id: 1, title: 'Contract Review - ABC Corp', date: '2024-01-15' },
    { id: 2, title: 'Legal Research - Patent Case', date: '2024-01-14' },
    { id: 3, title: 'Document Analysis - Merger', date: '2024-01-13' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat History
              </h2>
              <button className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {mockChatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {chat.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
