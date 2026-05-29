// src/components/Artifacts/ArtifactViewer.tsx
import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import CodeViewer from './CodeViewer';

function ArtifactViewer() {
  const { currentArtifacts } = useTaskStore();
  const [selectedTab, setSelectedTab] = useState('code');
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-800 mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedTab('code')}
            className={`pb-2 ${selectedTab === 'code' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-400'}`}
          >
            Code
          </button>
          <button
            onClick={() => setSelectedTab('files')}
            className={`pb-2 ${selectedTab === 'files' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-400'}`}
          >
            Files
          </button>
          <button
            onClick={() => setSelectedTab('output')}
            className={`pb-2 ${selectedTab === 'output' ? 'border-b-2 border-green-500 text-green-500' : 'text-gray-400'}`}
          >
            Output
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        {selectedTab === 'code' && (
          <CodeViewer 
            code={currentArtifacts.code || '// No code generated yet\n// Send a task to Onyx'} 
            language="python"
          />
        )}
        
        {selectedTab === 'files' && (
          <div className="bg-gray-900 rounded-lg p-4">
            {currentArtifacts.files?.length > 0 ? (
              currentArtifacts.files.map((file: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 py-2 border-b border-gray-800">
                  <span>📄</span>
                  <span>{file.name}</span>
                  <span className="text-xs text-gray-500">{file.size}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No files yet</p>
            )}
          </div>
        )}
        
        {selectedTab === 'output' && (
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
            {currentArtifacts.output || 'Waiting for task output...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArtifactViewer;
