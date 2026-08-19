import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Copy, Eraser, ScanText, X, FileText } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function ImageToTextConverterView({ showToast }) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setExtractedText('');
    } else {
      showToast('Please upload an image file (PNG, JPG, WEBP).');
    }
  };

  const preprocessImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const scale = 2; 
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const contrast = 50; 
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
          let color = factor * (avg - 128) + 128;
          color = color > 140 ? 255 : 0; 

          data[i] = color;       
          data[i + 1] = color;   
          data[i + 2] = color;   
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleExtractText = async () => {
    if (!selectedImage) return;
    
    setIsExtracting(true);
    setOcrProgress(0);
    setOcrStatus('Processing image filters...');

    try {
      const processedImage = await preprocessImage(selectedImage);

      const result = await Tesseract.recognize(
        processedImage,
        'eng',
        { 
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrStatus('Extracting text...');
              setOcrProgress(Math.round(m.progress * 100));
            } else {
              setOcrStatus(m.status.charAt(0).toUpperCase() + m.status.slice(1) + '...');
            }
          } 
        }
      );

      let cleanText = result.data.text
        .replace(/[^\x20-\x7E\n]/g, '') 
        .replace(/([|~_`{}\[\]\\]+)/g, '') 
        .replace(/\n\s*\n/g, '\n\n') 
        .trim();

      if (!cleanText) {
        setExtractedText("No readable text could be found in this image.");
        showToast("No text detected.");
      } else {
        setExtractedText(cleanText);
        showToast("Text extracted successfully!");
      }

    } catch (err) {
      console.error("OCR Error:", err);
      setExtractedText("An error occurred while reading the image. Please try a clearer image.");
      showToast("Extraction failed.");
    } finally {
      setIsExtracting(false);
      setOcrStatus('');
      setOcrProgress(0);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    showToast("Copied to clipboard!");
  };

  const clearAll = () => {
    setSelectedImage(null);
    setExtractedText('');
    setOcrStatus('');
    setOcrProgress(0);
  };

  return (
    <div className="w-full px-4 sm:px-8 pt-4 animate-fade-in-up max-w-[1600px] mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="relative flex items-center justify-center mb-6 shrink-0">
        <button 
          onClick={() => navigate('/')}
          className="absolute left-0 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold tracking-wide uppercase"
        >
          <div className="p-1.5 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] transition-all duration-300 border border-white/[0.05]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:block">Back</span>
        </button>
        <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 tracking-tight">
              Image to Text (OCR)
            </h1>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch relative min-h-0 pb-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-2xl p-5 border border-white/[0.05] shadow-2xl flex flex-col relative z-10">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[10px] font-bold tracking-widest text-gray-300 uppercase flex items-center gap-2">
              <ScanText className="w-3.5 h-3.5 text-violet-400" /> Source Image
            </label>
            {selectedImage && (
              <button onClick={() => setSelectedImage(null)} disabled={isExtracting} className="text-[9px] uppercase font-bold tracking-widest text-gray-500 hover:text-rose-400 disabled:opacity-50 transition-colors flex items-center gap-1">
                <X className="w-3 h-3" /> Remove
              </button>
            )}
          </div>

          {!selectedImage ? (
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 w-full flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                isDragging 
                  ? 'bg-violet-500/10 border-violet-500/50' 
                  : 'bg-black/20 border-white/[0.05] hover:border-white/[0.15] hover:bg-white/[0.02]'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
              <div className={`w-12 h-12 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-3 transition-transform duration-500 ${isDragging ? 'scale-110 -rotate-6' : ''}`}>
                <UploadCloud className="w-6 h-6 text-violet-400" />
              </div>
              <p className="text-xs font-semibold text-white mb-1">Click or drag an image here</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">PNG, JPG, WEBP</p>
            </div>
          ) : (
            <div className="flex-1 w-full bg-black/40 border border-white/[0.05] rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner min-h-0">
               <img src={selectedImage} alt="Source" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          )}

          <button 
            onClick={handleExtractText}
            disabled={isExtracting || !selectedImage}
            className="w-full mt-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white font-bold text-[11px] uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isExtracting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> 
                {ocrStatus} {ocrProgress > 0 ? `${ocrProgress}%` : ''}
              </>
            ) : (
              <><ScanText className="w-3.5 h-3.5" /> Run OCR Extraction</>
            )}
          </button>
        </div>

        <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-2xl p-5 border border-white/[0.05] shadow-2xl flex flex-col relative z-10">
          <div className="flex justify-between items-center mb-3">
            <label className="text-[10px] font-bold tracking-widest text-gray-300 uppercase flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-fuchsia-400" /> Extracted Text
            </label>
            <div className="flex gap-2">
              <button onClick={copyToClipboard} disabled={!extractedText || isExtracting} className="text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg border border-white/[0.05] transition-all hover:scale-105 active:scale-95">
                <Copy className="w-3 h-3" /> Copy
              </button>
              <button onClick={clearAll} disabled={(!selectedImage && !extractedText) || isExtracting} className="text-[9px] uppercase font-bold tracking-widest flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all hover:scale-105 active:scale-95">
                <Eraser className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative flex flex-col min-h-0">
            {!extractedText && !isExtracting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30 z-10">
                <FileText className="w-10 h-10 text-gray-500 mb-2" />
                <p className="text-xs font-light text-gray-400">Upload an image to extract text.</p>
              </div>
            )}
            
            <textarea 
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder=""
              className="flex-1 w-full bg-black/20 border border-white/[0.05] rounded-xl p-5 text-sm text-white/90 placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-black/40 resize-none transition-all shadow-inner font-mono leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}