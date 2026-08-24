import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Check, Sparkles, Layers, Sliders } from 'lucide-react';

const PRESET_PALETTES = [
  { name: "Neon Cyberpunk", colors: ["#00F5D4", "#7B2CBF", "#F72585", "#4CC9F0", "#7209B7"] },
  { name: "Sunset Horizon", colors: ["#FF7B00", "#FF8800", "#FF9500", "#FFA200", "#FFB703"] },
  { name: "Nordic Forest", colors: ["#2B2D42", "#8D99AE", "#EDF2F4", "#EF233C", "#D90429"] },
  { name: "Pastel Dream", colors: ["#CDB4DB", "#FFC8DD", "#FFAFCC", "#BDE0FE", "#A2D2FF"] },
  { name: "Emerald Luxe", colors: ["#064E3B", "#047857", "#10B981", "#34D399", "#A7F3D0"] }
];

export default function ColorGenieView({ showToast }) {
  const navigate = useNavigate();
  const [colors, setColors] = useState(["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"]);
  const [gradientAngle, setGradientAngle] = useState(90);
  const [gradientType, setGradientType] = useState("linear");
  const [copiedIndex, setCopiedKey] = useState(null);

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleRandomizePalette = () => {
    const newColors = colors.map(() => generateRandomColor());
    setColors(newColors);
    if (showToast) showToast("Generated new color palette!");
  };

  const handleColorChange = (index, value) => {
    const updated = [...colors];
    updated[index] = value.toUpperCase();
    setColors(updated);
  };

  const handleCopyCode = (text, identifier) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    if (showToast) showToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getGradientCSS = () => {
    const colorList = colors.slice(0, 3).join(', ');
    return gradientType === 'linear'
      ? `linear-gradient(${gradientAngle}deg, ${colorList})`
      : `radial-gradient(circle, ${colorList})`;
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-fade-in-up">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8 text-xs sm:text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tools
      </button>

      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3.5 py-1 rounded-full text-xs font-semibold mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" /> ColorGenie Studio
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
          Palette & Gradient Generator
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
          Craft, preview, and export vibrant color palettes and custom CSS gradients for your next web project.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121214] border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRandomizePalette}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Randomize Colors
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400 font-medium mr-2">Presets:</span>
          {PRESET_PALETTES.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setColors(p.colors);
                if (showToast) showToast(`Loaded ${p.name}`);
              }}
              className="bg-[#18181b] hover:bg-[#27272a] text-gray-300 text-xs px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Color Palette Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {colors.map((hex, idx) => (
          <div 
            key={idx}
            className="bg-[#121214] border border-white/5 hover:border-white/15 rounded-2xl p-4 flex flex-col items-center group transition-all"
          >
            <div 
              className="w-full h-32 rounded-xl mb-4 shadow-lg transition-transform duration-300 group-hover:scale-105 relative flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: hex }}
              onClick={() => handleCopyCode(hex, `card-${idx}`)}
            >
              <span className="opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-mono transition-opacity flex items-center gap-1.5">
                {copiedIndex === `card-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy HEX
              </span>
            </div>

            <div className="w-full flex items-center justify-between">
              <input 
                type="color"
                value={hex}
                onChange={(e) => handleColorChange(idx, e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none p-0"
              />
              <span className="text-xs font-mono font-bold text-white tracking-wider">{hex}</span>
              <button 
                onClick={() => handleCopyCode(hex, `btn-${idx}`)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
                title="Copy HEX"
              >
                {copiedIndex === `btn-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Gradient Preview Section */}
      <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" /> CSS Gradient Preview
          </h2>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Type:</label>
              <select
                value={gradientType}
                onChange={(e) => setGradientType(e.target.value)}
                className="bg-[#18181b] border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 outline-none"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>

            {gradientType === 'linear' && (
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-gray-400" />
                <label className="text-xs text-gray-400">Angle ({gradientAngle}°):</label>
                <input 
                  type="range"
                  min="0"
                  max="360"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(e.target.value)}
                  className="w-24 accent-purple-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Gradient Canvas */}
        <div 
          className="w-full h-48 sm:h-64 rounded-2xl border border-white/10 shadow-2xl mb-6 transition-all duration-300"
          style={{ background: getGradientCSS() }}
        />

        {/* CSS Export Output */}
        <div className="bg-[#18181b] border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
          <code className="text-xs sm:text-sm font-mono text-purple-300 truncate">
            background: {getGradientCSS()};
          </code>
          <button
            onClick={() => handleCopyCode(`background: ${getGradientCSS()};`, 'css-code')}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copiedIndex === 'css-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            Copy CSS
          </button>
        </div>
      </div>
    </div>
  );
}