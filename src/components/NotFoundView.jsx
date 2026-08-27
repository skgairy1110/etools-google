import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Radio } from 'lucide-react';

export default function NotFoundView() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Generate luxury starfield particles
    const numStars = Math.floor((width * height) / 4000);
    const stars = [];
    const colors = ['#ffffff', '#818cf8', '#c084fc', '#38bdf8', '#f472b6'];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 1.8 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const repelRadius = 140; // Distance where stars make space for the cursor

      stars.forEach((star) => {
        // Natural drift
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Cursor repulsion effect (making space on hover)
        let dx = mouse.x - star.x;
        let dy = mouse.y - star.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        let renderX = star.x;
        let renderY = star.y;

        if (distance < repelRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (repelRadius - distance) / repelRadius;
          renderX -= Math.cos(angle) * force * 45;
          renderY -= Math.sin(angle) * force * 45;
        }

        ctx.beginPath();
        ctx.arc(renderX, renderY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = star.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#050508] text-gray-300 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden z-10 animate-fade-in-up text-center select-none">
      
      {/* Interactive Galaxy Canvas Starfield Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-lg">
        
        {/* Signal Badge */}
        <div className="flex items-center gap-2 bg-[#121216]/90 backdrop-blur-md border border-[#262630] px-4 py-1.5 rounded-full text-xs font-bold mb-6 text-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.2)]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" /> SECTOR 404 · GALAXY ANOMALY
        </div>

        <h1 className="text-7xl md:text-9xl font-black text-white mb-2 tracking-tight drop-shadow-[0_0_40px_rgba(99,102,241,0.5)]">
          4<span className="text-indigo-500 animate-pulse">0</span>4
        </h1>
        
        <h2 className="text-lg md:text-xl font-extrabold text-gray-100 mb-3 tracking-wide">
          Lost in the Cosmos
        </h2>
        
        <p className="text-xs text-gray-400 max-w-md mb-8 leading-relaxed">
          The coordinates you entered drifted outside known star systems. Move your cursor to disperse the starlight and navigate back on course.
        </p>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-[#121216]/90 backdrop-blur-md hover:bg-[#1a1a22] border border-[#2a2a36] hover:border-indigo-500/50 px-5 py-3 rounded-xl transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" /> Warp Back
          </button>
          
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.7)]"
          >
            <Home className="w-4 h-4" /> Return to Base
          </button>
        </div>
      </div>
    </div>
  );
}