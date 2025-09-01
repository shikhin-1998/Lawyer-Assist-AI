import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../stores/documentStore';
import { useReferenceStore } from '../stores/referenceStore';
import { useToastStore } from '../stores/toastStore';
import PdfViewer from '../components/pdf/PdfViewer';
import SummaryPanel from '../components/pdf/SummaryPanel';
import QaPanel from '../components/pdf/QaPanel';
import { DocumentReference } from '../stores/documentStore';
import { mockRag } from '../services/mockServices';
import { ChevronLeft, ChevronRight, FileText, MessageSquare, X } from 'lucide-react';

const DocumentWorkspace: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getDocumentById, setCurrentDocument, generateMockSummary } = useDocumentStore();
  const { jumpToRef, getReferencesByDoc, activateReference, clearActiveReferences } = useReferenceStore();
  const { addToast } = useToastStore();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [highlightMode, setHighlightMode] = useState(true);
  const [currentReference, setCurrentReference] = useState<DocumentReference | undefined>();
  const [activeTab, setActiveTab] = useState<'summary' | 'qa'>('summary');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  // Resizable panes
  const [leftPaneWidth, setLeftPaneWidth] = useState(300);
  const [rightPaneWidth, setRightPaneWidth] = useState(350);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  const document = getDocumentById(docId || '');
  const refId = searchParams.get('ref');

  // Handle deep linking
  useEffect(() => {
    if (refId && document?.summary) {
      const reference = document.summary.references.find(ref => ref.id === refId);
      if (reference) {
        setCurrentReference(reference);
        setCurrentPage(reference.page);
        activateReference(reference.id);
        addToast({
          type: 'info',
          title: 'Reference Found',
          message: `Navigated to reference ${refId}`,
        });
      }
    }
  }, [refId, document, addToast, activateReference]);

  // Set current document
  useEffect(() => {
    if (document) {
      setCurrentDocument(document);
    }
  }, [document, setCurrentDocument]);

  // Listen for jumpToReference events
  useEffect(() => {
    const handleJumpToReference = (event: CustomEvent) => {
      const { reference } = event.detail;
      setCurrentReference(reference);
      setCurrentPage(reference.page);
    };

    const handleClearHighlights = () => {
      clearActiveReferences();
      setCurrentReference(undefined);
    };

    window.addEventListener('jumpToReference', handleJumpToReference as EventListener);
    window.addEventListener('clearHighlights', handleClearHighlights);

    return () => {
      window.removeEventListener('jumpToReference', handleJumpToReference as EventListener);
      window.removeEventListener('clearHighlights', handleClearHighlights);
    };
  }, [clearActiveReferences]);

  // Handle pane resizing
  const handleMouseDown = (e: React.MouseEvent, pane: 'left' | 'right') => {
    e.preventDefault();
    if (pane === 'left') {
      setIsDraggingLeft(true);
    } else {
      setIsDraggingRight(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setLeftPaneWidth(newWidth);
      }
      if (isDraggingRight) {
        const newWidth = Math.max(250, Math.min(600, window.innerWidth - e.clientX));
        setRightPaneWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };

    if (isDraggingLeft || isDraggingRight) {
      window.document.addEventListener('mousemove', handleMouseMove);
      window.document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.document.removeEventListener('mousemove', handleMouseMove);
      window.document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight]);

  const handleReferenceClick = (reference: DocumentReference) => {
    setCurrentReference(reference);
    setCurrentPage(reference.page);
    activateReference(reference.id);
    
    // Update URL with reference
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('ref', reference.id);
    setSearchParams(newSearchParams);
  };

  const handleGenerateSummary = async () => {
    if (!docId) return;
    
    setIsGeneratingSummary(true);
    try {
      await generateMockSummary(docId);
      addToast({
        type: 'success',
        title: 'Summary Generated',
        message: 'Document summary has been created successfully.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate summary. Please try again.',
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleAskQuestion = async (question: string) => {
    if (!docId) throw new Error('No document ID');
    
    const result = await mockRag.askQuestion(question, docId);
    
    return {
      id: `qa_${Date.now()}`,
      question,
      answer: result.answer,
      references: result.references,
      confidence: result.confidence,
      timestamp: new Date(),
    };
  };

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Document Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The document you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Mock PDF URL - in real app, this would be the actual PDF file
  const pdfUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

  // Get references for this document
  const documentReferences = docId ? getReferencesByDoc(docId) : [];

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Pane - Page Thumbnails & References */}
      <div
        className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
        style={{ width: leftPaneWidth }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {document.name}
            </h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {document.pages} pages • {new Date(document.uploadedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'summary'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            References
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'qa'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Q&A
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'summary' ? (
            <div className="p-4">
              {document.summary ? (
                <div className="space-y-3">
                  {document.summary.references.map((reference) => (
                    <div
                      key={reference.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentReference?.id === reference.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleReferenceClick(reference)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Ref #{reference.id.replace('ref', '')}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Page {reference.page}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {reference.snippet}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {reference.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No references available. Generate a summary to see references.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <QaPanel
              onReferenceClick={handleReferenceClick}
              onAskQuestion={handleAskQuestion}
            />
          )}
        </div>
      </div>

      {/* Left Resize Handle */}
      <div
        className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors"
        onMouseDown={(e) => handleMouseDown(e, 'left')}
      />

      {/* Center Pane - PDF Viewer */}
      <div className="flex-1 flex flex-col">
        <PdfViewer
          url={pdfUrl}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          zoom={zoom}
          onZoomChange={setZoom}
          references={document.summary?.references || []}
          currentReference={currentReference}
          onReferenceChange={setCurrentReference}
          highlightMode={highlightMode}
          onHighlightModeChange={setHighlightMode}
        />
      </div>

      {/* Right Resize Handle */}
      <div
        className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize transition-colors"
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />

      {/* Right Pane - Summary */}
      <div
        className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700"
        style={{ width: rightPaneWidth }}
      >
        <SummaryPanel
          summary={document.summary}
          onReferenceClick={handleReferenceClick}
          onGenerateSummary={handleGenerateSummary}
          isLoading={isGeneratingSummary}
        />
      </div>
    </div>
  );
};

export default DocumentWorkspace;
