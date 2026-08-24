import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, X, Download, Settings2, FileArchive, RefreshCw 
} from 'lucide-react';
import JSZip from 'jszip';

export default function ImageFormatConverterView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Settings State
  const [outputFormat, setOutputFormat] = useState('image/png'); // image/png, image/jpeg, image/webp
  const [quality, setQuality] = useState(80);
  const [preserveTransparency, setPreserveTransparency] = useState(true);

  // --- FILE HANDLING ---
  const processFiles = (uploadedFiles) => {
    // Basic filter for images
    const validFiles = uploadedFiles.filter(f => f.type.startsWith('image/') || f.name.endsWith('.svg') || f.name.endsWith('.heic'));
    if (validFiles.length === 0) {
      if (showToast) showToast("Please upload valid image files.");
      return;
    }

    const newFiles = validFiles.map(file => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      file,
      name: file.name,
      originalUrl: URL.createObjectURL(file),
      originalSize: file.size,
      convertedUrl: null,
      convertedSize: null,
      status: 'pending', // pending, converted
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFileUpload = (e) => {
    processFiles(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const clearAll = () => setFiles([]);

  // --- CONVERSION ENGINE ---
  const convertFiles = async () => {
    setIsConverting(true);

    const convertedResults = await Promise.all(
      files.map(async (f) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = f.originalUrl;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Handle transparency
            if (outputFormat === 'image/jpeg' || !preserveTransparency) {
              ctx.fillStyle = '#FFFFFF'; // Fill white background
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0);

            // Apply quality only for lossy formats
            const qualityParam = outputFormat === 'image/png' ? undefined : quality / 100;

            canvas.toBlob((blob) => {
              if (blob) {
                resolve({
                  id: f.id,
                  convertedUrl: URL.createObjectURL(blob),
                  convertedSize: blob.size,
                  convertedBlob: blob, // Store blob for ZIP export
                  status: 'converted'
                });
              } else {
                resolve(f); // Fallback on error
              }
            }, outputFormat, qualityParam);
          };
          img.onerror = () => resolve(f);
        });
      })
    );

    setFiles(prev => prev.map(f => {
      const result = convertedResults.find(r => r.id === f.id);
      return result ? { ...f, ...result } : f;
    }));

    setIsConverting(false);
    if (showToast) showToast("All images converted!");
  };

  // --- DOWNLOAD LOGIC ---
  const getExtension = () => {
    if (outputFormat === 'image/jpeg') return 'jpg';
    if (outputFormat === 'image/webp') return 'webp';
    return 'png';
  };

  const getFormatLabel = () => {
    if (outputFormat === 'image/jpeg') return 'JPG';
    if (outputFormat === 'image/webp') return 'WebP';
    return 'PNG';
  };

  const triggerDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSingle = (file) => {
    if (!file.convertedUrl) return;
    const newName = file.name.replace(/\.[^/.]+$/, "") + `.${getExtension()}`;
    triggerDownload(file.convertedUrl, newName);
  };

  const downloadZip = async () => {
    const completedFiles = files.filter(f => f.status === 'converted' && f.convertedBlob);
    if (completedFiles.length === 0) return;

    setIsZipping(true);
    if (showToast) showToast("Generating ZIP file...");

    try {
      const zip = new JSZip();
      completedFiles.forEach((file) => {
        const newName = file.name.replace(/\.[^/.]+$/, "") + `.${getExtension()}`;
        zip.file(newName, file.convertedBlob);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);
      triggerDownload(zipUrl, `Converted_Images_${Date.now()}.zip`);
    } catch (error) {
      console.error("ZIP Error", error);
      if (showToast) showToast("Failed to generate ZIP.");
    } finally {
      setIsZipping(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isPng = outputFormat === 'image/png';
  const allConverted = files.length > 0 && files.every(f => f.status === 'converted');

  return (
    <div className="w-full min-h-screen bg-[#0E0E0E] text-gray-300 font-sans flex flex-col items-center pt-8 pb-24 relative z-10 animate-fade-in-up">
      
      {/* Top Nav */}
      <div className="w-full max-w-[1000px] flex items-center justify-between px-6 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">Image Format Converter</h1>
        <div className="w-20"></div> {/* Spacer for center alignment */}
      </div>

      <div className="w-full max-w-[1000px] px-6 flex flex-col gap-6">
        
        {/* DRAG & DROP ZONE */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
              : 'border-[#333] bg-[#141414] hover:bg-[#1A1A1A] hover:border-[#444]'
            }
          `}
        >
          <Upload className={`w-8 h-8 mb-4 ${isDragging ? 'text-blue-400 animate-bounce' : 'text-gray-400'}`} />
          <h2 className="text-lg font-bold text-white mb-2">Drag & drop images here</h2>
          <p className="text-sm text-gray-500 mb-6">Supports SVG, PNG, JPG, WebP, HEIC</p>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors pointer-events-none">
            <FileArchive className="w-4 h-4" /> Browse Files
          </button>
          <input type="file" multiple accept="image/*,.heic,.svg" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>

        {/* SETTINGS PANEL */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
          <div className="flex items-center gap-2 text-white font-bold mb-6">
            <Settings2 className="w-5 h-5 text-gray-400" /> Conversion Settings
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Format Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Output Format</label>
              <select 
                value={outputFormat} 
                onChange={e => setOutputFormat(e.target.value)} 
                className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="image/png">PNG (Lossless)</option>
                <option value="image/jpeg">JPG (Lossy)</option>
                <option value="image/webp">WebP (Modern)</option>
              </select>
            </div>

            {/* Quality Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-gray-400">Quality: {isPng ? 'N/A' : `${quality}%`}</label>
              </div>
              <input 
                type="range" min="1" max="100" value={quality} onChange={e => setQuality(e.target.value)} disabled={isPng}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isPng ? 'bg-[#222] accent-gray-500' : 'bg-[#333] accent-blue-500'}`} 
              />
            </div>

            {/* Transparency Toggle */}
            <div className="flex items-center gap-3 mt-4 md:mt-0 md:justify-end">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={preserveTransparency} onChange={() => setPreserveTransparency(!preserveTransparency)} disabled={outputFormat === 'image/jpeg'} className="sr-only peer" />
                <div className="w-11 h-6 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
              <span className={`text-sm font-medium ${outputFormat === 'image/jpeg' ? 'text-gray-600' : 'text-gray-300'}`}>Preserve transparency</span>
            </div>
          </div>
        </div>

        {/* ACTION BAR */}
        {files.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <span className="text-sm font-medium text-gray-400">{files.length} image{files.length !== 1 ? 's' : ''} added</span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={clearAll} className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-[#333] hover:bg-[#1A1A1A] text-white text-sm font-semibold transition-colors">
                Clear All
              </button>
              <button 
                onClick={convertFiles} disabled={isConverting}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isConverting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <RefreshCw className="w-4 h-4" />}
                Convert All to {getFormatLabel()}
              </button>
              <button 
                onClick={downloadZip} disabled={!allConverted || isZipping}
                className="flex-1 sm:flex-none bg-[#222] hover:bg-[#333] disabled:opacity-50 border border-[#333] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <FileArchive className="w-4 h-4" /> {isZipping ? 'Zipping...' : 'Download ZIP'}
              </button>
            </div>
          </div>
        )}

        {/* IMAGE GRID */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {files.map(file => (
              <div key={file.id} className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden flex flex-col group animate-fade-in-up">
                {/* Image Preview */}
                <div className="aspect-video bg-[#0A0A0A] relative flex items-center justify-center checkerboard-bg">
                  <img src={file.originalUrl} alt="preview" className="max-w-full max-h-full object-contain p-2" />
                  <button onClick={() => removeFile(file.id)} className="absolute top-2 right-2 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* File Info & Download */}
                <div className="p-4 flex flex-col gap-3">
                  <h3 className="text-white text-xs font-bold truncate" title={file.name}>{file.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span>{formatBytes(file.originalSize)}</span>
                    {file.convertedSize && (
                      <>
                        <span>→</span>
                        <span className="text-blue-400">{formatBytes(file.convertedSize)}</span>
                      </>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => downloadSingle(file)}
                    disabled={file.status !== 'converted'}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#222] disabled:text-gray-500 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 mt-1"
                  >
                    <Download className="w-3.5 h-3.5" /> 
                    {file.status === 'converted' ? `Download .${getExtension()}` : 'Pending'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .checkerboard-bg {
          background-image: 
            linear-gradient(45deg, #1A1A1A 25%, transparent 25%), 
            linear-gradient(-45deg, #1A1A1A 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1A1A1A 75%), 
            linear-gradient(-45deg, transparent 75%, #1A1A1A 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
      `}} />
    </div>
  );
}