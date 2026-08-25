import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundView() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#0A0A0A] text-gray-300 font-sans flex flex-col items-center justify-center relative overflow-hidden z-10">
      
      {/* Animated Starry Background */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none starry-bg"></div>

      {/* Alien / UFO Scene */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in-up mt-10">
        
        {/* UFO */}
        <div className="relative flex flex-col items-center ufo-container">
          
          {/* Glass Dome */}
          <div className="w-20 h-14 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-t-full relative flex justify-center items-end z-20 backdrop-blur-md shadow-[inset_0_4px_10px_rgba(255,255,255,0.2)]">
            
            {/* Alien Head inside Dome */}
            <div className="w-10 h-10 bg-emerald-400 rounded-t-[20px] rounded-b-[10px] relative mb-1 flex justify-center items-center alien-head shadow-inner">
               {/* Alien Eyes */}
               <div className="absolute top-3 w-2.5 h-4 bg-black rounded-full left-1.5 -rotate-45 alien-eye"></div>
               <div className="absolute top-3 w-2.5 h-4 bg-black rounded-full right-1.5 rotate-45 alien-eye"></div>
            </div>
            
          </div>
          
          {/* Saucer Base */}
          <div className="w-48 h-10 bg-[#1A1A1A] border-2 border-[#333] rounded-[100%] -mt-3 z-30 shadow-[0_15px_40px_rgba(16,185,129,0.2)] relative overflow-hidden flex items-center">
            {/* Metal reflection */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
            
            {/* Sweeping radar light */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-sweep"></div>
            
            {/* Blinking Lights */}
            <div className="w-full flex justify-around px-6 relative z-10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-blink" style={{animationDelay: '0s'}}></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-blink" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-blink" style={{animationDelay: '0.4s'}}></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-blink" style={{animationDelay: '0.6s'}}></div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-blink" style={{animationDelay: '0.8s'}}></div>
            </div>
          </div>

          {/* Tractor Beam */}
          <div className="tractor-beam absolute top-full w-32 h-48 bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent -mt-2 z-10 blur-[2px]"></div>
        </div>

        {/* 404 Text caught in beam */}
        <div className="relative z-20">
          <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-300 to-emerald-900 tracking-tighter mt-12 mb-6 hover-404 relative z-20 mix-blend-screen">
            404
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 text-center tracking-tight">
          Page Abducted!
        </h1>
        <p className="text-gray-500 text-sm max-w-sm text-center mb-10 leading-relaxed">
          The page you are looking for has been transported to another dimension, or simply doesn't exist anymore.
        </p>

        {/* Return Button */}
        <button 
          onClick={() => navigate('/')}
          className="bg-[#111] hover:bg-[#1a1a1a] border border-[#333] hover:border-emerald-500/50 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 group"
        >
          <Home className="w-4 h-4 group-hover:text-emerald-400 transition-colors" /> Return to Base
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        /* Animations */
        .ufo-container {
          animation: float-ufo 4s ease-in-out infinite;
        }
        
        .tractor-beam {
          animation: pulse-beam 2s ease-in-out infinite alternate;
          clip-path: polygon(20% 0, 80% 0, 100% 100%, 0 100%);
        }
        
        .hover-404 {
          animation: float-404 4s ease-in-out infinite reverse;
          text-shadow: 0 20px 30px rgba(16, 185, 129, 0.3);
        }
        
        .alien-head {
          animation: look-around 8s ease-in-out infinite;
        }

        .alien-eye {
          animation: blink-eye 6s infinite;
        }
        
        .animate-sweep {
          animation: sweep 3s linear infinite;
        }

        .animate-blink {
          animation: blink-light 1s infinite alternate;
        }
        
        .starry-bg {
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 40px 70px, #aaaaaa, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 50px 160px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 40px, #aaaaaa, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 130px 80px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 160px 120px, #aaaaaa, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 200px 50px, #ffffff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 250px 180px, #aaaaaa, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: stars-drift 100s linear infinite;
        }

        /* Keyframes */
        @keyframes float-ufo {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-404 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.02) rotate(-1deg); }
        }
        
        @keyframes pulse-beam {
          0% { opacity: 0.4; height: 160px; transform: scaleX(0.95); filter: blur(2px); }
          100% { opacity: 0.8; height: 200px; transform: scaleX(1.05); filter: blur(4px); }
        }
        
        @keyframes look-around {
          0%, 100% { transform: translateX(0); }
          15%, 25% { transform: translateX(-6px); }
          45%, 55% { transform: translateX(6px); }
          75% { transform: translateX(0); }
        }

        @keyframes blink-eye {
          0%, 48%, 52%, 100% { transform: scaleY(1) rotate(var(--tw-rotate)); }
          50% { transform: scaleY(0.1) rotate(var(--tw-rotate)); }
        }
        
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes blink-light {
          0% { opacity: 0.2; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes stars-drift {
          0% { transform: translateY(0); }
          100% { transform: translateY(-300px); }
        }
      `}} />
    </div>
  );
}