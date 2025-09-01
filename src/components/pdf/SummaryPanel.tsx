import React, { useState } from 'react';
import { FileText, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { DocumentSummary, DocumentReference } from '../../stores/documentStore';

interface SummaryPanelProps {
  summary?: DocumentSummary;
  onReferenceClick: (reference: DocumentReference) => void;
  onGenerateSummary: () => void;
  isLoading?: boolean;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  onReferenceClick,
  onGenerateSummary,
  isLoading = false,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  const formatSummaryText = (text: string, references: DocumentReference[]) => {
    // Split text into sentences and add reference chips
    const sentences = text.split('. ').filter(s => s.trim());
    
    return sentences.map((sentence, index) => {
      // Find references that might be related to this sentence
      const relevantRefs = references.filter(ref => 
        sentence.toLowerCase().includes(ref.snippet.toLowerCase()) ||
        ref.snippet.toLowerCase().includes(sentence.toLowerCase().split(' ')[0])
      );

      return (
        <div key={index} className="mb-3">
          <p className="text-gray-900 dark:text-white leading-relaxed">
            {sentence}
            {sentence.endsWith('.') ? '' : '.'}
          </p>
          {relevantRefs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {relevantRefs.map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => onReferenceClick(ref)}
                  className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Ref #{ref.id.replace('ref', '')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  if (!summary && !isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Summary
          </h3>
          <button
            onClick={onGenerateSummary}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Generate</span>
          </button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Summary Available
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate a summary to see key points and references from this document.
            </p>
            <button
              onClick={onGenerateSummary}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Summary
        </h3>
        <div className="flex items-center space-x-2">
          {summary && (
            <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(summary.confidence)}`}>
              {getConfidenceLabel(summary.confidence)} Confidence
            </span>
          )}
          <button
            onClick={onGenerateSummary}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Generating summary...</p>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Summary Text */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Key Points
                </h4>
                <button
                  onClick={() => handleCopyText(summary.text)}
                  className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {copiedText === summary.text ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formatSummaryText(summary.text, summary.references)}
              </div>
            </div>

            {/* References List */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                References ({summary.references.length})
              </h4>
              <div className="space-y-2">
                {summary.references.map((reference) => (
                  <div
                    key={reference.id}
                    className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => onReferenceClick(reference)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
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
                      <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SummaryPanel;
