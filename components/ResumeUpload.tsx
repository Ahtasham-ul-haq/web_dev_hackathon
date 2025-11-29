'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ResumeUploadProps {
  onUploadSuccess?: (data: { success: boolean; message: string; [key: string]: any }) => void;
  onUploadError?: (error: string) => void;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  file?: File;
}

export default function ResumeUpload({ onUploadSuccess, onUploadError }: ResumeUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadState({
        status: 'error',
        progress: 0,
        message: 'Please upload a PDF file only.',
        file
      });
      onUploadError?.('Please upload a PDF file only.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState({
        status: 'error',
        progress: 0,
        message: 'File size must be less than 10MB.',
        file
      });
      onUploadError?.('File size must be less than 10MB.');
      return;
    }

    setUploadState({
      status: 'uploading',
      progress: 0,
      message: 'Uploading resume...',
      file
    });

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;

          // Provide more helpful error messages
          if (response.status === 401) {
            errorMessage = 'Please sign in to upload your resume';
          } else if (response.status === 500) {
            errorMessage = 'Server error. Please check your configuration and try again.';
          }
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setUploadState(prev => ({
        ...prev,
        status: 'processing',
        progress: 50,
        message: 'Analyzing resume with AI...'
      }));

      const result = await response.json();

      setUploadState({
        status: 'success',
        progress: 100,
        message: 'Resume processed successfully!',
        file
      });

      onUploadSuccess?.(result);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload resume. Please try again.';
      setUploadState({
        status: 'error',
        progress: 0,
        message: errorMessage,
        file
      });
      onUploadError?.(errorMessage);
    }
  }, [onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploadState.status === 'uploading' || uploadState.status === 'processing'
  });

  const resetUpload = () => {
    setUploadState({
      status: 'idle',
      progress: 0,
      message: ''
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${uploadState.status === 'uploading' || uploadState.status === 'processing'
              ? 'pointer-events-none opacity-50'
              : ''
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center space-y-4">
            {uploadState.status === 'idle' && (
              <>
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Drag and drop your PDF resume here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Maximum file size: 10MB • PDF format only
                  </p>
                </div>
                <Button type="button" variant="outline">
                  Choose File
                </Button>
              </>
            )}

            {uploadState.status === 'uploading' && (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    Uploading...
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {uploadState.file?.name}
                  </p>
                </div>
              </>
            )}

            {uploadState.status === 'processing' && (
              <>
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    Analyzing Resume
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Extracting skills, experience, and education...
                  </p>
                </div>
              </>
            )}

            {uploadState.status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    Resume Processed!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Your profile has been created successfully
                  </p>
                </div>
                <Button onClick={resetUpload} variant="outline">
                  Upload Another Resume
                </Button>
              </>
            )}

            {uploadState.status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xl font-medium text-gray-900 dark:text-gray-100">
                    Upload Failed
                  </p>
                  <p className="text-red-600 dark:text-red-400 mt-2">
                    {uploadState.message}
                  </p>
                </div>
                <Button onClick={resetUpload} variant="outline">
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
          <div className="space-y-2">
            <Progress value={uploadState.progress} className="w-full" />
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              {uploadState.message}
            </p>
          </div>
        )}

        {/* File Info */}
        {uploadState.file && uploadState.status !== 'idle' && (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {uploadState.file.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {uploadState.status === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            )}
            {uploadState.status === 'error' && (
              <button onClick={resetUpload}>
                <X className="w-5 h-5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
