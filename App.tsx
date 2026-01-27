import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { DEFAULT_SETTINGS, ProcessedFile, WatermarkSettings } from './types';
import Sidebar from './components/Sidebar';
import PreviewModal from './components/PreviewModal';
import { applyWatermark } from './services/watermarkService';
import { IconUpload, IconTrash, IconDownload, IconCheck, IconX } from './components/Icons';

// Native replacement for file-saver to avoid ESM import issues
const saveAs = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

const App: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS);
  const [previewFile, setPreviewFile] = useState<ProcessedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- File Handling ---

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: ProcessedFile[] = Array.from(fileList).map(file => ({
      id: uuidv4(),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setProgress({ current: 0, total: 0 });
  };

  // --- Settings Handling ---

  const updateSettings = (partial: Partial<WatermarkSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // --- Batch Processing ---

  const processBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });
    const zip = new JSZip();
    const CONCURRENCY = 3;

    // Helper to process a chunk
    const processChunk = async (chunk: ProcessedFile[]) => {
       const promises = chunk.map(async (file) => {
         try {
           // Skip if already processed
           if (file.status === 'done' && file.processedBlob) {
             const ext = settings.format.split('/')[1];
             zip.file(`watermarked_${file.originalFile.name.split('.')[0]}.${ext}`, file.processedBlob);
             setProgress(prev => ({ ...prev, current: prev.current + 1 }));
             return;
           }

           setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'processing' } : f));
           
           // Artificial delay to let UI breathe if needed, usually canvas is heavy enough
           await new Promise(r => setTimeout(r, 20));

           const blob = await applyWatermark(file.originalFile, settings);
           
           // Add to zip
           const ext = settings.format.split('/')[1];
           // Simple duplicate name handling could be added here
           zip.file(`watermarked_${file.originalFile.name.split('.')[0]}.${ext}`, blob);

           setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done', processedBlob: blob } : f));
         } catch (error) {
           console.error(error);
           setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error', errorMsg: 'Failed' } : f));
         } finally {
           setProgress(prev => ({ ...prev, current: prev.current + 1 }));
         }
       });
       return Promise.all(promises);
    };

    // Chunk array
    for (let i = 0; i < files.length; i += CONCURRENCY) {
      const chunk = files.slice(i, i + CONCURRENCY);
      await processChunk(chunk);
    }

    // Generate Zip
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'watermarked_images.zip');
    } catch (e) {
      alert("Failed to create ZIP file");
    }

    setIsProcessing(false);
  };

  const handleApplyPreview = (blob: Blob) => {
    if (previewFile) {
      setFiles(prev => prev.map(f => 
        f.id === previewFile.id ? { ...f, status: 'done', processedBlob: blob } : f
      ));
      setPreviewFile(null);
    }
  };

  // --- UI ---

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const getTotalSize = () => {
    const bytes = files.reduce((acc, f) => acc + f.originalFile.size, 0);
    return (bytes / (1024 * 1024)).toFixed(1); // MB
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar 
        settings={settings} 
        updateSettings={updateSettings} 
        resetSettings={resetSettings} 
      />

      <main 
        className="flex-1 flex flex-col min-w-0"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Header / Toolbar */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900 shadow-sm z-10">
           <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                Watermark Studio
              </h1>
              {files.length > 0 && (
                <span className="text-sm text-gray-500 border-l border-gray-700 pl-4">
                  {files.length} images ({getTotalSize()} MB)
                </span>
              )}
           </div>
           
           <div className="flex items-center space-x-3">
             <input 
               type="file" 
               multiple 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef}
               onChange={(e) => handleFiles(e.target.files)}
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
               disabled={isProcessing}
             >
               <IconUpload size={16} className="mr-2" /> Add Images
             </button>
             
             {files.length > 0 && (
               <>
                 <button 
                  onClick={clearAll}
                  className="flex items-center px-3 py-2 text-gray-400 hover:text-red-400 transition-colors"
                  disabled={isProcessing}
                  title="Clear All"
                 >
                   <IconTrash size={18} />
                 </button>
                 <button 
                   onClick={processBatch}
                   disabled={isProcessing}
                   className={`flex items-center px-6 py-2 rounded-md text-sm font-bold shadow-lg transition-all
                     ${isProcessing 
                       ? 'bg-blue-800 text-blue-200 cursor-wait' 
                       : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                 >
                   {isProcessing ? (
                     <span>Processing {progress.current}/{progress.total}</span>
                   ) : (
                     <>
                       <IconDownload size={18} className="mr-2" /> Export ZIP
                     </>
                   )}
                 </button>
               </>
             )}
           </div>
        </header>

        {/* Gallery Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-950/50">
          
          {files.length === 0 ? (
            <div 
              className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50 text-gray-500"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-gray-800 p-4 rounded-full mb-4">
                <IconUpload size={32} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-300">Drag & Drop images here</p>
              <p className="text-sm mt-2">or click to browse files (JPG, PNG, WebP)</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {files.map(file => (
                <div 
                  key={file.id} 
                  className="group relative aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-all shadow-sm"
                >
                  <img 
                    src={file.previewUrl} 
                    alt={file.originalFile.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setPreviewFile(file)}
                  />
                  
                  {/* Status Indicator */}
                  <div className="absolute top-2 left-2">
                     {file.status === 'done' && <div className="bg-green-500 text-white p-1 rounded-full"><IconCheck size={12}/></div>}
                     {file.status === 'processing' && <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>}
                     {file.status === 'error' && <div className="bg-red-500 text-white p-1 rounded-full"><IconX size={12}/></div>}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                     <div className="flex justify-between items-end">
                       <span className="text-xs text-white truncate max-w-[70%] drop-shadow-md">
                         {file.originalFile.name}
                       </span>
                       <button 
                         onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                         className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded shadow-sm"
                       >
                         <IconTrash size={14} />
                       </button>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {previewFile && (
        <PreviewModal 
          file={previewFile} 
          settings={settings} 
          onClose={() => setPreviewFile(null)}
          onApply={handleApplyPreview}
        />
      )}
    </div>
  );
};

export default App;