import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, UploadCloud, Film, Settings2, Download, 
  CheckCircle2, RefreshCw, PlaySquare, Trash2
} from 'lucide-react';
import gifshot from 'gifshot'; // <-- Import gifshot

export default function VideoToGifView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null); // Used to get actual video dimensions
  
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, converting, done
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // Settings
  const [fps, setFps] = useState(15);
  const [resolution, setResolution] = useState('480'); // width in px

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      // Data URIs don't necessarily need revoking, but good practice if we switched to Blobs
    };
  }, [videoUrl]);

  // --- DRAG & DROP LOGIC ---
  const processFile = (uploadedFile) => {
    if (!uploadedFile) return;
    
    if (uploadedFile.type.startsWith('video/')) {
      setFile(uploadedFile);
      setVideoUrl(URL.createObjectURL(uploadedFile));
      setStatus('idle');
      setProgress(0);
      setDownloadUrl(null);
      if (showToast) showToast("Video loaded successfully!");
    } else {
      if (showToast) showToast("Please upload a valid video file (MP4, WebM, MOV).");
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setStatus('idle');
    setDownloadUrl(null);
    setProgress(0);
  };

  // --- REAL CONVERSION ENGINE (GIFSHOT) ---
  const handleConvert = () => {
    if (!file || !videoUrl) return;
    setStatus('converting');
    setProgress(0);

    // Determine target width based on user selection
    let targetWidth = 480; 
    if (resolution === 'original' && videoRef.current) {
      // Use actual video width, capped at 800px to prevent browser crashes
      targetWidth = Math.min(videoRef.current.videoWidth, 800) || 480;
    } else if (resolution !== 'original') {
      targetWidth = parseInt(resolution);
    }

    // Convert FPS slider to frame duration (10 = 100ms/10fps for gifshot logic)
    // gifshot frameDuration is based on 10ms units. (e.g., 10 = 100ms)
    const calculatedFrameDuration = Math.max(1, Math.floor(100 / fps));

    gifshot.createGIF({
      video: [videoUrl],
      gifWidth: targetWidth,
      numFrames: Math.min(fps * 3, 60), // Generate up to 3 seconds of GIF based on FPS
      frameDuration: calculatedFrameDuration,
      sampleInterval: 10,
      progressCallback: (captureProgress) => {
        // Update the UI progress bar (captureProgress is a decimal between 0 and 1)
        setProgress(Math.round(captureProgress * 100));
      }
    }, (obj) => {
      if (!obj.error) {
        // obj.image is a base64 Data URI of the working animated GIF
        setDownloadUrl(obj.image);
        setProgress(100);
        setStatus('done');
        if (showToast) showToast("GIF generated successfully!");
      } else {
        console.error("Gifshot Error:", obj.error);
        setStatus('idle');
        if (showToast) showToast("Failed to generate GIF. Please try a smaller video.");
      }
    });
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    
    const newName = file.name.replace(/\.[^/.]+$/, "") + `_converted.gif`;
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col items-center pt-8 pb-24 relative z-10 animate-fade-in-up">
      
      {/* Top Nav */}
      <div className="w-full max-w-[900px] flex items-center justify-between px-6 mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
      </div>

      <div className="w-full max-w-[900px] px-6 flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-fuchsia-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-fuchsia-500/20">
            <PlaySquare className="w-8 h-8 text-fuchsia-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">Video to GIF Converter</h1>
          <p className="text-sm text-gray-400 max-w-lg mx-auto">
            Convert video files to animated GIFs with customizable framerates and resolutions.
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
              className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 cursor-pointer min-h-[300px]
                ${isDragging 
                  ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-[1.02]' 
                  : 'border-[#333] bg-[#0A0A0A] hover:bg-[#111] hover:border-[#444]'
                }
              `}
            >
              <UploadCloud className={`w-12 h-12 mb-4 ${isDragging ? 'text-fuchsia-400 animate-bounce' : 'text-gray-500'}`} />
              <h2 className="text-lg font-bold text-white mb-2">Select a Video file</h2>
              <p className="text-sm text-gray-500 mb-6 text-center">Supports MP4, WebM, MOV</p>
              <button className="bg-[#222] hover:bg-[#333] text-white font-semibold text-sm px-6 py-2.5 rounded-lg border border-[#444] transition-colors pointer-events-none">
                Browse Files
              </button>
              <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            // ACTIVE FILE ZONE
            <div className="flex flex-col animate-fade-in-up w-full gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Video Preview */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Film className="w-4 h-4" /> Original Video
                    </label>
                    {status === 'idle' && (
                      <button onClick={clearFile} className="text-xs text-gray-500 hover:text-rose-400 flex items-center gap-1 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-[#0A0A0A] border border-[#333] rounded-2xl overflow-hidden relative aspect-video flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls 
                      className="w-full h-full object-contain bg-black"
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]" title={file.name}>{file.name}</span>
                    <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                  </div>
                </div>

                {/* Right Column: Settings & Conversion */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    <Settings2 className="w-4 h-4" /> GIF Settings
                  </div>

                  {/* Resolution Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500">Width / Resolution</label>
                    <select 
                      value={resolution} 
                      onChange={e => setResolution(e.target.value)} 
                      disabled={status !== 'idle'}
                      className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <option value="original">Original Size</option>
                      <option value="720">720p (HD)</option>
                      <option value="480">480p (Standard)</option>
                      <option value="320">320p (Small)</option>
                    </select>
                  </div>

                  {/* FPS Slider */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-semibold text-gray-500">Frame Rate (FPS)</label>
                      <span className="text-xs font-bold text-fuchsia-400">{fps} fps</span>
                    </div>
                    <input 
                      type="range" min="5" max="30" step="5" 
                      value={fps} 
                      onChange={e => setFps(e.target.value)} 
                      disabled={status !== 'idle'}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-[#333] accent-fuchsia-500 disabled:opacity-50" 
                    />
                    <div className="flex justify-between text-[10px] text-gray-600 font-medium px-1">
                      <span>Choppy (Small Size)</span>
                      <span>Smooth (Large Size)</span>
                    </div>
                  </div>

                  <div className="flex-1"></div>

                  {/* Action Buttons */}
                  {status === 'idle' && (
                    <button 
                      onClick={handleConvert}
                      className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                      <RefreshCw className="w-5 h-5" /> Generate GIF
                    </button>
                  )}

                  {status === 'converting' && (
                    <div className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl p-5 mt-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-xs font-bold text-white">
                        <span>Encoding GIF...</span>
                        <span className="text-fuchsia-400">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-300 ease-out" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {status === 'done' && (
                    <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mt-4 flex flex-col gap-4 animate-fade-in-up">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-emerald-400">Conversion Complete</h4>
                          <p className="text-xs text-emerald-500/70">Your GIF is ready to download.</p>
                        </div>
                      </div>
                      
                      {/* Optional: Tiny preview of the finished GIF */}
                      <img src={downloadUrl} alt="GIF Preview" className="w-full h-20 object-cover rounded-lg border border-emerald-500/20 mb-2 opacity-80" />

                      <div className="flex gap-2">
                        <button 
                          onClick={handleDownload}
                          className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button 
                          onClick={clearFile}
                          className="bg-[#222] hover:bg-[#333] border border-[#444] text-white font-bold text-xs px-4 rounded-lg transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}