import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, UploadCloud, X, Download, Archive, Image as ImageIcon, Link2, Settings2, CheckSquare, Square } from 'lucide-react';

export default function ImageCompressorView({ onViewChange, showToast }) {
  const [files, setFiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const fileInputRef = useRef(null);

  // Global Settings
  const [globalFormat, setGlobalFormat] = useState('JPEG');
  const [globalQuality, setGlobalQuality] = useState(75);
  const [globalTargetKb, setGlobalTargetKb] = useState('');

  // Handle File Selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        originalSize: file.size,
        originalUrl: URL.createObjectURL(file),
        compressedUrl: null,
        compressedSize: null,
        status: 'pending', 
        settings: {
          format: globalFormat,
          quality: globalQuality,
          targetKb: globalTargetKb,
          width: 0,
          height: 0,
          lockRatio: true
        }
      }));

      // Pre-load image dimensions safely
      newFiles.forEach(f => {
        const img = new Image();
        img.onload = () => {
          setFiles(prev => prev.map(p => 
            p.id === f.id 
              ? { ...p, settings: { ...p.settings, width: img.width, height: img.height }, origWidth: img.width, origHeight: img.height } 
              : p
          ));
        };
        img.src = f.originalUrl;
      });

      setFiles(prev => [...prev, ...newFiles]);
      setSelectedIds(prev => [...prev, ...newFiles.map(f => f.id)]);
      if (!activeFileId && newFiles.length > 0) setActiveFileId(newFiles[0].id);
      
      // Reset input so the same files can be selected again if needed
      e.target.value = null; 
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === files.length) setSelectedIds([]);
    else setSelectedIds(files.map(f => f.id));
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const removeFile = (id, e) => {
    e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    if (activeFileId === id) setActiveFileId(null);
  };

  // Core Compression Engine
  const compressSingleImage = async (fileObj, overrides = null) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const config = overrides || fileObj.settings;

        const w = Number(config.width) || img.width;
        const h = Number(config.height) || img.height;
        
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        
        const format = config.format || 'JPEG';
        const mimeType = format === 'PNG' ? 'image/png' : 
                         format === 'WEBP' ? 'image/webp' : 'image/jpeg';
                         
        const quality = Number(config.quality) / 100;

        canvas.toBlob((blob) => {
          if (blob) {
            resolve({
              url: URL.createObjectURL(blob),
              size: blob.size,
              extension: format.toLowerCase()
            });
          } else {
            resolve(null);
          }
        }, mimeType, quality);
      };
      img.onerror = () => resolve(null); // Prevent hanging on bad images
      img.src = fileObj.originalUrl;
    });
  };

  // Smart Engine: Attempts to hit Target KB using binary search
  const processCompression = async (f, overrides) => {
    const targetKb = Number(overrides.targetKb);
    
    // PNG ignores quality sliders in HTML5 Canvas, so we skip binary search for it
    if (targetKb && overrides.format !== 'PNG') {
      let minQ = 1;
      let maxQ = 100;
      let bestResult = null;
      const targetBytes = targetKb * 1024;

      // Max 6 attempts to find the perfect quality percentage instantly
      for (let i = 0; i < 6; i++) {
        let testQ = Math.floor((minQ + maxQ) / 2);
        let res = await compressSingleImage(f, { ...overrides, quality: testQ });
        
        if (!res) break;
        bestResult = res;

        // Stop if we are within 5% of the target size
        if (Math.abs(res.size - targetBytes) / targetBytes < 0.05) break;

        if (res.size > targetBytes) {
          maxQ = testQ - 1; // Need lower quality
        } else {
          minQ = testQ + 1; // Can afford higher quality
        }
      }
      return bestResult;
    } else {
      return await compressSingleImage(f, overrides);
    }
  };

  const handleCompressSelected = async () => {
    const toCompress = files.filter(f => selectedIds.includes(f.id));
    if (toCompress.length === 0) return showToast("No files selected");

    showToast(`Compressing ${toCompress.length} images...`);
    
    for (let f of toCompress) {
      setFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'compressing' } : p));
      
      const overrides = {
        ...f.settings,
        format: globalFormat,
        quality: globalQuality,
        targetKb: globalTargetKb
      };

      const result = await processCompression(f, overrides);
      
      if (result) {
        setFiles(prev => prev.map(p => p.id === f.id ? { 
          ...p, 
          compressedUrl: result.url, 
          compressedSize: result.size,
          status: 'done',
          settings: overrides, // Save new settings to state
          name: p.name.replace(/\.[^/.]+$/, "") + "." + result.extension // Update extension
        } : p));
      } else {
        setFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'error' } : p));
      }
    }
    showToast("Compression complete!");
  };

  const handleCompressActive = async () => {
    if (!activeFileId) return;
    const f = files.find(x => x.id === activeFileId);
    
    setFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'compressing' } : p));
    
    const result = await processCompression(f, f.settings);
    
    if (result) {
      setFiles(prev => prev.map(p => p.id === f.id ? { 
        ...p, 
        compressedUrl: result.url, 
        compressedSize: result.size,
        status: 'done',
        name: p.name.replace(/\.[^/.]+$/, "") + "." + result.extension
      } : p));
      showToast("Image compressed!");
    } else {
      showToast("Compression failed");
      setFiles(prev => prev.map(p => p.id === f.id ? { ...p, status: 'error' } : p));
    }
  };

  const downloadFile = (url, name, e) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    const doneFiles = files.filter(f => f.status === 'done' && f.compressedUrl);
    if (doneFiles.length === 0) return showToast("No compressed files to download.");
    
    showToast("Downloading all files...");
    // Add a sequential delay to prevent the browser from blocking multiple simultaneous downloads
    for (let i = 0; i < doneFiles.length; i++) {
      downloadFile(doneFiles[i].compressedUrl, doneFiles[i].name);
      await new Promise(r => setTimeout(r, 300)); 
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="w-full px-4 sm:px-8 pt-4 pb-12 animate-fade-in-up max-w-[1600px] mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      
      {/* Inline Header */}
      <div className="relative flex items-center justify-center mb-8 shrink-0">
        <button onClick={() => onViewChange('home')} className="absolute left-0 group flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-xs font-semibold tracking-wide uppercase">
          <div className="p-2 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] transition-all duration-300 border border-white/[0.05]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:block">All Tools</span>
        </button>
        <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tight">
              Image Compressor
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-widest mt-1">Compress PNG, JPG, WebP locally in your browser</p>
        </div>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/[0.02] p-3 rounded-2xl border border-white/[0.05] backdrop-blur-md">
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95">
            <UploadCloud className="w-4 h-4" /> Select files
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="image/png, image/jpeg, image/webp" className="hidden" />
          
          {files.length > 0 && (
            <button onClick={() => { setFiles([]); setSelectedIds([]); setActiveFileId(null); }} className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border border-white/[0.05]">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
        
        {files.length > 0 && (
          <button onClick={downloadAll} className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95">
            <Archive className="w-4 h-4 text-emerald-400" /> Download all
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Panel: File List & Global Settings */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Global Batch Settings */}
          {files.length > 0 && (
            <div className="bg-[#050505]/60 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.05] shadow-xl">
                <div className="flex justify-between items-center mb-5">
                    <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors font-medium">
                        {selectedIds.length === files.length && files.length > 0 ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
                        Select all ({selectedIds.length}/{files.length})
                    </button>
                    <button onClick={handleCompressSelected} className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95">
                        <Settings2 className="w-3.5 h-3.5" /> Compress Selected
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Output Format</label>
                        <select value={globalFormat} onChange={(e) => setGlobalFormat(e.target.value)} className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                            <option value="JPEG">JPEG</option>
                            <option value="PNG">PNG (Lossless)</option>
                            <option value="WEBP">WebP</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Target KB (Opt)</label>
                        <input type="number" value={globalTargetKb} onChange={(e) => setGlobalTargetKb(e.target.value)} placeholder="e.g. 200" className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                        <span>Quality</span>
                        <span className="text-blue-400">{globalQuality}%</span>
                    </div>
                    <input type="range" min="1" max="100" value={globalQuality} onChange={(e) => setGlobalQuality(e.target.value)} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
            </div>
          )}

          {/* File List */}
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-2">
            {files.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/[0.05] border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center h-48">
                    <ImageIcon className="w-10 h-10 text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400">No images selected</p>
                </div>
            ) : (
                files.map(f => {
                    const isSelected = selectedIds.includes(f.id);
                    const isActive = activeFileId === f.id;
                    const savings = f.compressedSize ? Math.round((1 - (f.compressedSize / f.originalSize)) * 100) : 0;

                    return (
                        <div key={f.id} onClick={() => setActiveFileId(f.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-white/[0.05] border-blue-500/50' : 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.03]'}`}>
                            <div onClick={(e) => toggleSelect(f.id, e)} className="shrink-0 cursor-pointer">
                                {isSelected ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4 text-gray-500" />}
                            </div>
                            <img src={f.originalUrl} alt="thumb" className="w-12 h-12 rounded-lg object-cover bg-black/50 border border-white/10" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-200 truncate mb-1">{f.name}</p>
                                <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500 tracking-wide">
                                    <span>{formatBytes(f.originalSize)}</span>
                                    {f.status === 'compressing' && <span className="text-blue-400 animate-pulse">...</span>}
                                    {f.status === 'error' && <span className="text-rose-400">Failed</span>}
                                    {f.compressedSize && (
                                        <>
                                            <span>→</span>
                                            <span className="text-gray-300">{formatBytes(f.compressedSize)}</span>
                                            <span className={savings > 0 ? "text-emerald-400" : "text-rose-400"}>
                                                {savings > 0 ? `-${savings}%` : `+${Math.abs(savings)}%`}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {f.compressedUrl && (
                                    <button onClick={(e) => downloadFile(f.compressedUrl, f.name, e)} className="p-1.5 text-gray-400 hover:text-emerald-400 bg-white/5 hover:bg-white/10 rounded-md transition-colors">
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button onClick={(e) => removeFile(f.id, e)} className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )
                })
            )}
          </div>
        </div>

        {/* Right Panel: Individual Preview & Settings */}
        <div className="lg:col-span-7 bg-[#050505]/60 backdrop-blur-3xl rounded-[2rem] p-6 sm:p-8 border border-white/[0.05] shadow-2xl flex flex-col h-full min-h-[500px]">
          {!activeFile ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                 <Settings2 className="w-12 h-12 text-gray-600 mb-4" />
                 <p className="text-sm font-light text-gray-400">Select an image from the list to view details and settings.</p>
             </div>
          ) : (
             <div className="flex flex-col h-full">
                 
                 {/* Visual Comparison */}
                 <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="flex flex-col gap-2">
                         <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                             <span className="text-gray-500">Original</span>
                             <span className="text-gray-300">{formatBytes(activeFile.originalSize)}</span>
                         </div>
                         <div className="bg-black/40 rounded-2xl p-2 border border-white/[0.05] h-[220px] flex items-center justify-center overflow-hidden relative shadow-inner">
                             <img src={activeFile.originalUrl} className="max-w-full max-h-full object-contain" alt="Original" />
                         </div>
                     </div>
                     <div className="flex flex-col gap-2">
                         <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                             <span className="text-blue-400">Compressed</span>
                             <div className="flex gap-1.5">
                                 <span className="text-gray-300">{activeFile.compressedSize ? formatBytes(activeFile.compressedSize) : '---'}</span>
                                 {activeFile.compressedSize && (
                                    <span className={activeFile.compressedSize < activeFile.originalSize ? "text-emerald-400" : "text-rose-400"}>
                                        {activeFile.compressedSize < activeFile.originalSize ? '-' : '+'}{Math.abs(Math.round((1 - (activeFile.compressedSize / activeFile.originalSize)) * 100))}%
                                    </span>
                                 )}
                             </div>
                         </div>
                         <div className="bg-black/40 rounded-2xl p-2 border border-white/[0.05] h-[220px] flex items-center justify-center overflow-hidden relative shadow-inner">
                             {activeFile.status === 'compressing' ? (
                                 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                             ) : activeFile.compressedUrl ? (
                                <img src={activeFile.compressedUrl} className="max-w-full max-h-full object-contain" alt="Compressed" />
                             ) : (
                                <span className="text-xs font-medium tracking-wide text-gray-600">Pending compression</span>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Individual Settings */}
                 <div className="flex-1 flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Output Format</label>
                            <select 
                                value={activeFile.settings.format} 
                                onChange={(e) => setFiles(prev => prev.map(p => p.id === activeFile.id ? {...p, settings: {...p.settings, format: e.target.value}} : p))}
                                className="w-full bg-black/20 border border-white/[0.05] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="JPEG">JPEG</option>
                                <option value="PNG">PNG (Lossless)</option>
                                <option value="WEBP">WebP</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Target KB</label>
                            <input 
                                type="number" placeholder="Optional"
                                value={activeFile.settings.targetKb || ''}
                                onChange={(e) => setFiles(prev => prev.map(p => p.id === activeFile.id ? {...p, settings: {...p.settings, targetKb: e.target.value}} : p))}
                                className="w-full bg-black/20 border border-white/[0.05] rounded-xl p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" 
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                            <span>Quality</span>
                            <span className="text-blue-400">{activeFile.settings.quality}%</span>
                        </div>
                        <input 
                            type="range" min="1" max="100" 
                            value={activeFile.settings.quality} 
                            onChange={(e) => setFiles(prev => prev.map(p => p.id === activeFile.id ? {...p, settings: {...p.settings, quality: e.target.value}} : p))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                        />
                    </div>

                    <div className="pt-4 border-t border-white/[0.05]">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Dimensions</label>
                            <button 
                                onClick={() => setFiles(prev => prev.map(p => p.id === activeFile.id ? {...p, settings: {...p.settings, lockRatio: !p.settings.lockRatio}} : p))}
                                className={`text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider ${activeFile.settings.lockRatio ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Link2 className="w-3.5 h-3.5" /> {activeFile.settings.lockRatio ? 'Ratio Locked' : 'Ratio Unlocked'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-1">
                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Width (px)</label>
                                <input 
                                    type="number" 
                                    value={activeFile.settings.width || ''} 
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        let newHeight = activeFile.settings.height;
                                        if (activeFile.settings.lockRatio && activeFile.origWidth) {
                                            newHeight = Math.round((val / activeFile.origWidth) * activeFile.origHeight);
                                        }
                                        setFiles(prev => prev.map(p => p.id === activeFile.id ? {...p, settings: {...p.settings, width: val, height: newHeight}} : p))
                                    }}
                                    className="w-full bg-black/20 border border-white/[0.05] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500/50" 
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Height (px)</label>
                                <input 
                                    type="number" 
                                    value={activeFile.settings.height || ''} 
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        let newWidth = activeFile.settings.width;
                                        if (activeFile.settings.lockRatio && activeFile.origHeight) {
                                            newWidth = Math.round((val / activeFile.origHeight) * activeFile.origWidth);
                                        }
                                        setFiles(prev => prev.map(p => p.id === activeFile.id ? {...p, settings: {...p.settings, height: val, width: newWidth}} : p))
                                    }}
                                    className="w-full bg-black/20 border border-white/[0.05] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500/50" 
                                />
                            </div>
                        </div>
                        <p className="text-[9px] font-medium tracking-wide text-gray-600 mt-2">Original: {activeFile.origWidth} × {activeFile.origHeight}px</p>
                    </div>

                    <div className="mt-auto pt-4 flex gap-3">
                        <button 
                            onClick={handleCompressActive}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                            Apply & Compress
                        </button>
                        <button 
                            onClick={(e) => { if(activeFile.compressedUrl) downloadFile(activeFile.compressedUrl, activeFile.name, e); else showToast("Compress image first"); }}
                            disabled={!activeFile.compressedUrl}
                            className="flex items-center justify-center gap-2 px-8 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:hover:bg-white/[0.05] border border-white/[0.05] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95"
                        >
                            <Download className="w-4 h-4" /> Download
                        </button>
                    </div>
                 </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}