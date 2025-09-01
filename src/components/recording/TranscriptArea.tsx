import React, { useState, useEffect, useRef } from 'react';
import { FileText, Copy, Download, Edit3 } from 'lucide-react';

interface TranscriptAreaProps {
  transcript: string;
  isRecording: boolean;
  onEdit?: (text: string) => void;
  onSave?: () => void;
}

const TranscriptArea: React.FC<TranscriptAreaProps> = ({
  transcript,
  isRecording,
  onEdit,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(transcript);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Update edited text when transcript changes
  useEffect(() => {
    setEditedText(transcript);
  }, [transcript]);

  // Auto-scroll to bottom when new text is added
  useEffect(() => {
    if (transcriptRef.current && isRecording) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, isRecording]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onEdit?.(editedText);
    onSave?.();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText(transcript);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transcript to Template
          </h3>
          {isRecording && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Live
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleEdit}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span className="text-sm">Copy</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">Download</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Start typing or recording to see your transcript here..."
          />
        ) : (
          <div
            ref={transcriptRef}
            className="h-64 overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
          >
            {transcript ? (
              <div className="space-y-2">
                {transcript.split('\n').map((line, index) => (
                  <p key={index} className="text-gray-900 dark:text-white leading-relaxed">
                    {line}
                  </p>
                ))}
                {isRecording && (
                  <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse"></span>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Start recording to see your transcript here...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            {transcript.length} characters
          </span>
          <span>
            Last updated: {formatTimestamp()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TranscriptArea;
