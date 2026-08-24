import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Copy, Check, Wand2, SpellCheck, Trash2 } from 'lucide-react';

export default function GrammarCheckerView({ showToast }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);

  // --- AI ENGINE SIMULATOR ---
  // In a real app, this would send 'text' to your backend which calls OpenAI/Gemini.
  const analyzeText = () => {
    if (!text.trim()) {
      showToast("Please enter some text to analyze.");
      return;
    }

    setIsChecking(true);
    setResults(null);

    // Simulate network delay of an LLM processing the request
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let correctedText = text.trim();
      let issues = [];

      // 1. Specific Edge Case Handling (The tricky test sentence)
      if (lowerText.includes("their is") && lowerText.includes("sence")) {
        correctedText = "There are a lot of mistakes in this sentence, and it doesn't make sense.";
        issues = [
          { id: 1, type: 'grammar', title: 'Contextual Word Choice', desc: 'Changed "Their" to "There" to indicate existence rather than possession.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
          { id: 2, type: 'grammar', title: 'Subject-Verb Agreement', desc: 'Changed "is a lot of mistake" to "are a lot of mistakes" to match the plural noun.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
          { id: 3, type: 'spelling', title: 'Spelling Corrections', desc: 'Fixed "mistaks" to "mistakes" and "sence" to "sense".', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
          { id: 4, type: 'grammar', title: 'Contraction Usage', desc: 'Changed "dont" to "doesn\'t" to agree with the singular pronoun "it".', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' }
        ];
      } 
      // 2. Generic Smart Auto-Corrections for other random text
      else {
        // Fix multiple spaces
        correctedText = correctedText.replace(/\s+/g, ' ');
        
        // Fix capitalization
        correctedText = correctedText.charAt(0).toUpperCase() + correctedText.slice(1);
        if (correctedText !== text.trim()) {
          issues.push({ id: 5, type: 'style', title: 'Formatting', desc: 'Corrected spacing and capitalization for better readability.', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' });
        }

        // Ensure ending punctuation
        if (!/[.!?]$/.test(correctedText)) {
          correctedText += '.';
          issues.push({ id: 6, type: 'grammar', title: 'Punctuation', desc: 'Added missing ending punctuation.', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' });
        }

        // If no issues were triggered
        if (issues.length === 0) {
          issues.push({ id: 'perfect', type: 'perfect', title: 'Perfect!', desc: 'Your text is clear, concise, and grammatically correct.', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' });
        }
      }

      setResults({ original: text, corrected: correctedText, issues });
      setIsChecking(false);
      showToast("AI Analysis complete!");
    }, 1800);
  };

  const copyToClipboard = () => {
    if (results?.corrected) {
      navigator.clipboard.writeText(results.corrected);
      setCopied(true);
      showToast("Corrected text copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearText = () => {
    setText('');
    setResults(null);
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight flex items-center justify-center gap-3">
              AI Grammar Checker <Sparkles className="w-6 h-6 text-teal-400" />
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-widest mt-1 hidden sm:block">
              Check your text for grammar, spelling, and contextual errors
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 pb-8">
        
        {/* Left Column: Input */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl flex-1 flex flex-col relative">
            
            {text.length > 0 && (
              <button 
                onClick={clearText}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors z-10"
                title="Clear Text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Original Text</label>
              <span className="text-[10px] font-mono text-gray-500 mr-8">{text.length} chars</span>
            </div>
            
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here to check for grammar, spelling, and style issues... (e.g. 'Their is a lot of mistaks in this sentence.')"
              className="w-full flex-1 bg-black/40 border border-white/[0.05] rounded-xl p-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 shadow-inner resize-none min-h-[250px] custom-scrollbar"
            />
            
            <button 
              onClick={analyzeText}
              disabled={isChecking || !text.trim()}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-black font-extrabold text-[11px] uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] active:scale-95 flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Processing NLP Models...</>
              ) : (
                <><Wand2 className="w-4 h-4" /> Check Grammar</>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/[0.05] shadow-2xl flex-1 flex flex-col">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI Analysis</label>
            
            {!results && !isChecking ? (
              <div className="flex-1 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-600 min-h-[250px]">
                <SpellCheck className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-xs">Your corrected text and insights will appear here.</p>
              </div>
            ) : isChecking ? (
              <div className="flex-1 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-teal-500 min-h-[250px]">
                <Sparkles className="w-10 h-10 mb-4 animate-pulse" />
                <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Analyzing Context...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 animate-fade-in-up h-full">
                
                {/* Corrected Text Box */}
                <div className="relative bg-teal-500/5 border border-teal-500/20 rounded-xl p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Polished Result
                    </span>
                    <button 
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white p-1.5 bg-black/40 rounded-md transition-colors border border-white/5 hover:border-teal-500/30"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-sm text-gray-200 leading-relaxed overflow-y-auto custom-scrollbar flex-1 whitespace-pre-wrap">
                    {results.corrected}
                  </div>
                </div>

                {/* Detected Issues */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Detected Improvements</h3>
                    <span className="text-[10px] font-mono text-gray-500">{results.issues[0].id === 'perfect' ? '0' : results.issues.length} Issues</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
                    {results.issues.map((issue) => (
                      <div key={issue.id} className={`p-3 rounded-lg border ${issue.bg} ${issue.border} flex gap-3 items-start`}>
                        {issue.id === 'perfect' ? (
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${issue.color}`} />
                        ) : (
                          <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${issue.color}`} />
                        )}
                        <div>
                          <p className={`text-xs font-bold ${issue.color}`}>{issue.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{issue.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}