import React, { useState } from 'react';
import { 
  Download, ArrowLeft, Copy, Check, ExternalLink, 
  Sparkles, Image as ImageIcon, Search, RefreshCw, AlertCircle, Film 
} from 'lucide-react';

const Youtube = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const extractVideoId = (url) => {
  if (!url) return null;
  const cleanUrl = url.trim();
  
  // Direct 11-char Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // Matches standard watch, shortened, shorts, embed, and music URLs
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);

  if (match && match[1] && match[1].length === 11) {
    return match[1];
  }

  return null;
};

const RESOLUTIONS = [
  {
    key: 'maxresdefault',
    label: 'Maximum Quality (HD)',
    resolution: '1280 x 720',
    badge: '4K / 1080p',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    key: 'sddefault',
    label: 'Standard Quality (SD)',
    resolution: '640 x 480',
    badge: 'Standard',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    key: 'hqdefault',
    label: 'High Quality (HQ)',
    resolution: '480 x 360',
    badge: 'Medium',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  {
    key: 'mqdefault',
    label: 'Medium Quality (MQ)',
    resolution: '320 x 180',
    badge: 'Small',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
];

export default function YouTubeThumbnailDownloaderView({ onBack, showToast }) {
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  // Safe navigation handler that works inside or outside Router contexts
  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

  const handleProcessUrl = (e) => {
    if (e) e.preventDefault();
    const id = extractVideoId(urlInput);
    if (id) {
      setVideoId(id);
      setImgErrors({});
      if (showToast) showToast("Thumbnails generated successfully!");
    } else {
      if (showToast) showToast("Invalid YouTube URL. Please check the link.");
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUrlInput(value);
    const id = extractVideoId(value);
    if (id) {
      setVideoId(id);
      setImgErrors({});
    }
  };

  const handleSampleClick = (sampleUrl) => {
    setUrlInput(sampleUrl);
    const id = extractVideoId(sampleUrl);
    if (id) {
      setVideoId(id);
      setImgErrors({});
      if (showToast) showToast("Loaded sample video!");
    }
  };

  const handleDownload = async (imageUrl, resKey) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `yt-thumbnail-${videoId}-${resKey}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      if (showToast) showToast(`Downloaded ${resKey.toUpperCase()} Thumbnail!`);
    } catch (err) {
      window.open(imageUrl, '_blank');
      if (showToast) showToast('Opened thumbnail in new tab');
    }
  };

  const handleCopyUrl = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    if (showToast) showToast('Thumbnail URL copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleImageError = (resKey) => {
    setImgErrors((prev) => ({ ...prev, [resKey]: true }));
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-fade-in-up">
      {/* Back Button */}
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 sm:mb-8 text-xs sm:text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tools
      </button>

      {/* Header Title */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3.5 py-1 rounded-full text-xs font-semibold mb-3">
          <Youtube className="w-4 h-4 text-red-500" /> YouTube Utilities
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
          YouTube Thumbnail Downloader
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
          Download high-quality YouTube video thumbnails in HD, SD, HQ, or MQ resolutions instantly.
        </p>
      </div>

      {/* URL Input Box */}
      <div className="bg-[#121214] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-3xl mx-auto shadow-2xl mb-10 sm:mb-12">
        <form onSubmit={handleProcessUrl} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <Youtube className="w-5 h-5 text-red-500" />
            </div>
            <input 
              type="text"
              value={urlInput}
              onChange={handleInputChange}
              placeholder="Paste YouTube Video URL (e.g., https://www.youtube.com/watch?v=...)"
              className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            />
          </div>
          <button 
            type="submit"
            className="bg-red-600 hover:bg-red-500 text-white font-medium px-6 py-3 sm:py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 active:scale-95"
          >
            <Search className="w-4 h-4" /> Get Thumbnails
          </button>
        </form>

        {/* Quick Sample Presets */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Try Sample:
          </span>
          <button 
            type="button"
            onClick={() => handleSampleClick('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
            className="text-xs text-gray-400 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-white/5 px-2.5 py-1 rounded-lg transition-colors"
          >
            Music Video
          </button>
          <button 
            type="button"
            onClick={() => handleSampleClick('https://www.youtube.com/watch?v=jfKfPfyJRdk')}
            className="text-xs text-gray-400 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-white/5 px-2.5 py-1 rounded-lg transition-colors"
          >
            Lofi Stream
          </button>
          <button 
            type="button"
            onClick={() => handleSampleClick('https://www.youtube.com/watch?v=L_LUpnjgPso')}
            className="text-xs text-gray-400 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-white/5 px-2.5 py-1 rounded-lg transition-colors"
          >
            Nature 4K
          </button>
        </div>
      </div>

      {}
      {videoId ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-500" /> Available Resolutions
            </h2>
            <span className="text-xs text-gray-400 font-mono bg-[#18181b] px-3 py-1 rounded-lg border border-white/5">
              Video ID: {videoId}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESOLUTIONS.map((res) => {
              const imgUrl = `https://img.youtube.com/vi/${videoId}/${res.key}.jpg`;
              const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              const finalSrc = imgErrors[res.key] ? fallbackUrl : imgUrl;

              return (
                <div 
                  key={res.key}
                  className="bg-[#121214] border border-white/5 hover:border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-xl"
                >
                  <div>
                    {/* Thumbnail Display */}
                    <div className="relative bg-[#18181b] rounded-xl overflow-hidden mb-4 aspect-video flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all">
                      <img 
                        src={finalSrc} 
                        alt={res.label} 
                        onError={() => handleImageError(res.key)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full border ${res.badgeBg}`}>
                        {res.badge}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">{res.label}</h3>
                      <span className="text-xs font-mono text-gray-400">{res.resolution}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleDownload(finalSrc, res.key)}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button 
                      onClick={() => handleCopyUrl(finalSrc, res.key)}
                      className="bg-[#18181b] hover:bg-[#27272a] text-gray-300 hover:text-white border border-white/10 text-xs font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {copiedKey === res.key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#121214] border border-white/5 rounded-3xl p-10 sm:p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Youtube className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No Video Selected</h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Paste any YouTube video or Shorts link above to extract high-resolution thumbnails.
          </p>
        </div>
      )}
    </div>
  );
}