import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, FileText, GripVertical, Edit, Trash2, X } from 'lucide-react';

export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: Date;
  section: string;
  isPinned?: boolean;
}

export interface TemplateSection {
  id: string;
  title: string;
  chunks: TranscriptChunk[];
  isCollapsed: boolean;
}

export type TemplateType = 'intake' | 'petition-draft' | 'hearing-notes';

interface LegalTemplateViewProps {
  templateType: TemplateType;
  onTemplateTypeChange: (type: TemplateType) => void;
  sections: TemplateSection[];
  onSectionToggle: (sectionId: string) => void;
  onChunkMove: (chunkId: string, fromSection: string, toSection: string) => void;
  onAddNote: (sectionId: string, text: string) => void;
  onSummarizeSection: (sectionId: string) => void;
  onEditChunk: (chunkId: string, newText: string) => void;
  onDeleteChunk: (chunkId: string) => void;
  onPinChunk: (chunkId: string) => void;
}

const LegalTemplateView: React.FC<LegalTemplateViewProps> = ({
  templateType,
  onTemplateTypeChange,
  sections,
  onSectionToggle,
  onChunkMove,
  onAddNote,
  onSummarizeSection,
  onEditChunk,
  onDeleteChunk,
  onPinChunk,
}) => {
  const [draggedChunk, setDraggedChunk] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [addingNote, setAddingNote] = useState<{ sectionId: string; text: string } | null>(null);
  const [editingChunk, setEditingChunk] = useState<{ id: string; text: string } | null>(null);

  const templateOptions = [
    { value: 'intake', label: 'Intake' },
    { value: 'petition-draft', label: 'Petition Draft' },
    { value: 'hearing-notes', label: 'Hearing Notes' },
  ];

  const handleDragStart = (e: React.DragEvent, chunkId: string) => {
    setDraggedChunk(chunkId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDragOverSection(sectionId);
  };

  const handleDragLeave = () => {
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (draggedChunk) {
      const sourceSection = sections.find(section => 
        section.chunks.some(chunk => chunk.id === draggedChunk)
      );
      if (sourceSection && sourceSection.id !== targetSectionId) {
        onChunkMove(draggedChunk, sourceSection.id, targetSectionId);
      }
    }
    setDraggedChunk(null);
    setDragOverSection(null);
  };

  const handleAddNoteClick = (sectionId: string) => {
    setAddingNote({ sectionId, text: '' });
  };

  const handleSaveNote = () => {
    if (addingNote && addingNote.text.trim()) {
      onAddNote(addingNote.sectionId, addingNote.text.trim());
      setAddingNote(null);
    }
  };

  const handleCancelNote = () => {
    setAddingNote(null);
  };

  const handleEditClick = (chunk: TranscriptChunk) => {
    setEditingChunk({ id: chunk.id, text: chunk.text });
  };

  const handleSaveEdit = () => {
    if (editingChunk && editingChunk.text.trim()) {
      onEditChunk(editingChunk.id, editingChunk.text.trim());
      setEditingChunk(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingChunk(null);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Legal Template
            </h2>
            <select
              value={templateType}
              onChange={(e) => onTemplateTypeChange(e.target.value as TemplateType)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {templateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Template: {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sections */}
        <div className="p-4 space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`border border-gray-200 dark:border-gray-600 rounded-lg ${
                dragOverSection === section.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSectionToggle(section.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {section.isCollapsed ? (
                      <ChevronRight className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {section.chunks.length}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAddNoteClick(section.id)}
                    className="flex items-center space-x-1 px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Note</span>
                  </button>
                  <button
                    onClick={() => onSummarizeSection(section.id)}
                    className="flex items-center space-x-1 px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Summarize</span>
                  </button>
                </div>
              </div>

              {/* Section Content */}
              {!section.isCollapsed && (
                <div className="p-3 space-y-2">
                  {section.chunks.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                      No content yet. Drag transcript chunks here or add a note.
                    </p>
                  ) : (
                    section.chunks.map((chunk) => (
                      <div
                        key={chunk.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, chunk.id)}
                        className={`group relative p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors ${
                          draggedChunk === chunk.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <GripVertical className="h-4 w-4 text-gray-400 mt-0.5 cursor-move" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {chunk.text}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTimestamp(chunk.timestamp)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {chunk.isPinned && (
                              <span className="px-1 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                Pinned
                              </span>
                            )}
                            <button
                              onClick={() => onPinChunk(chunk.id)}
                              className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                              title={chunk.isPinned ? 'Unpin' : 'Pin'}
                            >
                              <FileText className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleEditClick(chunk)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onDeleteChunk(chunk.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Note Modal */}
      {addingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Note
              </h3>
              <button
                onClick={handleCancelNote}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <textarea
                value={addingNote.text}
                onChange={(e) => setAddingNote({ ...addingNote, text: e.target.value })}
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your note..."
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancelNote}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingChunk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Content
              </h3>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <textarea
                value={editingChunk.text}
                onChange={(e) => setEditingChunk({ ...editingChunk, text: e.target.value })}
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Edit the content..."
                autoFocus
              />
            </div>
            
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LegalTemplateView;
