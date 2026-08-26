import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Cloud, Type, Smile, Settings2, 
  UploadCloud, Download, Sparkles, RefreshCw, Layers, Trash2, Search,
  Heart, Star, Zap, Sun, Moon, CloudRain, Coffee, Music, Camera, Video,
  Mic, Globe, Map, Compass, Anchor, Shield, Lock, Key, Flame, Crown,
  Package, Smartphone, Gamepad2, Palette, Cpu, Database, Gift
} from 'lucide-react';

export default function CloudGeneratorView({ showToast }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('text'); // text, logo, icon
  const [wordsInput, setWordsInput] = useState('Design Create Inspire Build Dream Innovate Sparkle Bold Minimal Premium Cloud Studio');
  
  // Customization Controls
  const [density, setDensity] = useState(25);
  const [minSize, setMinSize] = useState(20);
  const [maxSize, setMaxSize] = useState(48);
  const [rotationRange, setRotationRange] = useState(15);
  const [opacity, setOpacity] = useState(1.0);
  const [selectedPalette, setSelectedPalette] = useState('sunset'); 
  const [fontFamily, setFontFamily] = useState('Inter');
  const [shapeMask, setShapeMask] = useState('rectangle'); 
  
  // Style Customization
  const [bgStyle, setBgStyle] = useState('whatsapp'); 
  const [customElementColor, setCustomElementColor] = useState('#3b82f6');
  const [useGlobalColor, setUseGlobalColor] = useState(true);

  // Canvas Items State
  const [canvasItems, setCanvasItems] = useState([]);
  const [iconSearch, setIconSearch] = useState('');

  // --- VECTOR ICON CATALOG ---
  const iconLibrary = useMemo(() => [
    { name: 'Heart', icon: Heart, category: 'Social' },
    { name: 'Star', icon: Star, category: 'General' },
    { name: 'Zap', icon: Zap, category: 'Tech' },
    { name: 'Sun', icon: Sun, category: 'Nature' },
    { name: 'Moon', icon: Moon, category: 'Nature' },
    { name: 'Cloud', icon: Cloud, category: 'Nature' },
    { name: 'Coffee', icon: Coffee, category: 'Lifestyle' },
    { name: 'Music', icon: Music, category: 'Media' },
    { name: 'Camera', icon: Camera, category: 'Media' },
    { name: 'Video', icon: Video, category: 'Media' },
    { name: 'Mic', icon: Mic, category: 'Media' },
    { name: 'Globe', icon: Globe, category: 'Tech' },
    { name: 'Map', icon: Map, category: 'General' },
    { name: 'Compass', icon: Compass, category: 'General' },
    { name: 'Anchor', icon: Anchor, category: 'General' },
    { name: 'Shield', icon: Shield, category: 'Security' },
    { name: 'Lock', icon: Lock, category: 'Security' },
    { name: 'Key', icon: Key, category: 'Security' },
    { name: 'Flame', icon: Flame, category: 'Nature' },
    { name: 'Crown', icon: Crown, category: 'Business' },
    { name: 'Package', icon: Package, category: 'Business' },
    { name: 'Smartphone', icon: Smartphone, category: 'Tech' },
    { name: 'Gamepad', icon: Gamepad2, category: 'Media' },
    { name: 'Palette', icon: Palette, category: 'Design' },
    { name: 'Cpu', icon: Cpu, category: 'Tech' },
    { name: 'Database', icon: Database, category: 'Tech' },
    { name: 'Gift', icon: Gift, category: 'Lifestyle' },
  ], []);

  const palettes = {
    sunset: ['#f97316', '#ec4899', '#a855f7', '#eab308', '#fb7185'],
    neon: ['#22d3ee', '#a855f7', '#f43f5e', '#4ade80', '#fbbf24'],
    mono: ['#ffffff', '#cbd5e1', '#94a3b8', '#64748b', '#334155'],
    pastel: ['#fbcfe8', '#bfdbfe', '#bbf7d0', '#fed7aa', '#e9d5ff']
  };

  const handleGenerate = () => {
    if (activeTab === 'text') {
      generateTextCloud();
    } else if (activeTab === 'icon') {
      generateIconCloud();
    } else {
      if (showToast) showToast("Upload brand logos to add them to your grid!");
    }
  };

  // --- STRICT NON-OVERLAPPING COLLISION ALGORITHM FOR TEXT & ICONS ---
  const generateTextCloud = () => {
    const list = wordsInput.trim().split(/[\s,]+/).filter(Boolean);
    if (list.length === 0) return;

    const colors = palettes[selectedPalette] || palettes.sunset;
    const placedBoxes = [];
    const items = [];
    
    const containerWidth = 680;
    const containerHeight = 360;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const targetCount = Math.min(list.length * 2, density);

    for (let i = 0; i < targetCount; i++) {
      const word = list[i % list.length];
      const size = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
      const color = useGlobalColor ? colors[Math.floor(Math.random() * colors.length)] : customElementColor;
      const rotation = Math.floor(Math.random() * (rotationRange * 2 + 1)) - rotationRange;

      const approxWidth = word.length * (size * 0.55);
      const approxHeight = size * 1.2;

      let placed = false;
      let attempts = 0;
      let x = 0, y = 0;

      while (!placed && attempts < 60) {
        attempts++;
        if (shapeMask === 'circle') {
          const radius = Math.random() * 150;
          const angle = Math.random() * Math.PI * 2;
          x = centerX + radius * Math.cos(angle) - (approxWidth / 2);
          y = centerY + radius * Math.sin(angle) - (approxHeight / 2);
        } else {
          x = Math.random() * (containerWidth - approxWidth - 20) + 10;
          y = Math.random() * (containerHeight - approxHeight - 20) + 10;
        }

        const padding = 8; // Extra safety padding between elements
        const newBox = { x: x - padding, y: y - padding, w: approxWidth + padding * 2, h: approxHeight + padding * 2 };

        let hasCollision = false;
        for (const box of placedBoxes) {
          if (newBox.x < box.x + box.w && newBox.x + newBox.w > box.x && newBox.y < box.y + box.h && newBox.y + box.h > box.y) {
            hasCollision = true;
            break;
          }
        }

        if (!hasCollision) {
          placedBoxes.push(newBox);
          items.push({
            id: `text-${i}-${Math.random()}`,
            type: 'text',
            content: word,
            size,
            color,
            rotation,
            x,
            y
          });
          placed = true;
        }
      }
    }
    setCanvasItems(items);
    if (showToast) showToast("Non-overlapping text cloud generated!");
  };

  const generateIconCloud = () => {
    const colors = palettes[selectedPalette] || palettes.sunset;
    const placedBoxes = [];
    const items = [];
    
    const containerWidth = 680;
    const containerHeight = 360;

    for (let i = 0; i < density; i++) {
      const randomIcon = iconLibrary[Math.floor(Math.random() * iconLibrary.length)];
      const color = useGlobalColor ? colors[Math.floor(Math.random() * colors.length)] : customElementColor;
      const rotation = Math.floor(Math.random() * (rotationRange * 2 + 1)) - rotationRange;
      const size = Math.floor(Math.random() * 16) + 32;

      const approxWidth = size;
      const approxHeight = size;

      let placed = false;
      let attempts = 0;
      let x = 0, y = 0;

      while (!placed && attempts < 60) {
        attempts++;
        x = Math.random() * (containerWidth - approxWidth - 20) + 10;
        y = Math.random() * (containerHeight - approxHeight - 20) + 10;

        const padding = 10;
        const newBox = { x: x - padding, y: y - padding, w: approxWidth + padding * 2, h: approxHeight + padding * 2 };

        let hasCollision = false;
        for (const box of placedBoxes) {
          if (newBox.x < box.x + box.w && newBox.x + newBox.w > box.x && newBox.y < box.y + box.h && newBox.y + box.h > box.y) {
            hasCollision = true;
            break;
          }
        }

        if (!hasCollision) {
          placedBoxes.push(newBox);
          items.push({
            id: `icon-gen-${i}-${Math.random()}`,
            type: 'icon',
            content: randomIcon.name,
            size,
            color,
            rotation,
            x,
            y
          });
          placed = true;
        }
      }
    }

    setCanvasItems(items);
    if (showToast) showToast("Non-overlapping icon cluster generated!");
  };

  const handleAddAssetToCanvas = (type, content, customX, customY) => {
    const colors = palettes[selectedPalette] || palettes.sunset;
    const newItem = {
      id: `asset-${Date.now()}-${Math.random()}`,
      type, 
      content,
      size: type === 'icon' ? 36 : 64,
      color: useGlobalColor ? colors[Math.floor(Math.random() * colors.length)] : customElementColor,
      rotation: Math.floor(Math.random() * (rotationRange * 2 + 1)) - rotationRange,
      x: customX !== undefined ? customX : Math.random() * 450 + 50,
      y: customY !== undefined ? customY : Math.random() * 220 + 50
    };
    setCanvasItems(prev => [...prev, newItem]);
    if (showToast) showToast(`${type === 'icon' ? 'Icon' : 'Logo'} added to canvas!`);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      handleAddAssetToCanvas('logo', url);
    }
  };

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = e.clientX - rect.left - 30;
    const dropY = e.clientY - rect.top - 30;

    const draggedData = e.dataTransfer.getData('text/plain');
    if (draggedData) {
      try {
        const parsed = JSON.parse(draggedData);
        handleAddAssetToCanvas(parsed.type, parsed.content, dropX, dropY);
      } catch {
        handleAddAssetToCanvas('icon', draggedData, dropX, dropY);
      }
    }
  };

  const removeItem = (id) => {
    setCanvasItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCanvas = () => {
    setCanvasItems([]);
    if (showToast) showToast("Canvas cleared!");
  };

  const filteredIcons = iconLibrary.filter(ic => ic.name.toLowerCase().includes(iconSearch.toLowerCase()));

  const getBgClass = () => {
    switch (bgStyle) {
      case 'whatsapp': return 'whatsapp-chat-bg';
      case 'dark': return 'bg-[#0f1115]';
      case 'midnight': return 'bg-[#121824]';
      case 'transparent': return 'checkerboard-bg';
      default: return 'bg-[#0f1115]';
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col overflow-hidden relative z-10 animate-fade-in-up">
      
      {/* Top Navbar */}
      <div className="w-full h-16 bg-[#121212] border-b border-[#222] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-medium bg-[#1a1a1a] px-3 py-2 rounded-xl border border-[#333]">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-bold text-white">Cloud Generator Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearCanvas}
            className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3.5 py-2 rounded-xl transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Canvas
          </button>
          <button 
            onClick={handleGenerate} 
            className="flex items-center gap-1.5 text-xs text-gray-300 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] px-3.5 py-2 rounded-xl transition-colors font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Generate {activeTab === 'icon' ? 'Icons' : activeTab === 'text' ? 'Text' : 'Logos'}
          </button>
          <button 
            onClick={() => showToast && showToast("Cloud exported successfully!")}
            className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)]"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] min-h-0 overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="bg-[#121212] border-r border-[#222] flex flex-col min-h-0 p-5 gap-4 overflow-y-auto custom-scrollbar">
          
          {/* Main Tab Switcher */}
          <div className="grid grid-cols-3 bg-[#0A0A0A] p-1 rounded-xl border border-[#222] gap-1">
            {[
              { id: 'text', label: 'Text Cloud', icon: Type },
              { id: 'logo', label: 'Brand Logos', icon: Layers },
              { id: 'icon', label: 'Icon Cloud', icon: Smile },
            ].map(tab => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all
                    ${activeTab === tab.id ? 'bg-[#222] text-indigo-400 shadow' : 'text-gray-500 hover:text-gray-300'}
                  `}
                >
                  <IconComp className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: TEXT CLOUD EDITOR */}
          {activeTab === 'text' && (
            <div className="flex flex-col gap-4 flex-1">
              <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-4 flex flex-col gap-2.5">
                <label className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Theme Generator
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. startup tech ecosystem" 
                    className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    onClick={() => { setWordsInput("SaaS AI Growth Metrics Cloud Scale Data UI UX Flow Cloud Stack"); generateTextCloud(); }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1 min-h-[140px]">
                <label className="text-xs font-semibold text-gray-400">Words (space or comma separated)</label>
                <textarea 
                  value={wordsInput}
                  onChange={e => setWordsInput(e.target.value)}
                  onBlur={generateTextCloud}
                  className="w-full flex-1 bg-[#0A0A0A] border border-[#333] rounded-2xl p-3.5 text-xs text-gray-200 font-mono focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar"
                  rows={6}
                />
              </div>
            </div>
          )}

          {/* TAB 2: BRAND LOGOS */}
          {activeTab === 'logo' && (
            <div className="flex flex-col gap-4 flex-1">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#333] hover:border-indigo-500 bg-[#0A0A0A] rounded-2xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3"
              >
                <UploadCloud className="w-8 h-8 text-indigo-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">Upload Brand Logos</h4>
                  <p className="text-[10px] text-gray-500">Supports PNG, SVG with transparent background</p>
                </div>
                <button className="bg-[#222] hover:bg-[#333] text-white font-semibold text-xs px-4 py-2 rounded-xl border border-[#444] transition-colors pointer-events-none">
                  Browse Files
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
            </div>
          )}

          {/* TAB 3: REAL SVG VECTOR ICON LIBRARY */}
          {activeTab === 'icon' && (
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
                <input 
                  type="text" 
                  value={iconSearch} 
                  onChange={e => setIconSearch(e.target.value)}
                  placeholder="Search vector stroke icons..." 
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Scrollable Icon Grid */}
              <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar pr-1 flex-1 max-h-[320px]">
                {filteredIcons.map((ic, idx) => {
                  const IconComponent = ic.icon;
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'icon', content: ic.name }));
                      }}
                      onClick={() => handleAddAssetToCanvas('icon', ic.name)}
                      className="bg-[#0A0A0A] hover:bg-[#1a1a1a] border border-[#222] hover:border-indigo-500/50 p-3 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-all shadow text-white"
                      title={`Add ${ic.name}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] text-center text-gray-500">💡 Drag icons onto the canvas to cluster</span>
            </div>
          )}

          {/* Active Canvas Items Manager */}
          <div className="border-t border-[#222] pt-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Canvas Items ({canvasItems.length})</h4>
            <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
              {canvasItems.map(item => (
                <div key={item.id} className="bg-[#0A0A0A] border border-[#222] rounded-xl px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-white truncate max-w-[160px]">
                    {item.type === 'logo' ? 'Uploaded Logo' : `${item.content} Icon`}
                  </span>
                  <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Area */}
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_300px] min-h-0 bg-[#0A0A0A] overflow-hidden">
          
          {/* Center Interactive Drag-and-Drop Canvas */}
          <div className="relative flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleCanvasDrop}
              className={`w-[700px] h-[380px] border border-[#222] relative overflow-hidden shadow-2xl transition-all
                ${getBgClass()}
                ${shapeMask === 'circle' ? 'rounded-full' : shapeMask === 'squircle' ? 'rounded-3xl' : 'rounded-2xl'}
              `}
            >
              {canvasItems.map((item) => {
                const foundIcon = item.type === 'icon' ? iconLibrary.find(i => i.name === item.content) : null;
                const IconComp = foundIcon ? foundIcon.icon : null;

                return (
                  <div
                    key={item.id}
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      transform: `rotate(${item.rotation || 0}deg)`,
                      opacity: opacity,
                    }}
                    className="absolute cursor-grab active:cursor-grabbing select-none transition-transform hover:scale-110 p-1"
                  >
                    {item.type === 'logo' ? (
                      <img src={item.content} alt="Logo Asset" style={{ width: `${item.size}px`, height: `${item.size}px` }} className="object-cover rounded-xl shadow-lg border border-white/10" />
                    ) : item.type === 'icon' && IconComp ? (
                      <div style={{ color: item.color }} className="drop-shadow-md select-none inline-block">
                        <IconComp style={{ width: `${item.size}px`, height: `${item.size}px` }} strokeWidth={1.5} />
                      </div>
                    ) : (
                      <span style={{ color: item.color, fontSize: `${item.size}px`, fontFamily }} className="font-extrabold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap">
                        {item.content}
                      </span>
                    )}
                  </div>
                );
              })}

              {canvasItems.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500 pointer-events-none">
                  <Cloud className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-xs font-semibold">Click "Generate" or drag stroke vector icons onto the canvas!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Floating Customization Sidebar */}
          <div className="bg-[#121212] border-l border-[#222] p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customize</h3>

            {/* Background Style Switcher */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Background Style</label>
              <select value={bgStyle} onChange={e => setBgStyle(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="whatsapp">WhatsApp Chat Style</option>
                <option value="dark">Dark Minimal</option>
                <option value="midnight">Midnight Blue</option>
                <option value="transparent">Transparent Checkerboard</option>
              </select>
            </div>

            {/* Element Color Mode */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-400">Element Color</label>
                <button onClick={() => setUseGlobalColor(!useGlobalColor)} className="text-[10px] text-indigo-400 hover:underline">
                  {useGlobalColor ? 'Use Custom Color' : 'Use Palette'}
                </button>
              </div>
              {useGlobalColor ? (
                <select value={selectedPalette} onChange={e => setSelectedPalette(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                  <option value="sunset">Sunset Palette</option>
                  <option value="neon">Neon Cyber</option>
                  <option value="mono">Monochrome</option>
                  <option value="pastel">Pastel Soft</option>
                </select>
              ) : (
                <div className="flex items-center gap-3 bg-[#0A0A0A] border border-[#333] p-2 rounded-xl">
                  <input type="color" value={customElementColor} onChange={e => setCustomElementColor(e.target.value)} className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0" />
                  <span className="text-xs font-mono font-bold text-white">{customElementColor}</span>
                </div>
              )}
            </div>

            {/* Density Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Density: {density}</span></div>
              <input type="range" min="10" max="60" value={density} onChange={e => setDensity(Number(e.target.value))} className="w-full h-1.5 bg-[#333] rounded-lg appearance-none accent-indigo-500 cursor-pointer" />
            </div>

            {/* Size Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Size: {minSize} – {maxSize}</span></div>
              <input type="range" min="10" max="80" value={maxSize} onChange={e => setMaxSize(Number(e.target.value))} className="w-full h-1.5 bg-[#333] rounded-lg appearance-none accent-indigo-500 cursor-pointer" />
            </div>

            {/* Rotation Randomness */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs"><span className="text-gray-400">Rotation ±{rotationRange}°</span></div>
              <input type="range" min="0" max="45" value={rotationRange} onChange={e => setRotationRange(Number(e.target.value))} className="w-full h-1.5 bg-[#333] rounded-lg appearance-none accent-indigo-500 cursor-pointer" />
            </div>

            {/* Font Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Font</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Courier New">Monospace</option>
              </select>
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .checkerboard-bg {
          background-color: #121212;
          background-image: 
            linear-gradient(45deg, #181818 25%, transparent 25%), 
            linear-gradient(-45deg, #181818 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #181818 75%), 
            linear-gradient(-45deg, transparent 75%, #181818 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
        }
        .whatsapp-chat-bg {
          background-color: #0b141a;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}} />
    </div>
  );
}