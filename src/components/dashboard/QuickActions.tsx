import React from 'react';
import { Upload, FileText, Settings, Clock, Star, Folder } from 'lucide-react';

interface QuickActionsProps {
  onUploadPDF?: () => void;
  onOpenLastDocument?: () => void;
  onOpenSettings?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onUploadPDF,
  onOpenLastDocument,
  onOpenSettings,
}) => {
  const recentDocuments = [
    { id: 1, title: 'Contract_ABC_Corp.pdf', date: '2 hours ago' },
    { id: 2, title: 'Patent_Application.pdf', date: '1 day ago' },
    { id: 3, title: 'Merger_Agreement.pdf', date: '3 days ago' },
  ];

  const quickTemplates = [
    { id: 1, title: 'Employment Contract', category: 'Employment' },
    { id: 2, title: 'NDA Template', category: 'Confidentiality' },
    { id: 3, title: 'Service Agreement', category: 'Business' },
    { id: 4, title: 'Lease Agreement', category: 'Real Estate' },
  ];

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h2>

      {/* Primary Actions */}
      <div className="space-y-3 mb-8">
        <button
          onClick={onUploadPDF}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">Upload PDF</span>
        </button>

        <button
          onClick={onOpenLastDocument}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 font-medium">Open Last Document</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300 font-medium">Settings</span>
        </button>
      </div>

      {/* Recent Documents */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Recent Documents
        </h3>
        <div className="space-y-2">
          {recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {doc.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Star className="h-4 w-4 mr-2" />
          Quick Templates
        </h3>
        <div className="space-y-2">
          {quickTemplates.map((template) => (
            <div
              key={template.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {template.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {template.category}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          This Week
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Documents processed</span>
            <span className="font-medium text-gray-900 dark:text-white">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Recording time</span>
            <span className="font-medium text-gray-900 dark:text-white">2h 34m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Notes created</span>
            <span className="font-medium text-gray-900 dark:text-white">8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
