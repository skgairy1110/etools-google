import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, CheckCircle2, FileText, Image as ImageIcon, Download, 
  ArrowLeft, RefreshCw, Type, Minimize2, BarChart3, Sparkles, 
  Globe, ScanText, ImagePlus, Code, Layers, Search, Copy, Check, ExternalLink,
  Upload, Star, Mail, Phone, MessageCircle, Save, Activity, Edit2, Trash2, BarChart2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD6fC68W2XqgyYzehwY0upFy-QdUQE-sWM",
  authDomain: "etools-login.firebaseapp.com",
  projectId: "etools-login",
  storageBucket: "etools-login.firebasestorage.app",
  messagingSenderId: "184497331244",
  appId: "1:184497331244:web:250ff03682579b79d24589"
};

let app, auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase initialized in standalone mode.", e);
}

const globalStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -40px) scale(1.08); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 12s infinite alternate ease-in-out;
  }
`;

const YoutubeIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const toolThemes = [
  {
    bgHover: "hover:bg-cyan-500/[0.03]",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-400",
    iconGlow: "shadow-[0_0_20px_rgba(34,211,238,0.4)]",
    lineGradient: "from-transparent via-cyan-400 to-transparent",
    borderHover: "hover:border-cyan-500/30"
  },
  {
    bgHover: "hover:bg-rose-500/[0.03]",
    iconBg: "bg-gradient-to-br from-fuchsia-600 to-rose-500",
    iconGlow: "shadow-[0_0_20px_rgba(244,63,94,0.4)]",
    lineGradient: "from-transparent via-rose-500 to-transparent",
    borderHover: "hover:border-rose-500/30"
  },
  {
    bgHover: "hover:bg-emerald-500/[0.03]",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    iconGlow: "shadow-[0_0_20px_rgba(52,211,153,0.4)]",
    lineGradient: "from-transparent via-emerald-400 to-transparent",
    borderHover: "hover:border-emerald-500/30"
  },
  {
    bgHover: "hover:bg-violet-500/[0.03]",
    iconBg: "bg-gradient-to-br from-violet-600 to-purple-500",
    iconGlow: "shadow-[0_0_20px_rgba(139,92,246,0.4)]",
    lineGradient: "from-transparent via-purple-500 to-transparent",
    borderHover: "hover:border-purple-500/30"
  }
];

function HomeView({ onNavigate, showToast }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", "Generators", "PDF", "Text Tools", "Media", "Developer"];

  const dummyTools = [
    { title: "QR Code Generator", desc: "Generate tracking-ready QR matrices instantly. Customize colors, logos, and error resilience.", cat: "Generators", active: true, path: 'qr', icon: QrCode },
    { title: "YouTube Thumbnail Downloader", desc: "Download high-quality YouTube video thumbnails in HD, SD, HQ, or MQ resolutions instantly.", cat: "Media", active: true, path: 'youtube-thumbnail', icon: YoutubeIcon },
    { title: "PDF to Image Converter", desc: "Convert PDF pages to high-quality JPG or PNG images instantly with customizable resolution.", cat: "PDF", active: true, path: 'pdf-to-image', icon: FileText },
    { title: "Text Case Converter", desc: "Instantly format your typography architecture. Switch between camel, snake, pascal, and more.", cat: "Text Tools", active: true, path: 'text-case', icon: Type },
    { title: "Image Compressor", desc: "Reduce payload sizes without losing visual fidelity using smart compression.", cat: "Media", active: true, path: 'image-compressor', icon: ImageIcon },
    { title: "Website Image Downloader", desc: "Extract and bulk download all visual assets from any website URL.", cat: "Media", active: true, path: 'image-downloader', icon: Globe },
    { title: "Image to Text (OCR)", desc: "Extract text from images using optical character recognition.", cat: "Media", active: true, path: 'image-to-text', icon: ScanText },
    { title: "AI Image Upscaler", desc: "Enhance and upscale your images without losing quality.", cat: "Media", active: true, path: 'image-upscaler', icon: ImagePlus },
    { title: "Chart Generator Pro", desc: "Create stunning, interactive charts with customizable options.", cat: "Generators", active: true, path: 'chart-generator', icon: BarChart3 }
  ];

  const filteredTools = activeCategory === "All" 
    ? dummyTools 
    : dummyTools.filter(t => t.cat.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-12 max-w-[1600px] mx-auto animate-fade-in-up">
      <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-300">100% Free Online Utilities</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Supercharge your workflow.
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          A suite of digital tools designed for creators, developers, and makers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeCategory === cat 
                ? 'bg-white text-black shadow-lg scale-105' 
                : 'bg-white/[0.03] text-gray-400 hover:bg-white/[0.08] hover:text-white border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTools.map((tool, idx) => {
          const IconComp = tool.icon;
          const theme = toolThemes[idx % toolThemes.length];

          return (
            <div 
              key={idx}
              onClick={() => tool.active ? onNavigate(tool.path) : showToast(`${tool.title} coming soon!`)}
              className={`group relative flex flex-col justify-between bg-[#0a0a0c] rounded-2xl p-5 border border-white/10 transition-all cursor-pointer min-h-[170px] ${theme.bgHover} ${theme.borderHover} hover:-translate-y-1`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.iconBg}`}>
                  <IconComp className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">{tool.title}</h3>
                <p className="text-gray-400 text-xs line-clamp-2">{tool.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YouTubeThumbnailDownloaderView({ onBack, showToast }) {
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const extractVideoId = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) return cleanUrl;
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return (match && match[1] && match[1].length === 11) ? match[1] : null;
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUrlInput(val);
    const id = extractVideoId(val);
    if (id) setVideoId(id);
  };

  const handleSampleClick = (sampleUrl) => {
    setUrlInput(sampleUrl);
    const id = extractVideoId(sampleUrl);
    if (id) {
      setVideoId(id);
      showToast("Loaded sample video!");
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
      showToast(`Downloaded ${resKey.toUpperCase()} Thumbnail!`);
    } catch (err) {
      window.open(imageUrl, '_blank');
      showToast('Opened thumbnail in new tab');
    }
  };

  const handleCopyUrl = (url, key) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    showToast('Copied URL to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resolutions = [
    { key: 'maxresdefault', label: 'Maximum Quality (HD)', res: '1280 x 720', badge: 'HD / 4K' },
    { key: 'sddefault', label: 'Standard Quality (SD)', res: '640 x 480', badge: 'SD' },
    { key: 'hqdefault', label: 'High Quality (HQ)', res: '480 x 360', badge: 'Medium' },
    { key: 'mqdefault', label: 'Medium Quality (MQ)', res: '320 x 180', badge: 'Small' }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3.5 py-1 rounded-full text-xs font-semibold mb-3">
          <YoutubeIcon className="w-4 h-4 text-red-500" /> YouTube Utilities
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">YouTube Thumbnail Downloader</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Download high-quality video thumbnails instantly.</p>
      </div>

      <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto mb-10 shadow-xl">
        <div className="relative mb-4">
          <input 
            type="text"
            value={urlInput}
            onChange={handleInputChange}
            placeholder="Paste YouTube Video or Shorts URL..."
            className="w-full bg-[#121214] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <YoutubeIcon className="w-5 h-5 text-red-500 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Try sample:</span>
          <button onClick={() => handleSampleClick("https://www.youtube.com/watch?v=dQw4w9WgXcQ")} className="underline hover:text-white">Music Video</button>
          <button onClick={() => handleSampleClick("https://www.youtube.com/watch?v=jfKfPfyJRdk")} className="underline hover:text-white">Lofi Stream</button>
        </div>
      </div>

      {videoId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resolutions.map((res) => {
            const imgUrl = `https://img.youtube.com/vi/${videoId}/${res.key}.jpg`;
            return (
              <div key={res.key} className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 mb-3 border border-white/5">
                    <img src={imgUrl} alt={res.label} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white border border-white/10">{res.badge}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-300 font-medium mb-4">
                    <span>{res.label}</span>
                    <span className="text-gray-500 font-mono">{res.res}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleDownload(imgUrl, res.key)} className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={() => handleCopyUrl(imgUrl, res.key)} className="bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 border border-white/10">
                    {copiedKey === res.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy Link
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0a0a0c] border border-white/5 rounded-2xl max-w-md mx-auto">
          <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-xs">Enter a video link above to extract thumbnails.</p>
        </div>
      )}
    </div>
  );
}

function PdfToImageConverterView({ onBack, showToast }) {
  const [file, setFile] = useState(null);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">PDF to Image Converter</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Convert PDF document pages to JPG/PNG images instantly.</p>
      </div>

      <div className="bg-[#0a0a0c] border-2 border-dashed border-white/10 rounded-2xl p-10 text-center max-w-xl mx-auto flex flex-col items-center">
        <FileText className="w-12 h-12 text-blue-500 mb-3" />
        <h3 className="text-white font-bold text-base mb-1">Select or drop a PDF file</h3>
        <p className="text-gray-500 text-xs mb-6">Convert all PDF pages into images directly in your browser.</p>
        <label className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-3 rounded-xl cursor-pointer">
          Browse File
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => {
            if (e.target.files[0]) {
              setFile(e.target.files[0]);
              showToast("PDF file loaded!");
            }
          }} />
        </label>
        {file && <p className="mt-4 text-xs text-emerald-400 font-medium">Selected: {file.name}</p>}
      </div>
    </div>
  );
}

function QRToolView({ onBack, showToast }) {
  const [qrText, setQrText] = useState('https://etools.hub');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">QR Code Generator</h1>
        <p className="text-gray-400 text-xs sm:text-sm">Create high-res QR matrices instantly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6">
          <label className="block text-xs font-semibold text-gray-300 mb-2">Enter URL or Text</label>
          <textarea 
            value={qrText}
            onChange={(e) => setQrText(e.target.value)}
            className="w-full h-32 bg-[#121214] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="bg-white p-3 rounded-xl mb-4">
            <img src={qrUrl} alt="QR Matrix" className="w-48 h-48" />
          </div>
          <button 
            onClick={() => {
              window.open(qrUrl, '_blank');
              showToast("Downloading QR Code...");
            }} 
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-6 py-2.5 rounded-xl"
          >
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}

function GenericToolView({ title, description, onBack }) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-fade-in-up">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{title}</h1>
        <p className="text-gray-400 text-xs sm:text-sm">{description}</p>
      </div>
      <div className="bg-[#0a0a0c] border border-white/10 rounded-2xl p-12 text-center max-w-lg mx-auto">
        <p className="text-gray-400 text-xs">Tool ready for processing requests.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home');
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      triggerToast("Welcome to eTools Hub");
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentRoute('home');
      triggerToast("Signed out successfully");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'qr':
        return <QRToolView onBack={() => setCurrentRoute('home')} showToast={triggerToast} />;
      case 'youtube-thumbnail':
        return <YouTubeThumbnailDownloaderView onBack={() => setCurrentRoute('home')} showToast={triggerToast} />;
      case 'pdf-to-image':
        return <PdfToImageConverterView onBack={() => setCurrentRoute('home')} showToast={triggerToast} />;
      case 'text-case':
        return <GenericToolView title="Text Case Converter" description="Convert typography architecture." onBack={() => setCurrentRoute('home')} />;
      case 'image-compressor':
        return <GenericToolView title="Image Compressor" description="Smart image payload compression." onBack={() => setCurrentRoute('home')} />;
      case 'image-to-text':
        return <GenericToolView title="Image to Text (OCR)" description="Extract typography from image pixels." onBack={() => setCurrentRoute('home')} />;
      case 'chart-generator':
        return <GenericToolView title="Chart Generator Pro" description="Interactive data graphics generator." onBack={() => setCurrentRoute('home')} />;
      case 'image-upscaler':
        return <GenericToolView title="AI Image Upscaler" description="Upscale image resolution." onBack={() => setCurrentRoute('home')} />;
      case 'image-downloader':
        return <GenericToolView title="Website Image Downloader" description="Extract visual assets from any website." onBack={() => setCurrentRoute('home')} />;
      default:
        return <HomeView onNavigate={(route) => setCurrentRoute(route)} showToast={triggerToast} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 font-sans flex flex-col justify-between relative overflow-x-hidden">
      <style>{globalStyles}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/[0.05] bg-[#030303]/40 backdrop-blur-2xl sticky top-0 z-40">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentRoute('home')}>
          <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.08]">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tighter text-white">eTOOLS</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-full" />
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white">Sign out</button>
          </div>
        ) : (
          <button onClick={handleLogin} className="text-xs bg-white text-black font-semibold px-4 py-2 rounded-full hover:scale-105 transition-all">
            Sign In
          </button>
        )}
      </header>

      {/* View Container */}
      <main className="pb-24 flex-grow relative z-10">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      {currentRoute === 'home' && (
        <footer className="py-8 border-t border-white/[0.05] flex flex-col items-center justify-center text-center bg-[#030303]">
          <span className="text-xs font-bold text-white tracking-widest uppercase mb-1">eTOOLS</span>
          <p className="text-gray-500 text-[10px]">DESIGNED FOR PERFECTION. NO SIGN-UP REQUIRED.</p>
        </footer>
      )}
    </div>
  );
}