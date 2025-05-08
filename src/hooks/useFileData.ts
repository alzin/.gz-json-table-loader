import { useState, useCallback } from 'react';
import { processGzipFile, processDataInChunks, fetchDefaultFile } from '../utils/fileProcessing';
import { SparqlJsonResult, ProcessingStatus } from '../types';

export const useFileData = () => {
  const [data, setData] = useState<SparqlJsonResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [isUsingDefaultData, setIsUsingDefaultData] = useState<boolean>(false);

  const processFile = useCallback(async (file: File) => {
    try {
      setProcessingStatus({
        status: 'uploading',
        progress: 0,
        message: 'Reading file...',
      });

      // First process the gzip file
      const jsonData = await processGzipFile(file);
      
      setProcessingStatus({
        status: 'processing',
        progress: 20,
        message: 'File decompressed. Processing JSON data...',
      });

      // Process the data in chunks to avoid blocking the UI
      const processedData = await processDataInChunks(
        jsonData,
        5000,
        (progress) => {
          setProcessingStatus({
            status: 'processing',
            progress: 20 + Math.floor(progress * 0.8), // Scale progress from 20-100%
            message: `Processing data... ${progress}%`,
          });
        }
      );

      // Set the processed data
      setData(processedData);
      setIsUsingDefaultData(false);
      
      setProcessingStatus({
        status: 'success',
        progress: 100,
        message: `Successfully loaded ${processedData.results.bindings.length} rows from custom file.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, []);

  const loadDefaultFile = useCallback(async () => {
    try {
      // Skip if we already have data loaded from a custom file
      if (data && !isUsingDefaultData) {
        return;
      }

      setProcessingStatus({
        status: 'uploading',
        progress: 0,
        message: 'Loading default enzymes data...',
      });

      // Fetch and process the default file
      const jsonData = await fetchDefaultFile();
      
      setProcessingStatus({
        status: 'processing',
        progress: 20,
        message: 'Default file loaded. Processing data...',
      });

      // Process the data in chunks to avoid blocking the UI
      const processedData = await processDataInChunks(
        jsonData,
        5000,
        (progress) => {
          setProcessingStatus({
            status: 'processing',
            progress: 20 + Math.floor(progress * 0.8), // Scale progress from 20-100%
            message: `Processing data... ${progress}%`,
          });
        }
      );

      // Set the processed data
      setData(processedData);
      setIsUsingDefaultData(true);
      
      setProcessingStatus({
        status: 'success',
        progress: 100,
        message: `Successfully loaded ${processedData.results.bindings.length} rows from default enzymes data.`,
      });
    } catch (error) {
      console.error('Error loading default file:', error);
      const errorMessage = error instanceof Error
        ? `Error loading default data: ${error.message}`
        : 'Unknown error occurred while loading default data';
      
      // Log additional details to help debug
      console.error('Error details:', {
        errorType: error instanceof Error ? error.name : typeof error,
        errorStack: error instanceof Error ? error.stack : 'No stack trace available'
      });
      
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: errorMessage,
      });
    }
  }, [data, isUsingDefaultData]);

  return {
    data,
    processingStatus,
    processFile,
    loadDefaultFile,
    isUsingDefaultData,
  };
};
