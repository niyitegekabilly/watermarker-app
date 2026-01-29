import React, { useEffect, useState, useRef } from 'react';
import { ProcessedFile, WatermarkSettings } from '../types';
import { applyWatermark } from '../services/watermarkService';
import { IconX, IconDownload, IconCheck } from './Icons';

interface PreviewModalProps {
  file: ProcessedFile;
  settings: WatermarkSettings;
  onClose: () => void;
  onApply: (blob: Blob) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ file, settings, onClose, onApply }) => {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track the current URL to revoke it properly on unmount or update
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const generatePreview = async () => {
      try {
        // Generate a preview blob using the current settings
        const blob = await applyWatermark(file.originalFile, settings);
        
        if (active) {
          const url = URL.createObjectURL(blob);
          
          // Revoke previous URL if it exists to avoid memory leaks
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
          }
          urlRef.current = url;

          setPreviewSrc(url);
          setCurrentBlob(blob);
          setLoading(false);
        } else {
          // If cancelled, revoke the created url immediately
          URL.revokeObjectURL(URL.createObjectURL(blob)); 
        }
      } catch (e) {
        console.error("Preview generation failed", e);
        if (active) setLoading(false);
      }
    };

    // Debounce slightly to prevent flashing on rapid slider changes if needed, 
    // but for now direct call is responsive enough for canvas
    const timeoutId = setTimeout(generatePreview, 50);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [file, settings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  const handleDownload = () => {
    if (!previewSrc) return;
    
    // Determine extension based on format
    const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
    };
    const ext = extMap[settings.format] || 'jpg';
    
    // Construct filename
    const originalName = file.originalFile.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const filename = `${nameWithoutExt}-watermarked.${ext}`;

    const a = document.createElement('a');
    a.href = previewSrc;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleApply = () => {
    if (currentBlob) {
      onApply(currentBlob);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col border border-gray-800" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h3 className="text-white font-semibold text-lg truncate max-w-md">{file.originalFile.name}</h3>
            <p className="text-gray-400 text-xs mt-0.5">Previewing output quality ({settings.quality * 100}%)</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-950/50 flex items-center justify-center p-6 relative">
           
           {/* Image Layer */}
           {previewSrc && (
             <img 
              src={previewSrc} 
              alt="Preview" 
              className={`max-w-full max-h-full object-contain shadow-lg transition-all duration-300 ${loading ? 'opacity-40 blur-sm scale-[0.99]' : 'opacity-100 scale-100'}`} 
             />
           )}

           {/* Loading Overlay */}
           {loading && (
             <div className="absolute inset-0 flex items-center justify-center z-20">
               <div className="bg-gray-900/80 backdrop-blur-md px-6 py-4 rounded-xl shadow-2xl border border-gray-700 flex flex-col items-center animate-in fade-in zoom-in duration-200">
                 <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-3"></div>
                 <p className="text-gray-200 text-sm font-medium tracking-wide">Updating Preview...</p>
               </div>
             </div>
           )}

           {/* Initial/Error State */}
           {!loading && !previewSrc && (
             <div className="text-gray-500 text-sm">Failed to generate preview</div>
           )}

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="text-xs text-gray-500 hidden sm:block">
             Format: {settings.format.split('/')[1].toUpperCase()}
           </div>
           <div className="flex space-x-3 w-full sm:w-auto justify-end">
             <button 
               onClick={handleDownload}
               disabled={loading || !previewSrc}
               className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <IconDownload className="mr-2" size={16} /> 
               Download Preview
             </button>
             <button 
               onClick={handleApply}
               disabled={loading || !currentBlob}
               className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <IconCheck className="mr-2" size={16} /> 
               Apply Watermark
             </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PreviewModal;