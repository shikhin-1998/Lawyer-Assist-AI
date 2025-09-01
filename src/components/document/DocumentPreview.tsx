import React from 'react';
import { FileText, Download, Copy, X } from 'lucide-react';
import { TemplateSection } from '../template/LegalTemplateView';

interface DocumentPreviewProps {
  sections: TemplateSection[];
  templateType: string;
  onClose: () => void;
  onDownload: () => void;
  onCopy: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  sections,
  templateType,
  onClose,
  onDownload,
  onCopy,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTemplateTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      'intake': 'Client Intake Notes',
      'petition-draft': 'Petition Draft',
      'hearing-notes': 'Hearing Notes',
    };
    return titles[type] || 'Legal Document';
  };

  const generateDocumentContent = () => {
    const now = new Date();
    let content = '';

    // Header
    content += `${getTemplateTitle(templateType)}\n`;
    content += `Generated on ${formatDate(now)} at ${formatTime(now)}\n`;
    content += '='.repeat(50) + '\n\n';

    // Sections
    sections.forEach((section) => {
      if (section.chunks.length > 0) {
        content += `${section.title.toUpperCase()}\n`;
        content += '-'.repeat(section.title.length) + '\n\n';

        // Group chunks by pinned status
        const pinnedChunks = section.chunks.filter(chunk => chunk.isPinned);
        const regularChunks = section.chunks.filter(chunk => !chunk.isPinned);

        // Add pinned chunks first
        pinnedChunks.forEach((chunk) => {
          content += `[PINNED] ${chunk.text}\n`;
          content += `  - ${formatTime(chunk.timestamp)}\n\n`;
        });

        // Add regular chunks
        regularChunks.forEach((chunk) => {
          content += `${chunk.text}\n`;
          content += `  - ${formatTime(chunk.timestamp)}\n\n`;
        });

        content += '\n';
      }
    });

    return content;
  };

  const documentContent = generateDocumentContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Document Preview
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onCopy}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={onDownload}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 font-mono leading-relaxed">
              {documentContent}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {sections.reduce((total, section) => total + section.chunks.length, 0)} total items
            </span>
            <span>
              {sections.filter(section => section.chunks.length > 0).length} sections with content
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
