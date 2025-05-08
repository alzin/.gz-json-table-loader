import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileX } from 'lucide-react';
import { ProcessingStatus } from '../types';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  processingStatus: ProcessingStatus;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, processingStatus }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if it's a .gz file
      if (file.name.endsWith('.gz')) {
        onFileSelected(file);
      } else {
        // Handle non-gz files
        console.error('Please upload a .gz file');
      }
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/gzip': ['.gz'],
    },
    maxFiles: 1,
    disabled: processingStatus.status === 'uploading' || processingStatus.status === 'processing',
  });

  // Determine the drop zone color based on the state
  const getBorderColor = () => {
    if (isDragReject) return 'border-red-500';
    if (isDragActive) return 'border-blue-500';
    return 'border-gray-300';
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative p-8 border-2 border-dashed rounded-lg transition-colors ${getBorderColor()} 
                   bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer
                   flex flex-col items-center justify-center min-h-[200px]`}
      >
        <input {...getInputProps()} />
        
        {isDragReject ? (
          <div className="text-center">
            <FileX className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <p className="text-red-500 font-medium">Invalid file type. Please upload a .gz file.</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Drag and drop a .gz file here, or click to select
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Only .gz files containing SPARQL JSON data are supported
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Default enzymes dataset is loaded automatically on startup
            </p>
          </div>
        )}
      </div>

      {processingStatus.status !== 'idle' && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${processingStatus.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {processingStatus.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;