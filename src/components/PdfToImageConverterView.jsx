import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ArrowLeft, RefreshCw, Upload } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for PDF.js using CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfToImageConverterView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pages, setPages] = useState([]);
  const [outputFormat, setOutputFormat] = useState('image/jpeg');
  const [scale, setScale] = useState(1.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Drag and Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        loadPdf(droppedFile);
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      loadPdf(e.target.files[0]);
    }
  };

  const loadPdf = async (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    setPdfFile(file);
    setIsProcessing(true);
    setProgress(0);
    setPages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setNumPages(pdf.numPages);

      const renderedPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL(outputFormat, 0.95);

        renderedPages.push({
          pageNumber: i,
          dataUrl: dataUrl,
          width: viewport.width,
          height: viewport.height
        });

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      setPages(renderedPages);
      if (showToast) showToast(`Loaded ${pdf.numPages} pages successfully!`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Error parsing PDF file.');
    }
    setIsProcessing(false);
  };

  const downloadSinglePage = (page) => {
    const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.href = page.dataUrl;
    link.download = `page-${page.pageNumber}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast(`Downloaded Page ${page.pageNumber}`);
  };

  const downloadAllPages = () => {
    pages.forEach((page) => {
      downloadSinglePage(page);
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-8 animate-fade-in-up">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tools
      </button>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-500 mb-3">PDF to Image Converter</h1>
        <p className="text-gray-400">Convert PDF pages to high-quality JPG or PNG images instantly</p>
      </div>

      {!pdfFile ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[350px] ${
            isDragging 
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
              : 'border-white/10 hover:border-blue-500/50 bg-[#121214]'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/pdf"
            className="hidden" 
          />
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
            isDragging ? 'bg-blue-500 text-white scale-110' : 'bg-blue-500/10 text-blue-500'
          }`}>
            {isDragging ? <Upload className="w-8 h-8 animate-bounce" /> : <FileText className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDragging ? 'Drop your PDF here' : 'Upload your PDF file'}
          </h3>
          <p className="text-gray-400 text-sm max-w-md mb-6">
            Drag and drop your PDF file directly onto this box, or click to select
          </p>
          <span className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl pointer-events-none">
            Select PDF
          </span>
        </div>
      ) : (
        <div>
          {/* Settings Bar */}
          <div className="bg-[#121214] rounded-2xl p-6 border border-white/5 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="text-white font-medium text-sm truncate max-w-xs">{pdfFile.name}</h3>
                <p className="text-xs text-gray-400">{numPages} Page{numPages > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <label className="text-xs text-gray-400 mr-2">Format:</label>
                <select 
                  value={outputFormat} 
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="bg-[#18181b] border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none"
                >
                  <option value="image/jpeg">JPG</option>
                  <option value="image/png">PNG</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mr-2">Quality/Scale:</label>
                <select 
                  value={scale} 
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="bg-[#18181b] border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none"
                >
                  <option value="1.0">Normal (1.0x)</option>
                  <option value="1.5">High (1.5x)</option>
                  <option value="2.0">Very High (2.0x)</option>
                  <option value="3.0">Ultra HD (3.0x)</option>
                </select>
              </div>

              <button 
                onClick={() => loadPdf(pdfFile)} 
                className="bg-[#18181b] hover:bg-[#27272a] border border-white/10 text-white text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-render
              </button>

              <button 
                onClick={() => { setPdfFile(null); setPages([]); }}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                Change PDF
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 mb-8 text-center">
              <p className="text-sm text-gray-300 mb-2">Converting PDF pages into images... ({progress}%)</p>
              <div className="w-full bg-[#18181b] rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {/* Download All Action */}
          {pages.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Preview Pages ({pages.length})</h2>
              <button 
                onClick={downloadAllPages}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Download className="w-4 h-4" /> Download All Pages
              </button>
            </div>
          )}

          {/* Pages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div key={page.pageNumber} className="bg-[#121214] border border-white/5 rounded-2xl p-4 flex flex-col items-center">
                <div className="bg-[#18181b] rounded-lg p-2 w-full flex items-center justify-center overflow-hidden mb-4 min-h-[200px]">
                  <img src={page.dataUrl} alt={`Page ${page.pageNumber}`} className="max-w-full max-h-[300px] object-contain rounded shadow" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-medium text-gray-400">Page {page.pageNumber}</span>
                  <button 
                    onClick={() => downloadSinglePage(page)}
                    className="bg-[#18181b] hover:bg-[#27272a] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}