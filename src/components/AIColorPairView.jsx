import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Palette, Copy, Check, Wand2, Layout } from 'lucide-react';

export default function AIColorPairView({ showToast }) {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedHex, setCopiedHex] = useState(null);
  const [palette, setPalette] = useState({
    name: "Midnight Interface",
    colors: [
      { role: "Background", hex: "#09090B", text: "#FFFFFF" },
      { role: "Surface", hex: "#18181A", text: "#E4E4E7" },
      { role: "Primary", hex: "#3B82F6", text: "#FFFFFF" },
      { role: "Secondary", hex: "#8B5CF6", text: "#FFFFFF" },
      { role: "Accent", hex: "#10B981", text: "#000000" }
    ]
  });

  // Smart aesthetic templates
  const suggestions = [
    "Wong Kar-wai cinematic night",
    "Studio Ghibli lush landscape",
    "Stranger Things upside down",
    "Tekken arcade electric",
    "Minimalist Scandinavian"
  ];

  // Simulated AI Engine with targeted aesthetics
  const generatePalette = () => {
    if (!prompt.trim()) return showToast("Please enter a description for your palette.");
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const p = prompt.toLowerCase();
      let newPalette = {};

      if (p.includes("wong") || p.includes("cinematic") || p.includes("neon")) {
        newPalette = {
          name: "In the Mood for Neon",
          colors: [
            { role: "Background", hex: "#0B0C10", text: "#FFFFFF" },
            { role: "Surface", hex: "#1F2833", text: "#C5C6C7" },
            { role: "Primary", hex: "#E94560", text: "#FFFFFF" },
            { role: "Secondary", hex: "#F9A826", text: "#000000" },
            { role: "Accent", hex: "#45A29E", text: "#000000" }
          ]
        };
      } else if (p.includes("ghibli") || p.includes("lush") || p.includes("nature")) {
        newPalette = {
          name: "Spirited Meadow",
          colors: [
            { role: "Background", hex: "#F4F1EA", text: "#2C3E50" },
            { role: "Surface", hex: "#E3E8E1", text: "#34495E" },
            { role: "Primary", hex: "#7A9D54", text: "#FFFFFF" },
            { role: "Secondary", hex: "#557A95", text: "#FFFFFF" },
            { role: "Accent", hex: "#E57373", text: "#FFFFFF" }
          ]
        };
      } else if (p.includes("stranger") || p.includes("retro") || p.includes("80s")) {
        newPalette = {
          name: "Hawkins 1983",
          colors: [
            { role: "Background", hex: "#0A0A1A", text: "#FFFFFF" },
            { role: "Surface", hex: "#1A1A2E", text: "#D1D5DB" },
            { role: "Primary", hex: "#E50914", text: "#FFFFFF" },
            { role: "Secondary", hex: "#833AB4", text: "#FFFFFF" },
            { role: "Accent", hex: "#00E5FF", text: "#000000" }
          ]
        };
      } else if (p.includes("tekken") || p.includes("arcade") || p.includes("electric")) {
        newPalette = {
          name: "Iron Fist Tournament",
          colors: [
            { role: "Background", hex: "#121212", text: "#FFFFFF" },
            { role: "Surface", hex: "#2A2A2A", text: "#E0E0E0" },
            { role: "Primary", hex: "#FF4500", text: "#FFFFFF" },
            { role: "Secondary", hex: "#2979FF", text: "#FFFFFF" },
            { role: "Accent", hex: "#FFD700", text: "#000000" }
          ]
        };
      } else {
        // Fallback procedural generation for random prompts
        const hue = Math.floor(Math.random() * 360);
        newPalette = {
          name: "AI Custom Generation",
          colors: [
            { role: "Background", hex: `hsl(${hue}, 20%, 10%)`, text: "#FFFFFF" },
            { role: "Surface", hex: `hsl(${hue}, 25%, 15%)`, text: "#E4E4E7" },
            { role: "Primary", hex: `hsl(${hue}, 80%, 60%)`, text: "#FFFFFF" },
            { role: "Secondary", hex: `hsl(${(hue + 30) % 360}, 70%, 55%)`, text: "#FFFFFF" },
            { role: "Accent", hex: `hsl(${(hue + 150) % 360}, 90%, 65%)`, text: "#000000" }
          ]
        };
      }

      setPalette(newPalette);
      setIsGenerating(false);
      showToast("Palette generated successfully!");
    }, 1200);
  };

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(`Copied ${hex}`);
    setTimeout(() => setCopiedHex(null), 2000);
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-tight flex items-center justify-center gap-3">
              AI Color Genie <Sparkles className="w-6 h-6 text-pink-400" />
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-widest mt-1 hidden sm:block">
              Generate UI-ready color pairs from text descriptions
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 pb-8">
        
        {/* Left Column: Input & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Describe your aesthetic</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A futuristic cyberpunk dashboard with neon accents..."
              className="w-full bg-black/40 border border-white/[0.05] rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 shadow-inner resize-none h-32 mb-4 custom-scrollbar"
            />
            <button 
              onClick={generatePalette}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 text-white font-extrabold text-[11px] uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Weaving Colors...</>
              ) : (
                <><Wand2 className="w-4 h-4" /> Generate Palette</>
              )}
            </button>
          </div>

          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl">
             <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette className="w-4 h-4"/> Try these aesthetics</span>
             <div className="flex flex-wrap gap-2">
               {suggestions.map((sug, idx) => (
                 <button 
                   key={idx}
                   onClick={() => setPrompt(sug)}
                   className="text-[10px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                 >
                   {sug}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Results & Preview */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Swatches */}
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white tracking-wide">{palette.name}</h2>
              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold bg-white/[0.05] px-2 py-1 rounded-md">Click hex to copy</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {palette.colors.map((color, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div 
                    onClick={() => copyToClipboard(color.hex)}
                    className="w-full aspect-square rounded-2xl shadow-inner cursor-pointer group relative overflow-hidden transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100">
                      {copiedHex === color.hex ? <Check className="w-6 h-6 text-white drop-shadow-md" /> : <Copy className="w-6 h-6 text-white drop-shadow-md" />}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{color.role}</p>
                    <p className="text-xs text-white font-mono mt-0.5">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live UI Preview */}
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl flex-1 flex flex-col">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Layout className="w-4 h-4"/> UI Application Preview</span>
            
            <div 
              className="flex-1 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-6 transition-colors duration-700"
              style={{ backgroundColor: palette.colors[0].hex }}
            >
              {/* Mock Dashboard Card */}
              <div 
                className="w-full max-w-sm rounded-xl p-6 shadow-2xl transition-colors duration-700"
                style={{ backgroundColor: palette.colors[1].hex }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-700" style={{ backgroundColor: palette.colors[2].hex }}>
                      <Sparkles className="w-5 h-5" style={{ color: palette.colors[2].text }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold transition-colors duration-700" style={{ color: palette.colors[1].text }}>Analytics Pro</h3>
                      <p className="text-[10px] opacity-60 transition-colors duration-700" style={{ color: palette.colors[1].text }}>Updated just now</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors duration-700" style={{ backgroundColor: palette.colors[4].hex, color: palette.colors[4].text }}>
                    Active
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="h-2 w-full rounded-full overflow-hidden transition-colors duration-700" style={{ backgroundColor: palette.colors[0].hex }}>
                    <div className="h-full w-[70%] rounded-full transition-colors duration-700" style={{ backgroundColor: palette.colors[2].hex }}></div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden transition-colors duration-700" style={{ backgroundColor: palette.colors[0].hex }}>
                    <div className="h-full w-[45%] rounded-full transition-colors duration-700" style={{ backgroundColor: palette.colors[3].hex }}></div>
                  </div>
                </div>

                <button 
                  className="w-full py-3 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                  style={{ backgroundColor: palette.colors[2].hex, color: palette.colors[2].text }}
                >
                  View Detailed Report
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}