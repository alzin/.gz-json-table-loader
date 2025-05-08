import { useEffect, useRef } from 'react';
import DataTable from './components/DataTable';
import { useFileData } from './hooks/useFileData';
import { AlertCircle } from 'lucide-react';

function App() {
  const { data, processingStatus, loadDefaultFile } = useFileData();
  const didLoadRef = useRef(false);

  useEffect(() => {
    if (!didLoadRef.current) {
      loadDefaultFile();
      didLoadRef.current = true;
    }
  }, [loadDefaultFile]);
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Error message */}
          {processingStatus.status === 'error' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{processingStatus.message}</p>
                  <div className="mt-2">
                    <button
                      onClick={loadDefaultFile}
                      className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded hover:bg-red-200 transition-colors"
                    >
                      Retry Loading Default Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data preview */}
          {(data || processingStatus.status === 'processing') && (
              <DataTable data={data} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
