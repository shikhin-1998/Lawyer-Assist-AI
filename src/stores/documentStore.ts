import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Document {
  id: string;
  name: string;
  size: number;
  thumbnail?: string;
  uploadedAt: Date;
  pages: number;
  summary?: DocumentSummary;
  references?: DocumentReference[];
}

export interface DocumentSummary {
  id: string;
  text: string;
  confidence: number;
  references: DocumentReference[];
}

export interface DocumentReference {
  id: string;
  page: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  snippet: string;
  text: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
}

interface DocumentStore extends DocumentState {
  addDocument: (document: Document) => void;
  setCurrentDocument: (document: Document | null) => void;
  getDocumentById: (id: string) => Document | null;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  generateMockSummary: (documentId: string) => Promise<DocumentSummary>;
}

// Mock summary generator
const generateMockSummary = async (documentId: string): Promise<DocumentSummary> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockSummaries = [
    {
      text: "This legal document outlines the terms and conditions for employment agreement between parties. Key provisions include non-compete clauses, intellectual property rights, and termination procedures.",
      references: [
        { id: 'ref1', page: 1, bbox: [100, 150, 300, 50] as [number, number, number, number], snippet: "Employment Agreement", text: "This Employment Agreement..." },
        { id: 'ref2', page: 2, bbox: [80, 200, 250, 40] as [number, number, number, number], snippet: "Non-compete clause", text: "Employee agrees not to..." },
        { id: 'ref3', page: 3, bbox: [120, 100, 280, 60] as [number, number, number, number], snippet: "Termination procedures", text: "Either party may terminate..." }
      ]
    },
    {
      text: "The contract establishes service delivery standards, payment terms, and dispute resolution mechanisms. Important deadlines and deliverables are clearly defined.",
      references: [
        { id: 'ref4', page: 1, bbox: [90, 180, 320, 45] as [number, number, number, number], snippet: "Service Agreement", text: "Service Provider shall..." },
        { id: 'ref5', page: 2, bbox: [110, 120, 290, 55] as [number, number, number, number], snippet: "Payment Terms", text: "Payment shall be made..." },
        { id: 'ref6', page: 4, bbox: [95, 160, 310, 50] as [number, number, number, number], snippet: "Dispute Resolution", text: "Any disputes arising..." }
      ]
    },
    {
      text: "This patent application describes a novel method for data processing with claims covering system architecture and implementation details.",
      references: [
        { id: 'ref7', page: 1, bbox: [85, 140, 330, 60] as [number, number, number, number], snippet: "Patent Application", text: "We claim a method..." },
        { id: 'ref8', page: 2, bbox: [100, 90, 300, 70] as [number, number, number, number], snippet: "System Architecture", text: "The system comprises..." },
        { id: 'ref9', page: 3, bbox: [115, 130, 285, 55] as [number, number, number, number], snippet: "Implementation Details", text: "The method includes..." }
      ]
    }
  ];
  
  const randomSummary = mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
  
  return {
    id: `summary_${documentId}`,
    text: randomSummary.text,
    confidence: 0.85 + Math.random() * 0.1, // 85-95% confidence
    references: randomSummary.references,
  };
};

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      documents: [],
      currentDocument: null,

      addDocument: (document: Document) => {
        set((state) => ({
          documents: [document, ...state.documents],
        }));
      },

      setCurrentDocument: (document: Document | null) => {
        set({ currentDocument: document });
      },

      getDocumentById: (id: string) => {
        const { documents } = get();
        return documents.find(doc => doc.id === id) || null;
      },

      updateDocument: (id: string, updates: Partial<Document>) => {
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, ...updates } : doc
          ),
          currentDocument: state.currentDocument?.id === id 
            ? { ...state.currentDocument, ...updates }
            : state.currentDocument,
        }));
      },

      deleteDocument: (id: string) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
          currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
        }));
      },

      generateMockSummary: async (documentId: string) => {
        const summary = await generateMockSummary(documentId);
        get().updateDocument(documentId, { summary });
        return summary;
      },
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        documents: state.documents,
      }),
    }
  )
);
