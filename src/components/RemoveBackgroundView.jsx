import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UploadCloud, Image as ImageIcon, Download, 
  Trash2, Sparkles, CheckCircle2, AlertTriangle, Layers
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

export default function RemoveBackgroundView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Status: idle, processing, done, error
  const [status, setStatus] = useState('idle'); 
  const [progressText, setProgressText] = useState('Initializing AI...');

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  // --- DRAG & DROP ---
  const processFile = (uploadedFile) => {
    if (!uploadedFile) return;
    
    if (uploadedFile.type.startsWith('image/')) {
      setFile(uploadedFile);
      setOriginalUrl(URL.createObjectURL(uploadedFile));
      setStatus('idle');
      setResultUrl(null);
      if (showToast) showToast("Image loaded successfully!");
    } else {
      if (showToast) showToast("Please upload a valid image file (JPG, PNG, WebP).");
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  };

  const clearFile = () => {
    setFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setStatus('idle');
  };

  // --- IN-BROWSER AI PROCESSING ---
  const handleRemoveBackground = async () => {
    if (!file) return; // FIX: Ensure we have the raw file object
    setStatus('processing');
    setProgressText('Preparing AI Engine...');

    try {
      // FIX: Pass the raw `file` object instead of the Blob URL.
      // FIX: Removed `publicPath` to allow the library to use its official, stable CDN.
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (key.includes('fetch')) {
            setProgressText(`Downloading AI Data... ${Math.round((current / total) * 100)}%`);
          } else if (key.includes('compute')) {
            setProgressText('Segmenting Subject...');
          }
        }
      });

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setStatus('done');
      if (showToast) showToast("Background removed successfully!");

    } catch (error) {
      console.error("AI Processing Error:", error);
      setStatus('error');
      if (showToast) showToast("Failed to process image. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    
    const newName = file.name.replace(/\.[^/.]+$/, "") + `_nobg.png`;
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col items-center pt-8 pb-24 relative z-10 animate-fade-in-up">
      
      {/* Top Nav */}
      <div className="w-full max-w-[1000px] flex items-center justify-between px-6 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
      </div>

      <div className="w-full max-w-[1000px] px-6 flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <Layers className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">AI Background Remover</h1>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Extract subjects from images instantly. Runs 100% locally in your browser ensuring complete privacy.
          </p>
        </div>

        {/* Main Workspace */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden transition-all">
          
          {!file ? (
            // DRAG AND DROP ZONE
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 cursor-pointer min-h-[350px]
                ${isDragging 
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' 
                  : 'border-[#333] bg-[#0A0A0A] hover:bg-[#111] hover:border-[#444]'
                }
              `}
            >
              <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? 'text-emerald-400 animate-bounce' : 'text-gray-500'}`} />
              <h2 className="text-lg font-bold text-white mb-2">Upload an Image</h2>
              <p className="text-sm text-gray-500 mb-6 text-center">Supports JPG, PNG, WebP</p>
              <button className="bg-[#222] hover:bg-[#333] text-white font-semibold text-sm px-6 py-2.5 rounded-lg border border-[#444] transition-colors pointer-events-none">
                Browse Files
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            // ACTIVE PROCESSING ZONE
            <div className="flex flex-col animate-fade-in-up w-full gap-6">
              
              <div className="flex items-center justify-between bg-[#0A0A0A] p-4 rounded-xl border border-[#333]">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-white max-w-[200px] sm:max-w-[400px] truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                {status !== 'processing' && (
                  <button onClick={clearFile} className="text-xs text-gray-500 hover:text-rose-400 flex items-center gap-1 transition-colors bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333]">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              <div className={`grid gap-6 ${resultUrl ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                
                {/* Original Image */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Original</label>
                  <div className="bg-[#0A0A0A] border border-[#333] rounded-2xl overflow-hidden relative aspect-square md:aspect-[4/3] flex items-center justify-center p-2">
                    <img src={originalUrl} alt="Original" className="w-full h-full object-contain rounded-xl" />
                  </div>
                </div>

                {/* Processing State */}
                {status === 'processing' && (
                  <div className="flex flex-col items-center justify-center bg-[#0A0A0A] border border-[#333] rounded-2xl aspect-square md:aspect-[4/3] border-dashed p-4 text-center">
                    <div className="w-12 h-12 border-4 border-[#222] border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-white font-bold text-sm mb-1">{progressText}</h3>
                    <p className="text-[10px] text-gray-500 max-w-[250px] text-center mt-2">
                      Please keep this tab open. Depending on your device's processing power, this can take 5-30 seconds.
                    </p>
                  </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                  <div className="flex flex-col items-center justify-center bg-rose-500/10 border border-rose-500/20 rounded-2xl aspect-square md:aspect-[4/3]">
                    <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
                    <h3 className="text-white font-bold text-sm">Processing Failed</h3>
                    <p className="text-[10px] text-rose-400/80 max-w-[200px] text-center mt-2">
                      Ensure you are connected to the internet to download the AI models on the first run.
                    </p>
                  </div>
                )}

                {/* Result Image */}
                {status === 'done' && resultUrl && (
                  <div className="flex flex-col gap-3 animate-fade-in-up">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Background Removed
                    </label>
                    <div className="checkerboard border border-[#333] rounded-2xl overflow-hidden relative aspect-square md:aspect-[4/3] flex items-center justify-center p-2 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                      <img src={resultUrl} alt="Removed Background" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-center">
                {status === 'idle' && (
                  <button 
                    onClick={handleRemoveBackground}
                    className="w-full max-w-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" /> Remove Background
                  </button>
                )}

                {status === 'done' && (
                  <button 
                    onClick={handleDownload}
                    className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" /> Download Transparent PNG
                  </button>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .checkerboard {
          background-color: #1a1a1a;
          background-image: 
            linear-gradient(45deg, #222 25%, transparent 25%), 
            linear-gradient(-45deg, #222 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #222 75%), 
            linear-gradient(-45deg, transparent 75%, #222 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}} />
    </div>
  );
}