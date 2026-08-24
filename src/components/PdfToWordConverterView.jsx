import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, FileDown, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun } from 'docx'; // IMPORT DOCX

export default function PdfToWordConverterView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [conversionState, setConversionState] = useState('idle'); // idle, uploading, converting, done
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // --- FILE HANDLING ---
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    
    if (uploadedFile.type !== 'application/pdf') {
      if (showToast) showToast("Please upload a valid PDF file.");
      return;
    }

    setFile(uploadedFile);
    setConversionState('idle');
    setDownloadUrl(null);
    setProgress(0);
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setConversionState('idle');
        setDownloadUrl(null);
      } else {
        if (showToast) showToast("Only PDF files are supported.");
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setConversionState('idle');
    setDownloadUrl(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- API SIMULATION & VALID DOCX GENERATION ---
  // --- REAL CONVERTAPI INTEGRATION ---
  const convertToWord = async () => {
    if (!file) return;
    setConversionState('uploading');
    setProgress(20);

    try {
      // 1. Prepare the file for upload
      const formData = new FormData();
      formData.append('File', file);

      // Note: In production, you should route this through your own backend (Next.js/Node)
      // to keep your Secret Key hidden.
      const SECRET_KEY = 'mbpbR7EbL2wQ8Ap6HTfarlO1aSmJDEHf'; 
      
      setProgress(50);
      setConversionState('converting');

      // 2. Call ConvertAPI
      const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/docx?Secret=${SECRET_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed on the server.");

      const data = await response.json();
      setProgress(90);

      // 3. Get the converted file URL from the response
      if (data.Files && data.Files.length > 0) {
        // ConvertAPI returns a base64 string or a direct URL.
        // We will decode their base64 response into a downloadable Blob.
        const fileData = data.Files[0].FileData;
        
        // Convert Base64 to Blob
        const byteCharacters = atob(fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

        setDownloadUrl(URL.createObjectURL(blob));
        setProgress(100);
        setConversionState('done');
        
        if (showToast) showToast("Conversion successful!");
      }

    } catch (error) {
      console.error("API Error:", error);
      setConversionState('idle');
      setProgress(0);
      if (showToast) showToast("Failed to convert document. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '.docx');
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
      <div className="w-full max-w-[800px] flex items-center justify-between px-6 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
      </div>

      <div className="w-full max-w-[800px] px-6 flex flex-col gap-6">
        
        {/* Header Title */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">PDF to Word Converter</h1>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Convert your PDF documents into editable Microsoft Word (.docx) files. Note: Perfect layout preservation requires server-side processing.
          </p>
        </div>

        {/* Dynamic Workspace */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          {!file ? (
            // DRAG AND DROP ZONE
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 cursor-pointer min-h-[300px]
                ${isDragging 
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' 
                  : 'border-[#333] hover:bg-[#1A1A1A] hover:border-[#444]'
                }
              `}
            >
              <Upload className={`w-10 h-10 mb-4 ${isDragging ? 'text-blue-400 animate-bounce' : 'text-gray-500'}`} />
              <h2 className="text-lg font-bold text-white mb-2">Select a PDF file</h2>
              <p className="text-sm text-gray-500 mb-6">Drag & drop your document here</p>
              <button className="bg-[#222] hover:bg-[#333] text-white font-semibold text-sm px-6 py-2.5 rounded-lg border border-[#444] transition-colors pointer-events-none">
                Browse Files
              </button>
              <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            // ACTIVE CONVERSION ZONE
            <div className="flex flex-col items-center animate-fade-in-up w-full">
              
              <div className="w-full bg-[#0A0A0A] border border-[#333] rounded-2xl p-6 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                    <FileText className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold truncate max-w-[200px] md:max-w-[400px]">{file.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{formatBytes(file.size)}</p>
                  </div>
                </div>
                {conversionState === 'idle' && (
                  <button onClick={clearFile} className="text-sm text-gray-400 hover:text-rose-400 transition-colors">Change file</button>
                )}
              </div>

              {conversionState === 'idle' && (
                <div className="w-full space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 items-start text-amber-200/80 text-xs">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                    <p><strong>Architecture Notice:</strong> Client-side conversion is simulated. You must connect an external API (like ConvertAPI) in <code>convertToWord()</code> to extract text and reconstruct formatting accurately into a DOCX payload.</p>
                  </div>
                  <button 
                    onClick={convertToWord}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" /> Convert to Word
                  </button>
                </div>
              )}

              {(conversionState === 'uploading' || conversionState === 'converting') && (
                <div className="w-full py-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 relative mb-6">
                    <svg className="animate-spin w-full h-full text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                      {progress}%
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {conversionState === 'uploading' ? 'Uploading securely...' : 'Reconstructing layout...'}
                  </h3>
                  <p className="text-gray-500 text-sm">Please do not close this window.</p>
                  
                  <div className="w-full max-w-sm h-1.5 bg-[#222] rounded-full mt-6 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {conversionState === 'done' && (
                <div className="w-full flex flex-col items-center py-6 animate-fade-in-up">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Ready to download</h3>
                  <p className="text-gray-500 text-sm mb-8 text-center max-w-md">Your document has been converted. Check the formatting after opening in Microsoft Word.</p>
                  
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={clearFile}
                      className="flex-1 bg-[#222] hover:bg-[#333] text-white font-semibold text-sm px-6 py-4 rounded-xl border border-[#444] transition-colors"
                    >
                      Convert Another
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      <FileDown className="w-5 h-5" /> Download .DOCX
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}