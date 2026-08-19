import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase'; 

import HomeView from './components/HomeView';
import QRToolView from './components/QRToolView';
import TextCaseConverterView from './components/TextCaseConverterView';
import ImageCompressorView from './components/ImageCompressorView';

// Custom animations for the "Awwwards" feel
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
  
  /* Staggered delays */
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-400 { animation-delay: 400ms; }
`;

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

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
      setCurrentView('home');
      triggerToast("Signed out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-gray-200 font-sans selection:bg-blue-500/30 flex flex-col justify-between relative overflow-x-hidden">
      <style>{globalStyles}</style>

      {/* Awwwards Style Ambient Background Blobs */}
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
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/[0.05] bg-[#030303]/40 backdrop-blur-2xl sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('home')}>
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.08] group-hover:bg-white/[0.08] group-hover:scale-105 transition-all duration-500 ease-out">
            <QrCode className="w-5 h-5 text-white group-hover:rotate-6 transition-transform duration-500" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            eTOOLS
          </span>
        </div>
        
        {user ? (
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] py-1.5 px-1.5 rounded-full pr-4">
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-medium text-gray-300 hidden sm:block">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="relative group overflow-hidden text-sm bg-white text-black px-6 py-2.5 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <span className="relative z-10">Sign in with Google</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="pb-24 flex-grow relative z-10">
        {currentView === 'home' && <HomeView onViewChange={setCurrentView} showToast={triggerToast} />}
        {currentView === 'qr' && <QRToolView onViewChange={setCurrentView} user={user} showToast={triggerToast} />}
        {currentView === 'text-case' && <TextCaseConverterView onViewChange={setCurrentView} showToast={triggerToast} />}
        {currentView === 'img-comp' && <ImageCompressorView onViewChange={setCurrentView} showToast={triggerToast} />}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.05] flex flex-col items-center justify-center gap-4 text-center bg-[#030303]/60 backdrop-blur-lg relative z-10">
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
          <QrCode className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white tracking-widest uppercase">eTOOLS</span>
        </div>
        <p className="text-gray-500 text-xs tracking-wide">DESIGNED FOR PERFECTION. NO SIGN-UP REQUIRED.</p>
      </footer>
    </div>
  );
}