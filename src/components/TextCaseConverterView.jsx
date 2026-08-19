import React, { useState } from 'react';
import { ArrowLeft, Copy, Eraser, Type, AlignLeft, CaseLower, CaseUpper, Scissors, Hash } from 'lucide-react';

export default function TextCaseConverterView({ onViewChange, showToast }) {
  const [text, setText] = useState('');

  const handleConvert = (type) => {
    if (!text) return;
    let newText = text;
    switch (type) {
      case 'uppercase': newText = text.toUpperCase(); break;
      case 'lowercase': newText = text.toLowerCase(); break;
      case 'titlecase': newText = text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); break;
      case 'sentencecase': newText = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase()); break;
      case 'alternatingcase': newText = text.toLowerCase().split('').map((c, i) => i % 2 === 0 ? c : c.toUpperCase()).join(''); break;
      case 'inversecase': newText = text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''); break;
      default: break;
    }
    setText(newText);
    showToast(`Formatted to ${type.replace('case', ' case')}`);
  };

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const actionButtons = [
    { id: 'sentencecase', label: 'Sentence case', icon: AlignLeft },
    { id: 'lowercase', label: 'lower case', icon: CaseLower },
    { id: 'uppercase', label: 'UPPER CASE', icon: CaseUpper },
    { id: 'titlecase', label: 'Title Case', icon: Type },
    { id: 'alternatingcase', label: 'aLtErNaTiNg', icon: Scissors },
    { id: 'inversecase', label: 'InVeRsE', icon: Hash },
  ];

  return (
    // Flex-col and min-h calculation ensures it spans the viewport beautifully without scrolling
    <div className="w-full px-4 sm:px-8 pt-4 pb-8 animate-fade-in-up max-w-[1600px] mx-auto flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      
      {/* Inline Header */}
      <div className="relative flex items-center justify-center mb-8 shrink-0">
        <button 
          onClick={() => onViewChange('home')}
          className="absolute left-0 group flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-xs font-semibold tracking-wide uppercase"
        >
          <div className="p-2 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] transition-all duration-300 border border-white/[0.05]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:block">All Tools</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 tracking-tight">
          Text Case Converter
        </h1>
      </div>

      {/* Main Immersive Editor Canvas */}
      <div className="flex-1 relative group flex flex-col w-full max-w-6xl mx-auto">
        
        {/* Ambient Glow behind the editor - visible on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 via-fuchsia-500/20 to-orange-500/20 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

        {/* Glassmorphic Container */}
        <div className="relative flex-1 flex flex-col bg-[#050505]/90 backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] shadow-2xl overflow-hidden">

          {/* Top Toolbar */}
          <div className="flex justify-between items-center px-6 sm:px-10 py-5 border-b border-white/[0.05] bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Interactive Canvas</span>
            </div>
            
            <div className="flex gap-3">
              <button onClick={copyToClipboard} className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.08] text-gray-300 hover:text-white px-4 py-2 rounded-xl border border-white/[0.05] transition-all hover:scale-105 active:scale-95">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button onClick={() => setText('')} className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl border border-rose-500/20 transition-all hover:scale-105 active:scale-95">
                <Eraser className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Huge, Borderless Textarea Area */}
          <div className="flex-1 p-6 sm:p-10 flex flex-col relative">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste your typography here..."
              className="flex-1 w-full bg-transparent text-xl sm:text-2xl md:text-3xl text-white/90 placeholder-white/10 font-light leading-relaxed focus:outline-none resize-none selection:bg-rose-500/30 transition-all"
            />

            {/* Sleek Floating Status Bar */}
            <div className="absolute bottom-6 right-10 flex items-center gap-6 text-[10px] font-bold tracking-widest text-gray-600 uppercase bg-[#030303]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/[0.03]">
              <span className={charCount > 0 ? 'text-gray-300' : ''}>{charCount} Chars</span>
              <div className="w-1 h-1 rounded-full bg-white/10"></div>
              <span className={wordCount > 0 ? 'text-gray-300' : ''}>{wordCount} Words</span>
            </div>
          </div>

          {/* Bottom Control Dock (Action Buttons) */}
          <div className="p-6 sm:p-8 bg-white/[0.02] border-t border-white/[0.05]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {actionButtons.map((btn) => {
                const Icon = btn.icon;
                return (
                  <button 
                    key={btn.id}
                    onClick={() => handleConvert(btn.id)} 
                    className="relative overflow-hidden group/btn bg-white/[0.02] hover:bg-rose-500/10 border border-white/[0.05] hover:border-rose-500/30 py-4 px-2 rounded-2xl transition-all duration-300 flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(244,63,94,0.25)] active:scale-95"
                  >
                    <Icon className="w-5 h-5 text-gray-500 group-hover/btn:text-rose-400 transition-colors" />
                    <span className="text-[11px] font-semibold tracking-wide text-gray-400 group-hover/btn:text-white transition-colors">
                      {btn.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}