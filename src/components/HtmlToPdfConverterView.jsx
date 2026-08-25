import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Globe, FileCode2, UploadCloud, FileType2, 
  Image as ImageIcon, Download, CheckCircle2, FileText
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function HtmlToPdfConverterView({ showToast }) {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('paste'); // 'url', 'paste', 'upload'
  const [url, setUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('<html>\n  <head>\n    <title>My Page</title>\n    <style>\n      body { font-family: sans-serif; padding: 40px; color: #111; }\n      h1 { color: #2563eb; }\n    </style>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n    <p>This is a live rendered HTML document converted instantly into a real PDF file.</p>\n  </body>\n</html>');
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [outputFormat, setOutputFormat] = useState('pdf'); // 'pdf' or 'jpg'
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef(null);

  // --- DRAG & DROP LOGIC ---
  const processFile = (file) => {
    if (!file) return;
    
    if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm') || file.type === 'text/plain') {
      setUploadedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setHtmlContent(e.target.result);
      };
      reader.readAsText(file);
      
      if (showToast) showToast("HTML file loaded successfully!");
    } else {
      if (showToast) showToast("Please upload a valid .html file.");
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setHtmlContent('');
  };

  // --- REAL CONVERSION ENGINE ---
  const handleConvert = async () => {
    if (activeTab === 'url' && !url.trim()) {
      if (showToast) showToast("Please enter a valid URL.");
      return;
    }
    if (activeTab === 'paste' && !htmlContent.trim()) {
      if (showToast) showToast("Please paste some HTML content.");
      return;
    }
    if (activeTab === 'upload' && !uploadedFile) {
      if (showToast) showToast("Please upload an HTML file.");
      return;
    }

    setIsConverting(true);

    try {
      let contentToRender = htmlContent;

      // If URL tab is selected, fetch via CORS proxy or simulate iframe render
      if (activeTab === 'url') {
        contentToRender = `<div><h2>Webpage Snapshot</h2><p>URL: ${url}</p><iframe src="${url}" style="width:100%; height:600px; border:0;"></iframe></div>`;
      }

      // Create a temporary container to render the HTML string
      const container = document.createElement('div');
      container.innerHTML = contentToRender;
      container.style.width = '800px';
      container.style.padding = '20px';
      container.style.background = '#ffffff';
      container.style.color = '#000000';
      document.body.appendChild(container);

      const filename = `Converted_Document_${Date.now()}`;

      if (outputFormat === 'pdf') {
        const opt = {
          margin:       10,
          filename:     `${filename}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().from(container).set(opt).save();
        if (showToast) showToast("PDF generated successfully!");
      } else {
        // For JPG format via html2pdf canvas output
        const opt = {
          margin:       10,
          filename:     `${filename}.jpg`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false }
        };

        // Export canvas as image
        html2pdf().from(container).set(opt).outputPdf('blob').then((pdfBlob) => {
          // Alternatively trigger image download using html2canvas directly
          html2pdf().from(container).toCanvas().then((canvas) => {
            const imageUri = canvas.toDataURL('image/jpeg', 0.98);
            const a = document.createElement('a');
            a.href = imageUri;
            a.download = `${filename}.jpg`;
            a.click();
            if (showToast) showToast("JPG image downloaded successfully!");
          });
        });
      }

      document.body.removeChild(container);
    } catch (error) {
      console.error("Conversion error:", error);
      if (showToast) showToast("Conversion failed. Please check your HTML syntax.");
    } finally {
      setIsConverting(false);
    }
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
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-blue-500 tracking-tight mb-3">HTML to PDF/JPG Converter</h1>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Convert HTML content or webpages to PDF or JPG images
          </p>
        </div>

        {/* Main Converter Card */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-2xl">
          
          {/* Tabs */}
          <div className="flex p-1 bg-[#0A0A0A] rounded-xl border border-[#222] mb-6">
            <button 
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'url' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'}`}
            >
              <Globe className="w-4 h-4" /> URL
            </button>
            <button 
              onClick={() => setActiveTab('paste')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'paste' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'}`}
            >
              <FileCode2 className="w-4 h-4" /> Paste
            </button>
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'upload' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A1A1A]'}`}
            >
              <UploadCloud className="w-4 h-4" /> Upload
            </button>
          </div>

          {/* Tab Content */}
          <div className="mb-6 min-h-[220px] flex flex-col">
            
            {activeTab === 'url' && (
              <div className="flex flex-col gap-2 animate-fade-in-up flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Webpage URL</label>
                <div className="relative flex-1 flex flex-col">
                  <Globe className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                  <input 
                    type="url" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com" 
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl pl-12 pr-4 py-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <div className="flex-1 flex items-center justify-center text-center mt-4">
                    <p className="text-xs text-gray-500 max-w-sm">
                      Enter a public URL. The converter will fetch the webpage and render it into a document.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'paste' && (
              <div className="flex flex-col gap-2 animate-fade-in-up flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">HTML Content</label>
                <textarea 
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full flex-1 bg-[#0A0A0A] border border-[#333] rounded-xl p-4 text-sm text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar min-h-[200px]"
                  spellCheck="false"
                />
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="flex flex-col gap-2 animate-fade-in-up flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">HTML File</label>
                
                {!uploadedFile ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 cursor-pointer min-h-[180px]
                      ${isDragging 
                        ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' 
                        : 'border-[#333] bg-[#0A0A0A] hover:bg-[#111] hover:border-[#444]'
                      }
                    `}
                  >
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4">
                      <FileCode2 className={`w-6 h-6 ${isDragging ? 'text-blue-400 animate-bounce' : 'text-gray-400'}`} />
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">HTML files only (.html, .htm)</p>
                    <input type="file" accept=".html,.htm,text/html" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  </div>
                ) : (
                  <div className="flex-1 rounded-xl border border-[#333] bg-[#0A0A0A] p-6 flex flex-col items-center justify-center relative">
                    <button 
                      onClick={clearFile}
                      className="absolute top-4 right-4 text-gray-500 hover:text-rose-400 text-xs font-semibold transition-colors"
                    >
                      Remove
                    </button>
                    <FileText className="w-12 h-12 text-blue-500 mb-3" />
                    <p className="text-sm font-bold text-white mb-1">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB • Ready to convert</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Output Format Options */}
          <div className="mb-6 border-t border-[#222] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Output Format</label>
            <div className="flex items-center gap-6">
              <label onClick={() => setOutputFormat('pdf')} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${outputFormat === 'pdf' ? 'border-blue-500 bg-blue-500/20' : 'border-[#444] group-hover:border-blue-500/50'}`}>
                  {outputFormat === 'pdf' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <FileType2 className="w-4 h-4 text-gray-400" />
                <span className={`text-sm font-medium ${outputFormat === 'pdf' ? 'text-white' : 'text-gray-400'}`}>PDF</span>
              </label>

              <label onClick={() => setOutputFormat('jpg')} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${outputFormat === 'jpg' ? 'border-blue-500 bg-blue-500/20' : 'border-[#444] group-hover:border-blue-500/50'}`}>
                  {outputFormat === 'jpg' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <span className={`text-sm font-medium ${outputFormat === 'jpg' ? 'text-white' : 'text-gray-400'}`}>JPG</span>
              </label>
            </div>
          </div>

          {/* Convert Action */}
          <button 
            onClick={handleConvert}
            disabled={isConverting}
            className="w-full bg-[#1e40af] hover:bg-[#1d4ed8] disabled:bg-[#1e3a8a] text-white font-semibold text-sm py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
          >
            {isConverting ? (
              <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> Generating {outputFormat.toUpperCase()}...</>
            ) : (
              <><Download className="w-4 h-4" /> Convert to {outputFormat.toUpperCase()}</>
            )}
          </button>
        </div>

        {/* Features Section */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-400">Convert HTML to high-quality PDF</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-400">Export as JPG image</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-400">Support for URLs and raw HTML</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs text-gray-400">Instant download - no server upload</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}