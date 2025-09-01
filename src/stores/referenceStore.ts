import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reference {
  id: string;
  docId: string;
  page: number;
  bbox: [number, number, number, number]; // [x, y, width, height] normalized 0..1
  snippet: string;
  text: string;
  createdAt: Date;
}

interface ReferenceState {
  references: Reference[];
  activeReferences: Set<string>;
}

interface ReferenceStore extends ReferenceState {
  // Reference management
  addReference: (reference: Omit<Reference, 'id' | 'createdAt'>) => string;
  getReferenceById: (id: string) => Reference | null;
  getReferencesByDoc: (docId: string) => Reference[];
  deleteReference: (id: string) => void;
  clearReferencesByDoc: (docId: string) => void;

  // Navigation
  jumpToRef: (id: string) => void;
  activateReference: (id: string) => void;
  deactivateReference: (id: string) => void;
  clearActiveReferences: () => void;
  getActiveReferences: () => Reference[];
}

export const useReferenceStore = create<ReferenceStore>()(
  persist(
    (set, get) => ({
      references: [],
      activeReferences: new Set(),

      addReference: (referenceData) => {
        const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const reference: Reference = {
          ...referenceData,
          id,
          createdAt: new Date(),
        };

        set((state) => ({
          references: [...state.references, reference],
        }));

        return id;
      },

      getReferenceById: (id: string) => {
        const { references } = get();
        return references.find(ref => ref.id === id) || null;
      },

      getReferencesByDoc: (docId: string) => {
        const { references } = get();
        return references.filter(ref => ref.docId === docId);
      },

      deleteReference: (id: string) => {
        set((state) => ({
          references: state.references.filter(ref => ref.id !== id),
          activeReferences: new Set(Array.from(state.activeReferences).filter(refId => refId !== id)),
        }));
      },

      clearReferencesByDoc: (docId: string) => {
        set((state) => {
          const refsToRemove = state.references.filter(ref => ref.docId === docId);
          const refIdsToRemove = new Set(refsToRemove.map(ref => ref.id));
          
          return {
            references: state.references.filter(ref => ref.docId !== docId),
            activeReferences: new Set(Array.from(state.activeReferences).filter(refId => !refIdsToRemove.has(refId))),
          };
        });
      },

      jumpToRef: (id: string) => {
        const reference = get().getReferenceById(id);
        if (reference) {
          // This will be handled by the PdfViewer component
          // We just activate the reference here
          get().activateReference(id);
          
          // Dispatch a custom event that PdfViewer can listen to
          window.dispatchEvent(new CustomEvent('jumpToReference', {
            detail: { reference }
          }));
        }
      },

      activateReference: (id: string) => {
        set((state) => ({
          activeReferences: new Set(Array.from(state.activeReferences).concat([id])),
        }));
      },

      deactivateReference: (id: string) => {
        set((state) => {
          const newActive = new Set(Array.from(state.activeReferences));
          newActive.delete(id);
          return { activeReferences: newActive };
        });
      },

      clearActiveReferences: () => {
        set({ activeReferences: new Set() });
      },

      getActiveReferences: () => {
        const { references, activeReferences } = get();
        return references.filter(ref => activeReferences.has(ref.id));
      },
    }),
    {
      name: 'reference-storage',
      version: 1,
      partialize: (state) => ({
        references: state.references,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert date strings back to Date objects when rehydrating
        if (state && state.references) {
          state.references = state.references.map(ref => ({
            ...ref,
            createdAt: new Date(ref.createdAt)
          }));
        }
      },
    }
  )
);
