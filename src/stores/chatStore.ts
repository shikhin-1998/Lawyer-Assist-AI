import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatThread } from '../components/chat/ChatHistory';

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'assistant';
}

export interface ChatState {
  threads: ChatThread[];
  activeThreadId: string | null;
  currentTranscript: string;
  isRecording: boolean;
}

interface ChatStore extends ChatState {
  // Thread management
  createThread: (title?: string) => string;
  selectThread: (threadId: string) => void;
  updateThread: (threadId: string, updates: Partial<ChatThread>) => void;
  deleteThread: (threadId: string) => void;
  duplicateThread: (threadId: string) => void;
  
  // Transcript management
  updateTranscript: (text: string) => void;
  appendToTranscript: (text: string) => void;
  clearTranscript: () => void;
  
  // Recording state
  setRecordingState: (isRecording: boolean) => void;
  
  // Utility
  getActiveThread: () => ChatThread | null;
  getThreadById: (threadId: string) => ChatThread | null;
}

// Helper function to convert date strings back to Date objects
const convertDates = (threads: any[]): ChatThread[] => {
  return threads.map(thread => ({
    ...thread,
    lastUpdated: new Date(thread.lastUpdated)
  }));
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      threads: [
        {
          id: '1',
          title: 'Contract Review - ABC Corp',
          lastMessage: 'Reviewed the employment agreement terms and conditions...',
          lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: '2',
          title: 'Legal Research - Patent Case',
          lastMessage: 'Analyzed prior art and patent infringement claims...',
          lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: '3',
          title: 'Document Analysis - Merger',
          lastMessage: 'Examined merger agreement and regulatory compliance...',
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      ],
      activeThreadId: null,
      currentTranscript: '',
      isRecording: false,

      createThread: (title = 'New Note') => {
        const newThread: ChatThread = {
          id: Date.now().toString(),
          title,
          lastMessage: 'Start recording or typing to create your note...',
          lastUpdated: new Date(),
        };

        set((state) => ({
          threads: [newThread, ...state.threads],
          activeThreadId: newThread.id,
          currentTranscript: '',
        }));

        return newThread.id;
      },

      selectThread: (threadId: string) => {
        set({ activeThreadId: threadId });
      },

      updateThread: (threadId: string, updates: Partial<ChatThread>) => {
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? { ...thread, ...updates, lastUpdated: new Date() }
              : thread
          ),
        }));
      },

      deleteThread: (threadId: string) => {
        set((state) => {
          const newThreads = state.threads.filter((thread) => thread.id !== threadId);
          const newActiveThreadId = state.activeThreadId === threadId
            ? (newThreads.length > 0 ? newThreads[0].id : null)
            : state.activeThreadId;

          return {
            threads: newThreads,
            activeThreadId: newActiveThreadId,
            currentTranscript: newActiveThreadId === threadId ? '' : state.currentTranscript,
          };
        });
      },

      duplicateThread: (threadId: string) => {
        const originalThread = get().getThreadById(threadId);
        if (originalThread) {
          const newThread: ChatThread = {
            ...originalThread,
            id: Date.now().toString(),
            title: `${originalThread.title} (Copy)`,
            lastUpdated: new Date(),
          };

          set((state) => ({
            threads: [newThread, ...state.threads],
            activeThreadId: newThread.id,
            currentTranscript: '',
          }));
        }
      },

      updateTranscript: (text: string) => {
        set({ currentTranscript: text });
        
        // Update the active thread's last message
        const activeThreadId = get().activeThreadId;
        if (activeThreadId) {
          const lastMessage = text.length > 100 ? text.substring(0, 100) + '...' : text;
          get().updateThread(activeThreadId, { lastMessage });
        }
      },

      appendToTranscript: (text: string) => {
        set((state) => {
          const newTranscript = state.currentTranscript + text;
          
          // Update the active thread's last message
          const activeThreadId = state.activeThreadId;
          if (activeThreadId) {
            const lastMessage = newTranscript.length > 100 
              ? newTranscript.substring(0, 100) + '...' 
              : newTranscript;
            
            // Update thread in the same set operation
            const updatedThreads = state.threads.map((thread) =>
              thread.id === activeThreadId
                ? { ...thread, lastMessage, lastUpdated: new Date() }
                : thread
            );

            return {
              currentTranscript: newTranscript,
              threads: updatedThreads,
            };
          }

          return { currentTranscript: newTranscript };
        });
      },

      clearTranscript: () => {
        set({ currentTranscript: '' });
      },

      setRecordingState: (isRecording: boolean) => {
        set({ isRecording });
      },

      getActiveThread: () => {
        const { threads, activeThreadId } = get();
        return threads.find((thread) => thread.id === activeThreadId) || null;
      },

      getThreadById: (threadId: string) => {
        const { threads } = get();
        return threads.find((thread) => thread.id === threadId) || null;
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert date strings back to Date objects when rehydrating
        if (state && state.threads) {
          state.threads = convertDates(state.threads);
        }
      },
    }
  )
);
