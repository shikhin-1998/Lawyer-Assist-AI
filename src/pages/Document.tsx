import React from 'react';
import { useParams } from 'react-router-dom';

const Document: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Document Workspace
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Document ID: {docId}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* PDF Viewer */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              PDF Viewer
            </h2>
            <div className="bg-gray-100 dark:bg-gray-700 h-96 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                PDF viewer will be implemented here
              </p>
            </div>
          </div>

          {/* Summary & Q&A Panel */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Summary
              </h3>
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-gray-300">
                  This document appears to be a legal contract with multiple clauses...
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Contract type: Employment Agreement
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Parties: 2 entities identified
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Key dates: 3 important deadlines
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Q&A */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Q&A
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    What is the termination clause?
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The termination clause allows either party to terminate with 30 days notice...
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    What are the payment terms?
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Payment is due within 15 days of invoice receipt...
                  </p>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Ask a Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Document;
