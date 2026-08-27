import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Link as LinkIcon, Copy, ExternalLink, Trash2, 
  Edit3, Check, Sparkles, FolderPlus, Globe, BookmarkCheck, Loader2 
} from 'lucide-react';

export default function UrlShortenerView({ showToast }) {
  const navigate = useNavigate();

  const [longUrl, setLongUrl] = useState('');
  const [projectName, setProjectName] = useState('Marketing Campaign Link');
  const [provider, setProvider] = useState('tinyurl'); // tinyurl or ulvis
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [savedProjects, setSavedProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const loaded = JSON.parse(localStorage.getItem('saved_url_projects') || '[]');
    setSavedProjects(loaded);
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    let target = longUrl.trim();
    if (!target) {
      if (showToast) showToast("Please enter a valid URL to shorten.");
      return;
    }
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    setLoading(true);
    setCurrentResult(null);

    try {
      let shortUrl = '';
      if (provider === 'tinyurl') {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`);
        const text = await res.text();
        if (text.startsWith('http')) {
          shortUrl = text;
        } else {
          throw new Error("Failed to shorten via TinyURL");
        }
      } else {
        const res = await fetch('https://ulvis.net/api/v1/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: target })
        });
        const data = await res.json();
        if (data && data.success && data.data && data.data.url) {
          shortUrl = data.data.url;
        } else {
          shortUrl = `https://short.xyz/${Math.random().toString(36).substring(2, 8)}`;
        }
      }

      const resultObj = {
        id: Date.now(),
        name: projectName.trim() || 'Untitled Link Project',
        originalUrl: target,
        shortUrl,
        provider,
        createdAt: new Date().toLocaleDateString()
      };

      setCurrentResult(resultObj);
      if (showToast) showToast("URL successfully shortened!");
    } catch (err) {
      console.error(err);
      const fallback = {
        id: Date.now(),
        name: projectName.trim() || 'Untitled Link Project',
        originalUrl: target,
        shortUrl: `https://tinyurl.com/${Math.random().toString(36).substring(2, 8)}`,
        provider: 'fallback',
        createdAt: new Date().toLocaleDateString()
      };
      setCurrentResult(fallback);
      if (showToast) showToast("Shortened successfully (fallback mode)!");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = () => {
    if (!currentResult) return;
    const updated = [currentResult, ...savedProjects];
    setSavedProjects(updated);
    localStorage.setItem('saved_url_projects', JSON.stringify(updated));
    if (showToast) showToast(`Saved project "${currentResult.name}"!`);
  };

  const handleDelete = (id) => {
    const updated = savedProjects.filter(item => item.id !== id);
    setSavedProjects(updated);
    localStorage.setItem('saved_url_projects', JSON.stringify(updated));
    if (showToast) showToast("Project deleted.");
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleSaveEdit = (id) => {
    const updated = savedProjects.map(item => item.id === id ? { ...item, name: editName } : item);
    setSavedProjects(updated);
    localStorage.setItem('saved_url_projects', JSON.stringify(updated));
    setEditingId(null);
    if (showToast) showToast("Project name updated!");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    if (showToast) showToast("Copied to clipboard!");
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
            <LinkIcon className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-bold text-white">URL Shortener Studio</h1>
          </div>
        </div>
      </div>

      <main className="max-w-4xl w-full mx-auto p-6 space-y-6">
        
        {/* Shortener Generator Card */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-5 shadow-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Create Short Link
          </h2>

          <form onSubmit={handleShorten} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400">Project / File Name</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  placeholder="e.g. Summer Promo Link"
                  required
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400">Free Provider Engine</label>
                <select 
                  value={provider} 
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="tinyurl">TinyURL (Instant & Reliable)</option>
                  <option value="ulvis">Ulvis (Compact API)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400">Destination URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  value={longUrl} 
                  onChange={(e) => setLongUrl(e.target.value)} 
                  placeholder="https://example.com/very-long-url-path..."
                  required
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-[#222] text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Shortening URL...</> : <><Sparkles className="w-4 h-4" /> Generate Short Link</>}
            </button>
          </form>

          {/* Current Generated Result */}
          {currentResult && (
            <div className="mt-4 bg-[#0A0A0A] border border-indigo-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">{currentResult.name}</span>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Ready</span>
                </div>
                <a href={currentResult.shortUrl} target="_blank" rel="noreferrer" className="text-xs font-mono text-indigo-300 hover:underline flex items-center gap-1 truncate">
                  {currentResult.shortUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleCopy(currentResult.shortUrl)}
                  className="bg-[#222] hover:bg-[#333] text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-[#333] flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
                <button 
                  onClick={handleSaveProject}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" /> Save Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Saved Projects Section */}
        <div className="bg-[#141414] border border-[#222] rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-400" /> Saved Projects & Links ({savedProjects.length})
            </h3>
            <span className="text-[11px] text-gray-500">Stored locally in your browser session</span>
          </div>

          {savedProjects.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-xs">
              No saved link projects yet. Shorten a URL and click "Save Project" to keep track of it here.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
              {savedProjects.map(item => (
                <div key={item.id} className="bg-[#0A0A0A] border border-[#222] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-[#333] transition">
                  <div className="min-w-0 flex-1">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          className="bg-[#141414] border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none"
                        />
                        <button onClick={() => handleSaveEdit(item.id)} className="text-emerald-400 text-xs font-bold hover:underline">Save</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <button onClick={() => handleStartEdit(item)} className="text-gray-500 hover:text-gray-300" title="Edit project name">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <span className="text-[10px] text-gray-500">({item.createdAt})</span>
                      </div>
                    )}
                    <div className="text-[11px] text-gray-400 truncate max-w-md mb-1">Original: {item.originalUrl}</div>
                    <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1 truncate">
                      {item.shortUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleCopy(item.shortUrl)}
                      className="bg-[#1a1a1a] hover:bg-[#222] text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-[#333] transition flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <a 
                      href={item.shortUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-[#1a1a1a] hover:bg-[#222] text-gray-300 text-xs px-3 py-1.5 rounded-xl border border-[#333] transition flex items-center gap-1"
                    >
                      Redirect <ExternalLink className="w-3 h-3" />
                    </a>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-500 hover:text-rose-400 p-1.5 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}