import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Edit, Pin, Trash2, FileText, Clock, X } from 'lucide-react';
import { TranscriptChunk } from '../template/LegalTemplateView';

interface TranscriptPanelProps {
  chunks: TranscriptChunk[];
  onChunkEdit: (chunkId: string, newText: string) => void;
  onChunkDelete: (chunkId: string) => void;
  onChunkPin: (chunkId: string) => void;
  onFinalizeDocument: () => void;
  isRecording: boolean;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  chunks,
  onChunkEdit,
  onChunkDelete,
  onChunkPin,
  onFinalizeDocument,
  isRecording,
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [editingChunk, setEditingChunk] = useState<{ id: string; text: string } | null>(null);
  const [editText, setEditText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const lastChunkRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && containerRef.current && lastChunkRef.current) {
      const container = containerRef.current;
      const lastChunk = lastChunkRef.current;
      
      // Only auto-scroll if we're near the bottom
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
      
      if (isNearBottom) {
        lastChunk.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [chunks, autoScroll]);

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
      setAutoScroll(isNearBottom);
    }
  };

  const handleEditClick = (chunk: TranscriptChunk) => {
    setEditingChunk({ id: chunk.id, text: chunk.text });
    setEditText(chunk.text);
  };

  const handleSaveEdit = () => {
    if (editingChunk && editText.trim()) {
      onChunkEdit(editingChunk.id, editText.trim());
      setEditingChunk(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingChunk(null);
    setEditText('');
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSectionBadgeColor = (section: string) => {
    const colors: { [key: string]: string } = {
      'client-details': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'case-summary': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'facts': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'issues': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'applicable-law': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'arguments': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'evidence': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'risks': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'next-steps': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'unassigned': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[section] || colors['unassigned'];
  };

  const getSectionDisplayName = (section: string) => {
    const names: { [key: string]: string } = {
      'client-details': 'Client Details',
      'case-summary': 'Case Summary',
      'facts': 'Facts',
      'issues': 'Issues',
      'applicable-law': 'Applicable Law',
      'arguments': 'Arguments',
      'evidence': 'Evidence',
      'risks': 'Risks',
      'next-steps': 'Next Steps',
      'unassigned': 'Unassigned',
    };
    return names[section] || 'Unassigned';
  };

  // Count chunks per section
  const sectionCounts = chunks.reduce((acc, chunk) => {
    acc[chunk.section] = (acc[chunk.section] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transcript Stream
              </h2>
              {isRecording && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 dark:text-red-400">Live</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onFinalizeDocument}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Finalize to Document</span>
              </button>
            </div>
          </div>

          {/* Section Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(sectionCounts).map(([section, count]) => (
              <div
                key={section}
                className={`px-2 py-1 text-xs rounded-full ${getSectionBadgeColor(section)}`}
              >
                {getSectionDisplayName(section)}: {count}
              </div>
            ))}
          </div>
        </div>

        {/* Transcript Tiles */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-96 overflow-y-auto p-4 space-y-3"
        >
          {chunks.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Start recording to see transcript tiles here
              </p>
            </div>
          ) : (
            chunks.map((chunk, index) => (
              <div
                key={chunk.id}
                ref={index === chunks.length - 1 ? lastChunkRef : null}
                className={`group relative p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors ${
                  chunk.isPinned ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSectionBadgeColor(chunk.section)}`}>
                        {getSectionDisplayName(chunk.section)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(chunk.timestamp)}
                      </span>
                      {chunk.isPinned && (
                        <span className="px-1 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {chunk.text}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onChunkPin(chunk.id)}
                      className="p-1 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                      title={chunk.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={`h-3 w-3 ${chunk.isPinned ? 'text-yellow-600 dark:text-yellow-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleEditClick(chunk)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onChunkDelete(chunk.id)}
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
          
          {/* Auto-scroll indicator */}
          {!autoScroll && (
            <div className="text-center py-2">
              <button
                onClick={() => setAutoScroll(true)}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Auto-scroll off - Click to resume
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingChunk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Transcript
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
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Edit the transcript text..."
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

export default TranscriptPanel;
