import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileJson, Copy, Check, Trash2, 
  CheckCircle2, AlertTriangle, Maximize2, Minimize2
} from 'lucide-react';

export default function JsonFormatterView({ showToast }) {
  const navigate = useNavigate();
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      if (showToast) showToast("Please paste some JSON first.");
      return;
    }
    
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
      if (showToast) showToast("JSON Formatted successfully!");
    } catch (err) {
      setError(err.message);
      setOutput('');
      if (showToast) showToast("Invalid JSON syntax.");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      if (showToast) showToast("JSON Minified successfully!");
    } catch (err) {
      setError(err.message);
      setOutput('');
      if (showToast) showToast("Invalid JSON syntax.");
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    if (showToast) showToast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    // FIX: Changed from min-h to strict h-[] and added overflow-hidden
    <div className="w-full h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col items-center py-6 relative z-10 animate-fade-in-up overflow-hidden">
      
      {/* Top Nav */}
      <div className="w-full max-w-[1400px] flex items-center justify-between px-6 mb-4 shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Tools
        </button>
      </div>

      {/* FIX: Added min-h-0 to prevent flex items from pushing the layout down */}
      <div className="w-full max-w-[1400px] px-6 flex flex-col gap-4 h-full flex-1 min-h-0">
        
        {/* Header - Made slightly more compact to save vertical space */}
        <div className="text-center shrink-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-amber-600/10 rounded-xl flex items-center justify-center mb-2 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <FileJson className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">JSON Formatter & Validator</h1>
          <p className="text-xs text-gray-500 max-w-lg mx-auto hidden sm:block">
            Beautify, minify, and validate complex JSON data instantly.
          </p>
        </div>

        {/* Main Workspace (Split Pane) - FIX: Added min-h-0 and pb-4 */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0 pb-4">
          
          {/* Left: Input Pane */}
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-5 shadow-2xl flex flex-col relative transition-all min-h-0">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Raw JSON
              </label>
              <button 
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-rose-400 flex items-center gap-1 transition-colors bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            
            {/* FIX: Added min-h-0 here as well */}
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"paste": "your messy JSON here"}'
              className="w-full flex-1 min-h-0 bg-[#0A0A0A] border border-[#333] rounded-xl p-4 text-sm text-amber-500/80 font-mono placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none custom-scrollbar"
              spellCheck="false"
            />

            <div className="grid grid-cols-2 gap-4 mt-4 shrink-0">
              <button 
                onClick={handleFormat}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-sm px-4 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95 flex items-center justify-center gap-2"
              >
                <Maximize2 className="w-4 h-4" /> Beautify
              </button>
              <button 
                onClick={handleMinify}
                className="w-full bg-[#222] hover:bg-[#333] border border-[#444] text-white font-bold text-sm px-4 py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Minimize2 className="w-4 h-4" /> Minify
              </button>
            </div>
          </div>

          {/* Right: Output/Error Pane */}
          <div className="bg-[#141414] border border-[#222] rounded-3xl p-5 shadow-2xl flex flex-col relative transition-all min-h-0">
            
            <div className="flex items-center justify-between mb-3 shrink-0">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                Output
              </label>
              {output && (
                <button 
                  onClick={handleCopy}
                  className="text-xs text-amber-500 hover:text-white flex items-center gap-1 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Data'}
                </button>
              )}
            </div>

            {error ? (
              <div className="w-full flex-1 min-h-0 bg-rose-500/5 border border-rose-500/20 rounded-xl p-6 flex flex-col font-mono text-sm overflow-hidden">
                <div className="flex items-center gap-2 text-rose-500 font-bold mb-4 shrink-0">
                  <AlertTriangle className="w-5 h-5" /> Invalid JSON Syntax
                </div>
                <div className="bg-rose-500/10 p-4 rounded-lg border border-rose-500/20 text-rose-400 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  {error}
                </div>
              </div>
            ) : (
              <textarea 
                value={output}
                readOnly
                placeholder="Processed JSON will appear here..."
                className="w-full flex-1 min-h-0 bg-[#0A0A0A] border border-[#333] rounded-xl p-4 text-sm text-emerald-400/90 font-mono placeholder-gray-600 focus:outline-none transition-colors resize-none custom-scrollbar"
                spellCheck="false"
              />
            )}
            
            {/* Status Indicator */}
            {output && !error && (
               <div className="mt-4 shrink-0 flex items-center justify-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Valid JSON
               </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}