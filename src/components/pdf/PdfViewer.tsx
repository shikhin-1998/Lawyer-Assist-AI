import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, RotateCw } from 'lucide-react';
import { DocumentReference } from '../../stores/documentStore';
import { useReferenceStore } from '../../stores/referenceStore';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  references: DocumentReference[];
  currentReference?: DocumentReference;
  onReferenceChange: (reference?: DocumentReference) => void;
  highlightMode: boolean;
  onHighlightModeChange: (enabled: boolean) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  url,
  currentPage,
  onPageChange,
  zoom,
  onZoomChange,
  references,
  currentReference,
  onReferenceChange,
  highlightMode,
  onHighlightModeChange,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { getActiveReferences, clearActiveReferences } = useReferenceStore();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in search
      if (isSearchFocused) return;

      switch (e.key) {
        case '[':
          e.preventDefault();
          navigateToPreviousReference();
          break;
        case ']':
          e.preventDefault();
          navigateToNextReference();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentPage > 1) {
            onPageChange(currentPage - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentPage < numPages) {
            onPageChange(currentPage + 1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          clearActiveReferences();
          onReferenceChange(undefined);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages, references, currentReference, isSearchFocused, clearActiveReferences, onReferenceChange]);

  // Listen for clear highlights event
  useEffect(() => {
    const handleClearHighlights = () => {
      clearActiveReferences();
      onReferenceChange(undefined);
    };

    window.addEventListener('clearHighlights', handleClearHighlights);
    return () => window.removeEventListener('clearHighlights', handleClearHighlights);
  }, [clearActiveReferences, onReferenceChange]);

  // Navigate to reference
  const navigateToReference = useCallback((reference: DocumentReference) => {
    onReferenceChange(reference);
    onPageChange(reference.page);
    
    // Scroll to the reference area after a short delay to allow page rendering
    setTimeout(() => {
      if (pageRef.current) {
        const [x, y, width, height] = reference.bbox;
        const scale = zoom / 100;
        
        pageRef.current.scrollTo({
          left: x * scale,
          top: y * scale,
          behavior: 'smooth'
        });
      }
    }, 500);
  }, [onReferenceChange, onPageChange, zoom]);

  const navigateToPreviousReference = () => {
    if (!references.length) return;
    
    const currentIndex = currentReference 
      ? references.findIndex(ref => ref.id === currentReference.id)
      : -1;
    
    const prevIndex = currentIndex <= 0 ? references.length - 1 : currentIndex - 1;
    navigateToReference(references[prevIndex]);
  };

  const navigateToNextReference = () => {
    if (!references.length) return;
    
    const currentIndex = currentReference 
      ? references.findIndex(ref => ref.id === currentReference.id)
      : -1;
    
    const nextIndex = currentIndex >= references.length - 1 ? 0 : currentIndex + 1;
    navigateToReference(references[nextIndex]);
  };

  // Mock search functionality
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    // Mock search results
    const mockResults = [
      { page: 1, text: searchQuery, bbox: [100, 150, 200, 20] },
      { page: 2, text: searchQuery, bbox: [80, 200, 180, 20] },
      { page: 3, text: searchQuery, bbox: [120, 100, 220, 20] },
    ];

    setSearchResults(mockResults);
    setCurrentSearchIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const navigateToSearchResult = (result: any) => {
    onPageChange(result.page);
    setTimeout(() => {
      if (pageRef.current) {
        const [x, y, width, height] = result.bbox;
        const scale = zoom / 100;
        
        pageRef.current.scrollTo({
          left: x * scale,
          top: y * scale,
          behavior: 'smooth'
        });
      }
    }, 500);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 25, 50));
  };

  const handleResetZoom = () => {
    onZoomChange(100);
  };

  // Get active references from store
  const activeReferences = getActiveReferences();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentPage} of {numPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
              disabled={currentPage >= numPages}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search in PDF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            {searchResults.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentSearchIndex + 1} of {searchResults.length}
              </span>
            )}
          </div>

          {/* Highlight Mode Toggle */}
          <button
            onClick={() => onHighlightModeChange(!highlightMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              highlightMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Highlight Mode
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Please check if the PDF file is valid and try again.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="flex justify-center p-4">
            <div ref={pageRef} className="relative">
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
                error=""
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom / 100}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>

              {/* Reference Highlights */}
              {highlightMode && references
                .filter(ref => ref.page === currentPage)
                .map((reference) => {
                  const [x, y, width, height] = reference.bbox;
                  const scale = zoom / 100;
                  const isCurrent = currentReference?.id === reference.id;
                  const isActive = activeReferences.some(ar => ar.id === reference.id);
                  
                  return (
                    <div
                      key={reference.id}
                      className={`absolute border-2 cursor-pointer transition-all duration-200 ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-500/20'
                          : isActive
                          ? 'border-yellow-500 bg-yellow-500/20'
                          : 'border-yellow-400 bg-yellow-400/20 hover:border-yellow-500 hover:bg-yellow-500/20'
                      }`}
                      style={{
                        left: x * scale,
                        top: y * scale,
                        width: width * scale,
                        height: height * scale,
                      }}
                      onClick={() => navigateToReference(reference)}
                      title={reference.snippet}
                    />
                  );
                })}

              {/* Search Result Highlights */}
              {searchResults
                .filter(result => result.page === currentPage)
                .map((result, index) => {
                  const [x, y, width, height] = result.bbox;
                  const scale = zoom / 100;
                  const isCurrent = index === currentSearchIndex;
                  
                  return (
                    <div
                      key={`${result.page}-${index}`}
                      className={`absolute border-2 cursor-pointer transition-all duration-200 ${
                        isCurrent
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-green-300 bg-green-300/20'
                      }`}
                      style={{
                        left: x * scale,
                        top: y * scale,
                        width: width * scale,
                        height: height * scale,
                      }}
                      onClick={() => {
                        setCurrentSearchIndex(index);
                        navigateToSearchResult(result);
                      }}
                      title={result.text}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Search Results Navigation */}
      {searchResults.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {searchResults.length} search result{searchResults.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const prevIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
                  setCurrentSearchIndex(prevIndex);
                  navigateToSearchResult(searchResults[prevIndex]);
                }}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const nextIndex = currentSearchIndex >= searchResults.length - 1 ? 0 : currentSearchIndex + 1;
                  setCurrentSearchIndex(nextIndex);
                  navigateToSearchResult(searchResults[nextIndex]);
                }}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
