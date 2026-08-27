import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase'; 

import HomeView from './components/HomeView';
import QRToolView from './components/QRToolView';
import TextCaseConverterView from './components/TextCaseConverterView';
import ImageCompressorView from './components/ImageCompressorView';
import ImageToTextConverterView from './components/ImageToTextConverterView';
import ChartGeneratorView from './components/ChartGeneratorView';
import ImageUpscalerView from './components/ImageUpscalerView';
import WebsiteImageDownloaderView from './components/WebsiteImageDownloaderView';
import PdfToImageConverterView from './components/PdfToImageConverterView';
import AIColorPairView from './components/AIColorPairView';
import ImageToPdfConverterView from './components/ImageToPdfConverterView';
import GrammarCheckerView from './components/GrammarCheckerView';
import GifCompressorView from './components/GifCompressorView';
import ImageFormatConverterView from './components/ImageFormatConverterView';
import PdfToWordConverterView from './components/PdfToWordConverterView';
import PlagiarismCheckerView from './components/PlagiarismCheckerView';
import HtmlToPdfConverterView from './components/HtmlToPdfConverterView';
import PdfCompressorView from './components/PdfCompressorView';
import NotFoundView from './components/NotFoundView';
import VideoToGifView from './components/VideoToGifView';
import RemoveBackgroundView from './components/RemoveBackgroundView';
import JsonFormatterView from './components/JsonFormatterView';
import WordToPdfView from './components/WordToPdfView';
import CloudGeneratorView from './components/CloudGeneratorView';
import AiEmailBuilderView from './components/AiEmailBuilderView';


const globalStyles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    opacity: 0;
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(40px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob {
    animation: blob 15s infinite alternate ease-in-out;
  }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
`;

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
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
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      triggerToast("Signed out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 font-sans selection:bg-blue-500/30 flex flex-col justify-between relative overflow-x-hidden">
      <style>{globalStyles}</style>

      {/* Ambient Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] animate-blob mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[120px] animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-rose-600/10 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-3 rounded-2xl text-sm font-medium shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Frosted Glass Header */}
      <header className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-white/[0.05] bg-[#030303]/40 backdrop-blur-2xl sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:scale-105 transition-all duration-500 ease-out">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-6 transition-transform duration-500" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            eTOOLS
          </span>
        </div>
        
        {user ? (
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/[0.03] border border-white/[0.05] py-1 px-1 sm:py-1.5 sm:px-1.5 rounded-full pr-3 sm:pr-4">
              <img src={user.photoURL} alt="Avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover" />
              <span className="text-xs sm:text-sm font-medium text-gray-300 hidden sm:block">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="relative group overflow-hidden text-xs sm:text-sm bg-white text-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <span className="relative z-10 hidden sm:inline">Sign in with Google</span>
            <span className="relative z-10 sm:hidden">Sign In</span>
          </button>
        )}
      </header>

      {/* Main Content Routing */}
      <main className="pb-24 flex-grow relative z-10">
        <Routes>
          <Route path="*" element={<NotFoundView />} />
          <Route path="/" element={<HomeView showToast={triggerToast} />} />
          <Route path="/qr" element={<QRToolView user={user} showToast={triggerToast} />} />
          <Route path="/text-case" element={<TextCaseConverterView showToast={triggerToast} />} />
          <Route path="/image-compressor" element={<ImageCompressorView showToast={triggerToast} />} />
          <Route path="/image-to-text" element={<ImageToTextConverterView showToast={triggerToast} />} />
          <Route path="/chart-generator" element={<ChartGeneratorView user={user} showToast={triggerToast} />} />
          <Route path="/image-upscaler" element={<ImageUpscalerView showToast={triggerToast} />} />
          <Route path="/image-downloader" element={<WebsiteImageDownloaderView showToast={triggerToast} />} />
          <Route path="/pdf-to-image" element={<PdfToImageConverterView showToast={triggerToast} />} />
          <Route path="/ai-colors" element={<AIColorPairView showToast={triggerToast} />} />
          <Route path="/image-to-pdf" element={<ImageToPdfConverterView showToast={triggerToast} />} />
          <Route path="/grammar-checker" element={<GrammarCheckerView showToast={triggerToast} />} />
          <Route path="/gif-compressor" element={<GifCompressorView showToast={triggerToast} />} />
          <Route path="/image-converter" element={<ImageFormatConverterView showToast={triggerToast} />} />
          <Route path="/pdf-to-word" element={<PdfToWordConverterView showToast={triggerToast} />} />
          <Route path="/plagiarism-checker" element={<PlagiarismCheckerView showToast={triggerToast} />} />
          <Route path="/html-to-pdf" element={<HtmlToPdfConverterView showToast={triggerToast} />} />
          <Route path="/pdf-compressor" element={<PdfCompressorView showToast={triggerToast} />} />
          <Route path="/video-to-gif" element={<VideoToGifView showToast={triggerToast} />} />
          <Route path="/remove-background" element={<RemoveBackgroundView showToast={triggerToast} />} />
          <Route path="/json-formatter" element={<JsonFormatterView showToast={triggerToast} />} />
          <Route path="/word-to-pdf" element={<WordToPdfView showToast={triggerToast} />} />
          <Route path="/cloud-generator" element={<CloudGeneratorView showToast={triggerToast} />} />
          <Route path="/ai-email-builder" element={<AiEmailBuilderView showToast={triggerToast} />} />
          
        </Routes>
      </main>

      {/* Footer - Rendered only on Home view */}
      {isHome && (
        <footer className="py-12 border-t border-white/[0.05] flex flex-col items-center justify-center gap-4 text-center bg-[#030303]/60 backdrop-blur-lg relative z-10">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <QrCode className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white tracking-widest uppercase">eTOOLS</span>
          </div>
          <p className="text-gray-500 text-xs tracking-wide px-4">DESIGNED FOR PERFECTION. NO SIGN-UP REQUIRED.</p>
        </footer>
      )}
    </div>
  );
}