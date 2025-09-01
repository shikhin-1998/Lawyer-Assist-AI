import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../../stores/documentStore';
import { useToastStore } from '../../stores/toastStore';

interface UploadPdfCardProps {
  onClose?: () => void;
}

const UploadPdfCard: React.FC<UploadPdfCardProps> = ({ onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    thumbnail?: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { addDocument } = useDocumentStore();
  const { addToast } = useToastStore();

  const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    
    return null;
  };

  const generateThumbnail = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 200;
        canvas.height = (img.height / img.width) * 200;
        
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
        resolve(canvas.toDataURL());
      };
      
      // For demo purposes, create a mock thumbnail
      // In a real app, you'd use a PDF library to extract the first page
      const mockThumbnail = `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="280" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="280" fill="#f3f4f6"/>
          <rect x="20" y="20" width="160" height="240" fill="white" stroke="#d1d5db"/>
          <text x="100" y="80" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="12">PDF Preview</text>
          <text x="100" y="100" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="10">First Page</text>
          <text x="100" y="120" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="10">${file.name}</text>
        </svg>
      `)}`;
      
      resolve(mockThumbnail);
    });
  };

  const simulateUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearInterval(interval);
    setUploadProgress(100);
    
    // Generate thumbnail
    const thumbnail = await generateThumbnail(file);
    
    // Add to document store
    const docId = Date.now().toString();
    const document = {
      id: docId,
      name: file.name,
      size: file.size,
      thumbnail,
      uploadedAt: new Date(),
      pages: Math.floor(Math.random() * 50) + 1, // Mock page count
    };
    
    addDocument(document);
    
    setIsUploading(false);
    setUploadedFile({
      name: file.name,
      size: file.size,
      thumbnail,
    });
    
    addToast({
      type: 'success',
      title: 'PDF uploaded successfully!',
      message: `${file.name} has been processed and is ready to view.`,
    });
    
    // Navigate to document after a short delay
    setTimeout(() => {
      navigate(`/documents/${docId}`);
    }, 1000);
  };

  const handleFileSelect = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      addToast({
        type: 'error',
        title: 'Upload failed',
        message: error,
      });
      return;
    }
    
    await simulateUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload PDF Document
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drop your PDF here
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={isUploading}
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Maximum file size: 30MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload Complete!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Redirecting to document viewer...
              </p>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Processing PDF...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* File Info */}
          {uploadedFile && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {uploadedFile.thumbnail && (
                  <img
                    src={uploadedFile.thumbnail}
                    alt="PDF thumbnail"
                    className="w-16 h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {uploadedFile.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPdfCard;
