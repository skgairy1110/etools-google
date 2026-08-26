import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UploadCloud, FileText, Download, 
  Trash2, CheckCircle2, FilePlus, Loader2, AlertTriangle, File, CloudLightning
} from 'lucide-react';

export default function WordToPdfView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [fileList, setFileList] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Grab the API key from your environment variables
  const API_SECRET = import.meta.env.VITE_CONVERT_API_SECRET;

  useEffect(() => {
    return () => {
      fileList.forEach(item => {
        if (item.pdfUrl) URL.revokeObjectURL(item.pdfUrl);
      });
    };
  }, [fileList]);

  const handleFilesAdded = (newFiles) => {
    const validExtensions = ['.docx', '.doc', '.txt', '.rtf'];
    const validFiles = Array.from(newFiles).filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length < newFiles.length && showToast) {
      showToast("Some files were skipped. Only DOCX, DOC, TXT, and RTF are supported.");
    }

    if (validFiles.length > 0) {
      const newItems = validFiles.map(file => ({
        id: Math.random().toString(36).substring(2, 9),
        file,
        status: 'pending',
        pdfUrl: null,
        error: null
      }));
      setFileList(prev => [...prev, ...newItems]);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) handleFilesAdded(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFilesAdded(e.dataTransfer.files);
  };

  const removeFile = (idToRemove) => {
    setFileList(prev => prev.filter(item => item.id !== idToRemove));
  };

  const clearAll = () => setFileList([]);

  // --- HIGH-FIDELITY CLOUD API CONVERSION ENGINE ---
  const convertFileToPdf = async (fileItem) => {
    if (!API_SECRET) {
      throw new Error("Missing API Key in .env.local (VITE_CONVERT_API_SECRET)");
    }

    const formData = new FormData();
    formData.append('File', fileItem.file);

    const response = await fetch(`https://v2.convertapi.com/convert/doc/to/pdf?Secret=${API_SECRET}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || "Conversion failed");
    }

    const data = await response.json();
    
    const fileData = data.Files[0].FileData;
    const byteCharacters = atob(fileData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const pdfBlob = new Blob([byteArray], { type: 'application/pdf' });
    
    return URL.createObjectURL(pdfBlob);
  };

  const handleConvertAll = async () => {
    if (!API_SECRET) {
      if (showToast) showToast("API Key is missing! Check your .env.local file.");
      return;
    }

    const pendingFiles = fileList.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length === 0) return;

    setIsConverting(true);

    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].status === 'done') continue;

      setFileList(prev => prev.map(item => item.id === fileList[i].id ? { ...item, status: 'converting' } : item));

      try {
        const url = await convertFileToPdf(fileList[i]);
        setFileList(prev => prev.map(item => item.id === fileList[i].id ? { ...item, status: 'done', pdfUrl: url } : item));
      } catch (err) {
        setFileList(prev => prev.map(item => item.id === fileList[i].id ? { ...item, status: 'error', error: err.message } : item));
      }
    }

    setIsConverting(false);
    if (showToast) showToast("Batch conversion complete!");
  };

  const handleDownload = (item) => {
    if (!item.pdfUrl) return;
    const a = document.createElement('a');
    a.href = item.pdfUrl;
    a.download = item.file.name.replace(/\.[^/.]+$/, "") + ".pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    const doneFiles = fileList.filter(f => f.status === 'done' && f.pdfUrl);
    doneFiles.forEach((file, index) => {
      setTimeout(() => handleDownload(file), index * 300);
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col items-center py-6 relative z-10 animate-fade-in-up overflow-hidden">
      
      {/* Top Nav */}
      <div className="w-full max-w-[900px] flex items-center justify-between px-6 mb-4 shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
      </div>

      <div className="w-full max-w-[900px] px-6 flex flex-col gap-4 h-full flex-1 min-h-0">
        
        {/* Header */}
        <div className="text-center shrink-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-2 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Word to PDF Converter</h1>
          <p className="text-xs text-gray-500 max-w-lg mx-auto hidden sm:block">
            High-fidelity cloud conversion. Preserves exact layout, fonts, and images.
          </p>
        </div>

        {/* Main Workspace */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-5 shadow-2xl flex flex-col flex-1 min-h-0 transition-all relative">
          
          {fileList.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex-1 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 cursor-pointer
                ${isDragging ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' : 'border-[#333] bg-[#0A0A0A] hover:bg-[#111] hover:border-[#444]'}
              `}
            >
              <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? 'text-blue-400 animate-bounce' : 'text-gray-500'}`} />
              <h2 className="text-lg font-bold text-white mb-2">Drop your documents here</h2>
              <p className="text-sm text-gray-500 mb-6 text-center">Batch convert DOCX, DOC, TXT, and RTF files with exact formatting.</p>
              <button className="bg-[#222] hover:bg-[#333] text-white font-semibold text-sm px-6 py-2.5 rounded-lg border border-[#444] transition-colors pointer-events-none">
                Browse Files
              </button>
              <input type="file" multiple accept=".docx,.doc,.txt,.rtf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4 shrink-0 border-b border-[#333] pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white bg-[#222] px-3 py-1 rounded-full">{fileList.length} Files</span>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isConverting}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold disabled:opacity-50"
                  >
                    <FilePlus className="w-3.5 h-3.5" /> Add More
                  </button>
                  <input type="file" multiple accept=".docx,.doc,.txt,.rtf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>

                <div className="flex items-center gap-2">
                  {fileList.some(f => f.status === 'done') && (
                    <button 
                      onClick={handleDownloadAll}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download All
                    </button>
                  )}
                  <button 
                    onClick={clearAll}
                    disabled={isConverting}
                    className="text-xs text-gray-500 hover:text-rose-400 font-bold bg-[#1a1a1a] border border-[#333] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Scrollable File List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3 min-h-0">
                {fileList.map(item => (
                  <div key={item.id} className="bg-[#0A0A0A] border border-[#333] rounded-xl p-4 flex items-center justify-between group transition-colors hover:border-[#444]">
                    <div className="flex items-center gap-3 min-w-0">
                      <File className="w-5 h-5 text-gray-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-[300px]" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{formatBytes(item.file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {item.status === 'pending' && <span className="text-[10px] font-bold text-amber-500/70 bg-amber-500/10 px-2 py-1 rounded">Pending</span>}
                      {item.status === 'converting' && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> Converting...
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded flex items-center gap-1.5" title={item.error}>
                          <AlertTriangle className="w-3 h-3" /> Error
                        </span>
                      )}

                      {item.status === 'done' ? (
                        <button 
                          onClick={() => handleDownload(item)}
                          className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => removeFile(item.id)}
                          disabled={isConverting}
                          className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action */}
              {fileList.some(f => f.status === 'pending' || f.status === 'error') && (
                <div className="shrink-0 mt-4 pt-4 border-t border-[#333]">
                  <button 
                    onClick={handleConvertAll}
                    disabled={isConverting}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#222] disabled:text-gray-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isConverting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing Layout...</>
                    ) : (
                      <>Convert {fileList.filter(f => f.status === 'pending' || f.status === 'error').length} Files to PDF</>
                    )}
                  </button>
                </div>
              )}
              
            </div>
          )}
        </div>
        
        {/* Cloud Notice */}
        <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-3 items-start text-blue-200/80 text-[10px]">
          <CloudLightning className="w-4 h-4 shrink-0 text-blue-400" />
          <p><strong>High-Fidelity Rendering:</strong> Documents are processed via a server-side engine to guarantee absolute layout, font, and table consistency with your original Word files.</p>
        </div>
      </div>
    </div>
  );
}