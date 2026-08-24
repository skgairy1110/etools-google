import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, UploadCloud, X, FileUp, Trash2, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function ImageToPdfConverterView({ showToast }) {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = (files) => {
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length === 0) {
      showToast("Please upload valid image files (JPG, PNG).");
      return;
    }

    const newImages = validImages.map(file => ({
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const handleImageUpload = (e) => {
    processFiles(Array.from(e.target.files));
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
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (idToRemove) => {
    setImages(prev => prev.filter(img => img.id !== idToRemove));
  };

  const generatePDF = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      let pdf = null;

      for (let i = 0; i < images.length; i++) {
        const imgData = await new Promise((resolve) => {
          const img = new Image();
          img.src = images[i].preview;
          img.onload = () => resolve(img);
        });

        // Use exact image dimensions in pixels
        const imgWidth = imgData.width;
        const imgHeight = imgData.height;
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';

        if (i === 0) {
          // Initialize PDF with the first image's exact dimensions
          pdf = new jsPDF({
            orientation: orientation,
            unit: 'px',
            format: [imgWidth, imgHeight]
          });
        } else {
          // Add subsequent pages matching their respective image dimensions
          pdf.addPage([imgWidth, imgHeight], orientation);
        }

        // Draw the image to fill the exact dimensions of the page
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`Compiled_Document_${Date.now()}.pdf`);
      showToast("PDF generated successfully!");
      setImages([]); // Clear after success
    } catch (error) {
      console.error("PDF Generation Error:", error);
      showToast("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 pt-4 animate-fade-in-up max-w-[1200px] mx-auto flex flex-col min-h-[calc(100vh-120px)]">
      
      {/* Header */}
      <div className="relative flex items-center justify-center mb-8 shrink-0">
        <button onClick={() => navigate('/')} className="absolute left-0 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold tracking-wide uppercase">
          <div className="p-1.5 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] transition-all duration-300 border border-white/[0.05]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:block">Back</span>
        </button>
        <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 tracking-tight flex items-center justify-center gap-3">
              Image to PDF <FileText className="w-6 h-6 text-cyan-400" />
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-widest mt-1 hidden sm:block">
              Compile multiple images into a single PDF, preserving original dimensions
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 pb-8">
        
        {/* Left Column: Upload Zone */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`backdrop-blur-3xl rounded-[2rem] p-10 border-2 border-dashed shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[300px]
              ${isDragging 
                ? 'border-cyan-400 bg-cyan-500/[0.05] scale-[1.02]' 
                : 'border-white/[0.1] bg-[#050505]/80 hover:border-cyan-500/50 hover:bg-cyan-500/[0.02]'
              }
            `}
          >
            <UploadCloud className={`w-12 h-12 mb-4 transition-colors duration-300 ${isDragging ? 'text-cyan-400 animate-bounce' : 'text-cyan-500'}`} />
            <h3 className="text-white font-bold mb-2">Upload Images</h3>
            <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed">Drag & drop your JPG or PNG files here, or click to browse.</p>
            <input 
              type="file" 
              multiple 
              accept="image/png, image/jpeg, image/webp" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </div>

          <button 
            onClick={generatePDF}
            disabled={isGenerating || images.length === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:grayscale text-white font-extrabold text-[11px] uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Compiling PDF...</>
            ) : (
              <><FileUp className="w-4 h-4" /> Generate PDF ({images.length} Pages)</>
            )}
          </button>
        </div>

        {/* Right Column: Preview Grid */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                Document Preview
              </h2>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold bg-white/[0.05] px-2 py-1 rounded-md">
                {images.length > 0 ? `${images.length} Images Loaded` : 'No images'}
              </span>
            </div>

            {images.length === 0 ? (
              <div className="flex-1 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-600 min-h-[300px]">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-xs">Your compiled PDF pages will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 auto-rows-max overflow-y-auto custom-scrollbar pr-2 pb-4">
                {images.map((img, index) => (
                  <div key={img.id} className="relative group aspect-[1/1.4] bg-[#111] rounded-xl border border-white/10 overflow-hidden shadow-lg animate-fade-in-up">
                    <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                      {index + 1}
                    </div>
                    <button 
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-rose-500 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <img 
                      src={img.preview} 
                      alt={`Page ${index + 1}`} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}