import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Music, Upload, Download, Loader2, 
  Film, Sparkles, CheckCircle2, FileAudio, Play, Square
} from 'lucide-react';

export default function VideoToAudioConverterView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const hiddenVideoRef = useRef(null);

  const [videoFile, setVideoFile] = useState(null);
  const [outputFormat, setOutputFormat] = useState('wav'); // wav is natively supported for clean browser export
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const handleFileProcess = (file) => {
    if (!file.type.startsWith('video/')) {
      if (showToast) showToast("Please select a valid video file.");
      return;
    }
    setVideoFile(file);
    setAudioUrl(null);
    if (showToast) showToast(`Loaded video: ${file.name}`);
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Real client-side audio track extraction using AudioContext & Web APIs
  const handleConvert = async () => {
    if (!videoFile) return;

    setIsConverting(true);
    setProgress(20);

    try {
      const arrayBuffer = await videoFile.arrayBuffer();
      setProgress(40);

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      setProgress(60);

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setProgress(80);

      // Convert AudioBuffer to WAV Blob
      const wavBlob = bufferToWavBlob(audioBuffer);
      const url = URL.createObjectURL(wavBlob);

      setAudioUrl(url);
      setProgress(100);
      setIsConverting(false);
      if (showToast) showToast("Audio successfully extracted and converted!");
    } catch (err) {
      console.error(err);
      setIsConverting(false);
      if (showToast) showToast("Extraction failed. Try another video format.");
    }
  };

  // Helper function to encode AudioBuffer into a downloadable WAV file format
  const bufferToWavBlob = (buffer) => {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let result;
    if (numOfChan === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      result = buffer.getChannelData(0);
    }

    const dataLength = result.length * (bitDepth / 8);
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');

    // FMT sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
    view.setUint16(32, numOfChan * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);

    // Data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const interleave = (inputL, inputR) => {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    let index = 0;
    let inputIndex = 0;
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }
    return result;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleDownload = () => {
    if (!audioUrl || !videoFile) return;
    const baseName = videoFile.name.substring(0, videoFile.name.lastIndexOf('.')) || 'extracted-audio';
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${baseName}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (showToast) showToast("Audio file downloaded!");
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col overflow-y-auto custom-scrollbar relative z-10 animate-fade-in-up">
      
      {/* Top Navbar */}
      <div className="w-full h-16 bg-[#121212] border-b border-[#222] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-medium bg-[#1a1a1a] px-3 py-2 rounded-xl border border-[#333]">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
          </button>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-bold text-white">Video to Audio Converter</h1>
          </div>
        </div>

        {audioUrl && (
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          >
            <Download className="w-3.5 h-3.5" /> Download Audio (.WAV)
          </button>
        )}
      </div>

      <main className="max-w-4xl w-full mx-auto p-6 space-y-6">
        
        {/* Upload Card */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-6 shadow-2xl">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3
              ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' : 'border-[#333] hover:border-indigo-500 bg-[#0A0A0A]'}
            `}
          >
            <Film className="w-10 h-10 text-indigo-400 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                {videoFile ? videoFile.name : "Drag & drop video file or browse (MP4, MOV, WEBM)"}
              </h4>
              <p className="text-xs text-gray-500">100% browser-based audio track extraction</p>
            </div>
            <button className="bg-[#222] hover:bg-[#333] text-white font-semibold text-xs px-4 py-2 rounded-xl border border-[#444] transition-colors pointer-events-none mt-2">
              {videoFile ? "Change Video" : "Browse Video Files"}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="video/*" className="hidden" />
          </div>

          {videoFile && !audioUrl && !isConverting && (
            <button 
              onClick={handleConvert}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Extract & Convert to Audio Now
            </button>
          )}

          {isConverting && (
            <div className="space-y-3 rounded-2xl border border-[#333] bg-[#0A0A0A] p-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  Decoding video stream & converting audio...
                </div>
                <span className="text-gray-400 font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Ready Result & Player Card */}
        {audioUrl && (
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Audio Extracted Successfully!</h3>
                  <p className="text-xs text-gray-400">Listen to the preview or download below.</p>
                </div>
              </div>
              <button 
                onClick={handleDownload}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Audio
              </button>
            </div>

            <div className="bg-[#0A0A0A] p-4 rounded-2xl border border-[#333] flex items-center gap-4">
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="w-full" controls />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}