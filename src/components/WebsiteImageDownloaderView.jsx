import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Search, Download, CheckSquare, Square, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function WebsiteImageDownloaderView({ showToast }) {
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [scanStatus, setScanStatus] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  // --- MULTI-PROXY EXTRACTION ENGINE ---
  const fetchHtmlWithFallback = async (url) => {
    let html = '';
    
    try {
      setScanStatus('Trying Primary Node...');
      const res1 = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (!res1.ok) throw new Error('Proxy 1 failed');
      html = await res1.text();
      return html;
    } catch (err1) {
      console.warn("Proxy 1 failed, trying Proxy 2...", err1);
    }

    try {
      setScanStatus('Primary blocked. Routing via Secondary Node...');
      const res2 = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      if (!res2.ok) throw new Error('Proxy 2 failed');
      const data = await res2.json();
      if (!data.contents) throw new Error('No contents');
      html = data.contents;
      return html;
    } catch (err2) {
      console.warn("Proxy 2 failed, trying Proxy 3...", err2);
    }

    try {
      setScanStatus('Secondary blocked. Routing via Fallback Node...');
      const res3 = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
      if (!res3.ok) throw new Error('All proxies failed');
      html = await res3.text();
      return html;
    } catch (err3) {
      throw new Error("All proxy attempts failed. Website is heavily protected.");
    }
  };

  const handleScan = async () => {
    if (!targetUrl.trim()) return showToast("Please enter a valid URL");
    
    let urlToScan = targetUrl;
    if (!/^https?:\/\//i.test(urlToScan)) {
      urlToScan = 'https://' + urlToScan;
      setTargetUrl(urlToScan);
    }

    setIsScanning(true);
    setImages([]);
    setSelectedIds([]);
    setHasScanned(false);
    setScanStatus('Connecting to routing network...');

    try {
      // 1. Fetch raw HTML
      const html = await fetchHtmlWithFallback(urlToScan);
      
      setScanStatus('Deep scanning React/Next.js states & DOM...');
      
      const rawUrls = [];
      const baseUrl = new URL(urlToScan).origin;

      // Method A: Standard DOM Parsing
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      Array.from(doc.querySelectorAll('img')).forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('srcset');
        if (src) rawUrls.push(src.split(',')[0].split(' ')[0]);
      });

      Array.from(doc.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')).forEach(meta => {
        const src = meta.getAttribute('content');
        if (src) rawUrls.push(src);
      });

      Array.from(doc.querySelectorAll('*[style*="background-image"]')).forEach(el => {
        const match = el.getAttribute('style').match(/background-image:\s*url\(['"]?(.*?)['"]?\)/i);
        if (match && match[1]) rawUrls.push(match[1]);
      });

      // Method B: Deep Regex Extraction (Catches React/Next.js/Vue hidden JSON states)
      // This looks for any string starting with http and ending with an image extension anywhere in the HTML source code
      const regex = /https?:\/\/[^"'\s>]+?\.(?:jpg|jpeg|gif|png|webp|svg)\b/gi;
      let regexMatch;
      while ((regexMatch = regex.exec(html)) !== null) {
        // Unescape unicode hex sequences commonly found in React JSON strings (e.g. \u002F -> /)
        let unescapedUrl = regexMatch[0].replace(/\\u002F/g, '/').replace(/\\/g, '');
        rawUrls.push(unescapedUrl);
      }

      setScanStatus('Resolving absolute URLs & deduplicating...');

      // Format and clean URLs
      let absoluteUrls = rawUrls.map(src => {
        if (!src) return null;
        if (src.startsWith('data:image')) return src; 
        if (src.startsWith('http')) return src;
        if (src.startsWith('//')) return 'https:' + src;
        if (src.startsWith('/')) return baseUrl + src;
        return baseUrl + '/' + src;
      }).filter(Boolean);

      // Deep Deduplication
      const uniqueUrls = [...new Set(absoluteUrls)];

      const processedImages = uniqueUrls.map((url, index) => {
        let filename = `image_${index}.jpg`;
        if (url.startsWith('data:image')) {
          filename = `extracted-base64-${index}.png`;
        } else {
          try {
            filename = new URL(url).pathname.split('/').pop() || filename;
          } catch (e) { /* ignore parse errors */ }
        }
        
        return {
          id: `img_${index}_${Math.random().toString(36).substr(2, 9)}`,
          url: url,
          filename: filename,
        };
      });

      setTimeout(() => {
        setImages(processedImages);
        setHasScanned(true);
        setIsScanning(false);
        setScanStatus('');
        if (processedImages.length > 0) {
          showToast(`Extracted ${processedImages.length} hidden images!`);
        } else {
          showToast("No images found even after deep scanning.");
        }
      }, 800);

    } catch (error) {
      console.error("Scanning error:", error);
      setIsScanning(false);
      setHasScanned(true);
      setScanStatus('');
      showToast("Scan failed. The website might be heavily blocking bots.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === images.length) setSelectedIds([]);
    else setSelectedIds(images.map(img => img.id));
  };

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // --- MULTI-TIERED DOWNLOAD ENGINE ---
  const forceDownload = async (imgUrl, filename) => {
    try {
      if (imgUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imgUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      try {
        const response = await fetch(imgUrl);
        if (!response.ok) throw new Error("Direct fetch failed");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      } catch (directErr) {
        console.warn("Direct fetch blocked. Attempting proxy download...");
      }

      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imgUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Proxy fetch failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("All binary download attempts failed. Opening in new tab.");
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadSelected = async () => {
    const toDownload = images.filter(img => selectedIds.includes(img.id));
    if (toDownload.length === 0) return showToast("No images selected.");
    
    showToast(`Downloading ${toDownload.length} images...`);
    
    for (let i = 0; i < toDownload.length; i++) {
      await forceDownload(toDownload[i].url, toDownload[i].filename);
      await new Promise(r => setTimeout(r, 400)); 
    }
  };

  return (
    <div className="w-full px-4 sm:px-8 pt-4 animate-fade-in-up max-w-[1600px] mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      
      <div className="relative flex items-center justify-center mb-6 shrink-0">
        <button onClick={() => navigate('/')} className="absolute left-0 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-semibold tracking-wide uppercase">
          <div className="p-1.5 rounded-full bg-white/[0.03] group-hover:bg-white/[0.08] transition-all duration-300 border border-white/[0.05]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="hidden sm:block">Back</span>
        </button>
        <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 tracking-tight">
              Website Image Downloader
            </h1>
            <p className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-widest mt-1 hidden sm:block">
              Extract and download all visual assets from any URL
            </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative min-h-0 pb-6 w-full max-w-5xl mx-auto">
        
        <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] p-4 sm:p-6 border border-white/[0.05] shadow-2xl shrink-0 mb-5 relative z-20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="w-5 h-5 text-gray-500" />
              </div>
              <input 
                type="text" 
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="https://example.com"
                className="w-full bg-black/40 border border-white/[0.05] rounded-xl py-4 pl-12 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500/50 shadow-inner"
              />
            </div>
            <button 
              onClick={handleScan}
              disabled={isScanning || !targetUrl.trim()}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-50 text-white font-extrabold text-[11px] uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isScanning ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Scanning...</>
              ) : (
                <><Search className="w-4 h-4" /> Scan Website</>
              )}
            </button>
          </div>
          
          {isScanning && (
            <div className="mt-4 flex flex-col items-center justify-center">
              <p className="text-[10px] text-sky-400 font-bold tracking-widest uppercase mb-2 animate-pulse">{scanStatus}</p>
              <div className="w-full max-w-md h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-400 animate-[pulse_1.5s_ease-in-out_infinite] w-full"></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 bg-[#050505]/80 backdrop-blur-3xl rounded-[2rem] border border-white/[0.05] shadow-2xl flex flex-col relative z-10 min-h-0 overflow-hidden">
          
          {images.length > 0 && (
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-white/[0.05] shrink-0 bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <button onClick={toggleSelectAll} className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors font-medium">
                  {selectedIds.length === images.length ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4" />}
                  Select All ({selectedIds.length}/{images.length})
                </button>
              </div>
              <button 
                onClick={downloadSelected}
                disabled={selectedIds.length === 0}
                className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 border border-white/[0.05] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" /> Download Selected
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            {!hasScanned && !isScanning && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Globe className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Enter a URL to begin</h3>
                <p className="text-sm font-light text-gray-400 max-w-sm">We'll fetch the site, bypass CORS protections, and deeply scan the code to extract all accessible images.</p>
              </div>
            )}

            {hasScanned && images.length === 0 && !isScanning && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">No Images Found</h3>
                <p className="text-xs font-light text-gray-400 max-w-md leading-relaxed">
                  The website might be blocking proxy requests, or its images are heavily protected by JavaScript rendering (like React/Next.js) that hasn't executed.
                </p>
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(img => {
                  const isSelected = selectedIds.includes(img.id);
                  return (
                    <div 
                      key={img.id} 
                      onClick={() => toggleSelect(img.id, { stopPropagation: () => {} })}
                      className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 ${
                        isSelected ? 'border-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.3)]' : 'border-transparent bg-black/40 hover:border-white/20'
                      }`}
                    >
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
                      
                      <img 
                        src={img.url} 
                        alt="Scraped" 
                        loading="lazy"
                        className={`w-full h-full object-contain relative z-10 transition-transform duration-500 ${isSelected ? 'scale-95 rounded-lg' : 'group-hover:scale-105'}`} 
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }} 
                      />
                      
                      <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] z-20 flex flex-col justify-between p-3 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="flex justify-end">
                           {isSelected ? <CheckSquare className="w-5 h-5 text-sky-400 bg-black/50 rounded" /> : <Square className="w-5 h-5 text-white bg-black/50 rounded" />}
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-[9px] text-white/80 font-mono truncate pr-2" title={img.filename}>
                            {img.filename.substring(0, 15)}...
                          </p>
                          <button 
                            onClick={(e) => { e.stopPropagation(); forceDownload(img.url, img.filename); }} 
                            className="p-1.5 bg-sky-500/80 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-lg"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}