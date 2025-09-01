import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useTemplateStore } from '../stores/templateStore';
import { useToastStore } from '../stores/toastStore';
import ChatHistory from '../components/chat/ChatHistory';
import MicRecorder from '../components/recording/MicRecorder';
import TranscriptArea from '../components/recording/TranscriptArea';
import LegalTemplateView from '../components/template/LegalTemplateView';
import TranscriptPanel from '../components/transcript/TranscriptPanel';
import DocumentPreview from '../components/document/DocumentPreview';
import UploadPdfCard from '../components/upload/UploadPdfCard';
import QuickActions from '../components/dashboard/QuickActions';
import { Menu, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    threads,
    activeThreadId,
    currentTranscript,
    isRecording,
    createThread,
    selectThread,
    updateThread,
    deleteThread,
    duplicateThread,
    updateTranscript,
    appendToTranscript,
    clearTranscript,
    setRecordingState,
  } = useChatStore();
  const {
    templateType,
    sections,
    chunks,
    setTemplateType,
    toggleSection,
    addChunk,
    moveChunk,
    editChunk,
    deleteChunk,
    pinChunk,
    addNote,
    summarizeSection,
  } = useTemplateStore();
  const { addToast } = useToastStore();

  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showUploadPdf, setShowUploadPdf] = useState(false);
  const [viewMode, setViewMode] = useState<'transcript' | 'template'>('transcript');

  // Listen for showUploadPDF event
  useEffect(() => {
    const handleShowUploadPDF = () => {
      setShowUploadPdf(true);
    };

    window.addEventListener('showUploadPDF', handleShowUploadPDF);
    return () => {
      window.removeEventListener('showUploadPDF', handleShowUploadPDF);
    };
  }, []);

  const handleNewThread = () => {
    createThread();
    addToast({
      type: 'success',
      title: 'New note created',
      message: 'Start recording or typing to add content',
    });
  };

  const handleThreadSelect = (threadId: string) => {
    selectThread(threadId);
  };

  const handleThreadRename = (threadId: string, newTitle: string) => {
    updateThread(threadId, { title: newTitle });
    addToast({
      type: 'success',
      title: 'Note renamed',
      message: `Changed to "${newTitle}"`,
    });
  };

  const handleThreadDuplicate = (threadId: string) => {
    duplicateThread(threadId);
    addToast({
      type: 'success',
      title: 'Note duplicated',
      message: 'A copy has been created',
    });
  };

  const handleThreadDelete = (threadId: string) => {
    deleteThread(threadId);
    addToast({
      type: 'info',
      title: 'Note deleted',
      message: 'The note has been removed',
    });
  };

  const handleRecordingStart = () => {
    setRecordingState(true);
    if (!activeThreadId) {
      createThread();
    }
  };

  const handleRecordingStop = () => {
    setRecordingState(false);
  };

  const handleRecordingChunk = (text: string) => {
    appendToTranscript(text);
    // Also add to template chunks for real-time processing
    addChunk(text);
  };

  const handleRecordingError = (error: string) => {
    addToast({
      type: 'error',
      title: 'Recording error',
      message: error,
    });
  };

  const handleClear = () => {
    clearTranscript();
    addToast({
      type: 'info',
      title: 'Transcript cleared',
      message: 'The transcript has been cleared',
    });
  };

  const handleInsertTimestamp = () => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    appendToTranscript(`\n[${timestamp}] `);
  };

  const handleSaveDraft = () => {
    addToast({
      type: 'success',
      title: 'Draft saved',
      message: 'Your note has been saved as a draft',
    });
  };

  const handleUploadPDF = () => {
    setShowUploadPdf(true);
  };

  const handleOpenLastDocument = () => {
    addToast({
      type: 'info',
      title: 'Open Last Document',
      message: 'Document opening functionality will be implemented next',
    });
  };

  const handleOpenSettings = () => {
    addToast({
      type: 'info',
      title: 'Settings',
      message: 'Settings panel will be implemented next',
    });
  };

  const handleFinalizeDocument = () => {
    setShowDocumentPreview(true);
  };

  const handleDownloadDocument = () => {
    const content = sections
      .filter(section => section.chunks.length > 0)
      .map(section => {
        return `${section.title}:\n${section.chunks.map(chunk => `- ${chunk.text}`).join('\n')}`;
      })
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-document-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Document downloaded',
      message: 'Your legal document has been saved',
    });
  };

  const handleCopyDocument = async () => {
    const content = sections
      .filter(section => section.chunks.length > 0)
      .map(section => {
        return `${section.title}:\n${section.chunks.map(chunk => `- ${chunk.text}`).join('\n')}`;
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(content);
      addToast({
        type: 'success',
        title: 'Document copied',
        message: 'Content copied to clipboard',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Copy failed',
        message: 'Failed to copy to clipboard',
      });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar - Chat History */}
      <div className={`${showLeftSidebar ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out flex-shrink-0`}>
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <ChatHistory
            threads={threads}
            activeThreadId={activeThreadId || undefined}
            onThreadSelect={handleThreadSelect}
            onNewThread={handleNewThread}
            onThreadRename={handleThreadRename}
            onThreadDuplicate={handleThreadDuplicate}
            onThreadDelete={handleThreadDelete}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {showLeftSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeThreadId ? 'Note Editor' : 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {showRightSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            {activeThreadId ? (
              <div className="space-y-6">
                {/* View Mode Toggle */}
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setViewMode('transcript')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'transcript'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Transcript View
                  </button>
                  <button
                    onClick={() => setViewMode('template')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'template'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Template View
                  </button>
                </div>

                {/* Microphone Recording Control */}
                <MicRecorder
                  onStart={handleRecordingStart}
                  onStop={handleRecordingStop}
                  onChunk={handleRecordingChunk}
                  onError={handleRecordingError}
                  onClear={handleClear}
                  onInsertTimestamp={handleInsertTimestamp}
                  onSaveDraft={handleSaveDraft}
                />

                {/* Content Area */}
                {viewMode === 'transcript' ? (
                  <div className="space-y-6">
                    <TranscriptArea
                      transcript={currentTranscript}
                      isRecording={isRecording}
                      onEdit={updateTranscript}
                      onSave={handleSaveDraft}
                    />
                    <TranscriptPanel
                      chunks={chunks}
                      onChunkEdit={editChunk}
                      onChunkDelete={deleteChunk}
                      onChunkPin={pinChunk}
                      onFinalizeDocument={handleFinalizeDocument}
                      isRecording={isRecording}
                    />
                  </div>
                ) : (
                  <LegalTemplateView
                    templateType={templateType}
                    onTemplateTypeChange={setTemplateType}
                    sections={sections}
                    onSectionToggle={toggleSection}
                    onChunkMove={moveChunk}
                    onAddNote={addNote}
                    onSummarizeSection={summarizeSection}
                    onEditChunk={editChunk}
                    onDeleteChunk={deleteChunk}
                    onPinChunk={pinChunk}
                  />
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Welcome to Your Notebook
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Select a note from the sidebar or create a new one to get started
                  </p>
                  <button
                    onClick={handleNewThread}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Note
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Quick Actions */}
          {showRightSidebar && (
            <QuickActions
              onUploadPDF={handleUploadPDF}
              onOpenLastDocument={handleOpenLastDocument}
              onOpenSettings={handleOpenSettings}
            />
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {showDocumentPreview && (
        <DocumentPreview
          sections={sections}
          templateType={templateType}
          onClose={() => setShowDocumentPreview(false)}
          onDownload={handleDownloadDocument}
          onCopy={handleCopyDocument}
        />
      )}

      {/* PDF Upload Modal */}
      {showUploadPdf && (
        <UploadPdfCard onClose={() => setShowUploadPdf(false)} />
      )}
    </div>
  );
};

export default Dashboard;
