import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, MoreVertical, MessageSquare } from 'lucide-react';

export interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: Date;
  isActive?: boolean;
}

interface ChatHistoryProps {
  threads: ChatThread[];
  activeThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  onThreadRename: (threadId: string, newTitle: string) => void;
  onThreadDuplicate: (threadId: string) => void;
  onThreadDelete: (threadId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  threads,
  activeThreadId,
  onThreadSelect,
  onNewThread,
  onThreadRename,
  onThreadDuplicate,
  onThreadDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [contextMenu, setContextMenu] = useState<{
    threadId: string;
    x: number;
    y: number;
  } | null>(null);
  const [editingThread, setEditingThread] = useState<{
    threadId: string;
    title: string;
  } | null>(null);
  
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter threads based on search query
  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== searchRef.current) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredThreads.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
          case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filteredThreads.length) {
              onThreadSelect(filteredThreads[selectedIndex].id);
            }
            break;
          case 'Delete':
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filteredThreads.length) {
              onThreadDelete(filteredThreads[selectedIndex].id);
              setSelectedIndex(-1);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredThreads, selectedIndex, onThreadSelect, onThreadDelete]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, threadId: string) => {
    e.preventDefault();
    setContextMenu({ threadId, x: e.clientX, y: e.clientY });
  };

  const handleRename = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setEditingThread({ threadId, title: thread.title });
      setContextMenu(null);
    }
  };

  const handleSaveRename = () => {
    if (editingThread) {
      onThreadRename(editingThread.threadId, editingThread.title);
      setEditingThread(null);
    }
  };

  const handleCancelRename = () => {
    setEditingThread(null);
  };

  const formatTimestamp = (date: Date) => {
    // Ensure date is a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chat History
          </h2>
          <button
            onClick={onNewThread}
            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            title="New Note"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto" ref={listRef}>
        {filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredThreads.map((thread, index) => (
              <div
                key={thread.id}
                className={`relative p-3 rounded-lg cursor-pointer transition-colors ${
                  thread.id === activeThreadId
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                    : selectedIndex === index
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => onThreadSelect(thread.id)}
                onContextMenu={(e) => handleContextMenu(e, thread.id)}
              >
                <div className="flex items-start space-x-3">
                  <MessageSquare className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {editingThread?.threadId === thread.id ? (
                      <input
                        type="text"
                        value={editingThread.title}
                        onChange={(e) => setEditingThread({ ...editingThread, title: e.target.value })}
                        onBlur={handleSaveRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename();
                          if (e.key === 'Escape') handleCancelRename();
                        }}
                        className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent border-none outline-none"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {thread.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {thread.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatTimestamp(thread.lastUpdated)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, thread.id);
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-3 w-3 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            onClick={() => handleRename(contextMenu.threadId)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Rename
          </button>
          <button
            onClick={() => {
              onThreadDuplicate(contextMenu.threadId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              onThreadDelete(contextMenu.threadId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
