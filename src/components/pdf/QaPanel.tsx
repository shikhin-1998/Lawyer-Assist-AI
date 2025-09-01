import React, { useState } from 'react';
import { MessageSquare, Send, ExternalLink, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { DocumentReference } from '../../stores/documentStore';

interface QaAnswer {
  id: string;
  question: string;
  answer: string;
  references: DocumentReference[];
  confidence: number;
  timestamp: Date;
}

interface QaPanelProps {
  onReferenceClick: (reference: DocumentReference) => void;
  onAskQuestion: (question: string) => Promise<QaAnswer>;
  isLoading?: boolean;
}

const QaPanel: React.FC<QaPanelProps> = ({
  onReferenceClick,
  onAskQuestion,
  isLoading = false,
}) => {
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<QaAnswer[]>([]);
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set());
  const [isAsking, setIsAsking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    setIsAsking(true);
    try {
      const answer = await onAskQuestion(question.trim());
      setAnswers(prev => [answer, ...prev]);
      setQuestion('');
    } catch (error) {
      console.error('Failed to get answer:', error);
    } finally {
      setIsAsking(false);
    }
  };

  const toggleEvidence = (answerId: string) => {
    const newExpanded = new Set(expandedEvidence);
    if (newExpanded.has(answerId)) {
      newExpanded.delete(answerId);
    } else {
      newExpanded.add(answerId);
    }
    setExpandedEvidence(newExpanded);
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Q&A
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {answers.length} questions
          </span>
        </div>
      </div>

      {/* Question Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this document..."
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isAsking}
            />
            <button
              type="submit"
              disabled={!question.trim() || isAsking}
              className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAsking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Answers List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isAsking && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Analyzing document...</p>
            </div>
          </div>
        )}

        {answers.length === 0 && !isAsking ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ask Your First Question
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Get AI-powered answers about this document's content, terms, and legal implications.
            </p>
          </div>
        ) : (
          answers.map((answer) => (
            <div
              key={answer.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
            >
              {/* Question */}
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Q: {answer.question}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{answer.timestamp.toLocaleTimeString()}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full ${getConfidenceColor(answer.confidence)}`}>
                    {getConfidenceLabel(answer.confidence)} Confidence
                  </span>
                </div>
              </div>

              {/* Answer */}
              <div className="mb-3">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {answer.answer}
                </p>
              </div>

              {/* References */}
              {answer.references.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      References:
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {answer.references.length} found
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {answer.references.map((reference) => (
                      <button
                        key={reference.id}
                        onClick={() => onReferenceClick(reference)}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Page {reference.page}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Section */}
              {answer.references.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleEvidence(answer.id)}
                    className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  >
                    {expandedEvidence.has(answer.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span>Evidence ({answer.references.length} snippets)</span>
                  </button>

                  {expandedEvidence.has(answer.id) && (
                    <div className="mt-3 space-y-2">
                      {answer.references.map((reference) => (
                        <div
                          key={reference.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                          onClick={() => onReferenceClick(reference)}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              Page {reference.page}
                            </span>
                            <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0 mt-0.5" />
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white mb-1">
                            {reference.snippet}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {reference.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QaPanel;
