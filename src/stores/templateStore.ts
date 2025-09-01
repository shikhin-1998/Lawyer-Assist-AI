import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TranscriptChunk, TemplateSection, TemplateType } from '../components/template/LegalTemplateView';

interface TemplateState {
  templateType: TemplateType;
  sections: TemplateSection[];
  chunks: TranscriptChunk[];
  currentChunkBuffer: string;
}

interface TemplateStore extends TemplateState {
  // Template management
  setTemplateType: (type: TemplateType) => void;
  toggleSection: (sectionId: string) => void;
  
  // Chunk management
  addChunk: (text: string) => void;
  moveChunk: (chunkId: string, fromSection: string, toSection: string) => void;
  editChunk: (chunkId: string, newText: string) => void;
  deleteChunk: (chunkId: string) => void;
  pinChunk: (chunkId: string) => void;
  
  // Section actions
  addNote: (sectionId: string, text: string) => void;
  summarizeSection: (sectionId: string) => void;
  
  // Utility
  getChunksBySection: (sectionId: string) => TranscriptChunk[];
  clearAllChunks: () => void;
}

// Rule-based assignment function
const assignChunkToSection = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  // Client details
  if (lowerText.includes('client:') || lowerText.includes('name:') || 
      lowerText.includes('contact:') || lowerText.includes('phone:') ||
      lowerText.includes('email:') || lowerText.includes('address:')) {
    return 'client-details';
  }
  
  // Case summary
  if (lowerText.includes('summary:') || lowerText.includes('overview:') ||
      lowerText.includes('case involves') || lowerText.includes('matter concerns')) {
    return 'case-summary';
  }
  
  // Facts
  if (lowerText.includes('fact:') || lowerText.includes('occurred on') ||
      lowerText.includes('happened') || lowerText.includes('incident') ||
      lowerText.includes('event')) {
    return 'facts';
  }
  
  // Issues
  if (lowerText.includes('issue:') || lowerText.includes('problem:') ||
      lowerText.includes('concern:') || lowerText.includes('question:') ||
      lowerText.includes('legal issue')) {
    return 'issues';
  }
  
  // Applicable law
  if (lowerText.includes('law:') || lowerText.includes('statute:') ||
      lowerText.includes('regulation:') || lowerText.includes('code:') ||
      lowerText.includes('legal authority') || lowerText.includes('case law')) {
    return 'applicable-law';
  }
  
  // Arguments
  if (lowerText.includes('argument:') || lowerText.includes('position:') ||
      lowerText.includes('contend') || lowerText.includes('assert') ||
      lowerText.includes('claim')) {
    return 'arguments';
  }
  
  // Evidence
  if (lowerText.includes('evidence:') || lowerText.includes('document:') ||
      lowerText.includes('witness:') || lowerText.includes('testimony') ||
      lowerText.includes('exhibit')) {
    return 'evidence';
  }
  
  // Risks
  if (lowerText.includes('risk:') || lowerText.includes('liability:') ||
      lowerText.includes('exposure') || lowerText.includes('damage') ||
      lowerText.includes('penalty')) {
    return 'risks';
  }
  
  // Next steps
  if (lowerText.includes('next step:') || lowerText.includes('action:') ||
      lowerText.includes('task:') || lowerText.includes('deadline:') ||
      lowerText.includes('follow up')) {
    return 'next-steps';
  }
  
  // Default to unassigned
  return 'unassigned';
};

// Initialize default sections
const getDefaultSections = (): TemplateSection[] => [
  { id: 'client-details', title: 'Client Details', chunks: [], isCollapsed: false },
  { id: 'case-summary', title: 'Case Summary', chunks: [], isCollapsed: false },
  { id: 'facts', title: 'Facts', chunks: [], isCollapsed: false },
  { id: 'issues', title: 'Issues', chunks: [], isCollapsed: false },
  { id: 'applicable-law', title: 'Applicable Law', chunks: [], isCollapsed: false },
  { id: 'arguments', title: 'Arguments', chunks: [], isCollapsed: false },
  { id: 'evidence', title: 'Evidence', chunks: [], isCollapsed: false },
  { id: 'risks', title: 'Risks', chunks: [], isCollapsed: false },
  { id: 'next-steps', title: 'Next Steps / Tasks', chunks: [], isCollapsed: false },
  { id: 'unassigned', title: 'Unassigned', chunks: [], isCollapsed: false },
];

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templateType: 'intake',
      sections: getDefaultSections(),
      chunks: [],
      currentChunkBuffer: '',

      setTemplateType: (type: TemplateType) => {
        set({ templateType: type });
      },

      toggleSection: (sectionId: string) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, isCollapsed: !section.isCollapsed }
              : section
          ),
        }));
      },

      addChunk: (text: string) => {
        const chunk: TranscriptChunk = {
          id: Date.now().toString(),
          text: text.trim(),
          timestamp: new Date(),
          section: assignChunkToSection(text),
          isPinned: false,
        };

        set((state) => ({
          chunks: [...state.chunks, chunk],
          sections: state.sections.map((section) =>
            section.id === chunk.section
              ? { ...section, chunks: [...section.chunks, chunk] }
              : section
          ),
        }));
      },

      moveChunk: (chunkId: string, fromSection: string, toSection: string) => {
        set((state) => {
          const chunk = state.chunks.find(c => c.id === chunkId);
          if (!chunk) return state;

          const updatedChunk = { ...chunk, section: toSection };

          return {
            chunks: state.chunks.map(c => c.id === chunkId ? updatedChunk : c),
            sections: state.sections.map((section) => {
              if (section.id === fromSection) {
                return { ...section, chunks: section.chunks.filter(c => c.id !== chunkId) };
              } else if (section.id === toSection) {
                return { ...section, chunks: [...section.chunks, updatedChunk] };
              }
              return section;
            }),
          };
        });
      },

      editChunk: (chunkId: string, newText: string) => {
        set((state) => ({
          chunks: state.chunks.map((chunk) =>
            chunk.id === chunkId ? { ...chunk, text: newText } : chunk
          ),
          sections: state.sections.map((section) => ({
            ...section,
            chunks: section.chunks.map((chunk) =>
              chunk.id === chunkId ? { ...chunk, text: newText } : chunk
            ),
          })),
        }));
      },

      deleteChunk: (chunkId: string) => {
        set((state) => ({
          chunks: state.chunks.filter(c => c.id !== chunkId),
          sections: state.sections.map((section) => ({
            ...section,
            chunks: section.chunks.filter(c => c.id !== chunkId),
          })),
        }));
      },

      pinChunk: (chunkId: string) => {
        set((state) => ({
          chunks: state.chunks.map((chunk) =>
            chunk.id === chunkId ? { ...chunk, isPinned: !chunk.isPinned } : chunk
          ),
          sections: state.sections.map((section) => ({
            ...section,
            chunks: section.chunks.map((chunk) =>
              chunk.id === chunkId ? { ...chunk, isPinned: !chunk.isPinned } : chunk
            ),
          })),
        }));
      },

      addNote: (sectionId: string, text: string) => {
        const note: TranscriptChunk = {
          id: Date.now().toString(),
          text: text.trim(),
          timestamp: new Date(),
          section: sectionId,
          isPinned: false,
        };

        set((state) => ({
          chunks: [...state.chunks, note],
          sections: state.sections.map((section) =>
            section.id === sectionId
              ? { ...section, chunks: [...section.chunks, note] }
              : section
          ),
        }));
      },

      summarizeSection: (sectionId: string) => {
        // Mock summarization - in real app, this would call an AI service
        const section = get().sections.find(s => s.id === sectionId);
        if (section && section.chunks.length > 0) {
          const summaryText = `Summary of ${section.title}: ${section.chunks.length} items collected. Key points include: ${section.chunks.slice(0, 3).map(c => c.text.substring(0, 50)).join('; ')}...`;
          
          const summary: TranscriptChunk = {
            id: Date.now().toString(),
            text: summaryText,
            timestamp: new Date(),
            section: sectionId,
            isPinned: true,
          };

          set((state) => ({
            chunks: [...state.chunks, summary],
            sections: state.sections.map((s) =>
              s.id === sectionId
                ? { ...s, chunks: [...s.chunks, summary] }
                : s
            ),
          }));
        }
      },

      getChunksBySection: (sectionId: string) => {
        return get().chunks.filter(chunk => chunk.section === sectionId);
      },

      clearAllChunks: () => {
        set((state) => ({
          chunks: [],
          sections: state.sections.map((section) => ({ ...section, chunks: [] })),
        }));
      },
    }),
    {
      name: 'template-storage',
      partialize: (state) => ({
        templateType: state.templateType,
        sections: state.sections,
        chunks: state.chunks,
      }),
    }
  )
);
