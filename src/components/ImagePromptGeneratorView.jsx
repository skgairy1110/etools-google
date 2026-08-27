import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  ArrowLeft, Wand2, Upload, Copy, Sparkles, 
  Image as ImageIcon, RefreshCw, Check, Code 
} from 'lucide-react';

export default function ImagePromptGeneratorView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState(null);
  const [promptStyle, setPromptStyle] = useState('photorealistic'); // photorealistic, cinematic, anime, minimalist
  const [isDragging, setIsDragging] = useState(false);

  const handleFileProcess = (file) => {
    if (!file.type.startsWith('image/')) {
      if (showToast) showToast("Please select a valid image file.");
      return;
    }
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setGeneratedPrompt(null);
    if (showToast) showToast(`Loaded image: ${file.name}`);
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

  const handleGenerate = () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setGeneratedPrompt(null);

    // Simulate smart AI visual analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      
      const styles = {
        photorealistic: "Cinematic hyper-realistic photography, 8k resolution, shot on 35mm lens, dramatic natural lighting, exquisite texture detail, volumetric atmosphere, unreal engine 5 render feel --ar 16:9 --v 6.0",
        cinematic: "Moody cinematic film still, anamorphic lens flare, rich deep color grading, dramatic shadow contrast, mysterious narrative depth, masterwork composition --ar 2.39:1",
        anime: "Makoto Shinkai style anime aesthetic, vibrant surreal sky, highly detailed background art, ethereal glow, magical atmosphere, beautiful painterly lighting --ar 16:9",
        minimalist: "Apple-inspired minimalist design, monochrome palette with single vibrant neon accent, generous whitespace, strict grid alignment, editorial typography focus, ultra-clean aesthetic"
      };

      const baseDescription = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || 'subject';
      const prompt = `A breathtaking composition depicting ${baseDescription.replace(/[-_]/g, ' ')}, featuring immaculate details, harmonious balance, professional color harmony. ${styles[promptStyle] || styles.photorealistic}`;
      
      setGeneratedPrompt(prompt);
      if (showToast) showToast("AI prompt successfully extracted!");
    }, 1800);
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    if (showToast) showToast("Prompt copied to clipboard!");
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
            <Wand2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-bold text-white">Image Prompt Generator</h1>
          </div>
        </div>
      </div>

      <main className="max-w-4xl w-full mx-auto p-6 space-y-6">
        
        {/* Upload & Generator Card with Drag & Drop */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-6 shadow-2xl">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3
              ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' : 'border-[#333] hover:border-indigo-500 bg-[#0A0A0A]'}
            `}
          >
            {imageUrl ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#333] shadow-lg">
                <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 transition-transform ${isDragging ? 'scale-110' : ''}`}>
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                {imageFile ? imageFile.name : isDragging ? "Drop your reference image here..." : "Drag & drop reference image or browse (PNG, JPG, WEBP)"}
              </h4>
              <p className="text-xs text-gray-500">Extract professional AI generation prompts instantly</p>
            </div>
            <button className="bg-[#222] hover:bg-[#333] text-white font-semibold text-xs px-4 py-2 rounded-xl border border-[#444] transition-colors pointer-events-none mt-1">
              {imageFile ? "Change Image" : "Browse Images"}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
          </div>

          {imageFile && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">Target Prompt Aesthetic Style</label>
                <select 
                  value={promptStyle} 
                  onChange={(e) => setPromptStyle(e.target.value)} 
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="photorealistic">Photorealistic (High Detail & Lighting)</option>
                  <option value="cinematic">Cinematic Film Still (Moody & Dramatic)</option>
                  <option value="anime">Anime / Makoto Shinkai Style</option>
                  <option value="minimalist">Apple-Inspired Minimalist Editorial</option>
                </select>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isAnalyzing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#222] text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Image Features & Lighting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Reverse Engineer Prompt
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Result Prompt Card */}
        {generatedPrompt && (
          <div className="bg-[#141414] border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Generated AI Prompt</h3>
              </div>
              <button 
                onClick={handleCopy}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Prompt
              </button>
            </div>

            <div className="bg-[#0A0A0A] border border-[#333] p-4 rounded-2xl font-mono text-xs text-indigo-200 leading-relaxed select-all">
              {generatedPrompt}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}